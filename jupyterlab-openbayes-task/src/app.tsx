import React, { useState,useEffect } from 'react'
import * as ReactDOM from 'react-dom'
import { Widget } from '@lumino/widgets'
import { Button, Switch } from '@material-ui/core'


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

const TOOLBAR_CELLTYPE_DROPDOWN_CLASS = 'jp-Notebook-toolbarCellTypeDropdown';
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
    ReactDOM.render(<SelectTypeComponent  notebook={widget} panel={panel}/>, this.node)
  }
}
const SelectTypeComponent = ({panel,notebook}:{panel:NotebookPanel,notebook:Notebook})=>{
  const [value,setValue] = useState('Default');
  
  const handleChange = (event:React.ChangeEvent<HTMLSelectElement>)=>{
    let selectValue = event.target.value
    setValue(selectValue)
    if(selectValue === 'Task'){
      let children = panel.toolbar.children()
      console.log(children)
      // 设置初始值
      notebook.model.metadata.set('cellRecords','{}');
      notebook.widgets.map((c: Cell) => {
        AddSelectButton(c,notebook.model);
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
        className={TOOLBAR_CELLTYPE_DROPDOWN_CLASS}
        onChange={handleChange}
        value={value}
        aria-label='Select'
      >
        <option value="Default">Default</option>
        <option value="Task">Task</option>
      </HTMLSelect>
      {
        value === 'Task' && 
        <div>
          {/* 在这一步保存生成文件 */}
          <Button size="small">Save</Button>
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
export const AddSelectButton = (cell: Cell,model:INotebookModel) => {
  // let tracker:any = model.metadata.get('cellTracker')
  if (cell.model.type === 'code' ) {
    // && !tracker[cell.model.id]
    const selectButton = new SelectButtonWidget({
      id:cell.model.id,
      cell,
      model
    });
    // tracker[cell.model.id] = selectButton;
    (cell.inputArea.layout as PanelLayout).insertWidget(0, selectButton);
    // model.metadata.set('cellTracker',tracker)
  } 
  // else {
  //   (cell.inputArea.layout as PanelLayout).removeWidget(tracker[cell.model.id]);
  //   delete tracker[cell.model.id];
  //   const selectButton = new SelectButtonWidget({
  //     id:cell.model.id,
  //     cell,
  //     model,
  //   });
  //   tracker[cell.model.id] = selectButton;
  //   (cell.inputArea.layout as PanelLayout).insertWidget(0, selectButton);
  //   model.metadata.set('cellTracker',tracker)
  // }
};
/**
 * @description: 移除选择 button
 * @param {cell}
 * @return {null}
 */
export const RemoveSelectButton = (cell: Cell) => {
  if (cell.model.type === 'code') {
    (cell.inputArea.layout as PanelLayout).removeWidgetAt(0);
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
    let initCellRecords = JSON.parse(model.metadata.get('cellRecords').toString())
    console.log('初始渲染recordslist',initCellRecords)
    model.metadata.changed.connect(()=>{
      console.log('metadata发生变化')
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
    console.log(model.metadata.get('cellRecords'))
    setRecord(record)
    setIsSelected(!isSelected);
  }

  if(!isSelected) return(
    <Button 
      size="small" 
      variant="contained" 
      title="Select" 
      onClick={handelClick}
      >select</Button>)
  return(
    <Button size="small" variant="contained" color="primary" onClick={handelClick}>
      {
      Object.keys(record).findIndex((item:string) =>item === id)+1
      }
    </Button>
    )
}

