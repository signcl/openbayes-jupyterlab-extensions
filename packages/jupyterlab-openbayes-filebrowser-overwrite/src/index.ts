import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { Clipboard } from '@jupyterlab/apputils';
import { fileIcon } from '@jupyterlab/ui-components';

namespace CommandIDs {
  export const copyPath = 'filebrowser-overwrite:copy-path';
}

const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-filebrowser-overwrite',
  autoStart: true,
  requires: [IFileBrowserFactory],
  optional: [],
  activate: (app: JupyterFrontEnd, factory: IFileBrowserFactory) => {
    console.log('JupyterLab extension jupyterlab-openbayes-filebrowser-overwrite is activated!');

    app.commands.addCommand(CommandIDs.copyPath, {
      label: 'Copy OpenBayes Path',
      caption: 'Copy file path for OpenBayes specific location',
      icon: fileIcon.bindprops({stylesheet: 'menuItem'}),
      execute: () => {
        const file = factory.tracker.currentWidget.selectedItems().next();

        Clipboard.copyToSystem('/openbayes/' + file.path);
      },
    });

    app.contextMenu.addItem({
      command: CommandIDs.copyPath,
      selector: '.jp-DirListing-item[data-isdir]',
      rank: 14
    });
  }
};

export default extension;
