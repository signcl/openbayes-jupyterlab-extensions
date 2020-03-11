import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application'
import { NotebookActions } from '@jupyterlab/notebook'
import { INotebookTracker } from '@jupyterlab/notebook'

import { SnippetsWidget } from './snippets'
import { getSnippets } from './api'

const NAMESPACE = 'openbayes-bindings'

/**
 * Initialization data for the jupyterlab-openbayes-snippets extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-snippets',
  autoStart: true,
  requires: [ILayoutRestorer, INotebookTracker],
  activate: async (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    tracker: INotebookTracker
  ) => {
    console.log(
      'JupyterLab extension jupyterlab-openbayes-snippets is activated!'
    )

    const widget = new SnippetsWidget({
      snippets: await getSnippets(),
      insertSnippets: snippets => {
        snippets.map((code, index) => {
          if (tracker.currentWidget) {
            let nbWidget = tracker.currentWidget.content
            if (tracker.activeCell.model.value.text != '') {
              NotebookActions.insertBelow(nbWidget)
            }
            tracker.activeCell.model.value.text = code.content
            NotebookActions.insertBelow(nbWidget)
            NotebookActions.deleteCells(nbWidget)
            if (nbWidget.model.cells.length != nbWidget.activeCellIndex + 1) {
              NotebookActions.selectAbove(nbWidget)
            }
          }
        })
      }
    })
    widget.id = 'openbayes-snippets-widget'
    widget.title.iconClass = 'snippets-icon'
    widget.title.caption = 'OpenBayes Snippets'
    widget.title.closable = true
    widget.addClass('snippets-widget')

    restorer.add(widget, NAMESPACE)
    app.shell.add(widget, 'left', { rank: 102 })
  }
}

export default extension
