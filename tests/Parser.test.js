import Parser from '../src/Parser'
import descriptorBase from './__dummies__/descriptorBase.json'
import descriptorBaseSpec from './__dummies__/descriptorBaseSpect.json'

describe('Loader#load', () => {
  it('creates a pipile object filled with stages and steps', () => {
    const pipeline = Parser.buildPipeline(descriptorBase)

    expect(pipeline).toMatchObject(descriptorBaseSpec)
  })
})
