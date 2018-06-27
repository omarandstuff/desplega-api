import * as Desplega from 'desplega-api'

export default class Parser {
  static buildPipeline(descriptor) {
    if (descriptor instanceof Desplega.default.Pipeline) {
      return descriptor
    } else {
      return Parser._buildFromDescriptor(descriptor)
    }
  }

  static _buildFromDescriptor(descriptor) {
    const { pipeline } = descriptor
    const { title, verbosityLevel, remotes, remoteOptions, localOptions, theme, stages } = pipeline
    const pipelineRunner = Desplega.Pipeline(title, { verbosityLevel, remotes, remoteOptions, localOptions }, theme)

    if (stages) {
      stages.forEach(({ title, verbosityLevel, remotes, remoteOptions, localOptions, steps }) => {
        const stageRunner = Desplega.Stage(title, { verbosityLevel, remotes, remoteOptions, localOptions })

        if (steps) {
          steps.forEach(({ remote, ...stepDefinition }) => {
            let stepRunner

            if (remote) {
              stepRunner = Desplega.RemoteStep(stepDefinition)
            } else {
              stepRunner = Desplega.LocalStep(stepDefinition)
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
