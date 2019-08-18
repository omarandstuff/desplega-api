import Pipeline from './Pipeline'
import { CommandResult } from './Processor.types'

export default class PipelineLogger {
  private pipeline: Pipeline

  public constructor(pipeline: Pipeline) {
    this.pipeline = pipeline

    this.pipeline.addListener('PIPELINE@INIT', this.pipelineInit.bind(this))
    this.pipeline.addListener('PIPELINE@HEADER', this.pipelineHeader.bind(this))
    this.pipeline.addListener('PIPELINE@FINISH', this.pipelineFinish.bind(this))
    this.pipeline.addListener('PIPELINE@FAIL', this.pipelineFail.bind(this))

    this.pipeline.addListener('LOCAL_STEP@INIT', this.localStepInit.bind(this))
    this.pipeline.addListener('LOCAL_STEP@RETRY', this.localStepRetry.bind(this))
    this.pipeline.addListener('LOCAL_STEP@FINISH', this.localStepFinish.bind(this))
    this.pipeline.addListener('LOCAL_STEP@FAIL', this.localStepFail.bind(this))

    this.pipeline.addListener('REMOTE_STEP@INIT', this.remoteStepInit.bind(this))
    this.pipeline.addListener('REMOTE_STEP@RETRY', this.remoteStepRetry.bind(this))
    this.pipeline.addListener('REMOTE_STEP@FINISH', this.remoteStepFinish.bind(this))
    this.pipeline.addListener('REMOTE_STEP@FAIL', this.remoteStepFail.bind(this))

    this.pipeline.addListener('VIRTUAL_STEP@INIT', this.virtualStepInit.bind(this))
    this.pipeline.addListener('VIRTUAL_STEP@RETRY', this.virtualStepRetry.bind(this))
    this.pipeline.addListener('VIRTUAL_STEP@FINISH', this.virtualStepFinish.bind(this))
    this.pipeline.addListener('VIRTUAL_STEP@FAIL', this.virtualStepFail.bind(this))

    this.pipeline.addListener('LOCAL@STDOUT', this.localStdout.bind(this))
    this.pipeline.addListener('LOCAL@STDERR', this.localStderr.bind(this))

    this.pipeline.addListener('REMOTE@CONNECTING', this.remoteConnecting.bind(this))
    this.pipeline.addListener('REMOTE@CONNECTED', this.remoteConnected.bind(this))
    this.pipeline.addListener('REMOTE@CLOSED', this.remoteClosed.bind(this))
    this.pipeline.addListener('REMOTE@STDOUT', this.remoteStdout.bind(this))
    this.pipeline.addListener('REMOTE@STDERR', this.remoteStderr.bind(this))

    this.pipeline.addListener('VIRTUAL@STDOUT', this.virtualStdout.bind(this))
    this.pipeline.addListener('VIRTUAL@STDERR', this.virtualStderr.bind(this))
  }

  /* eslint-disable @typescript-eslint/no-unused-vars*/
  /* eslint-disable @typescript-eslint/no-empty-function*/
  public pipelineInit(title: string, startTime: Date): void {}
  public pipelineHeader(title: string, time: Date): void {}
  public pipelineFinish(finishTime: Date): void {}
  public pipelineFail(error: CommandResult, finishTime: Date): void {}

  public localStepInit(index: number, title: string, command: string, workingDirectory: string, startTime: Date): void {}
  public localStepRetry(retry: number, retryTime: Date): void {}
  public localStepFinish(result: CommandResult, finishTime: Date): void {}
  public localStepFail(error: CommandResult, finishTime: Date): void {}

  public remoteStepInit(index: number, title: string, command: string, workingDirectory: string, remoteId: string, startTime: Date): void {}
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
