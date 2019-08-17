import RemoteStep from '../src/RemoteStep'
import Local from '../src/Local'
import Remote from '../src/Remote'
import ssh2 from 'ssh2'
import SSH2Mocker from './utils/SSH2Mocker'

beforeEach((): void => {
  SSH2Mocker.mock(ssh2)
})

afterEach((): void => {
  SSH2Mocker.unMock()
})

describe('Remote#run', () => {
  it('executes a remote command and return its result', async () => {
    const localProcessor: Local = new Local()
    const remoteProcessor: Remote = new Remote({})
    const remoteStep: RemoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor' })
    const thenFunc = jest.fn()

    SSH2Mocker.addFinishMock()
    await remoteStep.run({ localProcessor, remoteProcessors: { remoteProcessor } }).then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toEqual({
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

  it('changes the command working directory if set', async () => {
    const localProcessor: Local = new Local()
    const remoteProcessor: Remote = ({ exec: jest.fn() } as unknown) as Remote
    const remoteStep: RemoteStep = new RemoteStep({
      title: 'title',
      command: 'command',
      remoteId: 'remoteProcessor',
      workingDirectory: 'some/path'
    })

    await remoteStep.run({ localProcessor, remoteProcessors: { remoteProcessor } })

    expect((remoteProcessor.exec as jest.Mock).mock.calls[0][0]).toEqual('cd some/path && command')
  })

  it('allows to generate a dynamic command', async () => {
    const localProcessor: Local = new Local()
    const remoteProcessor: Remote = ({ exec: jest.fn() } as unknown) as Remote
    const command = (_context: any) => 'dynamic command'
    const remoteStep = new RemoteStep({ title: 'title', command, remoteId: 'remoteProcessor' })

    await remoteStep.run({ localProcessor, remoteProcessors: { remoteProcessor } })

    expect((remoteProcessor.exec as jest.Mock).mock.calls[0][0]).toEqual('dynamic command')
  })

  it('can set the remote through the context', async () => {
    const localProcessor: Local = new Local()
    const remoteProcessor: Remote = new Remote({})
    const remoteStep: RemoteStep = new RemoteStep({ title: 'title', command: 'command' })
    const thenFunc = jest.fn()

    SSH2Mocker.addFinishMock()
    await remoteStep.run({ localProcessor, remoteId: 'remoteProcessor', remoteProcessors: { remoteProcessor } }).then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toEqual({
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

  it('throws if thew remote is not set ', async () => {
    const localProcessor: Local = new Local()
    const remoteProcessor: Remote = new Remote({})
    const remoteStep: RemoteStep = new RemoteStep({ title: 'title', command: 'command' })
    const catchFunc = jest.fn()

    SSH2Mocker.addFinishMock()
    await remoteStep.run({ localProcessor, remoteProcessors: { remoteProcessor } }).catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual({ error: new Error('Remote not configred or unmatching remoteId provided'), stdout: '', stderr: '' })
  })

  it('rejects when the command fucntion throws error', async () => {
    const localProcessor = new Local()
    const remoteProcessor: Remote = new Remote({})
    const command = (context: any) => context()
    const remoteStep = new RemoteStep({ title: 'title', command, remoteId: 'remoteProcessor' })
    const catchFunc = jest.fn()

    await remoteStep.run({ localProcessor, remoteProcessors: { remoteProcessor } }).catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual({ error: TypeError('context is not a function'), stderr: '', stdout: '' })
  })

  describe('when the maxRetries option is set and the exec keeps failing', () => {
    it('retries the same command the specified ammount', async () => {
      const localProcessor: Local = new Local()
      const remoteProcessor: Remote = new Remote({})
      const remoteStep: RemoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor', maxRetries: 1 })
      const catchFunc = jest.fn()

      SSH2Mocker.addFinishWithErrorMock()
      SSH2Mocker.addFinishWithErrorMock()
      await remoteStep.run({ localProcessor, remoteProcessors: { remoteProcessor } }).catch(catchFunc)

      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toEqual({ error: { code: 128, message: undefined, name: 'signal', signal: 'signal' }, stdout: '', stderr: 'stderr' })
    })

    it('resolve if the exec command if it is successfull before spending all tries', async () => {
      const localProcessor: Local = new Local()
      const remoteProcessor: Remote = new Remote({}, { timeout: 1 })
      const remoteStep: RemoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor', maxRetries: 4 })
      const catchFunc = jest.fn()
      const thenFunc = jest.fn()

      SSH2Mocker.addFinishWithErrorMock()
      SSH2Mocker.addFinishWithErrorMock()
      SSH2Mocker.addTimeOutErrorMock()
      SSH2Mocker.addTimeOutErrorMock()
      SSH2Mocker.addFinishMock()
      await remoteStep
        .run({ localProcessor, remoteProcessors: { remoteProcessor } })
        .then(thenFunc)
        .catch(catchFunc)

      expect(catchFunc.mock.calls.length).toBe(0)
      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toEqual({ error: { code: 0, message: undefined, name: 'signal', signal: 'signal' }, stdout: 'stdout', stderr: '' })
    })
  })

  describe('when onFailure is set to continue', () => {
    it('resolves instead of rejecting the step', async () => {
      const localProcessor = new Local()
      const remoteProcessor: Remote = new Remote({})
      const remoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor', onFailure: 'continue' })
      const thenFunc = jest.fn()

      SSH2Mocker.addFinishWithErrorMock()
      await remoteStep.run({ localProcessor, remoteProcessors: { remoteProcessor } }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toEqual({ error: { code: 128, message: undefined, name: 'signal', signal: 'signal' }, stderr: 'stderr', stdout: '' })
    })
  })

  describe('when onFailure is set to continue', () => {
    it('resolves instead of rejecting the step', async () => {
      const localProcessor = new Local()
      const remoteProcessor: Remote = new Remote({})
      const remoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor', onFailure: 'continue' })
      const thenFunc = jest.fn()

      SSH2Mocker.addFinishWithErrorMock()
      await remoteStep.run({ localProcessor, remoteProcessors: { remoteProcessor } }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toEqual({ error: { code: 128, message: undefined, name: 'signal', signal: 'signal' }, stderr: 'stderr', stdout: '' })
    })
  })

  describe('when onSuccess is set to terminate', () => {
    it('rejects instead of resolve the step', async () => {
      const localProcessor = new Local()
      const remoteProcessor: Remote = new Remote({})
      const remoteStep = new RemoteStep({ title: 'title', command: 'command', remoteId: 'remoteProcessor', onSuccess: 'terminate' })
      const catchFunc = jest.fn()

      SSH2Mocker.addFinishMock()
      await remoteStep.run({ localProcessor, remoteProcessors: { remoteProcessor } }).catch(catchFunc)

      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toEqual({ error: { code: 0, message: undefined, name: 'signal', signal: 'signal' }, stderr: '', stdout: 'stdout' })
    })
  })
})
