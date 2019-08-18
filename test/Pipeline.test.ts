import Pipeline from '../src/Pipeline'
import VirtualStep from '../src/VirtualStep'

describe('Pipeline#run', () => {
  it('Executes a series steps', async () => {
    const step1: VirtualStep = new VirtualStep({ title: 'Step', asyncFunction: jest.fn().mockResolvedValue(null) })
    const step2: VirtualStep = new VirtualStep({ title: 'Step', asyncFunction: jest.fn().mockResolvedValue(null) })
    const step3: VirtualStep = new VirtualStep({ title: 'Step', asyncFunction: jest.fn().mockResolvedValue(null) })
    const pipeline = new Pipeline({ title: 'Pipeline', steps: [step1, step2, step3] })

    await pipeline.run()

    expect(step1.definition.asyncFunction).toHaveBeenCalled()
    expect(step2.definition.asyncFunction).toHaveBeenCalled()
    expect(step3.definition.asyncFunction).toHaveBeenCalled()
  })

  it('Stops if a step fails', async () => {
    const step1: VirtualStep = new VirtualStep({ title: 'Step', asyncFunction: jest.fn().mockResolvedValue(null) })
    const step2: VirtualStep = new VirtualStep({ title: 'Step', asyncFunction: jest.fn().mockRejectedValue(null) })
    const step3: VirtualStep = new VirtualStep({ title: 'Step', asyncFunction: jest.fn().mockResolvedValue(null) })
    const pipeline = new Pipeline({ title: 'Pipeline', steps: [step1, step2, step3] })

    await pipeline.run()

    expect(step1.definition.asyncFunction).toHaveBeenCalled()
    expect(step2.definition.asyncFunction).toHaveBeenCalled()
    expect(step3.definition.asyncFunction).not.toHaveBeenCalled()
  })

  it('builds the remote collection and the rest of the context', async () => {
    const step1: VirtualStep = ({
      run: jest.fn().mockResolvedValue(null),
      addListener: jest.fn(),
      removeAllListeners: jest.fn()
    } as unknown) as VirtualStep
    const pipeline = new Pipeline({ title: 'Pipeline', steps: [step1], remotes: { one: { host: 'host' } } })

    await pipeline.run()

    expect((step1.run as jest.Mock).mock.calls[0][0]).toMatchObject({
      globals: {},
      history: [null],
      localOptions: undefined,
      localProcessor: {
        options: {
          maxBuffer: 8388608
        }
      },
      remoteOptions: undefined,
      remoteProcessors: {
        one: {
          connectConfig: {
            host: 'host'
          },
          connectionStatus: 'closed',
          options: undefined
        }
      },
      virtualProcessor: {
        options: undefined
      }
    })
  })
})
