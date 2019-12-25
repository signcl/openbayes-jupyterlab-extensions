import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  IThemeManager
} from '@jupyterlab/apputils';

/**
 * Initialization data for the jupyterlab-openbayes-theme extension.
 */

const namespace = 'jupyterlab-openbayes-theme'

const extension: JupyterFrontEndPlugin<void> = {
  id: namespace + ':plugin',
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    const style = namespace + '/index.css';
    manager.register({
      name: 'OpenBayes Theme',
      isLight: true,
      themeScrollbars: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  },
  autoStart: true,
};

export default extension;
