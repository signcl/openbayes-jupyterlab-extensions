# jupyterlab-openbayes-bindings

![Github Actions Status](https://github.com/signcl/openbayes-jupyterlab-extensions/workflows/Build/badge.svg)

Openbayes Bindings

## Features

数据集绑定

- 模仿 console 的 [JupyterPage.tsx](https://github.com/signcl/openbayes-console/blob/573a48e92e09d7032f36258c095f4912023f2699/src/pages/JupyterPage.tsx) 显示数据集绑定的网页路径和容器内路径
- 点击网页路径跳到到相应的页面
- 点击容器内路径，打开终端，并列出前 N 个文件细节

## Requirements

- JupyterLab >= 1.0

## Install

```bash
jupyter labextension install jupyterlab-openbayes-bindings
```

## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Move to jupyterlab-openbayes-bindings directory
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
jupyter labextension uninstall jupyterlab-openbayes-bindings
```
