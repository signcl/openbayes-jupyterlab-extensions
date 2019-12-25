# jupyterlab-openbayes-theme

OpenBayes Theme, a fork from official JupyterLab [dark theme](https://github.com/jupyterlab/jupyterlab/tree/master/packages/theme-dark-extension).

## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterlab-openbayes-theme
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```
