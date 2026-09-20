import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './tokenize.mjs';

function scopesAt(lines, lineText, text, offset = 0) {
  const line = lines.find(line => line.text === lineText);
  assert.ok(line, `Missing fixture line: ${lineText}`);
  const start = line.text.indexOf(text, offset);
  assert.notEqual(start, -1, `Missing ${text} in ${lineText}`);
  const end = start + text.length;
  const tokens = line.tokens.filter(token => token.startIndex < end && token.endIndex > start);
  assert.ok(tokens.length > 0, `No tokens cover ${text} in ${lineText}`);
  return tokens;
}
function has(lines, line, text, scope, offset = 0) {
  for (const token of scopesAt(lines, line, text, offset)) {
    assert.ok(token.scopes.includes(scope), `${JSON.stringify(text)} in ${line}: expected ${scope}, got ${token.scopes.join(', ')}`);
  }
}
function lacks(lines, line, text, prefix) {
  for (const token of scopesAt(lines, line, text)) {
    assert.ok(!token.scopes.some(scope => scope.startsWith(prefix)), `${text} leaked into ${prefix}: ${token.scopes}`);
  }
}

test('measure declarations and generic measured annotations retain lexical type scopes', async () => {
  const lines = await fixture('measures.clef');
  has(lines, '[<Measure>] type m', 'Measure', 'support.function.attribute.clef');
  has(lines, '[<Measure>] type m', 'type', 'keyword.clef');
  has(lines, '[<Measure>] type m', 'm', 'entity.name.type.clef', 15);
  const speed = lines.find(line => line.text.startsWith('let speed')).text;
  has(lines, speed, 'float', 'entity.name.type.clef');
  has(lines, speed, 'm', 'entity.name.type.clef', speed.indexOf('float<m/s>'));
  has(lines, speed, '/', 'keyword.symbol.clef', speed.indexOf('float<m/s>'));
  has(lines, "let identity (value: 'T) : 'T = value", "'T", 'entity.name.type.clef');
  has(lines, 'let values : list<float<m>> = [distance]', 'm', 'entity.name.type.clef');
});

test('measured literals highlight units and compound operators as lexical syntax', async () => {
  const lines = await fixture('measures.clef');
  has(lines, 'let distance = 12.0<m>', '12.0', 'constant.numeric.float.clef');
  has(lines, 'let distance = 12.0<m>', 'm', 'entity.name.type.clef');
  has(lines, 'let acceleration = 9.81<m/s^2>', 's', 'entity.name.type.clef');
  has(lines, 'let acceleration = 9.81<m/s^2>', '/', 'keyword.symbol.clef');
  has(lines, 'let pressure = 101325.0<kg m^-1 s^-2>', 'kg', 'entity.name.type.clef');
  has(lines, 'let pressure = 101325.0<kg m^-1 s^-2>', '^', 'keyword.symbol.clef');
  has(lines, 'let tiny = -1.25e-3<m>', '1.25e-3', 'constant.numeric.float.clef');
  has(lines, 'let qualified = 2.0<SI.m>', 'SI.m', 'entity.name.type.clef');
});

test('quoted identifiers remain bindings in declarations and expressions', async () => {
  const lines = await fixture('lexical.clef');
  has(lines, 'let ``distance travelled`` = 12.0', 'distance travelled', 'variable.clef');
  has(lines, 'let quoted = ``distance travelled``', 'distance travelled', 'variable.other.binding.clef');
});

test('strings and nested comments protect embedded code and release following lines', async () => {
  const lines = await fixture('lexical.clef');
  has(lines, 'let text = "not a // comment or a 12.0<m> measure"', '12.0<m>', 'string.quoted.double.clef');
  lacks(lines, 'let text = "not a // comment or a 12.0<m> measure"', '12.0<m>', 'meta.measure');
  has(lines, 'let escaped = "a \\"quote\\" remains inside"', 'remains inside', 'string.quoted.double.clef');
  has(lines, 'let verbatim = @"a ""quote"" and // remain inside"', '//', 'string.quoted.literal.clef');
  has(lines, '// let fake = 9.81<m/s^2>', '9.81', 'comment.line.double-slash.clef');
  has(lines, '   (* nested comment *) still outer', 'still outer', 'comment.block.clef');
  has(lines, 'let afterComment = 42', 'let', 'keyword.clef');
  lacks(lines, 'let afterComment = 42', 'let', 'comment.');
  has(lines, 'let fake = 12.0<m>', 'let', 'string.quoted.triple.clef');
  has(lines, 'let afterString = true', 'true', 'constant.language.boolean.clef');
  lacks(lines, 'let afterString = true', 'let', 'string.');
});

test('incomplete measured literal does not swallow the next declaration or a comparison', async () => {
  const lines = await fixture('editing.clef');
  has(lines, 'let unfinished = 1.0<m/', 'm', 'entity.name.type.clef');
  has(lines, 'let following = 42', 'let', 'keyword.clef');
  lacks(lines, 'let following = 42', 'let', 'meta.measure');
  lacks(lines, 'let comparison = 1.0 < limit', 'limit', 'meta.measure');
  has(lines, 'let followingComparison = false', 'false', 'constant.language.boolean.clef');
});

test('ordinary conditional code keeps keyword and numeric scopes', async () => {
  const lines = await fixture('lexical.clef');
  const line = 'let choose value = if value then 1 else 0';
  has(lines, line, 'choose', 'variable.clef');
  for (const keyword of ['if', 'then', 'else']) has(lines, line, keyword, 'keyword.control');
  has(lines, line, '1', 'constant.numeric.integer.nativeint.clef');
});

test('integer literals and anonymous measure placeholders have lexical measure scopes', async () => {
  const lines = await fixture('measures.clef');
  has(lines, 'let wholeDistance = 1<m>', '1', 'constant.numeric.integer.nativeint.clef');
  has(lines, 'let wholeDistance = 1<m>', 'm', 'entity.name.type.clef');
  has(lines, 'let wholeSpeed = 2<m/s>', 'm', 'entity.name.type.clef');
  has(lines, 'let wholeSpeed = 2<m/s>', '/', 'keyword.symbol.clef');
  has(lines, 'let wholeSpeed = 2<m/s>', 's', 'entity.name.type.clef', 20);
  has(lines, 'let inferredUnit = 1<_>', '_', 'entity.name.type.clef');
  has(lines, 'let inferredReal = 0.0<_>', '_', 'entity.name.type.clef');
  const editing = await fixture('editing.clef');
  lacks(editing, 'let wholeComparison = 1 < limit', 'limit', 'meta.measure');
  has(editing, 'let afterWholeComparison = true', 'true', 'constant.language.boolean.clef');
});

test('polymorphic measures in type annotations stay type syntax rather than character literals', async () => {
  const lines = await fixture('measures.clef');
  const simple = "let sameMeasure (value: float<'U>) : float<'U> = value";
  const power = "let squared (value: float<'U>) : float<'U^2> = value * value";
  has(lines, simple, "'U", 'entity.name.type.clef');
  lacks(lines, simple, "'U", 'string.');
  has(lines, power, "'U", 'entity.name.type.clef', power.indexOf(': float', 30));
});
