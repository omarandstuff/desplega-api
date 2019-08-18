import { Client, ConnectConfig, ClientChannel } from 'ssh2'
import { ExecException, ExecOptions } from 'child_process'
import { ConnectionStatus } from './Remote.types'
import Processor from './Processor'
import fs from 'fs'
import os from 'os'
import { CommandResult } from './Processor.types'

/**
 * Connects to a remote host and stays connected while sending commands.
 * Will reemit any events related to the connection status like (ready, error,
 * and close)
 *
 * When the connection finishes or has an error it will close the connection.
 *
 * @param {ConnectConfig} connectConfig connection parameters
 *
 * @param {ExecOptions} options execution options.
 *
 */
export default class Remote extends Processor {
  private connectConfig: ConnectConfig = null
  private connection: Client = new Client()
  private options: ExecOptions
  private connectionStatus: ConnectionStatus = 'closed'

  constructor(connectConfig: ConnectConfig, options?: ExecOptions) {
    super()

    const { privateKey } = connectConfig
    // keepaliveInterval: 1000, keepaliveCountMax: 1,
    this.connectConfig = { privateKey: privateKey || this.getPrivateKey(), ...connectConfig }

    this.options = options
  }

  /**
   * Execs a remote command and sets the status to running.
   *
   * It listens fot stdout and stderr and stream it to the stream callback, when
   * the command finishes it will resolve with the whole stdout and stderr
   * drivered form the call.
   *
   * If the returning code is not 0 or there is a problem with te execution it
   * rejects with the error | stderr.
   *
   * @param {String} command the actual command string to be executed
   * Any command with any params example:
   *   "sudo apt-get update"
   *   "ls -lh ~/apps"
   *
   * @returns {CommandResult} the result of the execution
   */
  public async exec(command: string, options?: ExecOptions): Promise<CommandResult> {
    const derivedOptions: ExecOptions = { ...this.options, ...options }

    return new Promise(
      async (resolve, reject): Promise<void> => {
        if (this.connectionStatus === 'closed') {
          try {
            await this.connect()
          } catch (error) {
            return reject({
              error: new Error(`There was a problem trying to connect to the host ${this.connectConfig.host}: ${error.message}`),
              stderr: '',
              stdout: ''
            })
          }
        }

        this.connection.exec(String(command), derivedOptions, (error: Error, channel: ClientChannel) => {
          if (error) {
            return reject({ error, stderr: '', stdout: '' })
          } else {
            let stdout = ''
            let stderr = ''

            const timeout = derivedOptions.timeout || 0

            if (timeout > 0) {
              setTimeout((): void => {
                channel.removeAllListeners('close')
                channel.removeAllListeners('data')

                this.resetConnection()

                reject({ error: new Error('Remote command timeout'), stderr, stdout })
              }, timeout)
            }

            channel.addListener('close', (exitCode: number | null, signalName?: string, didCoreDump?: boolean, description?: string) => {
              const error: ExecException = { code: exitCode, signal: signalName, name: signalName, message: description }

              if (exitCode !== 0) {
                if (exitCode === undefined) {
                  this.resetConnection()

                  reject({ error: new Error('Network error'), stderr, stdout })
                } else {
                  reject({ error, stdout, stderr })
                }
              } else {
                resolve({ error, stdout, stderr })
              }
            })

            channel.addListener('data', (data: string | Buffer) => {
              const stringData: string = data.toString('utf8')
              stdout += data.toString('utf8')

              this.emit('REMOTE@STDOUT', stringData)
            })

            channel.stderr.addListener('data', (data: string | Buffer) => {
              const stringData: string = data.toString('utf8')
              stderr += data.toString('utf8')

              this.emit('REMOTE@STDERR', stringData)
            })
          }
        })
      }
    )
  }

  public close(): void {
    if (this.connectionStatus === 'connected') {
      this.connectionStatus = 'closed'
      this.connection.end()
    }
  }

  private resetConnection(): void {
    this.close()
    this.connection = new Client()
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject): void => {
      const onReady = (): void => {
        this.connectionStatus = 'connected'
        this.emit('REMOTE@CONNECTED')

        resolve()
      }
      const onError = (error: Error): void => {
        this.connection.removeListener('close', onClose)
        this.connection.removeListener('error', onError)
        this.connection.removeListener('ready', onReady)
        this.connectionStatus = 'closed'
        this.emit('REMOTE@CLOSED')

        reject(error)
      }
      const onClose = (): void => {
        this.connection.removeListener('close', onClose)
        this.connection.removeListener('error', onError)
        this.connection.removeListener('ready', onReady)
        this.connectionStatus = 'closed'
        this.emit('REMOTE@CLOSED')
      }

      this.connection.addListener('close', onClose)
      this.connection.addListener('error', onError)
      this.connection.addListener('ready', onReady)

      this.emit('REMOTE@CONNECTING')
      this.connection.connect(this.connectConfig)
    })
  }

  private getPrivateKey(): Buffer {
    const path = `${os.homedir()}/.ssh/id_rsa`

    if (fs.existsSync(path)) {
      return fs.readFileSync(path)
    }
  }
}
