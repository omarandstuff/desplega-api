import VirtualStep from '../src/VirtualStep'
import Virtual from '../src/Virtual'
import { VirtualFunction } from '../src/Virtual.types'
import { Context } from '../src/Pipeline.types'

describe('VirtualStep#run', () => {
  it('executes a local command and return its result', async (): Promise<void> => {
    const virtualProcessor: Virtual = new Virtual()
    const virtualFunction: VirtualFunction = jest.fn().mockResolvedValue('')
    const virtualStep: VirtualStep = new VirtualStep({ title: 'title', asyncFunction: virtualFunction })
    const thenFunc = jest.fn()

    await virtualStep.run({ virtualProcessor } as Context, 1).then(thenFunc)

    expect(thenFunc).toHaveBeenCalledWith({ error: null, stdout: '', stderr: '' })
  })

  describe('when the maxRetries option is set and the exec keeps failing', () => {
    it('retries the same command the specified ammount', async (): Promise<void> => {
      const virtualProcessor: Virtual = new Virtual()
      const virtualFunction: VirtualFunction = jest.fn().mockRejectedValue('')
      const virtualStep: VirtualStep = new VirtualStep({ title: 'title', asyncFunction: virtualFunction, maxRetries: 1 })
      const catchFunc = jest.fn()

      await virtualStep.run({ virtualProcessor } as Context, 1).catch(catchFunc)

      expect(catchFunc).toBeCalledWith({ error: '', stdout: '', stderr: '' })
    })

    it('resolve if the exec command if it is successfull before spending all tries', async (): Promise<void> => {
      const virtualProcessor: Virtual = new Virtual()
      let tries = 0
      const virtualFunction: VirtualFunction = async (): Promise<void> => {
        if (tries++ < 4) {
          throw ''
        }
      }
      const virtualStep: VirtualStep = new VirtualStep({ title: 'title', asyncFunction: virtualFunction, maxRetries: 4 })
      const thenFunc = jest.fn()

      await virtualStep.run({ virtualProcessor } as Context, 1).then(thenFunc)

      expect(thenFunc).toHaveBeenCalledWith({ error: null, stdout: '', stderr: '' })
    })
  })

  describe('when onFailure is set to continue', () => {
    it('resolves instead of rejecting the step', async (): Promise<void> => {
      const virtualProcessor = new Virtual()
      const virtualFunction: VirtualFunction = jest.fn().mockRejectedValue('')
      const virtualStep = new VirtualStep({ title: 'title', asyncFunction: virtualFunction, onFailure: 'continue' })
      const thenFunc = jest.fn()

      await virtualStep.run({ virtualProcessor } as Context, 1).then(thenFunc)

      expect(thenFunc).toHaveBeenCalledWith({ error: '', stderr: '', stdout: '' })
    })
  })

  describe('when onFailure is set to continue', () => {
    it('resolves instead of rejecting the step', async (): Promise<void> => {
      const virtualProcessor = new Virtual()
      const virtualFunction: VirtualFunction = jest.fn().mockRejectedValue('')
      const virtualStep = new VirtualStep({ title: 'title', asyncFunction: virtualFunction, onFailure: 'continue' })
      const thenFunc = jest.fn()

      await virtualStep.run({ virtualProcessor } as Context, 1).then(thenFunc)

      expect(thenFunc.mock.calls[0][0]).toEqual({ error: '', stderr: '', stdout: '' })
    })
  })

  describe('when onSuccess is set to terminate', () => {
    it('rejects instead of resolve the step', async (): Promise<void> => {
      const virtualProcessor = new Virtual()
      const virtualFunction: VirtualFunction = jest.fn().mockRejectedValue('')
      const virtualStep = new VirtualStep({ title: 'title', asyncFunction: virtualFunction, onSuccess: 'terminate' })
      const catchFunc = jest.fn()

      await virtualStep.run({ virtualProcessor } as Context, 1).catch(catchFunc)

      expect(catchFunc.mock.calls.length).toBe(1)
      expect(catchFunc.mock.calls[0][0]).toEqual({ error: '', stderr: '', stdout: '' })
    })
  })
})
