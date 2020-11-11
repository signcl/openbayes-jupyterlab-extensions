import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

import {
  Clipboard
} from '@jupyterlab/apputils';

import {
  fileIcon
} from '@jupyterlab/ui-components';

namespace CommandIDs {
  export const copyPath = 'filebrowser-overwrite:copy-path';
}

/**
 * Initialization data for the jupyterlab-openbayes-filebrowser-overwrite extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-filebrowser-overwrite',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, factory: IFileBrowserFactory) => {
    console.log('JupyterLab extension jupyterlab-openbayes-filebrowser-overwrite is activated!');

    addCommands(app, factory);

    // app.contextMenu.menu.removeItemAt(11)

    const selectorItem = '.jp-DirListing-item[data-isdir]';

    app.contextMenu.addItem({
      command: CommandIDs.copyPath,
      selector: selectorItem,
      rank: 12
    });

  }
};

function addCommands(
  app: JupyterFrontEnd,
  factory: IFileBrowserFactory,
): void {
  const {commands} = app;
  const {tracker} = factory;

  console.log(tracker)

  commands.addCommand(CommandIDs.copyPath, {
    execute: () => {

      const widget = tracker.currentWidget;
      if (!widget) {
        return;
      }

      const item = widget.selectedItems().next();
      if (!item) {
        return;
      }

      Clipboard.copyToSystem("/openbayes/" + item.path);

    },
    isVisible: () =>
        !!tracker.currentWidget &&
        tracker.currentWidget.selectedItems().next !== undefined,
    icon: fileIcon.bindprops({stylesheet: 'menuItem'}),
    label: 'Copy Full Path'
  });
}

export default extension;
