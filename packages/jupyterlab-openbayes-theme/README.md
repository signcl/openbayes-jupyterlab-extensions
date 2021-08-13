# jupyterlab-openbayes-theme

OpenBayes Theme, a fork from official JupyterLab  [light theme](https://github.com/jupyterlab/jupyterlab/tree/master/packages/theme-light-extension) with auto color scheme support powered by [Kladenets](https://github.com/sparanoid/kladenets) variables.

## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterlab-openbayes-theme
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
yarn install
yarn build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
yarn build
jupyter lab build
```

## Sync styles from upstream

- Download the source zipball from [jupyterlab/jupyterlab](https://github.com/jupyterlab/jupyterlab)
- Compare `packages/theme-light-extension` and `packages/theme-dark-extension` side by side
- Copy and paste updated files and override the old ones in this repo
