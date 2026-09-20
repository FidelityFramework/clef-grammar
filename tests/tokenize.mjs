import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import textmate from 'vscode-textmate';
import oniguruma from 'vscode-oniguruma';

const require = createRequire(import.meta.url);
const wasm = await readFile(require.resolve('vscode-oniguruma/release/onig.wasm'));
await oniguruma.loadWASM(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
const registry = new textmate.Registry({
  onigLib: Promise.resolve({
    createOnigScanner: patterns => new oniguruma.OnigScanner(patterns),
    createOnigString: value => new oniguruma.OnigString(value),
  }),
  loadGrammar: async scope => scope === 'source.clef'
    ? textmate.parseRawGrammar(await readFile(new URL('../grammars/clef.json', import.meta.url), 'utf8'), 'clef.json')
    : null,
});
const grammar = await registry.loadGrammar('source.clef');

export function tokenize(source) {
  let state = textmate.INITIAL;
  return source.split(/\r?\n/).map(text => {
    const result = grammar.tokenizeLine(text, state);
    state = result.ruleStack;
    return { text, tokens: result.tokens };
  });
}

export async function fixture(name) {
  return tokenize(await readFile(new URL(`fixtures/${name}`, import.meta.url), 'utf8'));
}
