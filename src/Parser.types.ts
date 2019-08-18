import { ExecOptions } from 'child_process'
import { RemoteCollectionDescriptor, Context } from './Pipeline.types'
import { VirtualFunction } from './Virtual.types'

export interface PipelineParserDescriptor {
  pipeline: {
    title: string
    steps: {
      type: 'local' | 'remote' | 'virtual'
      title: string
      onFailure?: 'terminate' | 'continue'
      onSuccess?: 'terminate' | 'continue'
      maxRetries?: number
      command?: string | ((context: Context) => string)
      localOptions?: ExecOptions
      workingDirectory?: string
      remoteOptions?: ExecOptions
      remoteId?: string
      asyncFunction: VirtualFunction
      virtualOptions?: ExecOptions
    }[]
    localOptions?: ExecOptions
    remotes?: RemoteCollectionDescriptor
    remoteOptions?: ExecOptions
    virtualOptions?: ExecOptions
  }
}
