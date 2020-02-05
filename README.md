# jupyterlab openbayes extensions

## 插件安装

- [dataset-browser](https://github.com/signcl/openbayes-jupyterlab-extensions/tree/master/jupyterlab-openbayes-dataset-browser)

	`$ jupyter labextension install jupyterlab-openbayes-dataset-browser`
	
- [introduction](https://github.com/signcl/openbayes-jupyterlab-extensions/tree/master/jupyterlab-openbayes-introduction)

	`$ jupyter labextension install jupyterlab-openbayes-introduction`

- [openbayes-theme](https://github.com/signcl/openbayes-jupyterlab-extensions/tree/master/jupyterlab-openbayes-theme])

 	 `$ jupyter labextension install jupyterlab-openbayes-theme`


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
	
- 安装 jupyterlab 扩展 (较 link .更为常用)

	```
	(在相应的插件子目录中执行)
	jupyter labextension install .
	```
	
- 链接 jupyterlab 扩展 (较少用)
	
	```
	(在相应的插件子目录中执行)
	jupyter labextension link .
	```
	
### 其他
- 执行`conda init`命令，将会在终端中自动加载 conda 相关的东西 (如当前的虚拟环境)
- `jupyter lab` 命令执行的目录将会成容器的工作空间 <br/>
- jupyterlab 的配置文件在 `/Users/[YOUR_NAME]/miniconda3/envs/jupyterlab-ext/etc/jupyter/jupyter_notebook_config.py` 