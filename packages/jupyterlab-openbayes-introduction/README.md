# jupyterlab-openbayes-introduction

OpenBayes Introduction

## Features

自动打开 openbayes-intro.ipynb 文件

- 第一次启动，打开 openbayes-intro.ipynb 文件，关闭后不会再次自动打开
- 在 menu 增加入口，可以再次打开 openbayes-intro.ipynb 文件
- 顺便在 menu 加入 文档中心 的入口

## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterlab-openbayes-introduction
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
