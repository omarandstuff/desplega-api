import Loader from '../src/Loader'
import Local from '../src/Local'
import LocalManager from '../src/LocalManager'
import LocalStep from '../src/LocalStep'
import Parser from '../src/Parser'
import Pipeline from '../src/Pipeline'
import Printer from '../src/Printer'
import Remote from '../src/Remote'
import RemoteManager from '../src/RemoteManager'
import RemoteStep from '../src/RemoteStep'
import Stage from '../src/Stage'
import * as api from '../src/index'

describe('index', () => {
  it('exports api components', () => {
    expect(api).toEqual({
      Loader,
      Local,
      LocalManager,
      LocalStep,
      Parser,
      Pipeline,
      Printer,
      Remote,
      RemoteManager,
      RemoteStep,
      Stage
    })
  })
})
