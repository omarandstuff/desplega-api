import { ExecOptions } from 'child_process'
import { CommandResult } from './Processor.types'
import Local from './Local'
import Remote from './Remote'
import Virtual from './Virtual'

export interface History {
  results: CommandResult[]
  stepMap: { [stepId: string]: CommandResult }
}

export interface Context {
  history: History
  localProcessor: Local
  localOptions?: ExecOptions
  remoteProcessors: { [id: string]: Remote }
  remoteOptions?: ExecOptions
  remoteId?: string
  virtualProcessor: Virtual
  virtualOptions?: ExecOptions
}

export interface StepDefinition {
  title: string
  id?: string
  onFailure?: 'terminate' | 'continue'
  onSuccess?: 'terminate' | 'continue'
  maxRetries?: number
}
