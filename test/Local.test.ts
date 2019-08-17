import Local from '../src/Local'
import childProcess from 'child_process'
import ChildProcessMocker from './utils/ChildProcessMocker'

beforeEach((): void => {
  ChildProcessMocker.mock(childProcess)
})

afterEach((): void => {
  ChildProcessMocker.unMock()
})

describe('Local#exec', () => {
  it('executes a local comand and then resolves the result', async () => {
    const local = new Local()
    const thenFunc = jest.fn()

    ChildProcessMocker.addFinishMock()

    await local.exec('test command').then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toEqual({ error: null, stdout: 'stdout', stderr: '' })
  })

  it('rejects if command fails', async () => {
    const local = new Local()
    const catchFunc = jest.fn()

    ChildProcessMocker.addFinishWithErrorMock()
    await local.exec('test command').catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual({
      error: { code: 127, message: 'There was an error', name: 'error' },
      stdout: '',
      stderr: 'stderr'
    })
  })

  it('can streams stdout and stderr before closing', async () => {
    const local = new Local()
    const thenFunc = jest.fn()
    const catchFunc = jest.fn()
    const streamFunc = jest.fn()

    local.addListener('stdout', streamFunc)
    local.addListener('stderr', streamFunc)

    ChildProcessMocker.addFinishMock()
    await local.exec('test command').then(thenFunc)

    expect(streamFunc.mock.calls.length).toBe(1)
    expect(streamFunc.mock.calls[0][0]).toBe('stdout')

    streamFunc.mockReset()

    ChildProcessMocker.addFinishWithErrorMock()
    await local.exec('test command').catch(catchFunc)

    expect(streamFunc.mock.calls.length).toBe(1)
    expect(streamFunc.mock.calls[0][0]).toEqual('stderr')
  })

  it('rejects if command timeout is reached', async () => {
    const local = new Local()
    const catchFunc = jest.fn()

    ChildProcessMocker.addFinishWithTimeOutMock()
    await local.exec('test command').catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual({
      error: { signal: 'SIGTERM', name: 'timeout', message: 'Too much time' },
      stdout: 'stdout',
      stderr: ''
    })
  })
})
