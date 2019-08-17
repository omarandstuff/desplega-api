import Virtual from '../src/Virtual'
import { VirtualFunction } from '../src/Virtual.types'
import { Context } from '../src/Step.types'

describe('Virtual#exec', () => {
  it('executes a virtual async function and then resolves the result', async () => {
    const virtual = new Virtual()
    const virtualExec = jest.fn()
    const thenFunc = jest.fn()

    const virtualFunction: VirtualFunction = async (...args) => {
      return virtualExec(...args)
    }

    await virtual.exec(virtualFunction, {} as Context).then(thenFunc)

    expect(thenFunc).toHaveBeenCalledWith({ error: null, stdout: '', stderr: '' })
    expect(virtualExec).toHaveBeenCalledWith({}, virtual.emit)
  })

  it('rejects if command fails', async () => {
    const virtual = new Virtual()
    const virtualExec = jest.fn()
    const catchFunc = jest.fn()

    const virtualFunction: VirtualFunction = async (...args) => {
      virtualExec(...args)
      throw new Error('Async error')
    }

    await virtual.exec(virtualFunction, {} as Context).catch(catchFunc)

    expect(catchFunc).toHaveBeenCalledWith({ error: new Error('Async error'), stdout: '', stderr: '' })
    expect(virtualExec).toHaveBeenCalledWith({}, virtual.emit)
  })

  it('can streams stdout and stderr before closing', async () => {
    const virtual = new Virtual()
    const streamFunc = jest.fn()

    virtual.addListener('stdout', streamFunc)
    virtual.addListener('stderr', streamFunc)

    let virtualFunction: VirtualFunction = async (_, emit) => {
      emit('stdout', 'stdout')
      return
    }

    await virtual.exec(virtualFunction, {} as Context)

    expect(streamFunc).toHaveBeenCalledWith('stdout')

    streamFunc.mockReset()

    virtualFunction = async (_, emit) => {
      emit('stderr', 'stderr')
      throw new Error('Async error')
    }

    await virtual.exec(virtualFunction, {} as Context).catch(jest.fn())

    expect(streamFunc).toHaveBeenCalledWith('stderr')
  })

  it('rejects if command timeout is reached', async () => {
    const virtual = new Virtual({ timeout: 1 })
    const virtualExec = jest.fn()
    const catchFunc = jest.fn()

    const virtualFunction: VirtualFunction = async (...args) => {
      virtualExec(...args)
      return new Promise(resolve => setTimeout(resolve, 10))
    }

    await virtual.exec(virtualFunction, {} as Context).catch(catchFunc)

    expect(catchFunc).toHaveBeenCalledWith({ error: new Error('Virtual async function timeout'), stdout: '', stderr: '' })
    expect(virtualExec).toHaveBeenCalledWith({}, virtual.emit)
  })
})
