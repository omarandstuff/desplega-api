import { PipelineParserDescriptor } from '../../src'

const base: PipelineParserDescriptor = {
  pipeline: {
    title: 'Pipeline Name',
    remotes: {
      Remote1: {
        host: 'host.com',
        port: 45,
        username: 'user',
        password: 'somepassword',
        keepaliveInterval: 666,
        keepaliveCountMax: 777
      },
      Remote2: {
        host: 'host2.com',
        port: 33,
        username: 'david',
        password: 'somepassword2',
        keepaliveInterval: 888,
        keepaliveCountMax: 2
      }
    },
    remoteOptions: {
      timeout: 600
    },
    localOptions: {
      timeout: 600
    },
    virtualOptions: {
      timeout: 600
    },
    steps: [
      {
        type: 'remote',
        title: 'Step1',
        workingDirectory: 'path/where/to/run',
        command: 'sudo apt-get update',
        remoteId: 'Remote1',
        onFailure: 'continue',
        remoteOptions: {
          timeout: 600
        }
      },
      {
        type: 'local',
        title: 'Step2',
        workingDirectory: 'path/where/to/run',
        command: 'sudo apt-get update',
        onSuccess: 'terminate',
        localOptions: {
          timeout: 60
        }
      },
      {
        type: 'virtual',
        title: 'Step3',
        asyncFunction: async (): Promise<void> => {},
        onFailure: 'terminate',
        virtualOptions: {
          timeout: 60
        }
      }
    ]
  }
}

export default base
