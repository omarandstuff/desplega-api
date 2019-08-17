import { ExecOptions } from 'child_process'
import { StepDefinition } from './Step.types'
import { Context } from './Pipeline.types'

export interface LocalStepDefinition extends StepDefinition {
  command: string | ((context: Context) => string)
  localOptions?: ExecOptions
  workingDirectory?: string
}
