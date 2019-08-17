import LocalStep from '../src/LocalStep'
import Local from '../src/Local'
import childProcess from 'child_process'
import ChildProcessMocker from './utils/ChildProcessMocker'
import { Context } from '../src/Step.types'

beforeEach((): void => {
  ChildProcessMocker.mock(childProcess)
})

afterEach((): void => {
  ChildProcessMocker.unMock()
})

describe('LocalStep#run', () => {
  it('executes a local command and return its result', async () => {
    const localProcessor: Local = new Local()
    const localStep: LocalStep = new LocalStep({ title: 'title', command: 'command' })
    const thenFunc = jest.fn()

    ChildProcessMocker.addFinishMock()
    await localStep.run({ localProcessor } as Context).then(thenFunc)

    expect(thenFunc).toHaveBeenCalledWith({ error: null, stdout: 'stdout', stderr: '' })
  })

  it('changes the command working directory if set', async () => {
    const localProcessor: Local = ({ exec: jest.fn() } as unknown) as Local
    const localStep: LocalStep = new LocalStep({
      title: 'title',
      command: 'command',
      workingDirectory: 'some/path'
    })

    await localStep.run({ localProcessor } as Context)

    expect((localProcessor.exec as jest.Mock).mock.calls[0][0]).toEqual('cd some/path && command')
  })

  it('allows to generate a dynamic command', async () => {
    const localProcessor: Local = ({ exec: jest.fn() } as unknown) as Local
    const command = (_context: any) => 'dynamic command'
    const localStep = new LocalStep({ title: 'title', command })

    await localStep.run({ localProcessor } as Context)

    expect((localProcessor.exec as jest.Mock).mock.calls[0][0]).toEqual('dynamic command')
  })

  it('rejects when the command fucntion throws error', async () => {
    const localProcessor = new Local()
    const command = (context: any) => context()
    const localStep = new LocalStep({ title: 'title', command })
    const catchFunc = jest.fn()

    await localStep.run({ localProcessor } as Context).catch(catchFunc)

    expect(catchFunc.mock.calls[0][0]).toEqual({ error: TypeError('context is not a function'), stderr: '', stdout: '' })
  })

  describe('when the maxRetries option is set and the exec keeps failing', () => {
    it('retries the same command the specified ammount', async () => {
      const localProcessor: Local = new Local()
      const localStep: LocalStep = new LocalStep({ title: 'title', command: 'command', maxRetries: 1 })
      const catchFunc = jest.fn()

      ChildProcessMocker.addFinishWithErrorMock()
      ChildProcessMocker.addFinishWithErrorMock()
      await localStep.run({ localProcessor } as Context).catch(catchFunc)

      expect(catchFunc.mock.calls[0][0]).toEqual({ error: { code: 127, name: 'error', message: 'There was an error' }, stdout: '', stderr: 'stderr' })
    })

    it('resolve if the exec command if it is successfull before spending all tries', async () => {
      const localProcessor: Local = new Local()
      const localStep: LocalStep = new LocalStep({ title: 'title', command: 'command', maxRetries: 4 })
      const thenFunc = jest.fn()

      ChildProcessMocker.addFinishWithErrorMock()
      ChildProcessMocker.addFinishWithErrorMock()
      ChildProcessMocker.addFinishWithTimeOutMock()
      ChildProcessMocker.addFinishWithTimeOutMock()
      ChildProcessMocker.addFinishMock()
      await localStep.run({ localProcessor } as Context).then(thenFunc)

      expect(thenFunc).toHaveBeenCalledWith({ error: null, stdout: 'stdout', stderr: '' })
    })
  })

  describe('when onFailure is set to continue', () => {
    it('resolves instead of rejecting the step', async () => {
      const localProcessor = new Local()
      const localStep = new LocalStep({ title: 'title', command: 'command', onFailure: 'continue' })
      const thenFunc = jest.fn()

      ChildProcessMocker.addFinishWithErrorMock()
      await localStep.run({ localProcessor } as Context).then(thenFunc)

      expect(thenFunc).toHaveBeenCalledWith({ error: { code: 127, message: 'There was an error', name: 'error' }, stderr: 'stderr', stdout: '' })
    })
  })

  describe('when onFailure is set to continue', () => {
    it('resolves instead of rejecting the step', async () => {
      const localProcessor = new Local()
      const localStep = new LocalStep({ title: 'title', command: 'command', onFailure: 'continue' })
      const thenFunc = jest.fn()

      ChildProcessMocker.addFinishWithErrorMock()
      await localStep.run({ localProcessor } as Context).then(thenFunc)

      expect(thenFunc).toHaveBeenCalledWith({ error: { code: 127, message: 'There was an error', name: 'error' }, stderr: 'stderr', stdout: '' })
    })
  })

  describe('when onSuccess is set to terminate', () => {
    it('rejects instead of resolve the step', async () => {
      const localProcessor = new Local()
      const localStep = new LocalStep({ title: 'title', command: 'command', onSuccess: 'terminate' })
      const catchFunc = jest.fn()

      ChildProcessMocker.addFinishMock()
      await localStep.run({ localProcessor } as Context).catch(catchFunc)

      expect(catchFunc.mock.calls[0][0]).toEqual({ error: null, stderr: '', stdout: 'stdout' })
    })
  })
})
