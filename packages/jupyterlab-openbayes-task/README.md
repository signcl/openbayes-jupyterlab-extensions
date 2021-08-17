# jupyterlab-openbayes-task

![Github Actions Status](https://github.com/signcl/openbayes-jupyterlab-extensions/workflows/Build/badge.svg)

OpenBayes Task

## Features

将 notebook 代码保存成 python 文件，并开启新的 task 执行

- 选中 notebook 需要的代码块，并保存到 python 文件中
- 启动一个新的 task 执行 python 文件
- 参考 [kubeflow-kale](https://github.com/kubeflow-kale/jupyterlab-kubeflow-kale)

## Requirements

* JupyterLab >= 1.0

## Install

```bash
jupyter labextension install jupyterlab-openbayes-task
```

## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Move to jupyterlab-openbayes-task directory
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
jupyter labextension uninstall jupyterlab-openbayes-task
```
