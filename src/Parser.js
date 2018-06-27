import Pipeline from './Pipeline'
import Stage from './Stage'
import RemoteStep from './RemoteStep'
import LocalStep from './LocalStep'

export default class Parser {
  static buildPipeline(descriptor) {
    if (descriptor instanceof Pipeline) {
      return descriptor
    } else {
      return Parser._buildFromDescriptor(descriptor)
    }
  }

  static _buildFromDescriptor(descriptor) {
    const { pipeline } = descriptor
    const { title, verbosityLevel, remotes, remoteOptions, localOptions, theme, stages } = pipeline
    const pipelineRunner = new Pipeline(title, { verbosityLevel, remotes, remoteOptions, localOptions }, theme)

    if (stages) {
      stages.forEach(({ title, verbosityLevel, remotes, remoteOptions, localOptions, steps }) => {
        const stageRunner = new Stage(title, { verbosityLevel, remotes, remoteOptions, localOptions })

        if (steps) {
          steps.forEach(({ remote, ...stepDefinition }) => {
            let stepRunner

            if (remote) {
              stepRunner = new RemoteStep(stepDefinition)
            } else {
              stepRunner = new LocalStep(stepDefinition)
            }

            stageRunner.addStep(stepRunner)
          })
        }

        pipelineRunner.addStage(stageRunner)
      })
    }

    return pipelineRunner
  }
}
