import _Loader from '../src/Loader'
import _Local from '../src/Local'
import _LocalManager from '../src/LocalManager'
import _LocalStep from '../src/LocalStep'
import _Parser from '../src/Parser'
import _Pipeline from '../src/Pipeline'
import _Printer from '../src/Printer'
import _Remote from '../src/Remote'
import _RemoteManager from '../src/RemoteManager'
import _RemoteStep from '../src/RemoteStep'
import _Stage from '../src/Stage'
import * as api from '../src/index'

describe('index', () => {
  it('exports api components', () => {
    expect(api).toEqual({
      Loader: _Loader,
      Local: _Local,
      LocalManager: _LocalManager,
      LocalStep: _LocalStep,
      Parser: _Parser,
      Pipeline: _Pipeline,
      Printer: _Printer,
      Remote: _Remote,
      RemoteManager: _RemoteManager,
      RemoteStep: _RemoteStep,
      Stage: _Stage
    })
  })
})
