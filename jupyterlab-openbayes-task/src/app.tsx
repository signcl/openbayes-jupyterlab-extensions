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
    let select = new SelectTypeWidget(panel.content);
    panel.toolbar.insertItem(9, 'select', select);
    return new DisposableDelegate(() => {});
  }
}
class SelectTypeWidget extends Widget{
  constructor(widget: Notebook) {
    super()
    ReactDOM.render(<SelectTypeComponent  />, this.node)
  }
}
const SelectTypeComponent = ()=>{
  const [value,setValue] = useState('Default')
  const handleChange = (event:React.ChangeEvent<HTMLSelectElement>)=>{
    setValue(event.target.value)
  }
  return (
    <HTMLSelect
      className={TOOLBAR_CELLTYPE_DROPDOWN_CLASS}
      onChange={handleChange}
      value={value}
      aria-label='Select'
    >
      <option value="Default">Default</option>
      <option value="Task">Task</option>
    </HTMLSelect>
  );
}

export const AddSelectButton = (cell: Cell,tracker: INotebookSelectButtons,record:INotebookSelectRecords) => {
  if (cell.model.type === 'code' && !tracker[cell.model.id]) {
    const selectButton = new SelectButtonWidget({
      id:cell.model.id,
      cell,
      record,
    });
    tracker[cell.model.id] = selectButton;
    (cell.inputArea.layout as PanelLayout).insertWidget(0, selectButton);
  } else {
    (cell.inputArea.layout as PanelLayout).removeWidget(tracker[cell.model.id]);
    delete tracker[cell.model.id];
    const selectButton = new SelectButtonWidget({
      id:cell.model.id,
      cell,
      record,
    });
    tracker[cell.model.id] = selectButton;
    (cell.inputArea.layout as PanelLayout).insertWidget(0, selectButton);
  }
};

export interface INotebookSelectRecords {
  [id: string]: string;
}
export interface INotebookSelectButtons {
  [id: string]: SelectButtonWidget;
}
interface ISelectButtonProps {
  id:any;
  cell:Cell;
  record:INotebookSelectRecords;
}
class SelectButtonWidget extends Widget{
  constructor(props:ISelectButtonProps) {
    super()
    ReactDOM.render(<SelectButton {...props} />, this.node)
  }
}
const SelectButton = ({id,cell,record}:ISelectButtonProps)=>{
  const [index,setIndex] = useState(0)

  useEffect(()=>{
    let list = Object.keys(record)
    let Index = list.findIndex((item:string) =>item === id);
    let order = Index < 0 ? 0 : Index+1;
    setIndex(order)
  },[id,record])
  
  const SaveSelectCellID = ()=>{
    console.log('选中cell')
    console.log(record)
    record[cell.model.id] = cell.model.id;
    changeIndex()
  }
  const DeleteSelectCellID = ()=>{
    console.log('取消选中cell')
    delete record[cell.model.id]
    changeIndex()
  }

  const changeIndex = ()=>{
    let list = Object.keys(record)
    let Index = list.findIndex((item:string) =>item === id);
    let order = Index < 0 ? 0 : Index+1;
    setIndex(order)
  }

  if(!index) return(
    <Button 
      size="small" 
      variant="contained" 
      title="Select" 
      onClick={SaveSelectCellID}
      >select</Button>)
  return(
    <Button size="small" variant="contained" color="primary" onClick={DeleteSelectCellID}>{index}</Button>
    )
}

