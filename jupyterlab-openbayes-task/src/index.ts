import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application'

import { showErrorMessage } from '@jupyterlab/apputils'

import { INotebookTracker } from '@jupyterlab/notebook'

import { isCodeCellModel } from '@jupyterlab/cells'

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

import { DocumentManager, renameDialog } from '@jupyterlab/docmanager'

import { LeftPanelWidget,SelectTypeExtension } from './app'

import {run, uploadRequest, uploadCode, getJobDetail} from './api'
import { getEnvs } from "./env";

export const NAMESPACE = 'openbayes-task'

/**
 * Initialization data for the jupyterlab-openbayes-task extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-task',
  autoStart: true,
  requires: [
      ILayoutRestorer,
      INotebookTracker,
      IFileBrowserFactory
  ],
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    tracker: INotebookTracker,
    factory: IFileBrowserFactory
  ) => {
    console.log('JupyterLab extension jupyterlab-openbayes-task is activated!')

    const widget = new LeftPanelWidget({
      runCodes: async () => {
        let codes: string = ''

        if (tracker.currentWidget) {
          let nbWidget = tracker.currentWidget.content

          const cells = nbWidget.model.cells
          for (let index = 0; index < cells.length; index++) {
            const cellModel = cells.get(index)
            const isCodeCell = isCodeCellModel(cellModel)
            if (!isCodeCell) {
              continue
            }

            codes += cellModel.value.text + '\n\n'
          }
        }

        // console.log(codes)

        const { commands } = app;

        let model = await commands.execute('docmanager:new-untitled', {
          path: "/",
          type: 'file',
          ext: 'py'
        })

        model.content = codes;
        model.format = 'text'
        await app.serviceManager.contents.save(model.path, model);

        const opener: DocumentManager.IWidgetOpener = {
          open: widget => {
            if (!widget.id) {
              widget.id = `document-manager-${++Private.id}`;
            }
            widget.title.dataset = {
              'type': 'document-title',
              ...widget.title.dataset
            };
            if (!widget.isAttached) {
              app.shell.add(widget, "main");
            }
            app.shell.activateById(widget.id);
          }
        };
        const registry = app.docRegistry;
        const docManager = new DocumentManager({ registry: registry, manager: app.serviceManager, opener: opener });

        model = await renameDialog(docManager, model.path).catch(error => {
          if (error !== 'File not renamed') {
            void showErrorMessage('Rename Error', error);
          }
        })

        if (model !== undefined) {
          console.log("path: " + model.path + ", name: " + model.name)
          const path = await getCodeURL(factory,model.path)
          await runCode(path)
        }

      }
    })

    widget.id = 'openbayes-task-widget'
    widget.title.iconClass = 'task-icon'
    widget.title.caption = 'OpenBayes Task'
    widget.title.closable = true
    widget.addClass('task-widget')

    restorer.add(widget, NAMESPACE)
    app.shell.add(widget, 'left', { rank: 101 })

    let select = new SelectTypeExtension();
    app.docRegistry.addWidgetExtension('Notebook', select);
    return
  }
}

async function runCode(path: string) {

  const env = await getEnvs()

  const url = env.url.replace("/"+env.jobID, "")

  const request = await uploadRequest(env.user, env.token, url)

  const cid = await uploadCode(
      request.upload_url,
      request.token,
      path,
      'main.py'
  )

  const job = await getJobDetail(env.url, env.token)

  return await run(env.user, env.token, url, cid, 'python main.py', job)
}

function getCodeURL (factory:IFileBrowserFactory,path:string){
  const { tracker } = factory;
  const widget = tracker.currentWidget
  return widget.model.manager.services.contents
    .getDownloadUrl(path)
    
}
export default extension

namespace Private {
  /**
   * A counter for unique IDs.
   */
  export
  let id = 0;
}
