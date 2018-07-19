import Local from './Local'

/**
 * Manage retry simple JS functions failures.
 *
 * When the function succeed or all retries fails it will resolve
 * or reject respectively.
 *
 * It also share an status and feddback value to watch the current status.
 *
 * @param {Object} [options] default options for the exec method
 * Options are:
 * maxRetries: Number of times the function should be rerun on fail.
 *
 */
export default class VirtualManager {
  constructor(options) {
    this.status = 'free'
    this.feedback = 'idle'
    this.options = { maxRetries: 0, ...options }
  }

  /**
   * Start resolving the JS function.
   *
   * @param {Function} command the function to be executed
   *
   * @param {Function} streamCallBack stream call back to feed if function log stuff.
   *
   * @param {Object} options options to inherit from step.
   *
   * @param {Object} context context object to inherit from step.
   *
   * @returns {Promise} Promise to be solved or rejected.
   * when solving or rejecting will pass the current run information
   * current run data is:
   * attempts: how many attempts before finishing
   * command: command executed
   * options: final options used to run the fucntion
   * results: results for every attempt
   * streamCallBack: function called when streaming
   *
   */
  exec(command, streamCallBack, options, context) {
    return new Promise((resolve, reject) => {
      if (this.status === 'free') {
        this.resolve = resolve
        this.reject = reject

        this.status = 'resolving'
        this.context = context
        this.currentRun = {
          attempts: 0,
          command: command,
          options: { ...this.options, ...options },
          results: [],
          streamCallBack: streamCallBack
        }

        this.feedback = 'running'
        this._run()
      } else {
        reject(new Error('Manager is bussy'))
      }
    })
  }

  _run() {
    this.currentRun.attempts++

    this.currentRun
      .command(this.context, this.currentRun.streamCallBack)
      .then(result => {
        const runData = this.currentRun
        this.currentRun.results.push({ virtualout: result })
        this.currentRun = undefined
        this.status = 'free'
        this.feedback = 'idle'

        this.resolve(runData)
      })
      .catch(error => {
        this._resolveError(error)
      })
  }

  _resolveError(error) {
    this.currentRun.results.push({ virtualerr: error })

    if (this.currentRun.options.maxRetries >= this.currentRun.attempts) {
      this.feedback = 'running'
      this._run()
    } else {
      const runData = this.currentRun
      this.currentRun = undefined
      this.status = 'free'
      this.feedback = 'idle'

      this.reject(runData)
    }
  }
}
