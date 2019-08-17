import Step from './Step'
import { RemoteStepDefinition } from './RemoteStep.types'
import { Context } from './Step.types'
import { ExecOptions } from 'child_process'
import { CommandResult } from './Processor.types'
import Remote from './Remote'

/**
 * Runs inside a pipeline and execute local commands
 *
 * @param {LocalStepDefinition} definition a definition object.
 *
 */

export default class LocalStep extends Step<RemoteStepDefinition> {
  /**
   * Builds a command, execute it and desides what to do on failure or success
   *
   * @param {Contenxt} context context in which this step is runnig
   *
   * @returns {LocalResult} The local exec result
   *
   */
  public async run(context: Context): Promise<CommandResult> {
    const command: string = await this.generateDynamicCommand(this.definition.command, context)
    const finalCommand: string = this.buildFinalcommand(command, this.definition.workingDirectory)
    const finalOptions: ExecOptions = { ...this.definition.remoteOptions, ...context.remoteOptions }
    const remote: Remote = context.remoteProcessors[context.remoteId || this.definition.remoteId]

    if (!remote) throw { error: new Error(`Remote not configred or unmatching remoteId provided`), stdout: '', stderr: '' }

    return await this.runAndRetry(remote, finalCommand, finalOptions)
  }
}
