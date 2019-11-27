import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';


/**
 * Initialization data for the openbayes-dataset-browser extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'openbayes-dataset-browser',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension openbayes-dataset-browser is activated!');
  }
};

export default extension;
