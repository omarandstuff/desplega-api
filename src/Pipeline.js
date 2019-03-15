import moment from 'moment'
import Runner from './Runner'
import LocalManager from './LocalManager'
import VirtualManager from './VirtualManager'
import RemoteManager from './RemoteManager'
import Printer from './Printer'
import Theme from './Theme'
import { solveDuration } from './utils'

/**
 * Simple runner to run a list of stages.
 *
 * @param {Object} title What is this pipeline prints at the top.
 *
 * @param {Object} config Global configurations
 * congigurations are:
 * localOptions: To override globaly on all local steps
 * remoteOptions: To override globaly on all remote steps
 * virtualOptions: To override globaly on all virtual steps
 * remotes: list of all remotes that will be running remote commands
 *   (See RemoteManger config)
 *   options: options to override just for this remote in the list
 * verbosityLevel: to override globale for all steps
 *
 *  @param {Object} theme object decribing theme colors
 * (See Theme for more info)
 */
export default class Pipeline extends Runner {
  constructor(title, config, theme) {
    super()
    this.title = title
    this.config = config
    this.context = {
      archive: { dictionary: {}, history: [] },
      addRemote: this._addRemote.bind(this), // Share add remote so steps can add remotes on the fly
      localOptions: config.localOptions,
      local: this._createLocal(),
      remoteOptions: config.remoteOptions,
      remotes: this._createRemotes(),
      theme: new Theme(theme),
      verbosityLevel: config.verbosityLevel || 'partial',
      virtual: this._createVirtual()
    }

    this.printer = new Printer()
  }

  addStage(stage) {
    this.addChild(stage)
  }

  /**
   * Runs the secuence of stages
   */
  run() {
    return new Promise((resolve, reject) => {
      if (this.status === 'idle') {
        this.currentIndex = 0
        this.currentStage = undefined
        this.context.globalStartTime = moment()
        this.results = []

        this.resolve = resolve
        this.reject = reject

        this._run()
      } else {
        throw new Error('Pipeline bussy')
      }
    })
  }

  _addRemote(config, id, options) {
    this.context.remotes[id] = new RemoteManager(config, id, options)
  }

  _closeRemotes() {
    this.context.remotes.forEach(remote => {
      remote.close()
    })
  }

  _createLocal() {
    return new LocalManager(this.config.localOptions)
  }

  _createRemotes() {
    return (this.config.remotes || []).map(remote => {
      const { id, options, ...config } = remote
      return new RemoteManager(config, id, options)
    })
  }

  _createVirtual() {
    return new VirtualManager(this.config.virtualOptions)
  }

  _onChildFailure(result) {
    this.results.push(result)
    this._closeRemotes()
    this.reject({ results: this.results, context: this.context })
  }

  _onChildSuccess(result) {
    this.results.push(result)
  }

  _onSuccess() {
    this._closeRemotes()
    this.resolve({ results: this.results, context: this.context })
  }

  _printHeader() {
    this.printer.drawRow([
      {
        blank: true,
        style: this.context.theme.backgroundStyle
      },
      {
        text: ` ${this.title} `,
        style: this.context.theme.pipelineHeaderContrastStyle.bold
      },
      {
        blank: true,
        style: this.context.theme.backgroundStyle
      }
    ])
  }

  _printResult(success = true) {
    const successContrastStyle = success
      ? this.context.theme.successContrastStyle
      : this.context.theme.failureContrastStyle
    const successWord = success ? 'DONE' : 'FAIL'

    this.printer.drawRow([
      {
        blank: true,
        style: this.context.theme.backgroundStyle
      },
      {
        text: ` ${successWord} `,
        style: successContrastStyle.bold
      },
      {
        text: ` ${solveDuration(this.context.globalStartTime)}`,
        style: this.context.theme.mainStyle
      },
      {
        blank: true,
        style: this.context.theme.backgroundStyle
      }
    ])
  }
}
