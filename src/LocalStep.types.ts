import { ExecOptions } from 'child_process'
import { StepDefinition, Context } from './Step.types'

export interface LocalStepDefinition extends StepDefinition {
  command: string | ((context: Context) => string)
  localOptions?: ExecOptions
  workingDirectory?: string
}
