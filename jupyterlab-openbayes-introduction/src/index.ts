import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  IFileBrowserFactory,
} from '@jupyterlab/filebrowser';

import {
  IMainMenu
} from '@jupyterlab/mainmenu'

import {
  IFrame,
  ICommandPalette
} from '@jupyterlab/apputils'

import {
  Menu
} from '@phosphor/widgets'

import {
  IStateDB
} from '@jupyterlab/coreutils';

import '../style/index.css';

const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-introduction',
  autoStart: true,
  requires: [IMainMenu, IStateDB],
  optional: [IFileBrowserFactory, ICommandPalette],
  activate: activate_openbayes_menu
};

export default extension;

namespace Targets {
  export const OpenFile = 'open_file';
  export const OpenWindow = 'open_window';
  export const ShowInIFrame = 'iframe';
}

namespace CommandIDs {
  export const OpenPath = 'filebrowser:open-path';
  export const OpenIntro = 'openbayes:open-intro:show';
  export const OpenDoc = 'openbayes:open-doc:show';
}

export const OpenBayesTabs = [
  {
    id: CommandIDs.OpenIntro,
    name: '操作简介',
    path: 'intro/openbayes-intro.ipynb',
    target: Targets.OpenFile,
  },
  {
    id: CommandIDs.OpenDoc,
    name: '文档中心',
    url: 'https://openbayes.com/docs/',
    target: Targets.OpenWindow
  }
];

export function activate_openbayes_menu(app: JupyterFrontEnd, mainMenu: IMainMenu, state: IStateDB): Promise<void>{

  const {commands} = app;

  function appendNewCommand(item: any) {
    let iframe: IFrame = null;
    let command = `${item.id}`;
    commands.addCommand(command, {
      label: item.name,
      execute: () => {
        if (item.target == Targets.OpenFile) {

          void app.commands.execute(CommandIDs.OpenPath, { path: item.path });

        } else if (item.target == Targets.OpenWindow) {

          let win = window.open(item.url, '_blank');
          win.focus();

        } else if (item.target == Targets.ShowInIFrame) {
          if (!iframe) {
            iframe = new IFrame();
            iframe.url = item.url;
            iframe.id = item.name;
            iframe.title.label = item.name;
            iframe.title.closable = true;
            iframe.node.style.overflowY = 'auto';
          }

          if (iframe == null || !iframe.isAttached) {
            app.shell.add(iframe, 'main');
            app.shell.activateById(iframe.id);
          } else {
            app.shell.activateById(iframe.id);
          }
        }

      }
    });
  }

  OpenBayesTabs.forEach(item => appendNewCommand(item));

  let menu:Menu = new Menu({commands});
  menu.title.label = 'OpenBayes';
  for (const tabItem of OpenBayesTabs) {
    menu.addItem({command: `${tabItem.id}`});
    menu.addItem({ type: 'separator' });
  }
  mainMenu.addMenu(menu, {rank: 2000});

  const stateID = 'openbayes-open-introduction-state';
  state.fetch(stateID).then((res) => {
    if (res != stateID) {
      void app.commands.execute(CommandIDs.OpenIntro);
      state.save(stateID, stateID).then();
    }
  });

  return Promise.resolve(void 0);
}

