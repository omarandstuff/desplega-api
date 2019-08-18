import chalk from 'chalk'
import moment from 'moment'
import numeral from 'numeral'
import ansiRegex from 'ansi-regex'
import PipelineLogger from './PipelineLogger'
import { CommandResult } from './Processor.types'
import Printer from './Printer'

const theme = {
  failureColor: '#af1400',
  failureContrastColor: '#380600',
  stageHeaderColor: '#00bfef',
  stepHeaderColor: '#d3d300',
  stepStatusColor: '#d3d300',
  successColor: '#009918',
  successContrastColor: '#013308'
}

const loadChars = {
  connecting: ['✶', '✸', '✹', '✺', '✹', '✷'],
  running: ['⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽', '⣾'],
  waiting: ['◜', '◠', '◝', '◞', '◡', '◟']
}
const superScriptChars = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']

export default class ConsoleLogger extends PipelineLogger {
  private animation: NodeJS.Timeout
  private animationFraction = 0
  private animationTick = 0

  private printer: Printer = new Printer()
  private pipilineStartTime: Date

  private currentStepStartTime: Date
  private currentStepType: 'local' | 'remote' | 'virtual'
  private currentStepRetry: number
  private currentStepRemoteId: string
  private lastStdio: string
  private lastStepTime: Date = new Date()

  private remoteStatuses: { [remoteId: string]: 'connecting' | 'connected' | 'waiting' } = {}

  public pipelineInit(title: string, startTime: Date): void {
    this.pipilineStartTime = startTime
    this.printer.drawRow([{ blank: true }, { text: ` ${title} `, style: chalk.bold }, { blank: true }])
    this.runAnimation()
  }
  public pipelineHeader(title: string, time: Date): void {
    this.printer.drawRow([
      { text: `${title} `, style: chalk.hex(theme.stageHeaderColor) },
      { blank: true },
      { text: ` ${moment(time).format('hh[:]mma')} `, style: chalk.hex(theme.stageHeaderColor) }
    ])
  }
  public pipelineFinish(finishTime: Date): void {
    this.stopAnimation()
    this.printer.drawRow([
      { blank: true },
      { text: ' DONE ', style: chalk.bgHex(theme.successContrastColor).bold },
      { text: ` ${this.solveDuration(this.pipilineStartTime, finishTime)}` },
      { blank: true }
    ])
  }
  public pipelineFail(error: CommandResult, finishTime: Date): void {
    this.stopAnimation()
    this.printer.drawRow([
      { blank: true },
      { text: ' FAIL ', style: chalk.bgHex(theme.failureContrastColor).bold },
      { text: ` ${this.solveDuration(this.pipilineStartTime, finishTime)}` },
      { blank: true }
    ])
    console.log(chalk.hex(theme.failureColor)(error.error && error.error.message))
    console.log(chalk.hex(theme.failureColor)(error.stderr as string))
  }

  public localStepInit(index: number, title: string, command: string, workingDirectory: string, startTime: Date): void {
    this.currentStepStartTime = startTime
    this.currentStepType = 'local'
    this.currentStepRetry = 0

    this.printer.drawRow([
      { text: ' ' },
      { text: `${numeral(index).format('00')} `, style: chalk.hex(theme.stepHeaderColor) },
      { text: `${title} ` },
      { text: 'local ', style: chalk.hex(theme.stepHeaderColor) },
      { text: `${workingDirectory || '~/'}`, fit: true }
    ])
    this.printer.drawRow([
      { text: ' ', style: chalk.hex(theme.stepHeaderColor) },
      { text: `⏎ ${command}`, style: chalk.hex(theme.stepHeaderColor).dim, fit: true }
    ])
  }
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public localStepRetry(retry: number, retryTime: Date): void {
    this.currentStepRetry = retry
    this.lastStdio = ''
  }
  public localStepFinish(result: CommandResult, finishTime: Date): void {
    this.lastStdio = ''

    this.printFinishedStep(finishTime)

    this.lastStepTime = finishTime
  }
  public localStepFail(error: CommandResult, finishTime: Date): void {
    this.lastStdio = ''

    this.printFailedStep(finishTime)

    this.lastStepTime = finishTime
  }

  public remoteStepInit(index: number, title: string, command: string, workingDirectory, remoteId: string, startTime: Date): void {
    this.currentStepStartTime = startTime
    this.currentStepType = 'remote'
    this.currentStepRetry = 0
    this.currentStepRemoteId = remoteId

    this.printer.drawRow([
      { text: ' ' },
      { text: `${numeral(index).format('00')} `, style: chalk.hex(theme.stepHeaderColor) },
      { text: `${title} ` },
      { text: 'remote ', style: chalk.hex(theme.stepHeaderColor) },
      { text: `${workingDirectory || '~/'}`, fit: true }
    ])
    this.printer.drawRow([
      { text: ' ', style: chalk.hex(theme.stepHeaderColor) },
      { text: `⏎ ${command}`, style: chalk.hex(theme.stepHeaderColor).dim, fit: true }
    ])
  }
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public remoteStepRetry(retry: number, retryTime: Date): void {
    this.currentStepRetry = retry
    this.lastStdio = ''
  }
  public remoteStepFinish(result: CommandResult, finishTime: Date): void {
    this.lastStdio = ''

    this.printFinishedStep(finishTime)

    this.lastStepTime = finishTime
  }
  public remoteStepFail(error: CommandResult, finishTime: Date): void {
    this.lastStdio = ''

    this.printFailedStep(finishTime)

    this.lastStepTime = finishTime
  }

  public virtualStepInit(index: number, title: string, startTime: Date): void {
    this.currentStepStartTime = startTime
    this.currentStepType = 'virtual'
    this.currentStepRetry = 0

    this.printer.drawRow([
      { text: ' ' },
      { text: `${numeral(index).format('00')} `, style: chalk.hex(theme.stepHeaderColor) },
      { text: `${title} ` },
      { text: 'virtual ', style: chalk.hex(theme.stepHeaderColor) },
      { text: '📎', fit: true }
    ])
  }
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public virtualStepRetry(retry: number, retryTime: Date): void {
    this.currentStepRetry = retry
    this.lastStdio = ''
  }
  public virtualStepFinish(result: CommandResult, finishTime: Date): void {
    this.lastStdio = ''

    this.printFinishedStep(finishTime)

    this.lastStepTime = finishTime
  }
  public virtualStepFail(error: CommandResult, finishTime: Date): void {
    this.lastStdio = ''

    this.printFailedStep(finishTime)

    this.lastStepTime = finishTime
  }

  public localStdout(stdout: string): void {
    this.processStdio(stdout)
  }
  public localStderr(stderr: string): void {
    this.processStdio(stderr)
  }

  public remoteConnecting(remoteId: string): void {
    this.remoteStatuses[remoteId] = 'connecting'
  }
  public remoteConnected(remoteId: string): void {
    this.remoteStatuses[remoteId] = 'connected'
  }
  public remoteClosed(remoteId: string): void {
    this.remoteStatuses[remoteId] = 'waiting'
  }
  public remoteStdout(stdout: string): void {
    this.processStdio(stdout)
  }
  public remoteStderr(stderr: string): void {
    this.processStdio(stderr)
  }

  public virtualStdout(stdout: string): void {
    this.processStdio(stdout)
  }
  public virtualStderr(stderr: string): void {
    this.processStdio(stderr)
  }

  private printFailedStep(finishTime: Date): void {
    this.printer.drawRow([
      { text: ' ' },
      { text: ` FAIL `, style: chalk.bgHex(theme.failureContrastColor).bold },
      { text: ` ${this.solveDuration(this.lastStepTime, finishTime)}` },
      { text: ' ✖', style: chalk.hex(theme.failureColor) },
      { blank: true },
      { text: ` ${moment(finishTime).format('hh[:]mma')} `, style: chalk.hex(theme.failureColor) }
    ])
  }

  private printFinishedStep(finishTime: Date): void {
    this.printer.drawRow([
      { text: ' ' },
      { text: ` DONE `, style: chalk.bgHex(theme.successContrastColor).bold },
      { text: ` ${this.solveDuration(this.lastStepTime, finishTime)}` },
      { text: ' ✔', style: chalk.hex(theme.successColor) },
      { blank: true },
      { text: ` ${moment(finishTime).format('hh[:]mma')} `, style: chalk.hex(theme.successColor) }
    ])
  }

  private printStatus(): void {
    const statusSpace = { text: this.lastStdio || '', fit: true }

    this.printer.drawRow(
      [
        { text: ' ' },
        { text: `▶▶ `, style: chalk.hex(theme.stepStatusColor) },
        { text: `${this.solveDuration(this.currentStepStartTime)}` },
        { text: ` ${this.solveProcessorsStatus()} `, style: chalk.hex(theme.stepStatusColor) },
        statusSpace
      ],
      true
    )
  }

  private processStdio(data: string): void {
    const lines = data.split('\n').filter(line => line)
    this.lastStdio = (lines[lines.length - 1] || '').replace(/(\r\n\t|\r|\n|\r\t)/gm, '').replace(ansiRegex(), '')

    this.printStatus()
  }

  private runAnimation(): void {
    this.animation = setInterval((): void => {
      this.animationFraction += 0.02
      this.animationTick = Math.floor(this.animationFraction)
      this.printStatus()
    }, 1)
  }

  private solveDuration(initialTime: Date, finishTime?: Date): string {
    const diference = moment(finishTime).diff(initialTime)
    const duration = moment.duration(diference)

    if (duration.hours() > 0) {
      return moment(diference).format('hh[:]mm[:]ss[.]SSS')
    } else if (duration.minutes() > 0) {
      return moment(diference).format('mm[:]ss[.]SSS')
    } else {
      return moment(diference).format('ss[.]SSS')
    }
  }

  private stopAnimation(): void {
    clearInterval(this.animation)
  }

  private solveProcessorsStatus(): string {
    let animationChars = []

    switch (this.currentStepType) {
      case 'local':
      case 'virtual':
        animationChars = loadChars.running
        break
      case 'remote':
        switch (this.remoteStatuses[this.currentStepRemoteId]) {
          case 'waiting':
          case undefined:
            animationChars = loadChars.waiting
            break
          case 'connecting':
            animationChars = loadChars.connecting
            break
          case 'connected':
            animationChars = loadChars.running
            break
          default:
            break
        }
        break
      default:
        break
    }

    const currentLoadChar = animationChars[this.animationTick % animationChars.length]
    const attemptsChar = this.solveSuperScript(this.currentStepRetry)

    return `${currentLoadChar}${attemptsChar}`
  }

  private solveSuperScript(number: number): string {
    if (number > 0) {
      const elements = String(number).split('')
      return elements.map((element: string): string => superScriptChars[Number(element)]).join('')
    }

    return ''
  }
}
