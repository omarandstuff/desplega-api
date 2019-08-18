import EventEmitter from 'events'
import { ExecOptions } from 'child_process'
import { VirtualFunction } from './Virtual.types'
import { Context } from './Pipeline.types'

/**
 * Base class for processors
 */
export default class Processor extends EventEmitter {
  /*eslint-disable @typescript-eslint/no-unused-vars*/
  public async exec(_: string | VirtualFunction, _2?: ExecOptions | Context, _3?: ExecOptions): Promise<any> {
    /*eslint-enable @typescript-eslint/no-unused-vars*/
    throw new Error('You need to implement the exec method')
  }
}
