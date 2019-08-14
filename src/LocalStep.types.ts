import { LocalManagerOptions } from './LocalManager.types'
import { StepDefinition } from './Step.types'

export interface LocalStapeDefinition extends StepDefinition {
  localManagerOptions?: LocalManagerOptions
  workingDirectory?: string
}
