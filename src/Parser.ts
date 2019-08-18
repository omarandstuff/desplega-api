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
        default:
          break
      }
    }

    return new Pipeline({ title, remotes, remoteOptions, localOptions, virtualOptions, steps: generatedSteps })
  }
}
