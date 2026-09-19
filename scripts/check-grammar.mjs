import assert from 'node:assert/strict'
import { parseGrammarIssues } from '../features/ai/grammar.ts'

const issues = parseGrammarIssues(
  'Here you go:\n```json\n[{"original":"teh","suggestion":"the","reason":"typo"},{"original":"recieve","suggestion":"receive","reason":"spelling"},{"original":"x","suggestion":"x","reason":"no-op"}]\n```'
)
assert.deepEqual(issues, [
  { original: 'teh', suggestion: 'the', reason: 'typo' },
  { original: 'recieve', suggestion: 'receive', reason: 'spelling' },
])

assert.deepEqual(parseGrammarIssues('[]'), [])
assert.deepEqual(parseGrammarIssues('no JSON here'), [])
assert.deepEqual(parseGrammarIssues('[{"original":5,"suggestion":null}]'), [])
assert.deepEqual(parseGrammarIssues('[not json'), [])

const many = JSON.stringify(
  Array.from({ length: 60 }, (_, i) => ({ original: `a${i}`, suggestion: `b${i}` }))
)
assert.equal(parseGrammarIssues(many).length, 50)

console.log('parseGrammarIssues ok')
