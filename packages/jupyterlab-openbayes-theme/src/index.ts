// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/**
 * @packageDocumentation
 * @module jupyterlab-openbayes-theme
 */

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IThemeManager } from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';

// Begin openbayes-jupyterlab-extensions
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
// End openbayes-jupyterlab-extensions

/**
 * A plugin for the Jupyter Light Theme.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-theme:plugin',
  requires: [IThemeManager, ITranslator],
  activate: (
    app: JupyterFrontEnd,
    manager: IThemeManager,
    translator: ITranslator
  ) => {
    const trans = translator.load('jupyterlab');
    const style = 'jupyterlab-openbayes-theme/index.css';

    // Begin openbayes-jupyterlab-extensions
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
    // End openbayes-jupyterlab-extensions

    manager.register({
      name: 'OpenBayes Theme Next',
      displayName: trans.__('OpenBayes Theme Next'),
      isLight: isLight,
      themeScrollbars: false,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  },
  autoStart: true
};

export default plugin;
