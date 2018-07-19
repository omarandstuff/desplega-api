import VirtualStep from '../src/VirtualStep'
import VirtualManager from '../src/VirtualManager'

const realLog = console.log
const realWrite = process.stdout.write

beforeEach(() => {
  console.log = jest.fn()
  process.stdout.write = jest.fn()
})

afterAll(() => {
  console.log = realLog
  process.stdout.write = realWrite
})

describe('VirtualStep#run', () => {
  it('executes a virtual command and return its result', async () => {
    const commandFunction = async () => {
      return { yo: 'merengues' }
    }
    const virtualManager = new VirtualManager({})
    const virtualStep = new VirtualStep({ title: 'title', command: commandFunction, verbosityLevel: 'full' })
    const thenFunc = jest.fn()

    await virtualStep.run({ virtual: virtualManager, childIndex: 5 }).then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toMatchObject({
      result: {
        attempts: 1,
        command: commandFunction,
        options: { maxRetries: 0 },
        results: [{ virtualout: { yo: 'merengues' } }]
      },
      status: 'done'
    })
  })

  it('archives the result in context', async () => {
    let toFail = 2
    const commandFunction = async () => {
      if (toFail--) {
        throw 'Nel pastel'
      }
      return { yo: 'merengues' }
    }
    const virtualManager = new VirtualManager({})
    const virtualStep = new VirtualStep({
      id: 'step1',
      title: 'title',
      command: commandFunction,
      verbosityLevel: 'full',
      options: { maxRetries: 2 }
    })
    const thenFunc = jest.fn()
    const catchFunc = jest.fn()
    const context = { archive: { dictionary: {}, history: [] }, virtual: virtualManager, childIndex: 5 }

    await virtualStep
      .run(context)
      .then(thenFunc)
      .catch(catchFunc)

    expect(context).toMatchObject({
      archive: {
        dictionary: { step1: ['Nel pastel', 'Nel pastel', { yo: 'merengues' }] },
        history: [['Nel pastel', 'Nel pastel', { yo: 'merengues' }]]
      }
    })
  })

  it('archives the result in context and avoid arrays on single results', async () => {
    const commandFunction = async () => {
      return { yo: 'merengues' }
    }
    const virtualManager = new VirtualManager({})
    const virtualStep = new VirtualStep({
      id: 'step1',
      title: 'title',
      command: commandFunction,
      verbosityLevel: 'full',
      options: { maxRetries: 2 }
    })
    const thenFunc = jest.fn()
    const catchFunc = jest.fn()
    const context = { archive: { dictionary: {}, history: [] }, virtual: virtualManager, childIndex: 5 }

    await virtualStep
      .run(context)
      .then(thenFunc)
      .catch(catchFunc)

    expect(context).toMatchObject({
      archive: { dictionary: { step1: { yo: 'merengues' } }, history: [{ yo: 'merengues' }] }
    })
  })

  it('rejects when the command fucntion throws error', async () => {
    const virtualManager = new VirtualManager({})
    const commandFunction = context => dasdasd
    const virtualStep = new VirtualStep({ title: 'title', command: commandFunction, verbosityLevel: 'full' })
    const catchFunc = jest.fn()

    await virtualStep.run({ virtual: virtualManager }).catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toMatchObject({
      result: new ReferenceError('dasdasd is not defined'),
      status: 'fail'
    })
  })

  it('rejects if is already running', async () => {
    const commandFunction = async () => {
      return { yo: 'merengues' }
    }
    const virtualManager = new VirtualManager({})
    const virtualStep = new VirtualStep({ title: 'title', command: commandFunction, verbosityLevel: 'full' })
    const thenFunc = jest.fn()
    const catchFunc = jest.fn()

    virtualStep.status = 'running'
    await virtualStep
      .run({ virtual: virtualManager, childIndex: 5 })
      .then(thenFunc)
      .catch(catchFunc)

    expect(thenFunc.mock.calls.length).toBe(0)
    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toBeInstanceOf(Error)
  })

  it('works with bad paramaters', async () => {
    const commandFunction = async () => {
      return { yo: 'merengues' }
    }
    const virtualManager = new VirtualManager(123123, { asda: 213123 }, 908809)
    const virtualStep = new VirtualStep({ command: commandFunction })
    const thenFunc = jest.fn()

    await virtualStep.run({ virtual: virtualManager }).then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toMatchObject({
      result: {
        attempts: 1,
        command: commandFunction,
        options: { maxRetries: 0 },
        results: [{ virtualout: { yo: 'merengues' } }]
      },
      status: 'done'
    })
  })

  it('rejects if a virtual is not included in context', async () => {
    const virtualStep = new VirtualStep(1212)
    const catchFunc = jest.fn()

    await virtualStep.run().catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual(
      new Error('There is not a virtual manager object included in the context')
    )
  })

  describe('when continueOnFailure is not set', () => {
    it('rejects when the internal remote fails', async () => {
      const commandFunction = async () => {
        throw 'Ups'
      }
      const virtualManager = new VirtualManager({})
      const virtualStep = new VirtualStep({ title: 'title', command: commandFunction })
      const thenFunc = jest.fn()
      const catchFunc = jest.fn()

      await virtualStep
        .run({ virtual: virtualManager, childIndex: 5 })
        .then(thenFunc)
        .catch(catchFunc)

      expect(thenFunc.mock.calls.length).toBe(0)
      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toMatchObject({
        result: { attempts: 1, command: commandFunction, options: { maxRetries: 0 }, results: [{ virtualerr: 'Ups' }] },
        status: 'fail'
      })
    })

    it('rejects and run the onfailure block if set', async () => {
      const commandFunctionOnFailure = async () => {
        return { Ups: 'not' }
      }
      const commandFunction = async () => {
        throw 'Ups'
      }
      const virtualManager = new VirtualManager({})
      const onFailureStep = new VirtualStep({ title: 'on failure', command: commandFunctionOnFailure })
      const virtualStep = new VirtualStep({ title: 'title', command: commandFunction, onFailure: onFailureStep })
      const thenFunc = jest.fn()
      const catchFunc = jest.fn()

      await virtualStep
        .run({ virtual: virtualManager, childIndex: 5 })
        .then(thenFunc)
        .catch(catchFunc)

      expect(thenFunc.mock.calls.length).toBe(0)
      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toMatchObject({
        mainResult: {
          result: {
            attempts: 1,
            command: commandFunction,
            options: { maxRetries: 0 },
            results: [{ virtualerr: 'Ups' }]
          },
          status: 'fail'
        },
        onFailureResult: {
          result: {
            attempts: 1,
            command: commandFunctionOnFailure,
            options: { maxRetries: 0 },
            results: [{ virtualout: { Ups: 'not' } }]
          },
          status: 'done'
        }
      })
    })

    it('resolves on failure if set recoverOnFailure and the secundary block succeed', async () => {
      const commandFunction = async () => {
        throw 'Nop'
      }
      const commandFunctionOnFailure = async () => {
        return { yo: 'merengues' }
      }
      const virtualManager = new VirtualManager({})
      const onFailureStep = new VirtualStep({ title: 'on failure', command: commandFunctionOnFailure })
      const virtualStep = new VirtualStep({
        title: 'title',
        command: commandFunction,
        onFailure: onFailureStep,
        recoverOnFailure: true
      })
      const thenFunc = jest.fn()

      await virtualStep.run({ virtual: virtualManager, childIndex: 5 }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toMatchObject({
        mainResult: {
          result: {
            attempts: 1,
            command: commandFunction,
            options: { maxRetries: 0 },
            results: [{ virtualerr: 'Nop' }]
          },
          status: 'fail'
        },
        onFailureResult: {
          result: {
            attempts: 1,
            command: commandFunctionOnFailure,
            options: { maxRetries: 0 },
            results: [{ virtualout: { yo: 'merengues' } }]
          },
          status: 'done'
        }
      })
    })

    it('rejects on failure if onFailure fails even if recoverOnFailure is set', async () => {
      const commandFunction = async () => {
        throw 'Nop'
      }
      const commandFunctionOnFailure = async () => {
        throw 'Nop'
      }
      const virtualManager = new VirtualManager({})
      const onFailureStep = new VirtualStep({ title: 'on failure', command: commandFunctionOnFailure })
      const virtualStep = new VirtualStep({
        title: 'title',
        command: commandFunction,
        onFailure: onFailureStep,
        recoverOnFailure: true
      })
      const thenFunc = jest.fn()
      const catchFunc = jest.fn()

      await virtualStep
        .run({ virtual: virtualManager, childIndex: 5 })
        .then(thenFunc)
        .catch(catchFunc)

      expect(thenFunc.mock.calls.length).toBe(0)
      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toMatchObject({
        mainResult: {
          result: {
            attempts: 1,
            command: commandFunction,
            options: { maxRetries: 0 },
            results: [{ virtualerr: 'Nop' }]
          },
          status: 'fail'
        },
        onFailureResult: {
          result: {
            attempts: 1,
            command: commandFunctionOnFailure,
            options: { maxRetries: 0 },
            results: [{ virtualerr: 'Nop' }]
          },
          status: 'fail'
        }
      })
    })
  })

  describe('when continueOnFailure is set', () => {
    it('resolves on failure', async () => {
      const commandFunction = async () => {
        throw 'Nop'
      }
      const virtualManager = new VirtualManager({})
      const virtualStep = new VirtualStep({ title: 'title', command: commandFunction, continueOnFailure: true })
      const thenFunc = jest.fn()

      await virtualStep.run({ virtual: virtualManager, childIndex: 5 }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toMatchObject({
        result: { attempts: 1, command: commandFunction, options: { maxRetries: 0 }, results: [{ virtualerr: 'Nop' }] },
        status: 'fail'
      })
    })

    it('resolves and run the onfailure block if set', async () => {
      const commandFunction = async () => {
        throw 'Nop'
      }
      const commandFunctionOnFailure = async () => {
        return { good: 'one' }
      }
      const virtualManager = new VirtualManager({})
      const onFailureStep = new VirtualStep({ title: 'on failure', command: commandFunctionOnFailure })
      const virtualStep = new VirtualStep({
        title: 'title',
        command: commandFunction,
        onFailure: onFailureStep,
        continueOnFailure: true
      })
      const thenFunc = jest.fn()

      await virtualStep.run({ virtual: virtualManager, childIndex: 5 }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toMatchObject({
        mainResult: {
          result: {
            attempts: 1,
            command: commandFunction,
            options: { maxRetries: 0 },
            results: [{ virtualerr: 'Nop' }]
          },
          status: 'fail'
        },
        onFailureResult: {
          result: {
            attempts: 1,
            command: commandFunctionOnFailure,
            options: { maxRetries: 0 },
            results: [{ virtualout: { good: 'one' } }]
          },
          status: 'done'
        }
      })
    })

    it('resolves on failure even if onFailure fails too', async () => {
      const commandFunction = async () => {
        throw 'Nop'
      }
      const commandFunctionOnFailure = async () => {
        throw 'Nop'
      }
      const virtualManager = new VirtualManager({})
      const onFailureStep = new VirtualStep({ title: 'on failure', command: commandFunctionOnFailure })
      const virtualStep = new VirtualStep({
        title: 'title',
        command: commandFunction,
        onFailure: onFailureStep,
        recoverOnFailure: true,
        continueOnFailure: true
      })
      const thenFunc = jest.fn()

      await virtualStep.run({ virtual: virtualManager, childIndex: 5 }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toMatchObject({
        mainResult: {
          result: {
            attempts: 1,
            command: commandFunction,
            options: { maxRetries: 0 },
            results: [{ virtualerr: 'Nop' }]
          },
          status: 'fail'
        },
        onFailureResult: {
          result: {
            attempts: 1,
            command: commandFunctionOnFailure,
            options: { maxRetries: 0 },
            results: [{ virtualerr: 'Nop' }]
          },
          status: 'fail'
        }
      })
    })
  })
})
