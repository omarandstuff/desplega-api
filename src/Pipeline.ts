import { PipelineDescriptor, Context, RemoteCollection, Header, RemoteCollectionDescriptor } from './Pipeline.types'
import { CommandResult } from './Processor.types'
import Step from './Step'
import Local from './Local'
import Virtual from './Virtual'
import { ConnectConfig } from 'ssh2'
import { ExecOptions } from 'child_process'
import Remote from './Remote'
import { EventEmitter } from 'events'

/**
 * The pipe line object will run steps secuentially
 *
 * @param {String} title string that identifies the pipeline or subpipeline
 *
 * @param {PipelineDescriptor} descriptor Pipeline descriptor
 *
 */
export default class Pipeline extends EventEmitter {
  private descriptor: PipelineDescriptor
  private context: Context
  private startTime: Date

  constructor(descriptor: PipelineDescriptor) {
    super()
    this.descriptor = descriptor

    this.context = {
      globals: {},
      history: [],
      localProcessor: new Local(this.descriptor.localOptions),
      localOptions: this.descriptor.localOptions,
      virtualProcessor: new Virtual(this.descriptor.virtualOptions),
      virtualOptions: this.descriptor.virtualOptions,
      remoteProcessors: this.generateRemoteProcessors(this.descriptor.remotes, this.descriptor.remoteOptions),
      remoteOptions: this.descriptor.remoteOptions,
      remoteId: this.getDefaultRemoteId(this.descriptor.remotes)
    }

    this.listenToLocal()
    this.listenToRemotes()
    this.listenToVirtual()
  }

  /**
   * Runs the secuence of steps
   */
  public async run(): Promise<void> {
    this.startTime = new Date()
    this.emit('PIPELINE@INIT', this.descriptor.title, this.startTime)

    const { steps } = this.descriptor
    let index: number = 1

    for (let i = 0; i < steps.length; i++) {
      const currentHeader: Header = steps[i] as Header
      const currentStep: Step = steps[i] as Step

      if (currentHeader.isHeader) {
        this.emit('PIPELINE@HEADER', currentHeader.title, new Date())
        index = 1
      } else {
        try {
          this.listenToStep(currentStep)

          const result: CommandResult = await currentStep.run(this.context, index++)

          this.context.history.push(result)
          currentStep.removeAllListeners()
        } catch (error) {
          this.emit('PIPELINE@FAIL', error, new Date())
          break
        }
      }
    }

    this.emit('PIPELINE@FINISH', new Date())
    this.closeRemotes()
  }

  private closeRemotes(): void {
    const ids: string[] = Object.keys({ ...this.context.remoteProcessors })

    for (let i = 0; i < ids.length; i++) {
      this.context.remoteProcessors[ids[i]].close()
    }
  }

  private generateRemoteProcessors(remotes: RemoteCollectionDescriptor, options: ExecOptions): RemoteCollection {
    const ids: string[] = Object.keys({ ...remotes })

    return ids.reduce((generatedRemotes: {}, key: string) => {
      generatedRemotes[key] = new Remote(remotes[key], options)
      return generatedRemotes
    }, {})
  }

  private getDefaultRemoteId(remotes: RemoteCollectionDescriptor): string {
    const ids: string[] = Object.keys({ ...remotes })

    if (ids.length === 1) {
      return ids[0]
    }
  }

  private listenToLocal() {
    this.context.localProcessor.addListener('LOCAL@STDOUT', (stdout: string) => {
      this.emit('LOCAL@STDOUT', stdout)
    })
    this.context.localProcessor.addListener('LOCAL@STDERR', (stderr: string) => {
      this.emit('LOCAL@STDERR', stderr)
    })
  }

  private listenToRemotes() {
    const ids: string[] = Object.keys({ ...this.context.remoteProcessors })

    for (let i = 0; i < ids.length; i++) {
      const remote: Remote = this.context.remoteProcessors[ids[i]]

      remote.addListener('REMOTE@CONNECTING', () => {
        this.emit('REMOTE@CONNECTING', ids[i])
      })
      remote.addListener('REMOTE@CONNECTED', () => {
        this.emit('REMOTE@CONNECTED', ids[i])
      })
      remote.addListener('REMOTE@CLOSED', () => {
        this.emit('REMOTE@CLOSED', ids[i])
      })
      remote.addListener('REMOTE@STDOUT', (stdout: string) => {
        this.emit('REMOTE@STDOUT', stdout, ids[i])
      })
      remote.addListener('REMOTE@STDERR', (stderr: string) => {
        this.emit('REMOTE@STDERR', stderr, ids[i])
      })
    }
  }

  private listenToVirtual() {
    this.context.virtualProcessor.addListener('stdout', (stdout: string) => {
      this.emit('VIRTUAL@STDOUT', stdout)
    })
    this.context.virtualProcessor.addListener('stderr', (stderr: string) => {
      this.emit('VIRTUAL@STDERR', stderr)
    })
  }

  private listenToStep(step: Step) {
    const stepTypes = ['LOCAL_STEP', 'REMOTE_STEP', 'VIRTUAL_STEP']
    const stepEvents = ['INIT', 'RETRY', 'FINISH', 'FAIL']

    stepTypes.forEach((prefix: string): void => {
      stepEvents.forEach((posfix: string): void => {
        step.addListener(`${prefix}@${posfix}`, (...args) => {
          this.emit(`${prefix}@${posfix}`, ...args)
        })
      })
    })
  }
}
