import { ExecOptions } from 'child_process'
import { StepDefinition } from './Step.types'
import { Context } from './Pipeline.types'

export interface RemoteStepDefinition extends StepDefinition {
  command: string | ((context: Context) => string)
  remoteOptions?: ExecOptions
  remoteId?: string
  workingDirectory?: string
}
