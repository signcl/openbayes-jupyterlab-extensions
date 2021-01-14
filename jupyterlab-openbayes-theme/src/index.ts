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

const listener = (event: any) => {
  if (!event.data) return;
  if (event.data.startsWith('theme-color')) {
    let theme = event.data.split(':')[1];
    document.querySelector('html').setAttribute('data-color-mode', theme);
  }
};

const extension: JupyterFrontEndPlugin<void> = {
  id: namespace + ':plugin',
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    const style = namespace + '/index.css';

    let isLight = true;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isLight = false;
    }

    manager.register({
      name: 'OpenBayes Theme',
      isLight: isLight,
      themeScrollbars: true,
      load: () => {
        manager.loadCSS(style)
        if (window.self !== window.top) { // inside iframe
          window.addEventListener('message', listener, false);
          window.parent.postMessage('theme-color', '*')
        }
        return Promise.resolve()
      },
      unload: () => {
        if (window.self !== window.top) { // inside iframe
          window.removeEventListener('message', listener, false);
        }
        return Promise.resolve(undefined)
      }
    });
  },
  autoStart: true,
};

export default extension;
