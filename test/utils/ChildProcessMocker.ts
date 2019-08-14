import { ExecOptions, ExecException } from 'child_process'
import { EventEmitter } from 'events'

interface ChildProcessMock {
  stdout: EventEmitter
  stderr: EventEmitter
  finish: (customStdout?: string) => void
  finishWithError: (customStderr?: string) => void
  finishWithTimeOut: (customStdout?: string) => void
}

type ExecCallBack = (error: ExecException | null, stdout: string, stderr: string) => void

export default class ChildProcessMocker {
  private static nextResolverData: { method: string; customData?: string } = { method: '' }
  private static originalInstance: any
  private static originalExec: any

  public static mock(originalInstance: any): void {
    this.originalInstance = originalInstance
    this.originalExec = originalInstance.exec

    this.originalInstance.exec = this.exec.bind(this)
  }

  public static unMock() {
    this.originalInstance.exec = this.originalExec
  }

  public static mockFinish(customStdout?: string): void {
    this.nextResolverData = { method: 'finish', customData: customStdout }
  }

  public static mockFinishWithError(customStderr?: string): void {
    this.nextResolverData = { method: 'finishWithError', customData: customStderr }
  }

  public static mockFinishWithTimeOut(customStdout?: string): void {
    this.nextResolverData = { method: 'finishWithTimeOut', customData: customStdout }
  }

  private static exec(_command: string, _options: ExecOptions, callback?: ExecCallBack): ChildProcessMock {
    const stdout = new EventEmitter()
    const stderr = new EventEmitter()
    const finish = (customStdout?: string): void => {
      const finalStdout: string = customStdout || 'stdout'

      stdout.emit('data', finalStdout)
      callback(null, finalStdout, '')
    }
    const finishWithError = (customStderr?: string): void => {
      const finalStderr: string = customStderr || 'stderr'
      const error: ExecException = { code: 127, name: 'error', message: 'There was an error' }

      stderr.emit('data', finalStderr)
      callback(error, '', finalStderr)
    }
    const finishWithTimeOut = (customStdout?: string): void => {
      const finalStdout: string = customStdout || 'stdout'
      const error: ExecException = { signal: 'SIGTERM', name: 'timeout', message: 'Too much time' }

      stdout.emit('data', finalStdout)
      callback(error, finalStdout, '')
    }
    const currentChildProcess: ChildProcessMock = { stdout, stderr, finish, finishWithError, finishWithTimeOut }

    setTimeout(() => {
      if (this.nextResolverData) {
        currentChildProcess[this.nextResolverData.method](this.nextResolverData.customData)

        this.nextResolverData = null
      }
    }, 10)

    return currentChildProcess
  }
}
