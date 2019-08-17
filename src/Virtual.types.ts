import { Context } from 'vm'

export type VirtualEmit = (event: 'stdout' | 'stderr', data: string) => void
export type VirtualFunction = (context: Context, emit: VirtualEmit) => Promise<void>
