import { Chalk } from 'chalk'

export interface RowElement {
  text?: string
  style?: Chalk
  fit?: boolean
  blank?: boolean
  symbol?: string
}
