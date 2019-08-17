import Step from './Step'
import { LocalStepDefinition } from './LocalStep.types'
import { ExecOptions } from 'child_process'
import { CommandResult } from './Processor.types'
import { Context } from './Pipeline.types'

/**
 * Runs inside a pipeline and execute local commands
 *
 * @param {LocalStepDefinition} definition a definition object.
 *
 */

export default class LocalStep extends Step<LocalStepDefinition> {
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
    const finalOptions: ExecOptions = { ...this.definition.localOptions, ...context.localOptions }

    return await this.runAndRetry(context.localProcessor, finalCommand, finalOptions)
  }
}
