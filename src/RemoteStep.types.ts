import { ExecOptions } from 'child_process'
import { StepDefinition } from './Step.types'

export interface RemoteStapeDefinition extends StepDefinition {
  remoteOptions?: ExecOptions
  remoteId?: string
  workingDirectory?: string
}
