# Clef TextMate Grammar

A TextMate grammar for the [Clef programming language](https://github.com/FidelityFramework/clef-lang-spec). It supplies initial lexical highlighting for editor and repository-highlighting consumers. The [Lattice integration plan](https://github.com/FidelityFramework/Composer/blob/main/docs/Lattice_Integration.md) coordinates this baseline with the .NET-hosted Lattice server under Composer.

## Current coverage

[grammars/clef.json](grammars/clef.json) declares the scope `source.clef` and the file extension `.clef`. It carries an F#-derived baseline for comments, strings, declarations, attributes, and type syntax. `.clefx` is not currently listed. The [sample-code directory](sample-code/) contains illustrative Clef files, including [Contract.clef](sample-code/Contract.clef) and [FPGAProgram.clef](sample-code/FPGAProgram.clef); these remain illustrative samples. The focused [lexical fixtures](tests/fixtures/) now have an automated TextMate regression gate; neither corpus claims compiler conformance.

The grammar provides lexical highlighting before a language server responds. Measured type identity, inferred dimensions, diagnostics, and proof status belong to the compiler and its LSP projections. CCS-derived semantic tokens can refine the editor presentation when available. A TextMate match alone does not establish those semantic facts, and the grammar does not launch a server or discover `.fidproj` projects.

## Consumer integration and first checks

Consumers include Lattice's VS Code integration and repository-highlighting integrations such as GitHub Linguist. Each consumer must register or package the grammar; this repository's extension list alone does not establish downstream installation. The current lattice-vim plugin carries a separate Vim regex syntax file, so it does not automatically consume this TextMate grammar.

The [grammar tests](tests/grammar.test.mjs) tokenize Clef fixtures with the actual TextMate/Oniguruma engine. They cover measure declarations, integer and real measured literals, anonymous placeholders, compound dimensions, polymorphic measure annotations, generic type syntax, quoted identifiers, strings, nested comments, ordinary code, and an unfinished literal measure annotation during editing. The latter must release the next declaration. Add `.clefx` coverage together with the server and editor document registration when supported.

The editor gate additionally checks an inferred measured-type hover, a dimensional mismatch diagnostic, and diagnostic removal after correction against the same server build. Those checks exercise the compiler/LSP path; tokenization checks exercise this grammar. Proof-status and semantic-token updates can join that fixture as the server capabilities land.

## Run lexical tests

With Node.js 22 or later:

```sh
npm ci
npm test
```

The lockfile pins `vscode-textmate` and `vscode-oniguruma`; the [tokenizer helper](tests/tokenize.mjs) follows their [registry and line-state API](https://github.com/microsoft/vscode-textmate#using) and loads Oniguruma's packaged WASM. Tests carry tokenizer state across lines and assert selected scopes rather than snapshotting every token. Markdown embedded in documentation comments is not loaded by this isolated harness. These checks establish lexical behavior, not dimensional correctness, semantic-token delivery, or live LSP support. The fixtures can inform the shared editor gate in the integration plan.

## Origin and license

Derived from [ionide-fsgrammar](https://github.com/ionide/ionide-fsgrammar), by Krzysztof Cieślak and contributors. Clef shares syntactic roots with F#, and this grammar will diverge with the language specification. See [LICENSE.md](LICENSE.md) for the MIT license.
