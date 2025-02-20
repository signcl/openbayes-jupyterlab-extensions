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

/**
 * Initialization data for the bayeslab-filebrowser extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'bayeslab-filebrowser:plugin',
  description: 'A JupyterLab extension for openbayes jupyterlab filebrowser',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, factory: IFileBrowserFactory) => {
    console.log('JupyterLab extension bayeslab-filebrowser is activated!');

    const updatePathDisplay = () => {
      console.log('🔍 [Debug] 尝试修改面包屑路径...');
      const breadcrumbHome = document.querySelector('.jp-BreadCrumbs-home');
      if (breadcrumbHome) {
        (breadcrumbHome as HTMLElement).innerHTML = '/ openbayes ';
        (breadcrumbHome as HTMLElement).style.cursor = 'pointer';
        console.log('✅ [Success] 文件浏览器路径已修改为 "/ openbayes"');
      } else {
        console.warn('⚠️ [Warning] 无法找到 .jp-BreadCrumbs-home，等待重试...');
        setTimeout(updatePathDisplay, 500);
      }
    };

    setTimeout(updatePathDisplay, 500);

    app.commands.addCommand(CommandIDs.copyPath, {
      label: 'Copy OpenBayes Path',
      caption: 'Copy file path for OpenBayes specific location',
      icon: fileIcon.bindprops({stylesheet: 'menuItem'}),
      execute: () => {
        const currentWidget = factory.tracker.currentWidget;
        if (currentWidget) {
          const iterator = currentWidget.selectedItems();
          const file = iterator.next();
          let filePath: string | undefined;

          if (!file.done) {
            const fileModel = file.value as any; // Use 'any' to bypass type checking
            if (fileModel && fileModel.path) {
              filePath = '/openbayes/' + fileModel.path;
            } else if ((file as any).path) {
              filePath = '/openbayes/' + (file as any).path;
            }
          }

          if (filePath) {
            Clipboard.copyToSystem(filePath);
          } else {
            console.warn('⚠️ [Warning] No valid file path found to copy.');
          }
        } else {
          console.warn('⚠️ [Warning] No current widget available.');
        }
      },
    });

    app.contextMenu.addItem({
      command: CommandIDs.copyPath,
      selector: '.jp-DirListing-item[data-isdir]',
      rank: 14
    });
  }
};

export default plugin;
