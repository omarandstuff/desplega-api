import { ExecOptions } from 'child_process'
import Step from './Step'
import { VirtualStepDefinition } from './VirtualStep.types'
import { Context } from './Step.types'
import { CommandResult } from './Processor.types'

/**
 * Runs inside a pipeline and execute local commands
 *
 * @param {VirtualStepDefinition} definition a definition object.
 *
 */

export default class VirtualStep extends Step<VirtualStepDefinition> {
  /**
   * Executes an async function and desides what to do on failure or success
   *
   * @param {Contenxt} context context in which this step is runnig
   *
   * @returns {LocalResult} The local exec result
   *
   */
  public async run(context: Context): Promise<CommandResult> {
    const finalOptions: ExecOptions = { ...this.definition.virtualOptions, ...context.virtualOptions }

    return await this.runAndRetry(context.virtualProcessor, this.definition.asyncFunction, context, finalOptions)
  }
}
