import { RowElement } from './Printer.types'

/**
 * Advanced terminal printer
 *
 */
export default class Printer {
  /**
   * Will draw a single terminal row adjusting text if necesary
   *
   * @param {Object} elements array of line seccions to draw
   * options are:
   * text: actual text to draw
   * style: chalk function to format text
   * fit: bool value to fit this element in the available space
   * blank: bool value to only draw a space between text elements
   * symbol: value to use instead of spaces when the element is clank
   *
   * @param {Bool} inline Keep drawing the line in the same terminal line
   *
   */
  public drawRow(elements: RowElement[], inline?: boolean): void {
    const terminalWidth: number = process.stdout.columns
    const processedElements = this.fitElements(elements, terminalWidth)
    const fixedWidth = this.calculateFixedElementsWidth(processedElements)
    const availableWidth = Math.max(0, terminalWidth - fixedWidth)
    const rendered = this.buildAndFormat(processedElements, availableWidth)

    if (inline) {
      process.stdout.write(`${rendered}\r`)
    } else {
      process.stdout.write(`${' '.repeat(terminalWidth)}\r`)
      console.log(rendered)
    }
  }

  /**
   * Cleans the curren teminal line in case the teminal draw an inline raw ans
   * prints a string adding a tab at the begining.
   *
   * @param {String} string actual string to draw.
   *
   * @param {Number} tabSize How many spaces to draw before the string.
   *
   */
  public draw(string: string, tabSize = 0): void {
    const terminalWidth = process.stdout.columns
    const finalString = string
      .replace(/(\r|[\n]$)/g, '')
      .split('\n')
      .map(line => {
        return `${' '.repeat(tabSize)}${line}`
      })
      .join('\n')

    process.stdout.write(`${' '.repeat(terminalWidth)}\r`)
    console.log(finalString)
  }

  private applyFormat(element: RowElement, optionalText?: string, raw?: boolean): string {
    if (element.style && !raw) {
      return element.style(optionalText || element.text)
    }
    return optionalText || element.text
  }

  private buildAndFormat(elements: RowElement[], availableWidth: number, raw?: boolean): string {
    const dynamicCount = this.calculateDynamicCount(elements)
    const widthPerDynamicElement = Math.floor(availableWidth / dynamicCount)
    const specialDynamic = widthPerDynamicElement === 0
    let availableDynamixSpace = availableWidth
    let uncalculateDynamicSpace = availableWidth - widthPerDynamicElement * dynamicCount

    return elements
      .map((element: RowElement): string => {
        let rendered: string

        if (element.blank) {
          if (specialDynamic) {
            if (availableDynamixSpace) {
              availableDynamixSpace--
              rendered = this.applyFormat(element, ' ')
            }
          } else {
            const extraSpace = uncalculateDynamicSpace-- > 0 ? 1 : 0
            const blank = (element.symbol || ' ').repeat(widthPerDynamicElement + extraSpace)
            rendered = this.applyFormat(element, blank, raw)
          }
        } else if (element.fit) {
          if (specialDynamic) {
            if (availableDynamixSpace) {
              availableDynamixSpace--
              rendered = this.applyFormat(element, element.text[0], raw)
            }
          } else {
            const extraSpace = uncalculateDynamicSpace-- > 0 ? 1 : 0
            const finalWith = widthPerDynamicElement + extraSpace

            if (element.text.length > finalWith) {
              const exceed = element.text.length - finalWith
              const cutPosition = element.text.length - exceed
              const addDots = cutPosition - 3 > 0
              const extraCut = addDots ? 3 : 0
              const extraDots = addDots ? '...' : ''
              const cuttedText = element.text.substring(0, cutPosition - extraCut)

              rendered = this.applyFormat(element, `${cuttedText}${extraDots}`, raw)
            } else {
              const lack = finalWith - element.text.length
              const amplifiedText = `${element.text}${' '.repeat(lack)}`

              rendered = this.applyFormat(element, amplifiedText, raw)
            }
          }
        } else {
          rendered = this.applyFormat(element)
        }

        return rendered
      })
      .join('')
  }

  private calculateDynamicCount(elements: RowElement[], onlyBlanks?: boolean): number {
    return elements.reduce((currentCount, element) => {
      if ((element.fit && !onlyBlanks) || element.blank) {
        return currentCount + 1
      }
      return currentCount
    }, 0)
  }

  private calculateFixedElementsWidth(elements: RowElement[]): number {
    return elements.reduce((currentWidth, element) => {
      if (!element.fit && !element.blank) {
        return currentWidth + element.text.length
      }
      return currentWidth
    }, 0)
  }

  private fitElements(elements: RowElement[], targetWidth: number): RowElement[] {
    const fixedWidth = this.calculateFixedElementsWidth(elements)
    const availableWidth = Math.max(0, targetWidth - fixedWidth)
    const dynamicCount = this.calculateDynamicCount(elements)
    const widthPerDynamicElement = Math.floor(availableWidth / dynamicCount)
    const removeDynamics = fixedWidth >= targetWidth
    let currentWidth = 0

    return elements
      .map(
        (element: RowElement): RowElement => {
          if (currentWidth < targetWidth) {
            if (element.fit || element.blank) {
              if (!removeDynamics) {
                currentWidth += widthPerDynamicElement
                return element
              }
            } else {
              currentWidth += element.text.length

              if (currentWidth >= targetWidth) {
                const exceed = currentWidth - targetWidth
                const cutPosition = element.text.length - exceed

                return { ...element, text: element.text.substring(0, cutPosition) }
              }

              return element
            }
          }
        }
      )
      .filter(element => element)
  }
}
