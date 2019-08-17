import { ExecException } from 'child_process'

export type ConnectionStatus = 'closed' | 'connected'

export interface RemoteResult {
  error: ExecException
  stdout?: string
  stderr?: string
}
