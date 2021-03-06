import { ExecOptions } from 'child_process'
import Step from './Step'
import { VirtualStepDefinition } from './VirtualStep.types'
import { CommandResult } from './Processor.types'
import { Context } from './Pipeline.types'

/**
 * Runs inside a pipeline and execute local commands
 *
 * @param {VirtualStepDefinition} definition a definition object.
 *
 */

export default class VirtualStep extends Step<VirtualStepDefinition> {
  protected eventPrefix = 'VIRTUAL_STEP'

  /**
   * Executes an async function and desides what to do on failure or success
   *
   * @param {Contenxt} context context in which this step is runnig
   *
   * @returns {LocalResult} The local exec result
   *
   */
  public async run(context: Context, index: number): Promise<CommandResult> {
    const finalOptions: ExecOptions = { ...this.definition.virtualOptions, ...context.virtualOptions }

    this.emit('VIRTUAL_STEP@INIT', index, this.definition.title, new Date())

    return await this.runAndRetry(context.virtualProcessor, this.definition.asyncFunction, context, finalOptions)
  }
}
