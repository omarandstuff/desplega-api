import Pipeline from './Pipeline'
import RemoteStep from './RemoteStep'
import LocalStep from './LocalStep'
import VirtualStep from './VirtualStep'
import { PipelineParserDescriptor } from './Parser.types'
import { StepDefinition } from './Step.types'

export default class Parser {
  public readonly descriptor: PipelineParserDescriptor

  constructor(descriptor: PipelineParserDescriptor) {
    this.descriptor = descriptor
  }

  public build(): Pipeline {
    this.analize(this.descriptor)

    const { pipeline: pipelineDescriptor } = this.descriptor
    const { title, remotes, remoteOptions, localOptions, virtualOptions, steps } = pipelineDescriptor
    const generatedSteps = []

    for (let i = 0; i < steps.length; i++) {
      const currentStepDescriptor = steps[i]
      const commonStepDefinition: StepDefinition = {
        title: currentStepDescriptor.title,
        onFailure: currentStepDescriptor.onFailure,
        onSuccess: currentStepDescriptor.onSuccess,
        maxRetries: currentStepDescriptor.maxRetries
      }

      switch (currentStepDescriptor.type) {
        case 'local':
          generatedSteps.push(
            new LocalStep({
              ...commonStepDefinition,
              command: currentStepDescriptor.command,
              localOptions: currentStepDescriptor.localOptions,
              workingDirectory: currentStepDescriptor.workingDirectory
            })
          )
          break
        case 'remote':
          generatedSteps.push(
            new RemoteStep({
              ...commonStepDefinition,
              command: currentStepDescriptor.command,
              remoteOptions: currentStepDescriptor.localOptions,
              workingDirectory: currentStepDescriptor.workingDirectory,
              remoteId: currentStepDescriptor.remoteId
            })
          )
          break
        case 'virtual':
          generatedSteps.push(
            new VirtualStep({
              ...commonStepDefinition,
              asyncFunction: currentStepDescriptor.asyncFunction,
              virtualOptions: currentStepDescriptor.virtualOptions
            })
          )
          break
        case 'header':
          generatedSteps.push({ title: currentStepDescriptor.title, isHeader: true })
          break
        default:
          break
      }
    }

    return new Pipeline({ title, remotes, remoteOptions, localOptions, virtualOptions, steps: generatedSteps })
  }

  private analize(descriptor: PipelineParserDescriptor): void {
    if (!descriptor.pipeline) {
      throw new Error('The Desplega file does not contain a "pipeline" root property')
    }
    if (!descriptor.pipeline.steps) {
      descriptor.pipeline.steps = []
    }

    if (!descriptor.pipeline.title) {
      descriptor.pipeline.title = 'Untitled'
    }

    for (let i = 0; i < descriptor.pipeline.steps.length; i++) {
      const step = descriptor.pipeline.steps[i]

      if (!step.type) {
        throw new Error(`Step number ${i + 1} does not contain a type`)
      }
      if (!['header', 'local', 'remote', 'virtual'].includes(step.type)) {
        throw new Error(`Step number ${i + 1} have an unrecognized type`)
      }
      if (step.type === 'local' || step.type === 'remote') {
        if (!step.command) {
          throw new Error(`Step of type ${step.type} number ${i + 1} does not contain a command`)
        }
        if ({}.toString.call(step.command) !== '[object Function]' && typeof step.command !== 'string') {
          throw new Error(`Step of type ${step.type} number ${i + 1} commnad is not a string neither a function`)
        }
      }
      if (step.type === 'virtual') {
        if (!step.asyncFunction) {
          throw new Error(`Step of type ${step.type} number ${i + 1} does not contain an async function`)
        }
        if ({}.toString.call(step.asyncFunction) !== '[object Function]') {
          throw new Error(`Step of type ${step.type} number ${i + 1} asyncFunction is not a function`)
        }
      }

      if (!step.title) {
        step.title = 'Untitled'
      }
    }
  }
}
