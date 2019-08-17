import { EventEmitter } from 'events'

jest.useFakeTimers()

class FakeChannel extends EventEmitter {
  public stderr: EventEmitter = new EventEmitter()
}

class ClientMock extends EventEmitter {
  public exec(_: string, _2: any, callback: (err: Error, channel: FakeChannel) => void): boolean {
    const nextResolverData = SSH2ClientMocker.nextResolverData[0]

    if (nextResolverData) {
      const channel = new FakeChannel()

      switch (nextResolverData.type) {
        case 'execError':
          callback(new Error('exec error'), channel)
          SSH2ClientMocker.nextResolverData.shift()

          return true
        case 'finish':
          callback(null, channel)
          channel.emit('data', nextResolverData.customData || 'stdout')
          channel.emit('close', 0, 'signal')
          SSH2ClientMocker.nextResolverData.shift()

          return true
        case 'finishWithError':
          callback(null, channel)
          channel.stderr.emit('data', nextResolverData.customData || 'stderr')
          channel.emit('close', 128, 'signal')
          SSH2ClientMocker.nextResolverData.shift()

          return true
        case 'networkError':
          callback(null, channel)
          channel.emit('data', nextResolverData.customData || 'stdout')
          channel.emit('close', undefined, 'signal')
          SSH2ClientMocker.nextResolverData.shift()

        case 'timeoutError':
          callback(null, channel)
          channel.emit('data', nextResolverData.customData || 'stdout')
          jest.runAllTimers()
          SSH2ClientMocker.nextResolverData.shift()

          return true
        default:
          break
      }
    } else {
      throw new Error('Client mock exec was called without resolve data')
    }
  }

  public connect(): void {
    const nextResolverData = SSH2ClientMocker.nextResolverData[0]

    if (nextResolverData.type === 'connectionError') {
      this.emit('error', new Error('Connection error'))
      this.emit('close')
      SSH2ClientMocker.nextResolverData.shift()
    } else {
      this.emit('ready')
    }
  }

  public end(): void {
    this.emit('close')
  }
}

export default class SSH2ClientMocker {
  public Client = ClientMock
  public static nextResolverData: {
    type: 'finish' | 'finishWithError' | 'connectionError' | 'execError' | 'networkError' | 'timeoutError'
    customData?: string
  }[] = []
  private static originalInstance: any
  private static originalClient: any

  public static mock(originalInstance: any): void {
    this.originalInstance = originalInstance
    this.originalClient = originalInstance.Client
    this.originalInstance.Client = ClientMock
  }

  public static unMock(): void {
    this.originalInstance.Client = this.originalClient
    this.nextResolverData = []
  }

  public static addFinishMock(customStdout?: string): void {
    this.nextResolverData.push({ type: 'finish', customData: customStdout })
  }

  public static addConnectionErrorMock(): void {
    this.nextResolverData.push({ type: 'connectionError' })
  }

  public static addFinishWithErrorMock(customStderr?: string): void {
    this.nextResolverData.push({ type: 'finishWithError', customData: customStderr })
  }

  public static addExecErrorMock(): void {
    this.nextResolverData.push({ type: 'execError' })
  }

  public static addNetworkErrorMock(customStdout?: string): void {
    this.nextResolverData.push({ type: 'networkError', customData: customStdout })
  }

  public static addTimeOutErrorMock(): void {
    this.nextResolverData.push({ type: 'timeoutError' })
  }
}
