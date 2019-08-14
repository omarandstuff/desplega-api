import { exec, ExecException, ChildProcess, ExecOptions } from 'child_process'
import { LocalResult } from './Local.types'
import ProcessEmitter from './ProcessEmitter'

/**
 * Waraper for exec function to exec local commands.
 *
 * @param {ExecOptions} [options] command execution options.
 *
 */
export default class Local extends ProcessEmitter {
  private options: ExecOptions

  public constructor(options?: ExecOptions) {
    super()
    const env: any = { FORCE_COLOR: true, ...process.env }

    this.options = { env: env, maxBuffer: 8388608, ...options }
  }

  /**
   * Execs a local command and sets the status to running.
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
   * @param {StreamCallBack} [streamCallBack] A callback to be invoked on data streaming.
   * The same data printed by some command while executing, chunk by chunk
   *
   * @param {ExecOptions} [options] override constructor options with these options
   *
   * @returns {LocalResult} Result oject containing the generated stdout, stderr and error if any
   */
  public async exec(command: string, options?: ExecOptions): Promise<LocalResult> {
    return new Promise((resolve, reject) => {
      const cleanCommand: string = String(command)
      const derivedOptions: ExecOptions = { ...this.options, ...options }
      const finalCallBack = (error: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) => {
        if (error) {
          reject({ error, stdout, stderr })
        } else {
          resolve({ error, stdout, stderr })
        }
      }

      const childProcess: ChildProcess = exec(cleanCommand, derivedOptions, finalCallBack)

      childProcess.stdout.on('data', (chunk: any): void => {
        this.emit('stdout', chunk.toString('utf8'))
      })

      childProcess.stderr.on('data', (chunk: any): void => {
        this.emit('stderr', chunk.toString('utf8'))
      })
    })
  }
}