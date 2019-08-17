import { ExecOptions } from 'child_process'
import { StepDefinition } from './Step.types'
import { VirtualFunction } from './Virtual.types'

export interface VirtualStepDefinition extends StepDefinition {
  asyncFunction: VirtualFunction
  virtualOptions?: ExecOptions
}
