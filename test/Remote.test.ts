import Remote from '../src/Remote'
import ssh2 from 'ssh2'
import SSH2Mocker from './utils/SSH2Mocker'

beforeEach((): void => {
  SSH2Mocker.mock(ssh2)
})

afterEach((): void => {
  SSH2Mocker.unMock()
})

describe('Remote#exec', () => {
  it('executes a remote comand and then returns its stdout', async () => {
    const remote = new Remote({})
    const thenFuc = jest.fn()

    SSH2Mocker.addFinishMock()

    await remote.exec('test command').then(thenFuc)

    expect(thenFuc).toBeCalledWith({ error: { code: 0, message: undefined, name: 'signal', signal: 'signal' }, stderr: '', stdout: 'stdout' })
  })

  it('streams stdout and stderr while executing', async () => {
    const remote = new Remote({})
    const streamFunc = jest.fn()

    remote.addListener('stdout', streamFunc)
    remote.addListener('stderr', streamFunc)

    SSH2Mocker.addFinishMock()
    await remote.exec('test command')

    expect(streamFunc).toBeCalledWith('stdout')

    streamFunc.mockReset()

    SSH2Mocker.addFinishWithErrorMock()
    await remote.exec('test command').catch(jest.fn())

    expect(streamFunc).toBeCalledWith('stderr')
  })

  it('throws if the command was unsuccessful', async () => {
    const remote = new Remote({})
    const catchFuc = jest.fn()

    SSH2Mocker.addFinishWithErrorMock()
    await remote.exec('test command').catch(catchFuc)

    expect(catchFuc).toBeCalledWith({ error: { code: 128, message: undefined, name: 'signal', signal: 'signal' }, stderr: 'stderr', stdout: '' })
  })

  it('throws if there is an error in the ss2 library exec', async () => {
    const remote = new Remote({})
    const catchFuc = jest.fn()

    SSH2Mocker.addExecErrorMock()
    await remote.exec('test command').catch(catchFuc)

    expect(catchFuc).toBeCalledWith({ error: new Error('exec error'), stderr: '', stdout: '' })
  })

  it('throws if exec returns with an undefined error code (Probably a network error)', async () => {
    const remote = new Remote({})
    const catchFuc = jest.fn()

    SSH2Mocker.addNetworkErrorMock()
    await remote.exec('test command').catch(catchFuc)

    expect(catchFuc).toBeCalledWith({ error: new Error('Network error'), stderr: '', stdout: 'stdout' })
  })

  it('throws if connection can not be established', async () => {
    const remote = new Remote({})
    const catchFuc = jest.fn()

    SSH2Mocker.addConnectionErrorMock()
    await remote.exec('test command').catch(catchFuc)

    expect(catchFuc).toBeCalledWith({
      error: new Error('There was a problem trying to connect to the host undefined: Connection error'),
      stderr: '',
      stdout: ''
    })
  })

  it('emits the connection status', async () => {
    const remote = new Remote({})
    const connectingFunc = jest.fn()
    const connectedFunc = jest.fn()
    const closedFunc = jest.fn()

    remote.addListener('connecting', connectingFunc)
    remote.addListener('connected', connectedFunc)
    remote.addListener('closed', closedFunc)

    SSH2Mocker.addFinishMock()
    await remote.exec('test command')

    remote.close()

    expect(connectingFunc).toBeCalled()
    expect(connectedFunc).toBeCalled()
    expect(closedFunc).toBeCalled()

    connectingFunc.mockReset()
    connectedFunc.mockReset()
    closedFunc.mockReset()

    SSH2Mocker.addConnectionErrorMock()
    await remote.exec('test command').catch(jest.fn())

    expect(connectingFunc).toBeCalled()
    expect(connectedFunc).not.toBeCalled()
    expect(closedFunc).toBeCalled()
  })
})
