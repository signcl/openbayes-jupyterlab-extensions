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
