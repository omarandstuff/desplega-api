import EventEmitter from 'events'
import { ExecOptions } from 'child_process'
import { VirtualFunction } from './Virtual.types'
import { Context } from './Pipeline.types'

/**
 * Base class for processors (stdout, stderr)
 */
export default class Processor extends EventEmitter {
  public async exec(_: string | VirtualFunction, _2?: ExecOptions | Context, _3?: ExecOptions): Promise<any> {
    throw new Error('You need to implement the exec method')
  }

  public addListener(event: 'stdout', listener: (stdout: string) => void): this
  public addListener(event: 'stderr', listener: (stderr: string) => void): this
  public addListener(event: 'connecting', listener: () => void): this
  public addListener(event: 'connected', listener: () => void): this
  public addListener(event: 'closed', listener: () => void): this
  public addListener(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed', listener: (data: string) => void): this {
    return super.addListener(event, listener)
  }

  public on(event: 'stdout', listener: (stdout: string) => void): this
  public on(event: 'stderr', listener: (stderr: string) => void): this
  public on(event: 'connecting', listener: () => void): this
  public on(event: 'connected', listener: () => void): this
  public on(event: 'closed', listener: () => void): this
  public on(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed', listener: (data: string) => void): this {
    return super.on(event, listener)
  }

  public once(event: 'stdout', listener: (stdout: string) => void): this
  public once(event: 'stderr', listener: (stderr: string) => void): this
  public once(event: 'connecting', listener: () => void): this
  public once(event: 'connected', listener: () => void): this
  public once(event: 'closed', listener: () => void): this
  public once(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed', listener: (data: string) => void): this {
    return super.once(event, listener)
  }

  public removeListener(event: 'stdout', listener: (stdout: string) => void): this
  public removeListener(event: 'stderr', listener: (stderr: string) => void): this
  public removeListener(event: 'connecting', listener: () => void): this
  public removeListener(event: 'connected', listener: () => void): this
  public removeListener(event: 'closed', listener: () => void): this
  public removeListener(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed', listener: (data: string) => void): this {
    return super.removeListener(event, listener)
  }

  public off(event: 'stdout', listener: (stdout: string) => void): this
  public off(event: 'stderr', listener: (stderr: string) => void): this
  public off(event: 'connecting', listener: () => void): this
  public off(event: 'connected', listener: () => void): this
  public off(event: 'closed', listener: () => void): this
  public off(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed', listener: (data: string) => void): this {
    return super.off(event, listener)
  }

  public removeAllListeners(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed'): this {
    return super.removeAllListeners(event)
  }

  public listeners(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed'): Function[] {
    return super.listeners(event)
  }

  public rawListeners(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed'): Function[] {
    return super.rawListeners(event)
  }

  public emit(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed', data?: string): boolean {
    return super.emit(event, data)
  }

  public listenerCount(type: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed'): number {
    return super.listenerCount(type)
  }

  public prependListener(event: 'stdout', listener: (stdout: string) => void): this
  public prependListener(event: 'stderr', listener: (stderr: string) => void): this
  public prependListener(event: 'connecting', listener: () => void): this
  public prependListener(event: 'connected', listener: () => void): this
  public prependListener(event: 'closed', listener: () => void): this
  public prependListener(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed', listener: (data: string) => void): this {
    return super.prependListener(event, listener)
  }

  public prependOnceListener(event: 'stdout', listener: (stdout: string) => void): this
  public prependOnceListener(event: 'stderr', listener: (stderr: string) => void): this
  public prependOnceListener(event: 'connecting', listener: () => void): this
  public prependOnceListener(event: 'connected', listener: () => void): this
  public prependOnceListener(event: 'closed', listener: () => void): this
  public prependOnceListener(event: 'stdout' | 'stderr' | 'connecting' | 'connected' | 'closed', listener: (data: string) => void): this {
    return super.prependOnceListener(event, listener)
  }
}
