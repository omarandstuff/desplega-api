import PipelineLogger from '../src/PipelineLogger'
import Pipeline from '../src/Pipeline'
import { CommandResult } from '../src/Processor.types'
import LocalStep from '../src/LocalStep'
import childProcess from 'child_process'
import ChildProcessMocker from './utils/ChildProcessMocker'
import ssh2 from 'ssh2'
import SSH2Mocker from './utils/SSH2Mocker'
import RemoteStep from '../src/RemoteStep'
import VirtualStep from '../src/VirtualStep'
import { VirtualEmit } from '../src/Virtual.types'
import { Context } from '../src/Pipeline.types'

const pipelineInitMock: jest.Mock = jest.fn()
const pipelineHeaderMock: jest.Mock = jest.fn()
const pipelineFinishMock: jest.Mock = jest.fn()
const pipelineFailMock: jest.Mock = jest.fn()

const localStepInitMock: jest.Mock = jest.fn()
const localStepRetryMock: jest.Mock = jest.fn()
const localStepFinishMock: jest.Mock = jest.fn()
const localStepFailMock: jest.Mock = jest.fn()

const remoteStepInitMock: jest.Mock = jest.fn()
const remoteStepRetryMock: jest.Mock = jest.fn()
const remoteStepFinishMock: jest.Mock = jest.fn()
const remoteStepFailMock: jest.Mock = jest.fn()

const virtualStepInitMock: jest.Mock = jest.fn()
const virtualStepRetryMock: jest.Mock = jest.fn()
const virtualStepFinishMock: jest.Mock = jest.fn()
const virtualStepFailMock: jest.Mock = jest.fn()

const localStdoutMock: jest.Mock = jest.fn()
const localStderrMock: jest.Mock = jest.fn()

const remoteConnectingMock: jest.Mock = jest.fn()
const remoteConnectedMock: jest.Mock = jest.fn()
const remoteClosedMock: jest.Mock = jest.fn()
const remoteStdoutMock: jest.Mock = jest.fn()
const remoteStderrMock: jest.Mock = jest.fn()

const virtualStdoutMock: jest.Mock = jest.fn()
const virtualStderrMock: jest.Mock = jest.fn()

beforeEach((): void => {
  ChildProcessMocker.mock(childProcess)
  SSH2Mocker.mock(ssh2)
})

afterEach((): void => {
  ChildProcessMocker.unMock()
  SSH2Mocker.unMock()

  pipelineInitMock.mockReset()
  pipelineHeaderMock.mockReset()
  pipelineFinishMock.mockReset()
  pipelineFailMock.mockReset()

  localStepInitMock.mockReset()
  localStepRetryMock.mockReset()
  localStepFinishMock.mockReset()
  localStepFailMock.mockReset()

  remoteStepInitMock.mockReset()
  remoteStepRetryMock.mockReset()
  remoteStepFinishMock.mockReset()
  remoteStepFailMock.mockReset()

  virtualStepInitMock.mockReset()
  virtualStepRetryMock.mockReset()
  virtualStepFinishMock.mockReset()
  virtualStepFailMock.mockReset()

  localStdoutMock.mockReset()
  localStderrMock.mockReset()

  remoteConnectingMock.mockReset()
  remoteConnectedMock.mockReset()
  remoteClosedMock.mockReset()
  remoteStdoutMock.mockReset()
  remoteStderrMock.mockReset()

  virtualStdoutMock.mockReset()
  virtualStderrMock.mockReset()
})

class TestLogger extends PipelineLogger {
  public pipelineInit(title: string, startTime: Date): void {
    super.pipelineInit(title, startTime)
    pipelineInitMock(title)
  }
  public pipelineHeader(title: string, time: Date): void {
    super.pipelineHeader(title, time)
    pipelineHeaderMock(title)
  }
  public pipelineFinish(finishTime: Date): void {
    super.pipelineFinish(finishTime)
    pipelineFinishMock()
  }
  public pipelineFail(error: CommandResult, finishTime: Date): void {
    super.pipelineFail(error, finishTime)
    pipelineFailMock(error)
  }

  public localStepInit(index: number, title: string, command: string, startTime: Date): void {
    super.localStepInit(index, title, command, startTime)
    localStepInitMock(index, title, command)
  }
  public localStepRetry(retry: number, retryTime: Date): void {
    super.localStepRetry(retry, retryTime)
    localStepRetryMock(retry)
  }
  public localStepFinish(result: CommandResult, finishTime: Date): void {
    super.localStepFinish(result, finishTime)
    localStepFinishMock(result)
  }
  public localStepFail(error: CommandResult, finishTime: Date): void {
    super.localStepFail(error, finishTime)
    localStepFailMock(error)
  }

  public remoteStepInit(index: number, title: string, command: string, remoteId: string, startTime: Date): void {
    super.remoteStepInit(index, title, command, remoteId, startTime)
    remoteStepInitMock(index, title, command, remoteId)
  }
  public remoteStepRetry(retry: number, retryTime: Date): void {
    super.remoteStepRetry(retry, retryTime)
    remoteStepRetryMock(retry)
  }
  public remoteStepFinish(result: CommandResult, finishTime: Date): void {
    super.remoteStepFinish(result, finishTime)
    remoteStepFinishMock(result)
  }
  public remoteStepFail(error: CommandResult, finishTime: Date): void {
    super.remoteStepFail(error, finishTime)
    remoteStepFailMock(error)
  }

  public virtualStepInit(index: number, title: string, startTime: Date): void {
    super.virtualStepInit(index, title, startTime)
    virtualStepInitMock(index, title)
  }
  public virtualStepRetry(retry: number, retryTime: Date): void {
    super.virtualStepRetry(retry, retryTime)
    virtualStepRetryMock(retry)
  }
  public virtualStepFinish(result: CommandResult, finishTime: Date): void {
    super.virtualStepFinish(result, finishTime)
    virtualStepFinishMock(result)
  }
  public virtualStepFail(error: CommandResult, finishTime: Date): void {
    super.virtualStepFail(error, finishTime)
    virtualStepFailMock(error)
  }

  public localStdout(stdout: string): void {
    super.localStdout(stdout)
    localStdoutMock(stdout)
  }
  public localStderr(stderr: string): void {
    super.localStderr(stderr)
    localStderrMock(stderr)
  }

  public remoteConnecting(remoteId: string): void {
    super.remoteConnecting(remoteId)
    remoteConnectingMock(remoteId)
  }
  public remoteConnected(remoteId: string): void {
    super.remoteConnected(remoteId)
    remoteConnectedMock(remoteId)
  }
  public remoteClosed(remoteId: string): void {
    super.remoteClosed(remoteId)
    remoteClosedMock(remoteId)
  }
  public remoteStdout(stdout: string): void {
    super.remoteStdout(stdout)
    remoteStdoutMock(stdout)
  }
  public remoteStderr(stderr: string): void {
    super.remoteStderr(stderr)
    remoteStderrMock(stderr)
  }

  public virtualStdout(stdout: string): void {
    super.virtualStdout(stdout)
    virtualStdoutMock(stdout)
  }
  public virtualStderr(stderr: string): void {
    super.virtualStderr(stderr)
    virtualStderrMock(stderr)
  }
}

describe('PipelineLogger', (): void => {
  describe('Header and pipeline finish', (): void => {
    it('listens to all events in a pipeline', async (): Promise<void> => {
      const pipeline: Pipeline = new Pipeline({ title: 'pipeline', steps: [{ title: 'Header', isHeader: true }] })
      new TestLogger(pipeline)

      await pipeline.run()

      expect(pipelineInitMock).toHaveBeenCalledWith('pipeline')
      expect(pipelineHeaderMock).toHaveBeenCalledWith('Header')
      expect(pipelineFinishMock).toHaveBeenCalledWith()
    })
  })

  describe('Local steps', (): void => {
    it('listens to all events in a pipeline', async (): Promise<void> => {
      const step1 = new LocalStep({ title: 'Local man', command: 'command', workingDirectory: 'working' })
      const step2 = new LocalStep({ title: 'Local man 2', command: (): string => 'command', workingDirectory: 'working2', maxRetries: 1 })

      const pipeline: Pipeline = new Pipeline({ title: 'pipeline', steps: [step1, step2] })
      new TestLogger(pipeline)

      ChildProcessMocker.addFinishMock()
      ChildProcessMocker.addFinishWithErrorMock()
      ChildProcessMocker.addFinishWithErrorMock()
      jest.useRealTimers()
      await pipeline.run()
      jest.useFakeTimers()

      expect(localStepInitMock).toHaveBeenCalledWith(1, 'Local man', 'cd working && command')
      expect(localStepInitMock).toHaveBeenCalledWith(2, 'Local man 2', 'cd working2 && command')
      expect(localStepRetryMock).toHaveBeenCalledWith(1)
      expect(localStepFinishMock).toHaveBeenCalledWith({ error: null, stderr: '', stdout: 'stdout' })
      expect(localStepFailMock).toHaveBeenCalledWith({ error: { code: 127, message: 'There was an error', name: 'error' }, stderr: 'stderr', stdout: '' })
      expect(localStderrMock).toHaveBeenCalledWith('stderr')
      expect(localStdoutMock).toHaveBeenCalledWith('stdout')

      expect(pipelineFailMock).toHaveBeenCalledWith({ error: { code: 127, message: 'There was an error', name: 'error' }, stderr: 'stderr', stdout: '' })
    })
  })

  describe('Remote steps', (): void => {
    it('listens to all events in a pipeline', async (): Promise<void> => {
      const step1 = new RemoteStep({ title: 'Remote man', command: 'command', workingDirectory: 'working' })
      const step2 = new RemoteStep({ title: 'Remote man 2', command: (): string => 'command', workingDirectory: 'working2', maxRetries: 1 })

      const pipeline: Pipeline = new Pipeline({ title: 'pipeline', steps: [step1, step2], remotes: { default: { host: 'yes' } } })
      new TestLogger(pipeline)

      SSH2Mocker.addFinishMock()
      SSH2Mocker.addFinishWithErrorMock()
      SSH2Mocker.addFinishWithErrorMock()
      await pipeline.run()

      expect(remoteStepInitMock).toHaveBeenCalledWith(1, 'Remote man', 'cd working && command', 'default')
      expect(remoteStepInitMock).toHaveBeenCalledWith(2, 'Remote man 2', 'cd working2 && command', 'default')
      expect(remoteStepRetryMock).toHaveBeenCalledWith(1)
      expect(remoteStepFinishMock).toHaveBeenCalledWith({
        error: { code: 0, message: undefined, name: 'signal', signal: 'signal' },
        stderr: '',
        stdout: 'stdout'
      })
      expect(remoteStepFailMock).toHaveBeenCalledWith({
        error: { code: 128, message: undefined, name: 'signal', signal: 'signal' },
        stderr: 'stderr',
        stdout: ''
      })
      expect(remoteStderrMock).toHaveBeenCalledWith('stderr')
      expect(remoteStdoutMock).toHaveBeenCalledWith('stdout')

      expect(pipelineFailMock).toHaveBeenCalledWith({
        error: { code: 128, message: undefined, name: 'signal', signal: 'signal' },
        stderr: 'stderr',
        stdout: ''
      })
    })
  })

  describe('Virtual steps', (): void => {
    it('listens to all events in a pipeline', async (): Promise<void> => {
      const step1 = new VirtualStep({
        title: 'Virtual man',
        asyncFunction: async (_context: Context, emit: VirtualEmit): Promise<void> => {
          emit('stdout', 'stdout')
        }
      })
      const step2 = new VirtualStep({
        title: 'Virtual man 2',
        asyncFunction: async (_context: Context, emit: VirtualEmit): Promise<void> => {
          emit('stderr', 'stderr')
          throw new Error('Async error')
        },
        maxRetries: 1
      })

      const pipeline: Pipeline = new Pipeline({ title: 'pipeline', steps: [step1, step2] })
      new TestLogger(pipeline)

      await pipeline.run()

      expect(virtualStepInitMock).toHaveBeenCalledWith(1, 'Virtual man')
      expect(virtualStepInitMock).toHaveBeenCalledWith(2, 'Virtual man 2')
      expect(virtualStepRetryMock).toHaveBeenCalledWith(1)
      expect(virtualStepFinishMock).toHaveBeenCalledWith({ error: null, stderr: '', stdout: 'stdout' })
      expect(virtualStepFailMock).toHaveBeenCalledWith({ error: new Error('Async error'), stderr: 'stderr', stdout: '' })
      expect(virtualStderrMock).toHaveBeenCalledWith('stderr')
      expect(virtualStdoutMock).toHaveBeenCalledWith('stdout')

      expect(pipelineFailMock).toHaveBeenCalledWith({ error: new Error('Async error'), stderr: 'stderr', stdout: '' })
    })
  })
})
