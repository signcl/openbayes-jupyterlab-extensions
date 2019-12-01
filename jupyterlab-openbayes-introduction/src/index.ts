import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
  IFileBrowserFactory,
} from '@jupyterlab/filebrowser';

/**
 * Initialization data for the jupyterlab-openbayes-introduction extension.
 */

const intro_path = 'intro/openbayes-intro.ipynb';

namespace CommandIDs {
  export const openIntro = 'openbayes:open-intro'
  export const openPath = 'filebrowser:open-path';
}

const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-introduction',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterFrontEnd,) => {

    const {commands} = app;

    commands.addCommand(CommandIDs.openIntro, {
      label: 'About OpenBayes',
      caption: 'OpenBayes Introduction',
      execute: () => {
        void commands.execute(CommandIDs.openPath, { path: intro_path });
      }
    });

    void commands.execute(CommandIDs.openIntro);

  }
};

export default extension;
