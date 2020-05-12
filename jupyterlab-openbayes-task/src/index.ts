import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application'
import { LeftPanelWidget } from './app'

export const NAMESPACE = 'openbayes-task'

/**
 * Initialization data for the jupyterlab-openbayes-task extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-task',
  autoStart: true,
  requires: [ILayoutRestorer],
  activate: (app: JupyterFrontEnd, restorer: ILayoutRestorer) => {
    console.log('JupyterLab extension jupyterlab-openbayes-task is activated!')

    const widget = new LeftPanelWidget()

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
