import Parser from '../src/Parser'
import descriptorBase from './__dummies__/descriptorBase'
import descriptorBaseSpec from './__dummies__/descriptorBaseSpect.json'

describe('Parser#buildPipeline', () => {
  it('creates a pipile object filled with stages and steps', () => {
    const parser: Parser = new Parser(descriptorBase)
    const pipeline = parser.build()

    expect(pipeline).toMatchObject(descriptorBaseSpec)
  })
})
