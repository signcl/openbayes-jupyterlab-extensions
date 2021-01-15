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

const parse_query_string = (query: string) => {
  var vars = query.split("&");
  var query_string: any = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1]);
    // If first entry with this name
    if (typeof query_string[key] === "undefined") {
      query_string[key] = decodeURIComponent(value);
      // If second entry with this name
    } else if (typeof query_string[key] === "string") {
      var arr = [query_string[key], decodeURIComponent(value)];
      query_string[key] = arr;
      // If third or later entry with this name
    } else {
      query_string[key].push(decodeURIComponent(value));
    }
  }
  return query_string;
}

const extension: JupyterFrontEndPlugin<void> = {
  id: namespace + ':plugin',
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    const style = namespace + '/index.css';

    let isLight = true;
    if (window.self !== window.top) { // inside iframe
      let queryStr = window.location.search.substring(1);
      let queryObj = parse_query_string(queryStr);
      let theme = queryObj['theme'] || 'auto'
      document.querySelector('html').setAttribute('data-color-mode', theme);
      if (theme === 'dark') {
        isLight = false
      } else if (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isLight = false;
      }
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isLight = false;
      }
    }

    manager.register({
      name: 'OpenBayes Theme',
      isLight: isLight,
      themeScrollbars: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  },
  autoStart: true,
};

export default extension;
