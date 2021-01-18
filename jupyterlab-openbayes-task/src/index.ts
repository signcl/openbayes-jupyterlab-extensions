import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application'

import { showErrorMessage,MainAreaWidget,WidgetTracker, } from '@jupyterlab/apputils'

import { INotebookTracker,NotebookPanel,INotebookModel } from '@jupyterlab/notebook'
import { DocumentRegistry } from '@jupyterlab/docregistry'

import { isCodeCellModel } from '@jupyterlab/cells'

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { DisposableDelegate,IDisposable } from "@lumino/disposable";
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { DocumentManager,IDocumentManager, renameDialog } from '@jupyterlab/docmanager'

import { Widget } from '@lumino/widgets';

import { LeftPanelWidget } from './app'
import { initToolbar,MarkerManager,ClonedOutputArea } from './overlay/index';

import {run, uploadRequest, uploadCode, getJobDetail} from './api'
import { getEnvs } from "./env";

export const NAMESPACE = 'openbayes-task';

namespace CommandIDs {
  export const createOutputFileView = 'notebook:create-output-file-view';
}
/**
 * Initialization data for the jupyterlab-openbayes-task extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-task',
  autoStart: true,
  requires: [
      ILayoutRestorer,
      INotebookTracker,
      IFileBrowserFactory
  ],
  activate: activateExtension
}

export class OpenBayesTaskExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
    constructor(
      app: JupyterFrontEnd,
      documentManager: IDocumentManager,
      settingRegistry: ISettingRegistry,
      notebooks: INotebookTracker){
    }
    createNew(
      notebook: NotebookPanel,
      notebookContext: DocumentRegistry.IContext<INotebookModel>
    ): IDisposable {
      notebookContext.ready.then(() => {
        this._toolbarWidgets = initToolbar(notebook);
        new MarkerManager(notebook);
      })

      return new DisposableDelegate(() => {
        this._toolbarWidgets.forEach(button => button.dispose());
      });
    }
    private _toolbarWidgets: Widget[];
}

function activateExtension(
  app: JupyterFrontEnd,
  restorer: ILayoutRestorer,
  tracker: INotebookTracker,
  factory: IFileBrowserFactory,
  docManager: IDocumentManager,
  settingRegistry: ISettingRegistry,
  ){
  console.log('JupyterLab extension jupyterlab-openbayes-task is activated!')

  const widget = new LeftPanelWidget({
    runCodes: async () => {
      let codes: string = ''

      if (tracker.currentWidget) {
        let nbWidget = tracker.currentWidget.content

        const cells = nbWidget.model.cells
        for (let index = 0; index < cells.length; index++) {
          const cellModel = cells.get(index)
          const isCodeCell = isCodeCellModel(cellModel)
          if (!isCodeCell) {
            continue
          }

          codes += cellModel.value.text + '\n\n'
        }
      }

      // console.log(codes)

      const { commands } = app;

      let model = await commands.execute('docmanager:new-untitled', {
        path: "/",
        type: 'file',
        ext: 'py'
      })

      model.content = codes;
      model.format = 'text'
      await app.serviceManager.contents.save(model.path, model);

      const opener: DocumentManager.IWidgetOpener = {
        open: widget => {
          if (!widget.id) {
            widget.id = `document-manager-${++Private.id}`;
          }
          widget.title.dataset = {
            'type': 'document-title',
            ...widget.title.dataset
          };
          if (!widget.isAttached) {
            app.shell.add(widget, "main");
          }
          app.shell.activateById(widget.id);
        }
      };
      const registry = app.docRegistry;
      const docManager = new DocumentManager({ registry: registry, manager: app.serviceManager, opener: opener });

      model = await renameDialog(docManager, model.path).catch(error => {
        if (error !== 'File not renamed') {
          void showErrorMessage('Rename Error', error);
        }
      })

      if (model !== undefined) {
        console.log("path: " + model.path + ", name: " + model.name)
        const path = await getCodeURL(factory,model.path)
        await runCode(path)
      }

    }
  })

  restorer.add(widget, NAMESPACE)
  app.shell.add(widget, 'left', { rank: 101 })
  
  let taskSelectExtension = new OpenBayesTaskExtension(
    app,
    docManager,
    settingRegistry,
    tracker
  );
  app.docRegistry.addWidgetExtension("Notebook", taskSelectExtension);

  // 这里是 output view 的第一步
  const selectedOutputs = new WidgetTracker<
    MainAreaWidget<ClonedOutputArea>
  >({
    namespace: 'selected-outputs'
  });

  addCommands(
    app,
    docManager,
    tracker,
    selectedOutputs,
  )

  app.contextMenu.addItem({
    command: CommandIDs.createOutputFileView,
    selector: '.jp-Notebook .jp-CodeCell',
    rank: 10
  });
  
  return
}

function addCommands(
  app: JupyterFrontEnd,
  docManager: IDocumentManager,
  pageTracker:INotebookTracker,
  selectedOutputs: WidgetTracker<MainAreaWidget>,
): void {
  // jupyter 已经定义了 名为 notebook 的 tracker，直接复用
  const { commands,shell } = app;
  console.log('插件的 tracker',pageTracker);
  function getCurrent(args: ReadonlyPartialJSONObject): NotebookPanel | null {
    const widget = pageTracker.currentWidget;
    const activate = args['activate'] !== false;

    if (activate && widget) {
      shell.activateById(widget.id);
    }

    return widget;
  }
  // todo：task 模式下有输出预览，default 需要移除；
  commands.addCommand(CommandIDs.createOutputFileView, {
    label: 'Create New File View for Select',
    execute: async args => {
      console.log(args)
      let codes:string = '';
      let current: NotebookPanel | undefined | null;
      current = getCurrent({ ...args, activate: false });

      if (current === null) {
        console.log('没有 current')
        return
      }

      const nbWidget = current.content;
      const recordList = JSON.parse(nbWidget.model.metadata.get('cellRecords').toString())
      const cells = nbWidget.widgets;

      if(Object.keys(recordList).length === 0){
        console.log('Code snippet not selected')
        return;
      }
      for(let key in recordList){
        cells.forEach(c=>{
          const isCodeCell = isCodeCellModel(c.model)
          if (isCodeCell && c.model.id === key) {
            codes += `#################### cell ${key} begin #################### \n\n`
            codes += c.model.value.text + '\n\n'
            codes += `#################### cell ${key} end #################### \n\n`
          }
        })
      }
      // 获取到了 codes 片段，需要输出到底部的 panel
      console.log(codes);
      // Create a MainAreaWidget 添加一个部件用来展示 output 的内容
      const content = new ClonedOutputArea({
        notebook: current,
        cellContent:codes,
      });
      const widget = new MainAreaWidget({ content });
      current.context.addSibling(widget);

      // 处理变化
      const updateCloned = () => {
        void selectedOutputs.save(widget);
      };

      current.context.pathChanged.connect(updateCloned);
      current.context.model.cells.changed.connect(updateCloned);

      // // Add the cloned output to the output widget tracker.
      void selectedOutputs.add(widget);

      // // Remove the output view if the parent notebook is closed.
      // current.content.disposed.connect(() => {
      //   current!.context.pathChanged.disconnect(updateCloned);
      //   current!.context.model?.cells.changed.disconnect(updateCloned);
      //   widget.dispose();
      // });
    }
    // isEnabled: isEnabledAndSingleSelected,需要增加一个确认该功能是否可用的函数
  });
}
async function runCode(path: string) {

  const env = await getEnvs()

  const url = env.url.replace("/"+env.jobID, "")

  const request = await uploadRequest(env.user, env.token, url)

  const cid = await uploadCode(
      request.upload_url,
      request.token,
      path,
      'main.py'
  )

  const job = await getJobDetail(env.url, env.token)

  return await run(env.user, env.token, url, cid, 'python main.py', job)
}

function getCodeURL (factory:IFileBrowserFactory,path:string){
  const { tracker } = factory;
  const widget = tracker.currentWidget
  return widget.model.manager.services.contents
    .getDownloadUrl(path)
    
}

export default extension

namespace Private {
  /**
   * A counter for unique IDs.
   */
  export
  let id = 0;
}
