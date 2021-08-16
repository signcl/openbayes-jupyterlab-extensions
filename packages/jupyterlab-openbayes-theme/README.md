# jupyterlab-openbayes-theme

OpenBayes Theme, a fork from official JupyterLab  [light theme](https://github.com/jupyterlab/jupyterlab/tree/master/packages/theme-light-extension) with auto color scheme support powered by [Kladenets](https://github.com/sparanoid/kladenets) variables.

## Features

- [Remapped Material Colors](https://github.com/sparanoid/kladenets/blob/master/packages/core/dist/kladenets-material-map.css) that more pleasent to the eyes
- Auto dark theme
- Refined syntax highlighting colors

## Screenshots

![jupyterlab-openbayes-theme-dark](https://user-images.githubusercontent.com/96356/129545551-453b076d-6bc3-4214-9fbb-877b724e2e81.png)

![jupyterlab-openbayes-theme-light](https://user-images.githubusercontent.com/96356/129545540-30c56d0e-e748-421e-928e-62463ce94e80.png)

## Prerequisites

* JupyterLab 3.1.0+

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
