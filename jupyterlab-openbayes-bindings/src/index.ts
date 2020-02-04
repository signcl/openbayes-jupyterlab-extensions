import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer,
} from '@jupyterlab/application';

import { BindingsWidget, NAMESPACE } from './bindings';

/**
 * Initialization data for the jupyterlab-openbayes-bindings extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-bindings',
  autoStart: true,
  requires: [
    ILayoutRestorer,
  ],
  activate: (app: JupyterFrontEnd, restorer: ILayoutRestorer) => {
    console.log('JupyterLab extension jupyterlab-openbayes-bindings is activated!');

    const widget = new BindingsWidget();
    widget.id = 'openbayes-bindings-widget';
    widget.title.iconClass = "bindings-icon";
    widget.title.caption = 'OpenBayes Bindings';
    widget.title.closable = true;

    restorer.add(widget, NAMESPACE);
    app.shell.add(widget, 'left', { rank: 101 });

    return;
  }
};

export default extension;
