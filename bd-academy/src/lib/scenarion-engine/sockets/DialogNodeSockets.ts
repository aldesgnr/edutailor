import { ClassicPreset } from 'rete'

const input = new ClassicPreset.Socket('input')
const output = new ClassicPreset.Socket('output')
const value = new ClassicPreset.Socket('Value')
const dialog = new ClassicPreset.Socket('Dialog')

export { dialog, value, input, output }
