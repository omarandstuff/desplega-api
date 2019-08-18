import RemoteStep from '../src/RemoteStep'
import Remote from '../src/Remote'
import ssh2 from 'ssh2'
import SSH2Mocker from './utils/SSH2Mocker'
import { Context } from '../src/Pipeline.types'

beforeEach((): void => {
  SSH2Mocker.mock(ssh2)
})

afterEach((): void => {
  SSH2Mocker.unMock()
})

describe('Remote#run', () => {
  it('executes a remote command and return its result', async (): Promise<void> => {
    const remoteProcessor: Remote = new Remote({})
    const remoteStep: RemoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor' })
    const thenFunc = jest.fn()

    SSH2Mocker.addFinishMock()
    await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1).then(thenFunc)

    expect(thenFunc).toHaveBeenCalledWith({
      error: {
        code: 0,
        message: undefined,
        name: 'signal',
        signal: 'signal'
      },
      stdout: 'stdout',
      stderr: ''
    })
  })

  it('changes the command working directory if set', async (): Promise<void> => {
    const remoteProcessor: Remote = ({ exec: jest.fn() } as unknown) as Remote
    const remoteStep: RemoteStep = new RemoteStep({
      title: 'title',
      command: 'command',
      remoteId: 'remoteProcessor',
      workingDirectory: 'some/path'
    })

    await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1)

    expect(remoteProcessor.exec as jest.Mock).toHaveBeenCalledWith('cd some/path && command', {}, undefined)
  })

  it('allows to generate a dynamic command', async (): Promise<void> => {
    const remoteProcessor: Remote = ({ exec: jest.fn() } as unknown) as Remote
    const command = (): string => 'dynamic command'
    const remoteStep = new RemoteStep({ title: 'title', command, remoteId: 'remoteProcessor' })

    await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1)

    expect(remoteProcessor.exec as jest.Mock).toHaveBeenCalledWith('dynamic command', {}, undefined)
  })

  it('scape values using globals from context', async (): Promise<void> => {
    const remoteProcessor: Remote = ({ exec: jest.fn() } as unknown) as Remote
    const command = (): string => 'dynamic :command:'
    const remoteStep = new RemoteStep({ title: 'title', command, remoteId: 'remoteProcessor' })

    await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: { command: 'replaced command' } } as unknown) as Context, 1)

    expect((remoteProcessor.exec as jest.Mock).mock.calls[0][0]).toEqual('dynamic replaced command')
  })

  it('can set the remote through the context', async (): Promise<void> => {
    const remoteProcessor: Remote = new Remote({})
    const remoteStep: RemoteStep = new RemoteStep({ title: 'title', command: 'command' })
    const thenFunc = jest.fn()

    SSH2Mocker.addFinishMock()
    await remoteStep.run(({ remoteId: 'remoteProcessor', remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1).then(thenFunc)

    expect(thenFunc).toHaveBeenCalledWith({
      error: {
        code: 0,
        message: undefined,
        name: 'signal',
        signal: 'signal'
      },
      stdout: 'stdout',
      stderr: ''
    })
  })

  it('throws if thew remote is not set ', async (): Promise<void> => {
    const remoteProcessor: Remote = new Remote({})
    const remoteStep: RemoteStep = new RemoteStep({ title: 'title', command: 'command' })
    const catchFunc = jest.fn()

    SSH2Mocker.addFinishMock()
    await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1).catch(catchFunc)

    expect(catchFunc).toHaveBeenCalledWith({ error: new Error('Remote not configred or unmatching remoteId provided'), stdout: '', stderr: '' })
  })

  it('rejects when the command fucntion throws error', async (): Promise<void> => {
    const remoteProcessor: Remote = new Remote({})
    const command = (context: any): string => context()
    const remoteStep = new RemoteStep({ title: 'title', command, remoteId: 'remoteProcessor' })
    const catchFunc = jest.fn()

    await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1).catch(catchFunc)

    expect(catchFunc).toHaveBeenCalledWith({ error: TypeError('context is not a function'), stderr: '', stdout: '' })
  })

  describe('when the maxRetries option is set and the exec keeps failing', () => {
    it('retries the same command the specified ammount', async (): Promise<void> => {
      const remoteProcessor: Remote = new Remote({})
      const remoteStep: RemoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor', maxRetries: 1 })
      const catchFunc = jest.fn()

      SSH2Mocker.addFinishWithErrorMock()
      SSH2Mocker.addFinishWithErrorMock()
      await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1).catch(catchFunc)

      expect(catchFunc).toHaveBeenCalledWith({ error: { code: 128, message: undefined, name: 'signal', signal: 'signal' }, stdout: '', stderr: 'stderr' })
    })

    it('resolve if the exec command if it is successfull before spending all tries', async (): Promise<void> => {
      const remoteProcessor: Remote = new Remote({}, { timeout: 1 })
      const remoteStep: RemoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor', maxRetries: 4 })
      const thenFunc = jest.fn()

      SSH2Mocker.addFinishWithErrorMock()
      SSH2Mocker.addFinishWithErrorMock()
      SSH2Mocker.addTimeOutErrorMock()
      SSH2Mocker.addTimeOutErrorMock()
      SSH2Mocker.addFinishMock()
      await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1).then(thenFunc)

      expect(thenFunc).toHaveBeenCalledWith({ error: { code: 0, message: undefined, name: 'signal', signal: 'signal' }, stdout: 'stdout', stderr: '' })
    })
  })

  describe('when onFailure is set to continue', () => {
    it('resolves instead of rejecting the step', async (): Promise<void> => {
      const remoteProcessor: Remote = new Remote({})
      const remoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor', onFailure: 'continue' })
      const thenFunc = jest.fn()

      SSH2Mocker.addFinishWithErrorMock()
      await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1).then(thenFunc)

      expect(thenFunc).toHaveBeenCalledWith({ error: { code: 128, message: undefined, name: 'signal', signal: 'signal' }, stderr: 'stderr', stdout: '' })
    })
  })

  describe('when onFailure is set to continue', () => {
    it('resolves instead of rejecting the step', async (): Promise<void> => {
      const remoteProcessor: Remote = new Remote({})
      const remoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor', onFailure: 'continue' })
      const thenFunc = jest.fn()

      SSH2Mocker.addFinishWithErrorMock()
      await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1).then(thenFunc)

      expect(thenFunc).toHaveBeenCalledWith({ error: { code: 128, message: undefined, name: 'signal', signal: 'signal' }, stderr: 'stderr', stdout: '' })
    })
  })

  describe('when onSuccess is set to terminate', () => {
    it('rejects instead of resolve the step', async (): Promise<void> => {
      const remoteProcessor: Remote = new Remote({})
      const remoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor', onSuccess: 'terminate' })
      const catchFunc = jest.fn()

      SSH2Mocker.addFinishMock()
      await remoteStep.run(({ remoteProcessors: { remoteProcessor }, globals: {} } as unknown) as Context, 1).catch(catchFunc)

      expect(catchFunc.mock.calls[0][0]).toEqual({ error: { code: 0, message: undefined, name: 'signal', signal: 'signal' }, stderr: '', stdout: 'stdout' })
    })
  })
})
