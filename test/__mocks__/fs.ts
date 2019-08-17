const fs: any = jest.genMockFromModule('fs')

fs.existsSync = () => true

fs.readFileSync = () => 'content'

export default fs
