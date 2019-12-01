import {
  ILayoutRestorer, IRouter, JupyterFrontEnd, JupyterFrontEndPlugin,
} from "@jupyterlab/application";

import {
  IDocumentManager,
} from "@jupyterlab/docmanager";

import {
  IWindowResolver,
} from "@jupyterlab/apputils";

import {
  constructDatasetBrowserWidget,
} from "./browser";

import "../style/index.css";

function activate(app: JupyterFrontEnd,
                  paths: JupyterFrontEnd.IPaths,
                  resolver: IWindowResolver,
                  restorer: ILayoutRestorer,
                  manager: IDocumentManager,
                  router: IRouter) {
  constructDatasetBrowserWidget(app, "", "dataset-browser", "left", paths, resolver, restorer, manager, router);
}

const extension: JupyterFrontEndPlugin<void> = {
  activate,
  autoStart: true,
  id: "jupyterlab-openbayes-dataset-browser",
  requires: [JupyterFrontEnd.IPaths, IWindowResolver, ILayoutRestorer, IDocumentManager, IRouter],
};

export default extension;
