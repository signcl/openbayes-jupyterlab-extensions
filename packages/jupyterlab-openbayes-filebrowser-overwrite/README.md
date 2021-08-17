# jupyterlab-openbayes-filebrowser-overwrite

![Github Actions Status](https://github.com/signcl/openbayes-jupyterlab-extensions/workflows/Build/badge.svg)

filebrowser overwrite

## Features

拷贝 OpenBayes 容器文件的完整路径

- 添加 menu item 「Copy OpenBayes Path」，拷贝容器内文件 `/openbayes/home/xxx` 的完整路径到系统剪贴板
- 不移除 「Copy Path」，留给 juypterlab 的其他组件使用

## Requirements

* JupyterLab >= 1.0

## Install

```bash
jupyter labextension install jupyterlab-openbayes-filebrowser-overwrite
```

## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Move to jupyterlab-openbayes-filebrowser-overwrite directory
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
jupyter labextension uninstall jupyterlab-openbayes-filebrowser-overwrite
```
