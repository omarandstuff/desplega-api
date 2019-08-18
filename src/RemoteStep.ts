import Step from './Step'
import { RemoteStepDefinition } from './RemoteStep.types'
import { ExecOptions } from 'child_process'
import { CommandResult } from './Processor.types'
import Remote from './Remote'
import { Context } from './Pipeline.types'

/**
 * Runs inside a pipeline and execute local commands
 *
 * @param {LocalStepDefinition} definition a definition object.
 *
 */

export default class RemoteStep extends Step<RemoteStepDefinition> {
  protected eventPrefix = 'REMOTE_STEP'

  /**
   * Builds a command, execute it and desides what to do on failure or success
   *
   * @param {Contenxt} context context in which this step is runnig
   *
   * @returns {LocalResult} The local exec result
   *
   */
  public async run(context: Context, index: number): Promise<CommandResult> {
    const command: string = await this.generateDynamicCommand(this.definition.command, context)
    const finalCommand: string = this.buildFinalcommand(command, this.definition.workingDirectory)
    const finalOptions: ExecOptions = { ...this.definition.remoteOptions, ...context.remoteOptions }
    const remote: Remote = context.remoteProcessors[context.remoteId || this.definition.remoteId]

    this.emit('REMOTE_STEP@INIT', index, this.definition.title, finalCommand, context.remoteId || this.definition.remoteId, new Date())

    if (!remote) throw { error: new Error(`Remote not configred or unmatching remoteId provided`), stdout: '', stderr: '' }

    return await this.runAndRetry(remote, finalCommand, finalOptions)
  }
}
