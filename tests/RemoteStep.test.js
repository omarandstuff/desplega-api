jest.mock('fs')
import RemoteStep from '../src/RemoteStep'
import RemoteManager from '../src/RemoteManager'
import ssh from 'ssh2'

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

afterEach(() => {
  ssh.__mockExecErrorCode = 0
  ssh.__mockExecError = 0
  ssh.__mockExecTimeOut = 0
  ssh.__mockConnectionInterruption = 0
})

describe('RemoteStep#run', () => {
  it('executes a remote command and return its result', async () => {
    const remoteManager = new RemoteManager({}, '#ID')
    const remoteStep = new RemoteStep({ id: 'step1', title: 'title', command: 'command', verbosityLevel: 'full' })
    const thenFunc = jest.fn()

    await remoteStep
      .run({ archive: { dictionary: {}, history: [] }, remotes: [remoteManager], childIndex: 5 })
      .then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toMatchObject({
      '#ID': {
        remote: { id: '#ID' },
        result: {
          attempts: 1,
          command: 'command',
          connectionErrors: [],
          reconnectionAttempts: 0,
          results: [[{ code: 0, signal: 'signal', stdout: 'stdout' }]]
        },
        status: 'done'
      }
    })
  })

  it('archives the result in context', async () => {
    const remoteManager = new RemoteManager({}, '#ID1')
    const remoteStep = new RemoteStep({
      id: 'step1',
      title: 'title',
      command: 'command',
      verbosityLevel: 'full',
      options: { maxRetries: 4, maxReconnectionRetries: 2, reconnectionInterval: 1 }
    })
    const context = {
      archive: { dictionary: {}, history: [] },
      remotes: [remoteManager],
      childIndex: 5
    }

    ssh.__mockExecErrorCode = 2
    ssh.__mockConnectionInterruption = 2
    await remoteStep.run(context)

    expect(context).toMatchObject({
      archive: {
        dictionary: {
          step1: [
            { code: 128, signal: 'signal', stderr: 'stderr' },
            { code: 128, signal: 'signal', stderr: 'stderr' },
            [
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 0, signal: 'signal', stdout: 'stdout' }
            ]
          ]
        },
        history: [
          [
            { code: 128, signal: 'signal', stderr: 'stderr' },
            { code: 128, signal: 'signal', stderr: 'stderr' },
            [
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 0, signal: 'signal', stdout: 'stdout' }
            ]
          ]
        ]
      }
    })
  })

  it('archives the result in context but keeps multiple remotes ids', async () => {
    const remoteManager = new RemoteManager({}, '#ID1')
    const remoteManager2 = new RemoteManager({}, '#ID2')
    const remoteStep = new RemoteStep({
      id: 'step1',
      title: 'title',
      command: 'command',
      verbosityLevel: 'full',
      options: { maxRetries: 2 }
    })
    const context = {
      archive: { dictionary: {}, history: [] },
      remotes: [remoteManager, remoteManager2],
      childIndex: 5
    }

    ssh.__mockExecErrorCode = 4
    await remoteStep.run(context)

    expect(context).toMatchObject({
      archive: {
        dictionary: {
          step1: {
            '#ID1': [
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 0, signal: 'signal', stdout: 'stdout' }
            ],
            '#ID2': [
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 0, signal: 'signal', stdout: 'stdout' }
            ]
          }
        },
        history: [
          {
            '#ID1': [
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 0, signal: 'signal', stdout: 'stdout' }
            ],
            '#ID2': [
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 128, signal: 'signal', stderr: 'stderr' },
              { code: 0, signal: 'signal', stdout: 'stdout' }
            ]
          }
        ]
      }
    })
  })

  it('resolves as nothing to deploy if no remotes set', async () => {
    const remoteStep = new RemoteStep({ command: 'command' })
    const thenFunc = jest.fn()

    await remoteStep.run().then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toBe('Nothing to deploy')
  })

  it('selects remotes based on step definition', async () => {
    const remoteManager = new RemoteManager({}, '#ID')
    const remoteManager2 = new RemoteManager({}, '#ID2')
    const remoteManager3 = new RemoteManager({}, '#ID3')
    const remoteStep = new RemoteStep({ command: 'command', remotes: ['#ID3'] })
    const thenFunc = jest.fn()

    await remoteStep.run({ remotes: [remoteManager, remoteManager2, remoteManager3] }).then(thenFunc)

    expect(remoteStep.remotesIds === ['#ID3'])
    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toMatchObject({
      '#ID3': {
        remote: { id: '#ID3' },
        result: {
          attempts: 1,
          command: 'command',
          connectionErrors: [],
          reconnectionAttempts: 0,
          results: [[{ code: 0, signal: 'signal', stdout: 'stdout' }]]
        },
        status: 'done'
      }
    })
  })

  it('tansforms the path as a change dir command', async () => {
    const remoteManager = new RemoteManager({}, '#ID')
    const remoteStep = new RemoteStep({
      title: 'title',
      command: 'command',
      path: 'some/path',
      verbosityLevel: 'partial'
    })
    const thenFunc = jest.fn()

    await remoteStep.run({ remotes: [remoteManager], childIndex: 5 }).then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toMatchObject({
      '#ID': {
        remote: { id: '#ID' },
        result: {
          attempts: 1,
          command: 'cd some/path && command',
          connectionErrors: [],
          reconnectionAttempts: 0,
          results: [[{ code: 0, signal: 'signal', stdout: 'stdout' }]]
        },
        status: 'done'
      }
    })
  })

  it('return the result of mutiple remotes', async () => {
    const remoteManager = new RemoteManager({ maxRetries: 2 }, '#ID')
    const remoteManager2 = new RemoteManager({}, '#ID2')
    const remoteManager3 = new RemoteManager({}, '#ID3')
    const remoteStep = new RemoteStep({ title: 'title', command: 'command', continueOnFailure: true })
    const thenFunc = jest.fn()

    ssh.__mockExecErrorCode = 2
    await remoteStep.run({ remotes: [remoteManager, remoteManager2, remoteManager3], childIndex: 5 }).then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toMatchObject({
      '#ID': {
        remote: { id: '#ID' },
        result: {
          attempts: 1,
          command: 'command',
          connectionErrors: [],
          reconnectionAttempts: 0,
          results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
        },
        status: 'fail'
      },
      '#ID2': {
        remote: { id: '#ID2' },
        result: {
          attempts: 1,
          command: 'command',
          connectionErrors: [],
          reconnectionAttempts: 0,
          results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
        },
        status: 'fail'
      },
      '#ID3': {
        remote: { id: '#ID3' },
        result: {
          attempts: 1,
          command: 'command',
          connectionErrors: [],
          reconnectionAttempts: 0,
          results: [[{ code: 0, signal: 'signal', stdout: 'stdout' }]]
        },
        status: 'done'
      }
    })
  })

  it('allows to generate a dynamic command', async () => {
    const remoteManager = new RemoteManager({}, '#ID')
    const command = context => 'dynamic command'
    const remoteStep = new RemoteStep({ title: 'title', command: command, verbosityLevel: 'full' })
    const thenFunc = jest.fn()

    await remoteStep.run({ remotes: [remoteManager] }).then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toMatchObject({
      '#ID': {
        remote: { id: '#ID' },
        result: {
          attempts: 1,
          command: 'dynamic command',
          connectionErrors: [],
          reconnectionAttempts: 0,
          results: [[{ code: 0, signal: 'signal', stdout: 'stdout' }]]
        },
        status: 'done'
      }
    })
  })

  it('rejects if is already running', async () => {
    const remoteManager = new RemoteManager({}, '#ID')
    const remoteStep = new RemoteStep({ title: 'title', command: 'command', verbosityLevel: 'full' })
    const thenFunc = jest.fn()
    const catchFunc = jest.fn()

    remoteStep.status = 'running'
    await remoteStep
      .run({ remotes: [remoteManager], childIndex: 5 })
      .then(thenFunc)
      .catch(catchFunc)

    expect(thenFunc.mock.calls.length).toBe(0)
    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toBeInstanceOf(Error)
  })

  it('works with bad paramaters', async () => {
    const remoteManager = new RemoteManager(213123123, undefined, 2324)
    const remoteStep = new RemoteStep('qweqwewqe')
    const thenFunc = jest.fn()

    await remoteStep.run({ remotes: [remoteManager] }).then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toMatchObject({
      undefined: {
        remote: {
          currentRun: undefined,
          feedback: 'idle',
          id: undefined,
          options: { maxRetries: 0, reconnectionInterval: 5000, timeOut: 0 },
          remote: {
            config: {
              keepaliveCountMax: 5,
              keepaliveInterval: 12000,
              port: 22,
              username: 'root'
            },
            connection: {
              config: {
                keepaliveCountMax: 5,
                keepaliveInterval: 12000,
                port: 22,
                privateKey: 'content',
                username: 'root'
              }
            },
            status: 'ready'
          },
          status: 'free'
        },
        result: {
          attempts: 1,
          command: 'undefined',
          connectionErrors: [],
          options: { maxRetries: 0, reconnectionInterval: 5000, timeOut: 0 },
          reconnectionAttempts: 0,
          results: [[{ code: 0, signal: 'signal', stdout: 'stdout' }]]
        },
        status: 'done'
      }
    })
  })

  describe('when continueOnFailure is not set', () => {
    it('rejects when the internal remote fails', async () => {
      const remoteManager = new RemoteManager({}, '#ID')
      const remoteStep = new RemoteStep({ title: 'title', command: 'command' })
      const thenFunc = jest.fn()
      const catchFunc = jest.fn()

      ssh.__mockExecErrorCode = true
      await remoteStep
        .run({ remotes: [remoteManager], childIndex: 5 })
        .then(thenFunc)
        .catch(catchFunc)

      expect(thenFunc.mock.calls.length).toBe(0)
      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toMatchObject({
        '#ID': {
          remote: { id: '#ID' },
          result: {
            attempts: 1,
            command: 'command',
            connectionErrors: [],
            reconnectionAttempts: 0,
            results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
          },
          status: 'fail'
        }
      })
    })

    it('rejects and run the onfailure block if set', async () => {
      const remoteManager = new RemoteManager({}, '#ID')
      const onFailureStep = new RemoteStep({ title: 'on failure', command: 'command' })
      const remoteStep = new RemoteStep({ title: 'title', command: 'command', onFailure: onFailureStep })
      const thenFunc = jest.fn()
      const catchFunc = jest.fn()

      ssh.__mockExecErrorCode = true
      await remoteStep
        .run({ remotes: [remoteManager], childIndex: 5 })
        .then(thenFunc)
        .catch(catchFunc)

      expect(thenFunc.mock.calls.length).toBe(0)
      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toMatchObject({
        mainResult: {
          '#ID': {
            remote: { id: '#ID' },
            result: {
              attempts: 1,
              command: 'command',
              connectionErrors: [],
              reconnectionAttempts: 0,
              results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
            },
            status: 'fail'
          }
        },
        onFailureResult: {
          '#ID': {
            remote: { id: '#ID' },
            result: {
              attempts: 1,
              command: 'command',
              connectionErrors: [],
              reconnectionAttempts: 0,
              results: [[{ code: 0, signal: 'signal', stdout: 'stdout' }]]
            },
            status: 'done'
          }
        }
      })
    })

    it('resolves on failure if set recoverOnFailure and the secundary block succeed', async () => {
      const remoteManager = new RemoteManager({}, '#ID')
      const onFailureStep = new RemoteStep({ title: 'on failure', command: 'command' })
      const remoteStep = new RemoteStep({
        title: 'title',
        command: 'command',
        onFailure: onFailureStep,
        recoverOnFailure: true
      })
      const thenFunc = jest.fn()

      ssh.__mockExecErrorCode = true
      await remoteStep.run({ remotes: [remoteManager], childIndex: 5 }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toMatchObject({
        mainResult: {
          '#ID': {
            remote: { id: '#ID' },
            result: {
              attempts: 1,
              command: 'command',
              connectionErrors: [],
              reconnectionAttempts: 0,
              results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
            },
            status: 'fail'
          }
        },
        onFailureResult: {
          '#ID': {
            remote: { id: '#ID' },
            result: {
              attempts: 1,
              command: 'command',
              connectionErrors: [],
              reconnectionAttempts: 0,
              results: [[{ code: 0, signal: 'signal', stdout: 'stdout' }]]
            },
            status: 'done'
          }
        }
      })
    })

    it('rejects on failure if onFailure fails even if recoverOnFailure is set', async () => {
      const remoteManager = new RemoteManager({}, '#ID')
      const onFailureStep = new RemoteStep({ title: 'on failure', command: 'command' })
      const remoteStep = new RemoteStep({
        title: 'title',
        command: 'command',
        onFailure: onFailureStep,
        recoverOnFailure: true
      })
      const thenFunc = jest.fn()
      const catchFunc = jest.fn()

      ssh.__mockExecErrorCode = 2
      await remoteStep
        .run({ remotes: [remoteManager], childIndex: 5 })
        .then(thenFunc)
        .catch(catchFunc)

      expect(thenFunc.mock.calls.length).toBe(0)
      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toMatchObject({
        mainResult: {
          '#ID': {
            remote: { id: '#ID' },
            result: {
              attempts: 1,
              command: 'command',
              connectionErrors: [],
              reconnectionAttempts: 0,
              results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
            },
            status: 'fail'
          }
        },
        onFailureResult: {
          '#ID': {
            remote: { id: '#ID' },
            result: {
              attempts: 1,
              command: 'command',
              connectionErrors: [],
              reconnectionAttempts: 0,
              results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
            },
            status: 'fail'
          }
        }
      })
    })
  })

  describe('when continueOnFailure is not set', () => {
    it('resolves on failure', async () => {
      const remoteManager = new RemoteManager({}, '#ID')
      const remoteStep = new RemoteStep({ title: 'title', command: 'command', continueOnFailure: true })
      const thenFunc = jest.fn()

      ssh.__mockExecErrorCode = true
      await remoteStep.run({ remotes: [remoteManager], childIndex: 5 }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toMatchObject({
        '#ID': {
          remote: { id: '#ID' },
          result: {
            attempts: 1,
            command: 'command',
            connectionErrors: [],
            reconnectionAttempts: 0,
            results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
          },
          status: 'fail'
        }
      })
    })

    it('resolves and run the onfailure block if set', async () => {
      const remoteManager = new RemoteManager({}, '#ID')
      const onFailureStep = new RemoteStep({ title: 'on failure', command: 'command' })
      const remoteStep = new RemoteStep({
        title: 'title',
        command: 'command',
        onFailure: onFailureStep,
        continueOnFailure: true
      })
      const thenFunc = jest.fn()

      ssh.__mockExecErrorCode = true
      await remoteStep.run({ remotes: [remoteManager], childIndex: 5 }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toMatchObject({
        mainResult: {
          '#ID': {
            remote: { id: '#ID' },
            result: {
              attempts: 1,
              command: 'command',
              connectionErrors: [],
              reconnectionAttempts: 0,
              results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
            },
            status: 'fail'
          }
        },
        onFailureResult: {
          '#ID': {
            remote: { id: '#ID' },
            result: {
              attempts: 1,
              command: 'command',
              connectionErrors: [],
              reconnectionAttempts: 0,
              results: [[{ code: 0, signal: 'signal', stdout: 'stdout' }]]
            },
            status: 'done'
          }
        }
      })
    })

    it('resolves on failure even if onFailure fails too', async () => {
      const remoteManager = new RemoteManager({}, '#ID')
      const onFailureStep = new RemoteStep({ title: 'on failure', command: 'command' })
      const remoteStep = new RemoteStep({
        title: 'title',
        command: 'command',
        onFailure: onFailureStep,
        recoverOnFailure: true,
        continueOnFailure: true
      })
      const thenFunc = jest.fn()

      ssh.__mockExecErrorCode = 2
      await remoteStep.run({ remotes: [remoteManager], childIndex: 5 }).then(thenFunc)

      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toMatchObject({
        mainResult: {
          '#ID': {
            remote: { id: '#ID' },
            result: {
              attempts: 1,
              command: 'command',
              connectionErrors: [],
              reconnectionAttempts: 0,
              results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
            },
            status: 'fail'
          }
        },
        onFailureResult: {
          '#ID': {
            remote: { id: '#ID' },
            result: {
              attempts: 1,
              command: 'command',
              connectionErrors: [],
              reconnectionAttempts: 0,
              results: [[{ code: 128, signal: 'signal', stderr: 'stderr' }]]
            },
            status: 'fail'
          }
        }
      })
    })
  })
})
