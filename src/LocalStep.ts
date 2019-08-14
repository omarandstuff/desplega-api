import Step from './Step'
import { LocalResult } from './Local.types'
import { LocalStapeDefinition } from './LocalStep.types'
import { LocalManagerOptions } from './LocalManager.types'
import { Context } from './Step.types'

/**
 * Runs inside a pipeline and execute local commands
 *
 * @param {LocalStepDefinition} definition a definition object.
 *
 */

export default class LocalStep extends Step<LocalStapeDefinition> {
  constructor(definition: LocalStapeDefinition) {
    super(definition)
  }

  /**
   * Build a command, execute it and desides what to do on failure or success
   *
   * @param {Contenxt} context context in which this step is runnig
   *
   * @returns {LocalResult} The local exec result
   *
   */

  public async run(context: Context): Promise<LocalResult> {
    const command: string = await this.generateDynamicCommand(this.definition.command, context)
    const finalCommand: string = this.buildFinalcommand(command, this.definition.workingDirectory)
    const finalOptions: LocalManagerOptions = { ...this.definition.localManagerOptions, ...context.localManagerOptions }

    try {
      const result: LocalResult = await context.localManager.exec(finalCommand, finalOptions)

      switch (this.definition.onSuccess) {
        case 'terminate':
          throw result
        default:
          return result
      }
    } catch (reason) {
      switch (this.definition.onFailure) {
        case 'continue':
          return reason
        default:
          throw reason
      }
    }
  }
}
