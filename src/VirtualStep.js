import moment from 'moment'
import Step from './Step'
import VirtualManager from './VirtualManager'

/**
 * In takes a virtual manager object and prints information about its results
 *
 * @param {Object} definition a definition object.
 * Definition attributes are:
 * title: Title for this step Example: 'Process some JS stuff'.
 * command: The function command to be executed
 *   function(context, streamCallBack)
 *     Context and steam function inherited form step
 * onFailure: Any Step object
 * recoverOnFailure: if the onFailure attribute is set and succeed
 *   this step will resolve instead of reject.
 * continueOnFailure: it does not matter if this step fails or onFailure fails
 *   it will resolve anyways.
 * options: options to overide in the local object: (See VirtualManager options)
 * verbosityLevel:
 *   'full': will the streamed output of the command
 *   'partial': will print only the last output line in the status bar.
 *
 */
export default class RemoteStep extends Step {
  constructor(definition) {
    super(definition)
    this.typeIcon = 'virtual'
  }

  /**
   * Starts resolving the virtual object and print the status of it.
   *
   * @param {Object} context context in which this step is runnig
   * context attributes are:
   * virtual: the local object that exec virtual commands
   * childIndex: This step can be part of a list of steps, so wich number is it.
   * globalStartTime: At what time all this started.
   * stackLevel: Tab size to be printed depending on the context.
   * subStep: In case this step was called as recovery step.
   * verbocityLevel: Global verbocity level.
   * theme: theme to use in printhings
   *
   * @returns {Promise} Promise to be solved or rejected.
   * when solving or rejecting will pass the results
   * (See VirtualManager exec method for more details)
   *
   */
  run(context = {}) {
    return new Promise((resolve, reject) => {
      if (this.status === 'idle') {
        this.resolve = resolve
        this.reject = reject

        this.context = this._buildContext(context)

        this.status = 'running'
        this.startTime = moment()
        this.currentRun = {}
        this.currentRecord = {}

        this.command = 'JS Function'

        this._printHeader()
        this._runAnimation()

        this.currentRun.status = 'running'
        this.context.virtual
          .exec(this.definition.command, this._onStream.bind(this), this.context.options, this.context)
          .then(result => {
            this.currentRun.status = 'done'
            this.currentRun.result = result
            this.currentRecord = result.results

            clearTimeout(this.animation)
            this._onSuccess()
          })
          .catch(result => {
            this.currentRun.status = 'fail'
            this.currentRun.result = result
            this.currentRecord = result.results

            clearTimeout(this.animation)
            this._onFailure()
          })
      } else {
        reject(new Error('Step bussy'))
      }
    })
  }

  _buildContext(context) {
    if (!(context.virtual instanceof VirtualManager)) {
      return this.reject(new Error('There is not a virtual manager object included in the context'))
    }

    return {
      ...context,
      options: { ...context.virtualOptions, ...this.definition.options },
      verbosityLevel: this.definition.verbosityLevel || context.verbosityLevel,
      theme: { ...context.theme }
    }
  }

  _generateLoaders() {
    if (this.currentRun.status === 'done') {
      return '✔'
    } else if (this.currentRun.status === 'fail') {
      return '✖'
    } else {
      return this._solveLoader()
    }
  }

  _solveLoader() {
    const animationChars = this.loadChars[this.context.virtual.feedback]
    const currentLoadChar = animationChars[this.animationTick % animationChars.length]
    const attemptsChar = this.context.virtual.currentRun
      ? this._solveSuperScript(this.context.virtual.currentRun.attempts)
      : ''

    return `${currentLoadChar}${attemptsChar}`
  }
}
