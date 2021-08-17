# JupyterLab OpenBayes Extensions

| Packages    | NPM |
| ----------- | ----------- |
| jupyterlab-openbayes-bindings | [![npm version](https://img.shields.io/npm/v/jupyterlab-openbayes-bindings.svg?style=flat)](https://www.npmjs.com/package/jupyterlab-openbayes-bindings) |
| jupyterlab-openbayes-dataset-browser | [![npm version](https://img.shields.io/npm/v/jupyterlab-openbayes-dataset-browser.svg?style=flat)](https://www.npmjs.com/package/jupyterlab-openbayes-dataset-browser) |
| jupyterlab-openbayes-filebrowser-overwrite |[![npm version](https://img.shields.io/npm/v/jupyterlab-openbayes-filebrowser-overwrite.svg?style=flat)](https://www.npmjs.com/package/jupyterlab-openbayes-filebrowser-overwrite) |
| jupyterlab-openbayes-introduction | [![npm version](https://img.shields.io/npm/v/jupyterlab-openbayes-introduction.svg?style=flat)](https://www.npmjs.com/package/jupyterlab-openbayes-introduction) |
| jupyterlab-openbayes-snippets | [![npm version](https://img.shields.io/npm/v/jupyterlab-openbayes-snippets.svg?style=flat)](https://www.npmjs.com/package/jupyterlab-openbayes-snippets) |
| jupyterlab-openbayes-task | [![npm version](https://img.shields.io/npm/v/jupyterlab-openbayes-task.svg?style=flat)](https://www.npmjs.com/package/jupyterlab-openbayes-task) |
| jupyterlab-openbayes-theme | [![npm version](https://img.shields.io/npm/v/jupyterlab-openbayes-theme.svg?style=flat)](https://www.npmjs.com/package/jupyterlab-openbayes-theme) |

[Extension Developer Guide](https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html)

## Plans

#### [ ] nbgrader 用 jupyter 创建作业并做自动评判
- 参考 [链接](https://nbgrader.readthedocs.io/en/stable/)

#### [ ] altair 强大的交互式展示支持
- 参考 [链接](https://towardsdatascience.com/jupyter-superpower-interactive-visualization-combo-with-python-ffc0adb37b7b)

## Install

General commands:

```bash
jupyter labextension install jupyterlab-openbayes-theme
```

See [`packages/`](packages) for details.

## Development

Requriements:

- JupyterLab
- Node.js with Yarn

```bash
# Setup dependencies at project root (not package root).
yarn install

# Start JupyterLab with --watch flag:
jupyter lab --collaborative --watch

# In another Terminal session, build your TS, ie:
# yarn <package> watch
yarn theme watch
```

JupyterLab config location:

- Miniconda3:
  ```
  /Users/[YOUR_NAME]/miniconda3/envs/jupyterlab-ext/etc/jupyter/jupyter_notebook_config.py
  ```
- pip:
  ```
  $HOME/.jupyter
  ```

## Publish

Node.js and npm are required to publish packages.

This repo is managed by Lerna monorepo:

```bash
yarn release
```
