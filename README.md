# Clef TextMate Grammar

TextMate grammar for the [Clef programming language](https://github.com/FidelityFramework/clef-lang-spec), providing syntax highlighting for editors and GitHub.

## Scope

`source.clef`

## Origin

This grammar is derived from [ionide-fsgrammar](https://github.com/ionide/ionide-fsgrammar) (MIT License). Clef shares syntactic roots with F# and this grammar serves as the baseline for Clef-specific highlighting. As the Clef language specification evolves, this grammar will diverge to reflect language-specific constructs.

## Usage

This grammar is consumed by:

- [GitHub Linguist](https://github.com/github-linguist/linguist) for repository language detection and highlighting
- [Lattice](https://github.com/houstonhaynes/lattice-vscode) (VS Code extension for Clef)

## Structure

```
grammars/
  clef.json          # TextMate grammar definition
sample-code/         # Representative Clef source files
```

## License

MIT — see [LICENSE.md](LICENSE.md)

Ionide F# Grammar: Copyright (c) Krzysztof Cieślak and contributors, MIT License.
