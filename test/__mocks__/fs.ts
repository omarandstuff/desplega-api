const fs: any = jest.genMockFromModule('fs')

fs.existsSync = (): true => true

fs.readFileSync = (): string => 'content'

export default fs
