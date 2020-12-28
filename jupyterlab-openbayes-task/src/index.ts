import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application'

import { showErrorMessage } from '@jupyterlab/apputils'

import { INotebookTracker } from '@jupyterlab/notebook'

import { isCodeCellModel } from '@jupyterlab/cells'

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

import { DocumentManager,IDocumentManager, renameDialog } from '@jupyterlab/docmanager'

// import { PanelLayout } from '@lumino/widgets';

import { LeftPanelWidget,SelectTypeExtension } from './app'

import {run, uploadRequest, uploadCode, getJobDetail} from './api'
import { getEnvs } from "./env";

export const NAMESPACE = 'openbayes-task'
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

function activateExtension(app: JupyterFrontEnd,
  restorer: ILayoutRestorer,
  tracker: INotebookTracker,
  factory: IFileBrowserFactory,
  docManager: IDocumentManager,
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

  let select = new SelectTypeExtension({
    runCodes: async() => {
      let codes:string = '';
      const notebookPanel = tracker.currentWidget;

      if (notebookPanel === null) {
        return
      }

      const nbWidget = notebookPanel.content;
      const Type = notebookPanel.content.model.metadata.get('selectType');

      if(Type === 'Default'){
        // saveCode 不处理 default
        // const cells = nbWidget.model.cells
        // for (let index = 0; index < cells.length; index++) {
        //   const cellModel = cells.get(index)
        //   const isCodeCell = isCodeCellModel(cellModel)
        //   if (!isCodeCell) {
        //     continue
        //   }

        //   codes += cellModel.value.text + '\n\n'
        // }
      } else if(Type === 'Task'){
        // 组合多段代码
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
        console.log(codes)
      }
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
    }
  });
  app.docRegistry.addWidgetExtension('Notebook', select);
  
  app.contextMenu.addItem({
    command: CommandIDs.createOutputFileView,
    selector: '.jp-Notebook .jp-CodeCell',
    rank: 10
  });
  const { commands } = app;

  commands.addCommand(CommandIDs.createOutputFileView, {
    label: 'Create New File View for Output',
    execute: async args => {
      console.log(args)
      let codes:string = '';
      const notebookPanel = tracker.currentWidget;

      if (notebookPanel === null) {
        return
      }
      const nbWidget = notebookPanel.content;
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
      console.log(codes)
      // let cell: CodeCell | undefined;
      // let current: NotebookPanel | undefined | null;
      // If we are given a notebook path and cell index, then
      // use that, otherwise use the current active cell.

      // Create a MainAreaWidget
      // const content = new Private.ClonedOutputArea({
      //   notebook: current,
      //   cell,
      //   index,
      //   translator
      // });
      // const widget = new MainAreaWidget({ content });
      // current.context.addSibling(widget, {
      //   ref: current.id,
      //   mode: 'split-bottom'
      // });

      // const updateCloned = () => {
      //   void clonedOutputs.save(widget);
      // };

      // current.context.pathChanged.connect(updateCloned);
      // current.context.model?.cells.changed.connect(updateCloned);

      // Add the cloned output to the output widget tracker.增加到notebook 的展示界面
      // void clonedOutputs.add(widget);

      // Remove the output view if the parent notebook is closed.移除事件
      // current.content.disposed.connect(() => {
      //   current!.context.pathChanged.disconnect(updateCloned);
      //   current!.context.model?.cells.changed.disconnect(updateCloned);
      //   widget.dispose();
      // });
    },
    // isEnabled: isEnabledAndSingleSelected,需要增加一个确认该功能是否可用的函数
  });

  return
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
