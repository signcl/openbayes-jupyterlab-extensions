# jupyterlab openbayes extensions

[Extension Developer Guide](https://jupyterlab.readthedocs.io/en/stable/developer/extension_dev.html)

## 开发计划

#### [x] 数据集绑定 
- 列出绑定的数据集或输出的所有文件夹及文件
- 参考 [filebrowser](https://github.com/jupyterlab/jupyterlab/tree/master/packages/filebrowser-extension)
- 参考 [filetree](https://github.com/youngthejames/jupyterlab_filetree)

存在问题：

-  某个文件夹下文件数太多，第一次打开会造成 juypterlab 卡死

#### [x] 自动打开 openbayes-intro.ipynb 文件
- 第一次启动，打开 openbayes-intro.ipynb 文件，关闭后不会再次自动打开
-  在 menu 增加入口，可以再次打开 openbayes-intro.ipynb 文件
-  顺便在 menu 加入 文档中心 的入口

#### [x] OpenBayes 专属主题
- juypterlab 的主题根据系统主题自动切换
- 参考主题 [dark](https://github.com/jupyterlab/jupyterlab/tree/master/packages/theme-dark-extension)
- 参考主题 [light](https://github.com/jupyterlab/jupyterlab/tree/master/packages/theme-light-extension)

#### [ ] 数据集绑定
- 模仿 console 的 [JupyterPage.tsx](https://github.com/signcl/openbayes-console/blob/573a48e92e09d7032f36258c095f4912023f2699/src/pages/JupyterPage.tsx) 显示数据集绑定的网页路径和容器内路径
- 点击网页路径跳到到相应的页面
- 点击容器内路径，打开终端，并列出前 N 个文件细节
- 终端打开频率为 3s 只能打开一次，或者是打开之前同名的终端 (打开同名终端需要等 jupyterlab 发布 2.0.0rc0)
- 将 url 和 token 信息保存在一个能供 jupyterlab 插件读取的地方

#### [ ] 将 notebook 代码保存成 python 文件，并开启新的 task 执行
- 选中 notebook 需要的代码块，并保存到 python 文件中
- 启动一个新的 task 执行 python 文件
- 参考 [kubeflow-kale](https://github.com/kubeflow-kale/jupyterlab-kubeflow-kale)

#### [ ] nbgrader 用 jupyter 创建作业并做自动评判 
- 参考 [链接](https://nbgrader.readthedocs.io/en/stable/)
	
	
#### [ ] snippets 补充大量代码片段
- 参考 [链接](https://jupyter-contrib-nbextensions.readthedocs.io/en/latest/nbextensions/snippets_menu/readme.html)
	
	
#### [ ] altair 强大的交互式展示支持
- 参考 [链接](https://towardsdatascience.com/jupyter-superpower-interactive-visualization-combo-with-python-ffc0adb37b7b)

## 插件安装

- [dataset-browser](https://github.com/signcl/openbayes-jupyterlab-extensions/tree/master/jupyterlab-openbayes-dataset-browser)

	`$ jupyter labextension install jupyterlab-openbayes-dataset-browser`
	
- [introduction](https://github.com/signcl/openbayes-jupyterlab-extensions/tree/master/jupyterlab-openbayes-introduction)

	`$ jupyter labextension install jupyterlab-openbayes-introduction`

- [openbayes-theme](https://github.com/signcl/openbayes-jupyterlab-extensions/tree/master/jupyterlab-openbayes-theme)

 	 `$ jupyter labextension install jupyterlab-openbayes-theme`

- [bindings](https://github.com/signcl/openbayes-jupyterlab-extensions/tree/master/jupyterlab-openbayes-bindings)

 	 `$ jupyter labextension install jupyterlab-openbayes-bindings`

## 插件发布
 
  插件需发布到 [npm](https://www.npmjs.com)

- 登录

    ```
    $ npm set registry http://registry.npmjs.org
    $ npm login
    Username: openbayes
    Password: 
    Email: (this IS public) dev@openbayes.com
    Logged in as openbayes on http://registry.npmjs.org/.
    ```
    
- 发布

    ```
    (在相应的插件子目录中执行)
    $ npm publish
    ```

## 插件开发

### 环境搭建

- 下载 [Miniconda](https://docs.conda.io/en/latest/miniconda.html)，根据文档安装
	
- 创建虚拟环境并下载 jupyterlab nodejs 等库

	```
	conda create -n jupyterlab-ext --override-channels --strict-channel-priority -c conda-forge -c anaconda jupyterlab nodejs
	```
	
- 激活虚拟环境

	```
	conda activate jupyterlab-ext
	```

### 常用命令

⚠️ 记得先激活虚拟环境 `conda activate jupyterlab-ext` 再执行命令 ⚠️
	
- 启动 jupyterlab 实例 (执行命令所在的文件夹为容器工作空间)

	```
	jupyter lab
	```
	
- 重装 jupyterlab

	```
	rm -rf /Users/[YOUR_NAME]/miniconda3/envs/jupyterlab-ext/share/jupyter/lab 
	jupyter lab build
	```
	
- 安装 jupyterlab 扩展

	```
	(在相应的插件子目录中执行)
	jupyter labextension install .
	```

- 链接 jupyterlab 扩展
	
	```
	(在相应的插件子目录中执行)
	jupyter labextension link .
	```
 
### 其他
- 执行`conda init`命令，将会在终端中自动加载 conda 相关的东西 (如当前的虚拟环境)
- `jupyter lab` 命令执行的目录将会成容器的工作空间 <br/>
- jupyterlab 的配置文件在 `/Users/[YOUR_NAME]/miniconda3/envs/jupyterlab-ext/etc/jupyter/jupyter_notebook_config.py` 
