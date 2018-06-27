import _Pipeline from '../src/Pipeline'
import _Stage from '../src/Stage'
import _LocalStep from '../src/LocalStep'
import _RemoteStep from '../src/RemoteStep'
import Local from '../src/Local'
import LocalManager from '../src/LocalManager'
import Printer from '../src/Printer'
import Remote from '../src/Remote'
import RemoteManager from '../src/RemoteManager'
import { Pipeline, Stage, LocalStep, RemoteStep } from '../src/index'
import api from '../src/index'

describe('index', () => {
  it('exports the object creator functions', () => {
    expect(Pipeline('', {})).toBeInstanceOf(_Pipeline)
    expect(Stage('', {})).toBeInstanceOf(_Stage)
    expect(LocalStep()).toBeInstanceOf(_LocalStep)
    expect(RemoteStep()).toBeInstanceOf(_RemoteStep)
  })

  it('exports api component as default', () => {
    expect(api).toEqual({
      Pipeline: _Pipeline,
      Stage: _Stage,
      LocalStep: _LocalStep,
      RemoteStep: _RemoteStep,
      Local: Local,
      LocalManager: LocalManager,
      Printer: Printer,
      Remote: Remote,
      RemoteManager: RemoteManager
    })
  })
})
