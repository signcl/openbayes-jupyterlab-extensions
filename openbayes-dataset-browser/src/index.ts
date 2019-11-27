
import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IDocumentManager } from '@jupyterlab/docmanager';

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

/**
 * The command IDs used by the dataset browser plugin.
 */
namespace CommandIDs {
  export const showBrowser = 'datasetbrowser:activate';
}

/**
 * The default dataset browser extension.
 */
const browser: JupyterFrontEndPlugin<void> = {
  activate: activateBrowser,
  id: 'datasetbrowser:browser',
  requires: [
    IFileBrowserFactory,
    IDocumentManager,
    ILabShell,
    ILayoutRestorer
  ],
  autoStart: true
};

/**
 * The dataset browser namespace token.
 */
const namespace = 'datasetbrowser';

export default browser;

/**
 * Activate the default dataset browser in the sidebar.
 */
function activateBrowser(
    app: JupyterFrontEnd,
    factory: IFileBrowserFactory,
    docManager: IDocumentManager,
    labShell: ILabShell,
    restorer: ILayoutRestorer,
): void {

  const browser = factory.createFileBrowser(namespace);
  const { commands } = app;

  // Let the application restorer track the primary dataset browser (that is
  // automatically created) for restoration of application state (e.g. setting
  // the dataset browser as the current side bar widget).
  //
  // All other dataset browsers created by using the factory function are
  // responsible for their own restoration behavior, if any.
  restorer.add(browser, namespace);

  browser.title.iconClass = 'jp-openbayes-icon jp-SideBar-tabIcon';
  browser.title.caption = 'Dataset Browser';
  labShell.add(browser, 'left', { rank: 101 });

  browser.toolbar.hide()

  // If the layout is a fresh session without saved data, open dataset browser.
  void labShell.restored.then(layout => {
    if (layout.fresh) {
      void commands.execute(CommandIDs.showBrowser, void 0);
    }
  });
}
