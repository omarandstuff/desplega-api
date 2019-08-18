import Processor from './Processor'
import { CommandResult } from './Processor.types'
import { VirtualFunction } from './Virtual.types'
import { ExecOptions } from 'child_process'
import { Context } from './Pipeline.types'

/**
 * Waraper for an async funtion
 *
 * @param {ExecOptions} [options] command execution options.
 *
 */
export default class Virtual extends Processor {
  private options: ExecOptions

  public constructor(options?: ExecOptions) {
    super()

    this.options = options

    // This will be shared so lets bind it to this context
    this.emit = this.emit.bind(this)
  }

  /**
   * Execs a virtual async function and resolves it.
   * It also implements a simple timeout system.
   *
   * @param {VirtualFunction} function The async function to execute
   *
   *  @param {Context} context The pipeline context to share with the async function
   *
   * @param {ExecOptions} [options] override constructor options with these options
   *
   * @returns {CommandResult} The result of the execution
   */
  public async exec(virtualFunction: VirtualFunction, context: Context, options?: ExecOptions): Promise<CommandResult> {
    return new Promise((resolve, reject): void => {
      const timeout = { ...this.options, ...options }.timeout || 0
      let stdout = ''
      let stderr = ''

      if (timeout > 0) {
        setTimeout((): void => {
          reject({ error: new Error('Virtual async function timeout'), stdout, stderr })
        }, timeout)
      }

      const stdoutListener = (data: string): void => {
        stdout += data
      }
      const stderrListener = (data: string): void => {
        stderr += data
      }

      this.addListener('stdout', stdoutListener)
      this.addListener('stderr', stderrListener)

      virtualFunction(context, this.emit)
        .then((): void => {
          this.removeListener('stdout', stdoutListener)
          this.removeListener('stderr', stderrListener)

          resolve({ error: null, stdout, stderr })
        })
        .catch((error: any) => {
          this.removeListener('stdout', stdoutListener)
          this.removeListener('stderr', stderrListener)

          reject({ error, stdout, stderr })
        })
    })
  }
}
