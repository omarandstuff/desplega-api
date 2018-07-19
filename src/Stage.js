import moment from 'moment'
import Runner from './Runner'
import { filterRemotes } from './utils'

/**
 * Simple runner to run a list of steps.
 *
 * @param {Object} title What is this stage prints at the top.
 *
 * @param {Object} config Configurations for this stage block
 * congigurations are:
 * localOptions: To override globaly on all local steps
 * remoteOptions: To override globaly on all remote steps
 * virtualOptions: To override globaly on all virtual steps
 * remotes: Array of remotes ids to only use inside this stage
 * verbosityLevel: to override for all steps inside this stage
 *
 */
export default class Stage extends Runner {
  constructor(title, config) {
    super()
    this.title = title
    this.config = config || {}
    this.childStackLevel = 2
  }

  addStep(step) {
    this.addChild(step)
  }

  /**
   * Runs the secuence of stages
   */
  run(context = {}) {
    return new Promise((resolve, reject) => {
      if (this.status === 'idle') {
        this.currentIndex = 0
        this.startTime = moment()
        this.context = this._buildContext(context)
        this.results = []

        this.resolve = resolve
        this.reject = reject

        this._run()
      } else {
        reject(new Error('Stage bussy'))
      }
    })
  }

  _buildContext(context) {
    return {
      ...context,
      stackLevel: this.childStackLevel,
      remotes: filterRemotes(context.remotes, this.config.remotes),
      localOptions: { ...context.localOptions, ...this.config.localOptions },
      remoteOptions: { ...context.remoteOptions, ...this.config.remoteOptions },
      verbosityLevel: this.config.verbosityLevel || context.verbosityLevel,
      theme: { ...context.theme }
    }
  }

  _onChildFailure(result) {
    this.results.push(result)
    this.reject(this.results)
  }

  _onChildSuccess(result) {
    this.results.push(result)
  }

  _onSuccess() {
    this.resolve(this.results)
  }

  _printHeader() {
    this.printer.drawRow([
      {
        text: ` ${this.title} `,
        style: this.context.theme.stageHeaderContrastStyle
          ? this.context.theme.stageHeaderContrastStyle.bold
          : undefined
      },
      {
        blank: true,
        style: this.context.theme.backgroundStyle
      },
      {
        text: ` ${moment(this.context.globalStartTime).format('hh[:]mma')} `,
        style: this.context.theme.stageHeaderStyle
      }
    ])
  }

  _printResult() {}
}
