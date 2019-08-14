import Local from './Local'
import { LocalManagerOptions, LocalMangerStatus } from './LocalManager.types'
import { LocalResult } from './Local.types'
import ProcessEmitter from './ProcessEmitter'

/**
 * Manage a local object to retry command failures.
 *
 * When the command succeed or fails it returs the last try results
 *
 * @param {LocalManagerOptions} [options] default options for the exec method
 *
 */
export default class LocalManager extends ProcessEmitter {
  public status: LocalMangerStatus = 'iddle'

  private local: Local = null
  private options: LocalManagerOptions = null

  constructor(options?: LocalManagerOptions) {
    super()
    const { maxRetries, ...localOptions } = options || { maxRetries: 0 }

    this.options = options
    this.local = new Local(localOptions)

    this.local.addListener('stdout', (stdout: string) => {
      this.emit('stdout', stdout)
    })

    this.local.addListener('stderr', (stderr: string) => {
      this.emit('stderr', stderr)
    })
  }

  /**
   * Exec a local command and retries it {maxRetries} until it solves or it runs out of oportunities.
   *
   * @param {String} command the actual command string to be executed
   *
   * @param {Function} streamCallBack stream call back to pass to the local object.
   *
   * @returns {LocalResult} Result oject containing the generated stdout, stderr and error if any
   *
   */
  public async exec(command: string, options?: LocalManagerOptions): Promise<LocalResult> {
    let { maxRetries, ...localOptions } = options || this.options || { maxRetries: 0 }

    // Make sure we have a positive number for max retries
    maxRetries = Math.max(maxRetries, 0)

    if (this.status === 'running') {
      throw new Error('Manager is bussy')
    } else {
      this.status = 'running'

      for (let i = 0; i <= maxRetries; i++) {
        try {
          const result: LocalResult = await this.local.exec(command, localOptions)
          this.status = 'iddle'

          return result
        } catch (reason) {
          if (i === maxRetries) {
            this.status = 'iddle'
            throw reason
          }
        }
      }
    }
  }
}
