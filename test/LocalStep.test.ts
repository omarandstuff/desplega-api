import LocalStep from '../src/LocalStep'
import LocalManager from '../src/LocalManager'
import childProcess from 'child_process'
import ChildProcessMocker from './utils/ChildProcessMocker'

beforeEach((): void => {
  ChildProcessMocker.mock(childProcess)
})

afterEach((): void => {
  ChildProcessMocker.unMock()
})

describe('LocalStep#run', () => {
  it('executes a local command and return its result', async () => {
    const localManager: LocalManager = new LocalManager()
    const localStep: LocalStep = new LocalStep({ title: 'title', command: 'command' })
    const thenFunc = jest.fn()

    ChildProcessMocker.addFinishMock()
    await localStep.run({ localManager }).then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toEqual({ error: null, stdout: 'stdout', stderr: '' })
  })

  it('changes the command working directory if set', async () => {
    const localManager: LocalManager = ({ exec: jest.fn() } as unknown) as LocalManager
    const localStep: LocalStep = new LocalStep({
      title: 'title',
      command: 'command',
      workingDirectory: 'some/path'
    })

    await localStep.run({ localManager })

    expect((localManager.exec as jest.Mock).mock.calls[0][0]).toEqual('cd some/path && command')
  })

  it('allows to generate a dynamic command', async () => {
    const localManager: LocalManager = ({ exec: jest.fn() } as unknown) as LocalManager
    const command = (_context: any) => 'dynamic command'
    const localStep = new LocalStep({ title: 'title', command })

    await localStep.run({ localManager })

    expect((localManager.exec as jest.Mock).mock.calls[0][0]).toEqual('dynamic command')
  })

  it('rejects when the command fucntion throws error', async () => {
    const localManager = new LocalManager()
    const command = (context: any) => context()
    const localStep = new LocalStep({ title: 'title', command })
    const catchFunc = jest.fn()

    await localStep.run({ localManager }).catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual({ error: TypeError('context is not a function'), stderr: '', stdout: '' })
  })

  describe('when onFailure is set to continue', () => {
    it('resolves instead of rejecting the step', async () => {
      const localManager = new LocalManager()
      const localStep = new LocalStep({ title: 'title', command: 'command', onFailure: 'continue' })
      const thenFunc = jest.fn()

      ChildProcessMocker.addFinishWithErrorMock()
      await localStep.run({ localManager }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toEqual({ error: { code: 127, message: 'There was an error', name: 'error' }, stderr: 'stderr', stdout: '' })
    })
  })

  describe('when onFailure is set to continue', () => {
    it('resolves instead of rejecting the step', async () => {
      const localManager = new LocalManager()
      const localStep = new LocalStep({ title: 'title', command: 'command', onFailure: 'continue' })
      const thenFunc = jest.fn()

      ChildProcessMocker.addFinishWithErrorMock()
      await localStep.run({ localManager }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toEqual({ error: { code: 127, message: 'There was an error', name: 'error' }, stderr: 'stderr', stdout: '' })
    })
  })

  describe('when onSuccess is set to terminate', () => {
    it('rejects instead of resolve the step', async () => {
      const localManager = new LocalManager()
      const localStep = new LocalStep({ title: 'title', command: 'command', onSuccess: 'terminate' })
      const catchFunc = jest.fn()

      ChildProcessMocker.addFinishMock()
      await localStep.run({ localManager }).catch(catchFunc)

      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toEqual({ error: null, stderr: '', stdout: 'stdout' })
    })
  })
})
