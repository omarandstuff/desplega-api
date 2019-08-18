import { exec, ExecException, ChildProcess, ExecOptions } from 'child_process'
import Processor from './Processor'
import { CommandResult } from './Processor.types'

/**
 * Waraper for exec function to exec local commands.
 *
 * @param {ExecOptions} [options] command execution options.
 *
 */
export default class Local extends Processor {
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
   * @param {ExecOptions} [options] override constructor options with these options
   *
   * @returns {CommandResult} Result oject containing the generated stdout, stderr and error if any
   */
  public async exec(command: string, options?: ExecOptions): Promise<CommandResult> {
    return new Promise((resolve, reject): void => {
      const cleanCommand = String(command)
      const derivedOptions: ExecOptions = { ...this.options, ...options }
      const finalCallBack = (error: ExecException | null, stdout: string | Buffer, stderr: string | Buffer): void => {
        if (error) {
          reject({ error, stdout, stderr })
        } else {
          resolve({ error, stdout, stderr })
        }
      }

      const childProcess: ChildProcess = exec(cleanCommand, derivedOptions, finalCallBack)

      childProcess.stdout.on('data', (chunk: any): void => {
        this.emit('LOCAL@STDOUT', chunk.toString('utf8'))
      })

      childProcess.stderr.on('data', (chunk: any): void => {
        this.emit('LOCAL@STDERR', chunk.toString('utf8'))
      })
    })
  }
}
