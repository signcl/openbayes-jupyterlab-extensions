import React, { useState,useEffect } from 'react'
import * as ReactDOM from 'react-dom'
import { Widget } from '@lumino/widgets'
import { Switch } from '@material-ui/core';
import {
  IDisposable, DisposableDelegate
} from '@lumino/disposable';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  Notebook,NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import {
  HTMLSelect
} from '@jupyterlab/ui-components';

import {
  Cell
} from '@jupyterlab/cells';

import { PanelLayout } from '@lumino/widgets';

const TOOLBAR_SELECTTYPE_DROPDOWN_CLASS = 'jp-Notebook-toolbarCellTypeDropdown select';
const TOOLBAR_SAVE_BUTTON_CLASS = 'save-button';
const TOOLBAR_SELECT_BUTTON_CLASS = 'select-button';
const TOOLBAR_SELECT_NUMBER_BUTTON_CLASS = 'select-number-button';
export interface IProps {
  runCodes?: () => void
}

export class LeftPanelWidget extends Widget {
  constructor(props: IProps = {}) {
    super()
    ReactDOM.render(<LeftPanelComponent runCodes={props.runCodes} />, this.node)
  }
}

const LeftPanelComponent = ({ runCodes }: { runCodes?: () => void }) => {
  const [checked, setChecked] = useState(false)

  return (
    <React.Fragment>
      <h2 className="title">OpenBayes Task Panel</h2>
      <div className="toolbar input-container">
        <div className={'switch-label'}>Enable</div>
        <Switch
          checked={checked}
          onChange={c => setChecked(c.target.checked)}
          color="primary"
          name="enableTask"
          inputProps={{ 'aria-label': 'primary checkbox' }}
          classes={{ root: 'material-switch' }}
        />
      </div>
      <div className={'deploy-button ' + (checked ? '' : 'hidden')}>
        <button color="primary" style={{ width: '100%' }} onClick={runCodes}>
          创建新容器运行
        </button>
      </div>
    </React.Fragment>
  )
}

export
class SelectTypeExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>{
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let select = new SelectTypeWidget(panel,panel.content);
    panel.toolbar.insertItem(8, 'select', select);
    return new DisposableDelegate(() => {});
  }
}
class SelectTypeWidget extends Widget{
  constructor(panel:NotebookPanel,widget: Notebook) {
    super()
    ReactDOM.render(<SelectTypeComponent  notebook={widget} panel={panel} />, this.node)
  }
}
const SelectTypeComponent = ({panel,notebook}:{panel:NotebookPanel,notebook:Notebook})=>{
  const [value,setValue] = useState('Default');
  let tracker:INotebookSelectButtons = {}
  
  const handleChange = (event:React.ChangeEvent<HTMLSelectElement>)=>{
    let selectValue = event.target.value
    setValue(selectValue)
    if(selectValue === 'Task'){
      // let children = panel.toolbar.children()
      // 设置初始值
      notebook.model.metadata.set('cellRecords','{}');
      notebook.widgets.map((c: Cell) => {
        AddSelectButton(c,notebook.model,tracker);
      });
    } else {
      notebook.widgets.map((c: Cell) => {
        RemoveSelectButton(c);
      });
      notebook.model.metadata.delete('cellTracker')
    }
  }
  return (
    <React.Fragment>
      <HTMLSelect
        className={TOOLBAR_SELECTTYPE_DROPDOWN_CLASS}
        onChange={handleChange}
        value={value}
        aria-label='Select'
      >
        <option value="Default">Default</option>
        <option value="Task">Task</option>
      </HTMLSelect>
      {
        value === 'Task' && 
        <div className={TOOLBAR_SAVE_BUTTON_CLASS}
          // onClick={saveCode}
        >
          {/* 在这一步保存生成文件 */}
          Save
        </div>
      }
    </React.Fragment>
    
  );
}
/**
 * @description: 增加选择 button
 * @param {cell,model}
 * @return {null}
 */
export const AddSelectButton = (cell: Cell,model:INotebookModel,tracker:INotebookSelectButtons) => {
  if (cell.model.type === 'code' && !tracker[cell.model.id]) {
    const selectButton = new SelectButtonWidget({
      id:cell.model.id,
      cell,
      model
    });
    tracker[cell.model.id] = selectButton;
    selectButton.id = "Select-Button";
    // (cell.inputArea.layout as PanelLayout).insertWidget(0, selectButton); 添加至左边第一个
    // 将 widget 添加至末尾
    (cell.inputArea.layout as PanelLayout).addWidget(selectButton);
  }
};
/**
 * @description: 移除选择 button
 * @param {cell}
 * @return {null}
 */
export const RemoveSelectButton = (cell: Cell) => {
  if (cell.model.type === 'code') {
    (cell.inputArea.layout as PanelLayout).widgets.forEach(element => {
      if(element.id === 'Select-Button'){
        (cell.inputArea.layout as PanelLayout).removeWidget(element);
      }
    });
  }
}

export interface INotebookSelectRecords {
  [id: string]: string;
}
export interface INotebookSelectButtons {
  [id: string]: SelectButtonWidget;
}
interface ISelectButtonProps {
  id:any;
  cell:Cell;
  model:INotebookModel;
}
class SelectButtonWidget extends Widget{
  constructor(props:ISelectButtonProps) {
    super()
    ReactDOM.render(<SelectButton {...props} />, this.node)
  }
}
const SelectButton = ({id,cell,model}:ISelectButtonProps)=>{
  const [isSelected, setIsSelected] = useState(false);
  const [record,setRecord] = useState(null);
  const metadata = cell.model.metadata;

  useEffect(()=>{
    model.metadata.changed.connect(()=>{
      const initiallySelected = metadata.get('isSelect') as boolean;
      const list = JSON.parse(model.metadata.get('cellRecords').toString());
      setRecord(list)
      const index = Object.keys(list).findIndex((item:string) =>item === id)
      if (initiallySelected && index !== -1) {
        setIsSelected(initiallySelected);
      }
    })
  },[model.metadata])

  const handelClick = ()=>{
    const record:any = JSON.parse(model.metadata.get('cellRecords').toString())
    if(!isSelected){
      record[cell.model.id] = cell.model.id;
      metadata.set('isSelect', true);
      
    } else {
      delete record[cell.model.id]
      metadata.delete('isSelect');
    }
    let resultRecord = JSON.stringify(record)
    model.metadata.set('cellRecords',resultRecord)
    setRecord(record)
    setIsSelected(!isSelected);
  }
  if(!metadata){
    return;
  }
  if(!isSelected) return(
    <div 
      title="Select"
      className={TOOLBAR_SELECT_BUTTON_CLASS} 
      onClick={handelClick}
    >
      <svg focusable="false" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
    </div>
    )
  return(
    <div className={TOOLBAR_SELECT_NUMBER_BUTTON_CLASS} onClick={handelClick}>
      {
      Object.keys(record).findIndex((item:string) =>item === id)+1
      }
    </div>
    )
}

