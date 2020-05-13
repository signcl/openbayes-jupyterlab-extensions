import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application'

import { INotebookTracker } from '@jupyterlab/notebook'

import { isCodeCellModel } from '@jupyterlab/cells'

// import { ContentsManager } from '@jupyterlab/services'
// import * as fs from 'fs-extra'

import { LeftPanelWidget } from './app'

export const NAMESPACE = 'openbayes-task'

/**
 * Initialization data for the jupyterlab-openbayes-task extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-task',
  autoStart: true,
  requires: [ILayoutRestorer, INotebookTracker],
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

        console.log(codes)

        // let contents = new ContentsManager()
        // let pythonPath = await contents.newUntitled({
        //   path: '/',
        //   type: 'file',
        //   ext: 'py'
        // })
        //
        // console.log(pythonPath)
        //
        // await fs.writeFile(pythonPath.path, codes)
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
