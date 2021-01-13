import React, { useState,useEffect,Fragment } from 'react';
import * as ReactDOM from 'react-dom';
import { HTMLSelect } from '@jupyterlab/ui-components';
import { Widget } from '@lumino/widgets';
import { NotebookPanel } from '@jupyterlab/notebook';

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

export function initToolbar(
  notebook: NotebookPanel
): Widget[] {
  let widgets = [];
  let button = new SelectTypeWidget({
    notebook,
    saveCodes:()=>{
      
    }
  });
  notebook.toolbar.insertItem(8,'select', button);
  widgets.push(button);

  return widgets;
}