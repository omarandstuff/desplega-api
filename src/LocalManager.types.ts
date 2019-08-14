import { ExecOptions } from 'child_process'

export interface LocalManagerOptions extends ExecOptions {
  maxRetries: number
}

export type LocalMangerStatus = 'iddle' | 'running'
