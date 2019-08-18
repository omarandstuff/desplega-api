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

  /* eslint-disable @typescript-eslint/no-unused-vars*/
  /* eslint-disable @typescript-eslint/no-empty-function*/
  public pipelineInit(title: string, startTime: Date): void {}
  public pipelineHeader(title: string, time: Date): void {}
  public pipelineFinish(finishTime: Date): void {}
  public pipelineFail(error: CommandResult, finishTime: Date): void {}

  public localStepInit(index: number, title: string, command: string, startTime: Date): void {}
  public localStepRetry(retry: number, retryTime: Date): void {}
  public localStepFinish(result: CommandResult, finishTime: Date): void {}
  public localStepFail(error: CommandResult, finishTime: Date): void {}

  public remoteStepInit(index: number, title: string, command: string, remoteId: string, startTime: Date): void {}
  public remoteStepRetry(retry: number, retryTime: Date): void {}
  public remoteStepFinish(result: CommandResult, finishTime: Date): void {}
  public remoteStepFail(error: CommandResult, finishTime: Date): void {}

  public virtualStepInit(index: number, title: string, startTime: Date): void {}
  public virtualStepRetry(retry: number, retryTime: Date): void {}
  public virtualStepFinish(result: CommandResult, finishTime: Date): void {}
  public virtualStepFail(error: CommandResult, finishTime: Date): void {}

  public localStdout(stdout: string): void {}
  public localStderr(stderr: string): void {}

  public remoteConnecting(remoteId: string): void {}
  public remoteConnected(remoteId: string): void {}
  public remoteClosed(remoteId: string): void {}
  public remoteStdout(stdout: string): void {}
  public remoteStderr(stderr: string): void {}

  public virtualStdout(stdout: string): void {}
  public virtualStderr(stderr: string): void {}
  /* eslint-enable @typescript-eslint/no-empty-function*/
  /* eslint-enable @typescript-eslint/no-unused-vars*/
}
