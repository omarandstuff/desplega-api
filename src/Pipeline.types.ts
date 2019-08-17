import { ExecOptions } from 'child_process'
import { ConnectConfig } from 'ssh2'
import { CommandResult } from './Processor.types'
import Local from './Local'
import Remote from './Remote'
import Virtual from './Virtual'
import LocalStep from './LocalStep'
import RemoteStep from './RemoteStep'
import VirtualStep from './VirtualStep'

export type Header = { title: string; isHeader: true }
export type RemoteCollection = { [id: string]: Remote }
export type RemoteCollectionDescriptor = { [remoteId: string]: ConnectConfig }
export type History = CommandResult[]

export interface Context {
  globals: { [name: string]: any }
  history: History
  localProcessor: Local
  localOptions?: ExecOptions
  remoteProcessors: RemoteCollection
  remoteOptions?: ExecOptions
  remoteId?: string
  virtualProcessor: Virtual
  virtualOptions?: ExecOptions
}

export interface PipelineDescriptor {
  title: string
  steps: (LocalStep | RemoteStep | VirtualStep | Header)[]
  localOptions?: ExecOptions
  remotes?: RemoteCollectionDescriptor
  remoteOptions?: ExecOptions
  virtualOptions?: ExecOptions
}
