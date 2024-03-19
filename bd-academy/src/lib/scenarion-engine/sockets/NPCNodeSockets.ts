import { ClassicPreset } from 'rete'

const input = new ClassicPreset.Socket('input')
const selected = new ClassicPreset.Socket('selected')
const output = new ClassicPreset.Socket('output')
const statement = new ClassicPreset.Socket('Statement')
const executed = new ClassicPreset.Socket('executed')

export { statement, input, output, selected, executed }
