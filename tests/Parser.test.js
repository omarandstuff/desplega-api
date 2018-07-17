import Parser from '../src/Parser'
import descriptorBase from './__dummies__/descriptorBase.json'
import descriptorBaseSpec from './__dummies__/descriptorBaseSpect.json'

describe('Parser#buildPipeline', () => {
  it('creates a pipile object filled with stages and steps', () => {
    const pipeline = Parser.buildPipeline(descriptorBase)

    expect(pipeline).toMatchObject(descriptorBaseSpec)
  })
})

describe('Parser#buildPipelineAsync', () => {
  it('creates a pipeline object by first executing an async function that returns the descriptor', async () => {
    const generator = async () => {
      return descriptorBase
    }

    await Parser.buildPipelineAsync(generator).then(pipeline => {
      expect(pipeline).toMatchObject(descriptorBaseSpec)
    })
  })
})
