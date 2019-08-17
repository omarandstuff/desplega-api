import { PipelineDescriptor, Context, RemoteCollection, Header } from './Pipeline.types'
import { CommandResult } from './Processor.types'
import Step from './Step'
import Local from './Local'
import Virtual from './Virtual'
import { ConnectConfig } from 'ssh2'
import { ExecOptions } from 'child_process'
import Remote from './Remote'

/**
 * The pipe line object will run steps secuentially
 *
 * @param {String} title string that identifies the pipeline or subpipeline
 *
 * @param {PipelineDescriptor} descriptor Pipeline descriptor
 *
 */
export default class Pipeline {
  private descriptor: PipelineDescriptor
  private context: Context

  constructor(descriptor: PipelineDescriptor) {
    this.descriptor = descriptor

    this.context = {
      globals: {},
      history: [],
      localProcessor: new Local(this.descriptor.localOptions),
      localOptions: this.descriptor.localOptions,
      virtualProcessor: new Virtual(this.descriptor.virtualOptions),
      virtualOptions: this.descriptor.virtualOptions,
      remoteProcessors: this.generateRemoteProcessors(this.descriptor.remotes, this.descriptor.remoteOptions),
      remoteOptions: this.descriptor.remoteOptions
    }
  }

  /**
   * Runs the secuence of steps
   */
  public async run(): Promise<void> {
    const { steps } = this.descriptor
    for (let i = 0; i < steps.length; i++) {
      const currentStep = steps[i]

      if ((currentStep as Header).isHeader) {
      } else {
        try {
          const result: CommandResult = await (currentStep as Step).run(this.context)
          this.context.history.push(result)
        } catch (error) {
          break
        }
      }
    }

    this.closeRemotes(this.context.remoteProcessors)
  }

  private closeRemotes(remotes: RemoteCollection): void {
    const ids: string[] = Object.keys({ ...remotes })

    for (let i = 0; i < ids.length; i++) {
      remotes[ids[i]].close()
    }
  }

  private generateRemoteProcessors(remotes: { [remoteId: string]: ConnectConfig }, options: ExecOptions): { [remoteId: string]: Remote } {
    const ids: string[] = Object.keys({ ...remotes })

    return ids.reduce((generatedRemotes: {}, key: string) => {
      generatedRemotes[key] = new Remote(remotes[key], options)
      return generatedRemotes
    }, {})
  }
}
