import Pipeline from './Pipeline'
import { CommandResult } from './Processor.types'

export default class PipelineLogger {
  private pipeline: Pipeline

  public constructor(pipeline: Pipeline) {
    this.pipeline = pipeline

    this.pipeline.addListener('PIPELINE@INIT', this.pipelineInit)
    this.pipeline.addListener('PIPELINE@HEADER', this.pipelineHeader)
    this.pipeline.addListener('PIPELINE@FINISH', this.pipelineFinish)
    this.pipeline.addListener('PIPELINE@FAIL', this.pipelineFail)

    this.pipeline.addListener('LOCAL_STEP@INIT', this.localStepInit)
    this.pipeline.addListener('LOCAL_STEP@RETRY', this.localStepRetry)
    this.pipeline.addListener('LOCAL_STEP@FINISH', this.localStepFinish)
    this.pipeline.addListener('LOCAL_STEP@FAIL', this.localStepFail)

    this.pipeline.addListener('REMOTE_STEP@INIT', this.remoteStepInit)
    this.pipeline.addListener('REMOTE_STEP@RETRY', this.remoteStepRetry)
    this.pipeline.addListener('REMOTE_STEP@FINISH', this.remoteStepFinish)
    this.pipeline.addListener('REMOTE_STEP@FAIL', this.remoteStepFail)

    this.pipeline.addListener('VIRTUAL_STEP@INIT', this.virtualStepInit)
    this.pipeline.addListener('VIRTUAL_STEP@RETRY', this.virtualStepRetry)
    this.pipeline.addListener('VIRTUAL_STEP@FINISH', this.virtualStepFinish)
    this.pipeline.addListener('VIRTUAL_STEP@FAIL', this.virtualStepFail)

    this.pipeline.addListener('LOCAL@STDOUT', this.localStdout)
    this.pipeline.addListener('LOCAL@STDERR', this.localStderr)

    this.pipeline.addListener('REMOTE@CONNECTING', this.remoteConnecting)
    this.pipeline.addListener('REMOTE@CONNECTED', this.remoteConnected)
    this.pipeline.addListener('REMOTE@CLOSED', this.remoteClosed)
    this.pipeline.addListener('REMOTE@STDOUT', this.remoteStdout)
    this.pipeline.addListener('REMOTE@STDERR', this.remoteStderr)

    this.pipeline.addListener('VIRTUAL@STDOUT', this.virtualStdout)
    this.pipeline.addListener('VIRTUAL@STDERR', this.virtualStderr)
  }

  public pipelineInit(title: string, startTime: Date) {}
  public pipelineHeader(title: string, time: Date) {}
  public pipelineFinish(finishTime: Date) {}
  public pipelineFail(error: CommandResult, finishTime: Date) {}

  public localStepInit(index: number, title: string, command: string, startTime: Date) {}
  public localStepRetry(retry: number, retryTime: Date) {}
  public localStepFinish(result: CommandResult, finishTime: Date) {}
  public localStepFail(error: CommandResult, finishTime: Date) {}

  public remoteStepInit(index: number, title: string, command: string, remoteId: string, startTime: Date) {}
  public remoteStepRetry(retry: number, retryTime: Date) {}
  public remoteStepFinish(result: CommandResult, finishTime: Date) {}
  public remoteStepFail(error: CommandResult, finishTime: Date) {}

  public virtualStepInit(index: number, title: string, startTime: Date) {}
  public virtualStepRetry(retry: number, retryTime: Date) {}
  public virtualStepFinish(result: CommandResult, finishTime: Date) {}
  public virtualStepFail(error: CommandResult, finishTime: Date) {}

  public localStdout(stdout: string) {}
  public localStderr(stderr: string) {}

  public remoteConnecting(remoteId: string) {}
  public remoteConnected(remoteId: string) {}
  public remoteClosed(remoteId: string) {}
  public remoteStdout(stdout: string) {}
  public remoteStderr(stderr: string) {}

  public virtualStdout(stdout: string) {}
  public virtualStderr(stderr: string) {}
}
