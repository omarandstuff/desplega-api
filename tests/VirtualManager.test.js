import VirtualManager from '../src/VirtualManager'

describe('Remote#exec', () => {
  it('Executes a local command and solves the result (run data)', async () => {
    const virtualManager = new VirtualManager()
    const thenFunc = jest.fn()
    const commandFunction = async () => {
      return { cosas: 'yes' }
    }

    await virtualManager.exec(commandFunction).then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toEqual({
      attempts: 1,
      command: commandFunction,
      options: { maxRetries: 0 },
      results: [{ virtualout: { cosas: 'yes' } }],
      streamCallBack: undefined
    })
  })

  it('streams stdout and stderr before finishing', async () => {
    const virtualManager = new VirtualManager()
    const thenFunc = jest.fn()
    const catchFunc = jest.fn()
    let streamFunc = jest.fn()
    const commandFunction = async (context, streamCallBack) => {
      streamCallBack('stream')
      return { cosas: 'yes' }
    }

    await virtualManager.exec(commandFunction, streamFunc).then(thenFunc)

    expect(streamFunc.mock.calls.length).toBe(1)
    expect(streamFunc.mock.calls[0][0]).toBe('stream')
  })

  it('rejects the run if is already solving', async () => {
    const virtualManager = new VirtualManager()
    const catchFunc = jest.fn()

    virtualManager.status = 'resolving'

    await virtualManager.exec('command').catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual(new Error('Manager is bussy'))
  })

  it('rejects the execution if unsuccessful', async () => {
    const virtualManager = new VirtualManager()
    const catchFunc = jest.fn()
    const commandFunction = async () => {
      throw 'Nel pastel'
    }

    await virtualManager.exec(commandFunction).catch(catchFunc)

    expect(catchFunc.mock.calls.length).toBe(1)
    expect(catchFunc.mock.calls[0][0]).toEqual({
      attempts: 1,
      command: commandFunction,
      options: { maxRetries: 0 },
      results: [{ virtualerr: 'Nel pastel' }],
      streamCallBack: undefined
    })
  })

  it('works with bad paramaters', async () => {
    const virtualManager = new VirtualManager(12312312)
    const thenFunc = jest.fn()
    const commandFunction = async (context, streamCallBack) => {
      return { cosas: 'yes' }
    }

    await virtualManager.exec(commandFunction, 123123, 'asdasdsa').then(thenFunc)

    expect(thenFunc.mock.calls.length).toBe(1)
    expect(thenFunc.mock.calls[0][0]).toEqual({
      attempts: 1,
      command: commandFunction,
      options: {
        '0': 'a',
        '1': 's',
        '2': 'd',
        '3': 'a',
        '4': 's',
        '5': 'd',
        '6': 's',
        '7': 'a',
        maxRetries: 0
      },
      results: [{ virtualout: { cosas: 'yes' } }],
      streamCallBack: 123123
    })
  })

  describe('when the maxRetries option is set and the exec is rejected', () => {
    it('retries the same command the specified ammount', async () => {
      const virtualManager = new VirtualManager()
      const catchFunc = jest.fn()
      const commandFunction = async () => {
        throw 'Nel pastel'
      }

      await virtualManager.exec(commandFunction, undefined, { maxRetries: 3 }).catch(catchFunc)

      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toEqual({
        attempts: 4,
        command: commandFunction,
        options: { maxRetries: 3 },
        results: [
          { virtualerr: 'Nel pastel' },
          { virtualerr: 'Nel pastel' },
          { virtualerr: 'Nel pastel' },
          { virtualerr: 'Nel pastel' }
        ],
        streamCallBack: undefined
      })
    })

    it('resolve if the exec command if it is successfull before spending all tries', async () => {
      const virtualManager = new VirtualManager()
      const catchFunc = jest.fn()
      const thenFunc = jest.fn()
      let toFail = 4
      const commandFunction = async () => {
        if (toFail--) {
          throw 'Nel pastel'
        }
        return { si: 'pastel' }
      }

      await virtualManager
        .exec(commandFunction, undefined, { maxRetries: 4 })
        .then(thenFunc)
        .catch(catchFunc)

      expect(catchFunc.mock.calls.length).toBe(0)
      expect(thenFunc.mock.calls.length).toBe(1)
      expect(thenFunc.mock.calls[0][0]).toEqual({
        attempts: 5,
        command: commandFunction,
        options: { maxRetries: 4 },
        results: [
          { virtualerr: 'Nel pastel' },
          { virtualerr: 'Nel pastel' },
          { virtualerr: 'Nel pastel' },
          { virtualerr: 'Nel pastel' },
          { virtualout: { si: 'pastel' } }
        ],
        streamCallBack: undefined
      })
    })
  })
})
