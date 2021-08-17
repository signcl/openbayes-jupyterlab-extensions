# jupyterlab-openbayes-snippets

![Github Actions Status](https://github.com/signcl/openbayes-jupyterlab-extensions/workflows/Build/badge.svg)

OpenBayes snippets

## Features

snippets 补充大量代码片段

- 参考 [colab](https://colab.research.google.com)
- 参考 [链接](https://jupyter-contrib-nbextensions.readthedocs.io/en/latest/nbextensions/snippets_menu/readme.html)

## Requirements

* JupyterLab >= 1.0

## Install

```bash
jupyter labextension install jupyterlab-openbayes-snippets
```

## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Move to jupyterlab-openbayes-snippets directory
# Install dependencies
jlpm
# Build Typescript source
jlpm build
# Link your development version of the extension with JupyterLab
jupyter labextension link .
# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter lab build
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
```

### Uninstall

```bash
jupyter labextension uninstall jupyterlab-openbayes-snippets
```
