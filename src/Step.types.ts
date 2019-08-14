import LocalManager from './LocalManager'
import { LocalManagerOptions } from './LocalManager.types'

export interface Context {
  localManager: LocalManager
  localManagerOptions?: LocalManagerOptions
}

export interface StepDefinition {
  title: string
  command: string | ((context: Context) => string)
  id?: string
  onFailure?: 'terminate' | 'continue'
  onSuccess?: 'terminate' | 'continue'
}
