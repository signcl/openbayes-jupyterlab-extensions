import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application'

import { showErrorMessage } from '@jupyterlab/apputils'

import { INotebookTracker } from '@jupyterlab/notebook'

import { isCodeCellModel } from '@jupyterlab/cells'

import { DocumentManager, renameDialog } from '@jupyterlab/docmanager'

import { LeftPanelWidget } from './app'
import { runTask} from "./cmd";


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
  ],
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    tracker: INotebookTracker
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
          console.log("name: " + model.name + " path: " + model.path)
          // Error: Canceled future for execute_request message before replies were done
          await runTask(model.path)
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

    return
  }
}

export default extension

namespace Private {
  /**
   * A counter for unique IDs.
   */
  export
  let id = 0;
}
