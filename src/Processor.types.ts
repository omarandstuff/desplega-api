import { ExecException } from 'child_process'

export interface CommandResult {
  error: ExecException
  stdout?: string | Buffer
  stderr?: string | Buffer
}
