import LocalManager from '../src/LocalManager'
import childProcess from 'child_process'
import ChildProcessMocker from './utils/ChildProcessMocker'

beforeEach((): void => {
  ChildProcessMocker.mock(childProcess)
})

afterEach((): void => {
  ChildProcessMocker.unMock()
})

describe('Remote#exec', () => {
  it('Executes a local command and returns the result', async () => {
    const localManager = new LocalManager()
    const thenFunc = jest.fn()

    ChildProcessMocker.addMockFinish()
    await localManager.exec('command').then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toEqual({ error: null, stderr: '', stdout: 'stdout' })
  })

  it('streams stdout and stderr before finishing', async () => {
    const localManager = new LocalManager()
    const thenFunc = jest.fn()
    const catchFunc = jest.fn()
    const streamFunc = jest.fn()

    localManager.addListener('stdout', streamFunc)
    localManager.addListener('stderr', streamFunc)

    ChildProcessMocker.addMockFinish()
    await localManager.exec('test command').then(thenFunc)

    expect(streamFunc.mock.calls.length).toBe(1)
    expect(streamFunc.mock.calls[0][0]).toBe('stdout')

    streamFunc.mockReset()

    ChildProcessMocker.addMockFinishWithError()
    await localManager.exec('test command').catch(catchFunc)

    expect(streamFunc.mock.calls.length).toBe(1)
    expect(streamFunc.mock.calls[0][0]).toEqual('stderr')
  })

  it('throws if is already running', async () => {
    const localManager = new LocalManager()
    const catchFunc = jest.fn()

    localManager.status = 'running'

    await localManager.exec('command').catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual(new Error('Manager is bussy'))
  })

  it('rejects the execution if unsuccessful', async () => {
    const localManager = new LocalManager()
    const catchFunc = jest.fn()

    ChildProcessMocker.addMockFinishWithError()
    await localManager.exec('command').catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual({ error: { code: 127, message: 'There was an error', name: 'error' }, stdout: '', stderr: 'stderr' })
  })

  it('rejects the execution if the time out configuration inteval is reached', async () => {
    const localManager = new LocalManager()
    const catchFunc = jest.fn()

    ChildProcessMocker.addMockFinishWithTimeOut()
    await localManager.exec('command').catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual({ error: { signal: 'SIGTERM', message: 'Too much time', name: 'timeout' }, stdout: 'stdout', stderr: '' })
  })

  describe('when the maxRetries option is set and the exec keeps failing', () => {
    it('retries the same command the specified ammount', async () => {
      const localManager = new LocalManager({ maxRetries: 1 })
      const catchFunc = jest.fn()

      ChildProcessMocker.addMockFinishWithError()
      ChildProcessMocker.addMockFinishWithError()
      await localManager.exec('command').catch(catchFunc)

      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toEqual({ error: { code: 127, name: 'error', message: 'There was an error' }, stdout: '', stderr: 'stderr' })
    })

    it('resolve if the exec command if it is successfull before spending all tries', async () => {
      const localManager = new LocalManager({ maxRetries: 2 })
      const catchFunc = jest.fn()
      const thenFunc = jest.fn()

      ChildProcessMocker.addMockFinishWithError()
      ChildProcessMocker.addMockFinishWithError()
      ChildProcessMocker.addMockFinishWithTimeOut()
      ChildProcessMocker.addMockFinishWithTimeOut()
      ChildProcessMocker.addMockFinish()
      await localManager
        .exec('command', { maxRetries: 4 })
        .then(thenFunc)
        .catch(catchFunc)

      expect(catchFunc.mock.calls.length).toBe(0)
      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toEqual({ error: null, stdout: 'stdout', stderr: '' })
    })
  })
})
