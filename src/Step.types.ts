export interface StepDefinition {
  title: string
  onFailure?: 'terminate' | 'continue'
  onSuccess?: 'terminate' | 'continue'
  maxRetries?: number
}
