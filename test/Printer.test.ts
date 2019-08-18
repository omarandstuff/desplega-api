import Printer from '../src/Printer'

const realLog = console.log
const realWrite = process.stdout.write
const realColumns = process.stdout.columns

describe('Printer#drawRow', (): void => {
  beforeEach((): void => {
    console.log = jest.fn()
    process.stdout.write = jest.fn()
    process.stdout.columns = 10
  })

  afterAll((): void => {
    console.log = realLog
    process.stdout.write = realWrite
    process.stdout.columns = realColumns
  })

  describe('Printing inline', (): void => {
    it('it adds a /r at the end and uses process.stdout.write', async (): Promise<void> => {
      const printer = new Printer()

      printer.drawRow([{ text: 'some text' }], true)

      expect(process.stdout.write).toHaveBeenCalledWith('some text\r')
    })
  })

  describe('Printing short text smaller than the terminal', (): void => {
    it('just prints that shor text', async (): Promise<void> => {
      const printer = new Printer()

      printer.drawRow([{ text: 'short' }])

      expect(console.log).toHaveBeenCalledWith('short')
    })
  })

  describe('trying to print more text than space available', (): void => {
    it('crops the text', async (): Promise<void> => {
      const printer = new Printer()

      printer.drawRow([{ text: 'this is a very large text' }])

      expect(console.log).toHaveBeenCalledWith('this is a ')
    })

    describe('throuh multiple text elements', (): void => {
      it('still crops the text', async (): Promise<void> => {
        const printer = new Printer()

        printer.drawRow([{ text: 'this ' }, { text: 'is ' }, { text: 'a ' }, { text: 'very ' }, { text: 'large text' }])

        expect(console.log).toHaveBeenCalledWith('this is a ')
      })
    })
  })

  describe('Including text elements set as dynamic (fit: true)', (): void => {
    it('fits the text and add ...', async (): Promise<void> => {
      const printer = new Printer()

      printer.drawRow([{ text: 'dynamic text', fit: true }])

      expect(console.log).toHaveBeenCalledWith('dynamic...')
    })

    describe('throuh multiple text elements', (): void => {
      it('still fits the text', async (): Promise<void> => {
        const printer = new Printer()

        printer.drawRow([{ text: 'short ' }, { text: 'dynamic text', fit: true }])

        expect(console.log).toHaveBeenCalledWith('short d...')
      })
    })

    describe('the dynamic text is too short for the available space', (): void => {
      it('adds extra spaces to fill space', async (): Promise<void> => {
        const printer = new Printer()

        printer.drawRow([{ text: '22', fit: true }])

        expect(console.log).toHaveBeenCalledWith('22        ')
      })
    })

    describe('when there is not space for the 3 dots', (): void => {
      it('does not use the dots', async (): Promise<void> => {
        const printer = new Printer()

        printer.drawRow([{ text: 'bigenough' }, { text: 'dynamic text', fit: true }])

        expect(console.log).toHaveBeenCalledWith('bigenoughd')
      })
    })

    describe('when it is not posible to assign even space for all dynamics and blanks', (): void => {
      it('add some more spaces for the first ones', async (): Promise<void> => {
        const printer = new Printer()

        process.stdout.columns = 11
        printer.drawRow([{ text: 'dynamic text', fit: true }, { blank: true }, { text: 'dynamic text', fit: true }])

        expect(console.log).toHaveBeenCalledWith('d...    dyn')
      })
    })

    describe('when there are too many dynamics for available space', (): void => {
      it('just renders some of them', async (): Promise<void> => {
        const printer = new Printer()

        process.stdout.columns = 5
        printer.drawRow([
          { text: 'dynamic text', fit: true },
          { blank: true },
          { text: 'dynamic text', fit: true },
          { blank: true },
          { text: 'dynamic text', fit: true },
          { text: 'dynamic text', fit: true },
          { blank: true }
        ])

        expect(console.log).toHaveBeenCalledWith('d d d')
      })
    })
  })

  describe('when static text exeed available space', (): void => {
    it('do not try to render any dinamic text element', async (): Promise<void> => {
      const printer = new Printer()

      printer.drawRow([{ text: 'short ' }, { text: 'dynamic text', fit: true }, { text: 'not too short ' }])

      expect(console.log).toHaveBeenCalledWith('short not ')
    })
  })

  describe('efining blank block to fill space', (): void => {
    it('fills the space between text', async (): Promise<void> => {
      const printer = new Printer()

      printer.drawRow([{ text: 'short' }, { blank: true }, { text: '22' }])

      expect(console.log).toHaveBeenCalledWith('short   22')
    })
  })
})

describe('Printer#draw', (): void => {
  beforeEach((): void => {
    console.log = jest.fn()
    process.stdout.write = jest.fn()
    process.stdout.columns = 10
  })

  afterAll((): void => {
    console.log = realLog
    process.stdout.write = realWrite
    process.stdout.columns = realColumns
  })

  it('clean current terminal line and apply tabsize to the string', (): void => {
    const printer = new Printer()

    printer.draw('Some random text', 2)

    expect(process.stdout.write).toHaveBeenCalledWith('          \r')
    expect(console.log).toHaveBeenCalledWith('  Some random text')
  })
})
