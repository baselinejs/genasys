# trial4

Simplest Typescript, Yarn 2, Plug-n-Play, Jest-based app that incorporates our standard components of eslint, prettier.

# Install

```bash
$ yarn install
```

# Switching Yarn Versions

The `sources` version of yarn can be used instead of berry by removing and regenerating the .yarn directory:

```bash
$ yarn teardown
$ yarn set version sources
$ yarn install
$ yarn pnpify --sdk vscode
```

After which you will need to redo the Install steps above.

NOTE: in VSCode, if Jest keywords like `describe` and `expect` are showing as undefined, do a "Developer: Reload Window" from the Command Palette to resolve that.

# Foundations:

Language: Typescript
Module System:  Yarn 2 Plug-n-Plug (berry)
Test Runner:  Jest
Code Quality:  ESLint, Prettier


# VS-Code

VS-Code Plugins used:

1. firsttris.vscode-jest-runner
2. arcanis.vscode-zipfs
3. dbaeumer.vscode-eslint
4. esbenp.prettier-vscode
