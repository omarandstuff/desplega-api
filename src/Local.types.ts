import { ExecException } from 'child_process'

export interface LocalResult {
  error: ExecException
  stdout?: string | Buffer
  stderr?: string | Buffer
}
