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
import { run, uploadCode, uploadRequest } from './api'

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
        // console.log(pythonPath.path)

        // await fs.writeFile('./untitled.py', codes)

        await runCode(codes)
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

async function runCode(path: string) {
  const token =
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhaXNlbnNpeSIsInBhdGgiOiIvIiwiZXhwIjoxNTkyMjA0NzA0fQ.kLZCixdA9p8TSjDdNENA4a-1INmlD3bZxsKZMRE1rMVXCx68kiiu7HHB2ouJTzmGRqG99cPwLfwIZl6E3uHPOA'

  const request = await uploadRequest('aisensiy', token)

  const cid = await uploadCode(
    request.upload_url,
    request.token,
    path,
    'main.py'
  )
  return await run('aisensiy', token, cid, 'python main.py', {})
}
