import React, { useState,useEffect,Fragment } from 'react';
import * as ReactDOM from 'react-dom';
import { HTMLSelect } from '@jupyterlab/ui-components';
import { Widget } from '@lumino/widgets';
import { JupyterFrontEnd} from '@jupyterlab/application'
import { NotebookPanel,INotebookTracker } from '@jupyterlab/notebook';
import { isCodeCellModel } from '@jupyterlab/cells';
import { DocumentManager, renameDialog } from '@jupyterlab/docmanager';
import { showErrorMessage } from '@jupyterlab/apputils';

const TOOLBAR_SELECTTYPE_DROPDOWN_CLASS = 'jp-Notebook-toolbarCellTypeDropdown select';
const TOOLBAR_SAVE_BUTTON_WRAPPER_CLASS = 'jp-ToolbarButton jp-Toolbar-item';
const TOOLBAR_SAVE_BUTTON_CLASS = 'bp3-button bp3-minimal jp-ToolbarButtonComponent minimal jp-Button save-button ';

export interface SelectTypeProps {
  notebook:NotebookPanel;
  saveCodes?:() => void;
}

export class SelectTypeWidget extends Widget{
  constructor(props:SelectTypeProps) {
    super()
    ReactDOM.render(<SelectTypeComponent {...props} />, this.node)
  }
}

const SelectTypeComponent = ({notebook,saveCodes}:SelectTypeProps)=>{
  const [value,setValue] = useState('Default');
  const content = notebook.content;
  useEffect(()=>{
    // 设定初始的状态值
    content.model.metadata.set('selectType','Default');
  },[])
  
  const handleChange = (event:React.ChangeEvent<HTMLSelectElement>)=>{
    let selectValue = event.target.value
    setValue(selectValue)
    if(selectValue === 'Task'){
      // 设置初始值
      content.model.metadata.set('cellRecords','{}');
      content.model.metadata.set('selectType','Task');
    } else {
      content.model.metadata.set('selectType','Default');
      content.model.metadata.set('cellRecords','{}');
    }
  }

  return (
    <Fragment>
      <HTMLSelect
        className={TOOLBAR_SELECTTYPE_DROPDOWN_CLASS}
        onChange={handleChange}
        value={value}
        aria-label='Select'
        title="Select Type"
      >
        <option value="Default">Default</option>
        <option value="Task">Task</option>
      </HTMLSelect>
      {/* 仅作用于 task 模式 */}
      {
        value === 'Task' &&
        <div className={TOOLBAR_SAVE_BUTTON_WRAPPER_CLASS}
          onClick={saveCodes}
        >
          <button className={TOOLBAR_SAVE_BUTTON_CLASS}>
            <span className={'bp3-button-text'}>
              <span className={'jp-ToolbarButtonComponent-label'}>Export</span>
            </span>
          </button>
        </div>
      }
    </Fragment>
  );
}

async function saveCodes(
  app: JupyterFrontEnd,
  tracker: INotebookTracker,
  ){
  let codes: string = ''

  if (tracker.currentWidget) {
    let nbWidget = tracker.currentWidget.content;
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
          codes += c.model.value.text + '\n\n';
          codes += `#################### cell ${key} end #################### \n\n`;
        }
      })
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
}

namespace Private {
  /**
   * A counter for unique IDs.
   */
  export
  let id = 0;
}

export function initToolbar(
  app: JupyterFrontEnd,
  tracker:INotebookTracker,
  notebook: NotebookPanel,
): Widget[] {
  let widgets = [];
  let button = new SelectTypeWidget({
    notebook,
    saveCodes:()=>{
      saveCodes(app,tracker)
    }
  });
  notebook.toolbar.insertItem(8,'select', button);
  widgets.push(button);

  return widgets;
}