import { ExecOptions } from 'child_process'
import { StepDefinition } from './Step.types'
import { CommandResult } from './Processor.types'
import { VirtualFunction } from './Virtual.types'
import Local from './Local'
import Remote from './Remote'
import Virtual from './Virtual'
import Processor from './Processor'
import { Context } from './Pipeline.types'

/**
 * Base step class.
 *
 * @param {Object} definition a definition object.
 */

export default class Step<D = StepDefinition> {
  public definition: D

  public constructor(definition: D) {
    this.definition = definition
  }

  public async run(_context: Context): Promise<any> {
    throw new Error('You need to implement the run method')
  }

  /**
   * Uses a given processor to exec a command and retries it {maxRetries} until it solves or it runs out
   * of oportunities, then desides what to do on failure or success
   *
   * @param {Local | Remote | Virtual} processor the processor object that will handle the command
   *
   * @param {String} command the final command that will be executed
   *
   * @param {ExecOptions} [options] step options to pass to the processor
   *
   * @returns {CommandResult} The execution result
   *
   */
  protected async runAndRetry(processor: Local, command: string, options?: ExecOptions): Promise<CommandResult>
  protected async runAndRetry(processor: Remote, command: string, options?: ExecOptions): Promise<CommandResult>
  protected async runAndRetry(processor: Virtual, virtalFunction: VirtualFunction, context: Context, options?: ExecOptions): Promise<CommandResult>
  protected async runAndRetry(
    processor: Processor,
    action: string | VirtualFunction,
    secondParam?: ExecOptions | Context,
    options?: ExecOptions
  ): Promise<CommandResult> {
    const definition: StepDefinition = (this.definition as unknown) as StepDefinition
    const finalMaxRetries: number = Math.max(definition.maxRetries || 0, 0)

    for (let i = 0; i <= finalMaxRetries; i++) {
      try {
        const result: CommandResult = await processor.exec(action, secondParam, options)

        switch (definition.onSuccess) {
          case 'terminate':
            throw result
          default:
            return result
        }
      } catch (reason) {
        if (i === finalMaxRetries) {
          switch (definition.onFailure) {
            case 'continue':
              return reason
            default:
              throw reason
          }
        }
      }
    }
  }

  protected buildFinalcommand(command: string, workingDirectory?: string): string {
    if (workingDirectory) {
      return `cd ${workingDirectory} && ${command}`
    }
    return command
  }

  protected async generateDynamicCommand(command: string | ((context: Context) => string), context: Context): Promise<string> {
    try {
      if (typeof command == 'function') {
        return await command(context)
      } else {
        return command
      }
    } catch (error) {
      throw { error, stdout: '', stderr: '' }
    }
  }
}
