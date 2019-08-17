import { Context } from './Step.types'

export type VirtualFunction = (context: Context, emit: (event: 'stdout' | 'stderr', data: string) => void) => Promise<void>
