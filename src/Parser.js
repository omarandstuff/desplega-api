import Pipeline from './Pipeline'
import Stage from './Stage'
import RemoteStep from './RemoteStep'
import LocalStep from './LocalStep'
import VirtualStep from './VirtualStep'

export default class Parser {
  static buildPipeline(descriptor) {
    if (descriptor instanceof Pipeline) {
      return descriptor
    } else {
      return Parser._buildFromDescriptor(descriptor)
    }
  }

  static async buildPipelineAsync(asyncLoader) {
    return new Promise((resolve, _) => {
      asyncLoader().then(descriptor => {
        resolve(Parser._buildFromDescriptor(descriptor))
      })
    })
  }

  static _buildFromDescriptor(descriptor) {
    const { pipeline } = descriptor
    const { title, verbosityLevel, remotes, remoteOptions, localOptions, virtualOptions, theme, stages } = pipeline
    const actualRemotes = Object.keys(remotes || []).map(remoteId => {
      const { id, ...remoteConfig } = remotes[remoteId]
      return { id: remoteId, ...remoteConfig }
    })

    const pipelineRunner = new Pipeline(
      title,
      { verbosityLevel, remotes: actualRemotes, remoteOptions, localOptions, virtualOptions },
      theme
    )

    if (stages) {
      stages.forEach(({ title, verbosityLevel, remotes, remoteOptions, localOptions, virtualOptions, steps }) => {
        const stageRunner = new Stage(title, { verbosityLevel, remotes, remoteOptions, virtualOptions, localOptions })

        if (steps) {
          steps.forEach(step => {
            const { onFailure, ...stepDefinition } = step

            if (onFailure) {
              stepDefinition.onFailure = Parser.__generateStep(onFailure)
            }

            stageRunner.addStep(Parser.__generateStep(stepDefinition))
          })
        }

        pipelineRunner.addStage(stageRunner)
      })
    }

    return pipelineRunner
  }

  static __generateStep(definition) {
    const { remote, virtual, ...actualDefinition } = definition

    if (remote) {
      return new RemoteStep(actualDefinition)
    } else if (virtual) {
      return new VirtualStep(actualDefinition)
    } else {
      return new LocalStep(actualDefinition)
    }
  }
}
