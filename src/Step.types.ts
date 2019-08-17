import { ExecOptions } from 'child_process'
import Local from './Local'
import { Remote } from '.'

export interface Context {
  localProcessor: Local
  localOptions?: ExecOptions
  remoteProcessors: { [id: string]: Remote }
  remoteOptions?: ExecOptions
  remoteId?: string
}

export interface StepDefinition {
  title: string
  command: string | ((context: Context) => string)
  id?: string
  onFailure?: 'terminate' | 'continue'
  onSuccess?: 'terminate' | 'continue'
  maxRetries?: number
}
