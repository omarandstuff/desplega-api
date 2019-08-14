import EventEmitter from 'events'

/**
 * Base class for process emmiters (stdout, stderr)
 */
export default class ProcessEmitter extends EventEmitter {
  public addListener(event: 'stdout', listener: (stdout: string) => void): this
  public addListener(event: 'stderr', listener: (stderr: string) => void): this
  public addListener(event: 'stdout' | 'stderr', listener: (stderr: string) => void): this {
    return super.addListener(event, listener)
  }

  public on(event: 'stdout', listener: (stdout: string) => void): this
  public on(event: 'stderr', listener: (stderr: string) => void): this
  public on(event: 'stdout' | 'stderr', listener: (stderr: string) => void): this {
    return super.on(event, listener)
  }

  public once(event: 'stdout', listener: (stdout: string) => void): this
  public once(event: 'stderr', listener: (stderr: string) => void): this
  public once(event: 'stdout' | 'stderr', listener: (stderr: string) => void): this {
    return super.once(event, listener)
  }

  public removeListener(event: 'stdout', listener: (stdout: string) => void): this
  public removeListener(event: 'stderr', listener: (stderr: string) => void): this
  public removeListener(event: 'stdout' | 'stderr', listener: (stderr: string) => void): this {
    return super.removeListener(event, listener)
  }

  public off(event: 'stdout', listener: (stdout: string) => void): this
  public off(event: 'stderr', listener: (stderr: string) => void): this
  public off(event: 'stdout' | 'stderr', listener: (stderr: string) => void): this {
    return super.off(event, listener)
  }

  public removeAllListeners(event: 'stdout' | 'stderr'): this {
    return super.removeAllListeners(event)
  }

  public listeners(event: 'stdout' | 'stderr'): Function[] {
    return super.listeners(event)
  }

  public rawListeners(event: 'stdout' | 'stderr'): Function[] {
    return super.rawListeners(event)
  }

  public emit(event: 'stdout' | 'stderr', data: string): boolean {
    return super.emit(event, data)
  }

  public listenerCount(type: 'stdout' | 'stderr'): number {
    return super.listenerCount(type)
  }

  public prependListener(event: 'stdout', listener: (stdout: string) => void): this
  public prependListener(event: 'stderr', listener: (stderr: string) => void): this
  public prependListener(event: 'stdout' | 'stderr', listener: (stderr: string) => void): this {
    return super.prependListener(event, listener)
  }

  public prependOnceListener(event: 'stdout', listener: (stdout: string) => void): this
  public prependOnceListener(event: 'stderr', listener: (stderr: string) => void): this
  public prependOnceListener(event: 'stdout' | 'stderr', listener: (stderr: string) => void): this {
    return super.prependOnceListener(event, listener)
  }
}
