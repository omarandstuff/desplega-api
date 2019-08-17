import { ExecOptions } from 'child_process'
import { StepDefinition } from './Step.types'

export interface LocalStapeDefinition extends StepDefinition {
  localOptions?: ExecOptions
  workingDirectory?: string
}
