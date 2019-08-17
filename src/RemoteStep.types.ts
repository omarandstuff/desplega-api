import { ExecOptions } from 'child_process'
import { StepDefinition, Context } from './Step.types'

export interface RemoteStepDefinition extends StepDefinition {
  command: string | ((context: Context) => string)
  remoteOptions?: ExecOptions
  remoteId?: string
  workingDirectory?: string
}
