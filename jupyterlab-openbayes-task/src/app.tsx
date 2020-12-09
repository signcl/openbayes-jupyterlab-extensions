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
const TOOLBAR_SAVE_BUTTON_WRAPPER_CLASS = 'jp-ToolbarButton jp-Toolbar-item';
const TOOLBAR_SAVE_BUTTON_CLASS = 'bp3-button bp3-minimal jp-ToolbarButtonComponent minimal jp-Button save-button ';
// save-button
const CELL_SELECTTYPE_WRAPPER_CLASS = 'select-wrapper';
const CELL_SELECT_BUTTON_CLASS = 'select-button';
const CELL_SELECT_NUMBER_BUTTON_CLASS = 'select-number-button';
const CELL_ID_BUTTON_CLASS = 'id-button';
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
  saveCodes: () => void;
  constructor(props: IProps = {}){
    this.saveCodes = props.runCodes
  }
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let select = new SelectTypeWidget({
      panel,
      notebook:panel.content,
      saveCodes:this.saveCodes
    });
    panel.toolbar.insertItem(8, 'select', select);
    return new DisposableDelegate(() => {});
  }
}

export interface SelectTypeProps {
  panel:NotebookPanel;
  notebook: Notebook;
  saveCodes?:() => void;
}

class SelectTypeWidget extends Widget{
  constructor(props:SelectTypeProps) {
    super()
    ReactDOM.render(<SelectTypeComponent {...props} />, this.node)
  }
}

const SelectTypeComponent = ({panel,notebook,saveCodes}:SelectTypeProps)=>{
  const [value,setValue] = useState('Default');
  let tracker:INotebookSelectButtons = {};

  useEffect(()=>{
    // 设定初始的状态值
    notebook.model.metadata.set('selectType','Default');
  },[])
  
  const handleChange = (event:React.ChangeEvent<HTMLSelectElement>)=>{
    let selectValue = event.target.value
    setValue(selectValue)
    if(selectValue === 'Task'){
      // todo：task 模式下禁止 cell type 的切换
      let children = panel.toolbar.children()
      console.log(children)
      // 设置初始值
      notebook.model.metadata.set('cellRecords','{}');
      notebook.model.metadata.set('selectType','Task');
      notebook.widgets.map((c: Cell) => {
        AddSelectButton(c,notebook.model,tracker);
      });
      // 处理新增加的 cell
      notebook.activeCellChanged.connect((slot)=>{
        slot.widgets.map((c: Cell) => {
          AddSelectButton(c,notebook.model,tracker);
        });
      })
    } else {
      notebook.model.metadata.set('selectType','Default');
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
    </React.Fragment>
  );
}
/**
 * @description: 增加选择 button
 * @param cell cell 实例
 * @param model notebook 的 model 实例
 * @param tracker 记录是否已添加该 cell 的选择 button
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
    selectButton.addClass(CELL_SELECTTYPE_WRAPPER_CLASS);
    // (cell.inputArea.layout as PanelLayout).insertWidget(0, selectButton); 
    // 添加至左边第一个
    // 将 widget 添加至末尾
    (cell.inputArea.layout as PanelLayout).addWidget(selectButton);
    // 将 widget 添加至 codeEditorWrapper,报错缺失 addWidget 方法
    // const codeEditorWrapper = cell.editorWidget;
    // (codeEditorWrapper.layout as PanelLayout).addWidget(selectButton);
  } else {
    return;
  }
};
/**
 * @description: 移除选择 button
 * @param cell cell 实例
 * @return {null}
 */
export const RemoveSelectButton = (cell: Cell) => {
  if (cell.model.type === 'code') {
    (cell.inputArea.layout as PanelLayout).widgets.forEach(element => {
      if(element.id && (element.id === 'Select-Button')){
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
/**
 * @description: 用户选择代码片段的按钮
 * @param id cell 的 id
 * @param cell cell 实例
 * @param model notebook 的 model
 * @return {dom} 返回选择按钮的 dom
 */
const SelectButton = ({id,cell,model}:ISelectButtonProps)=>{
  const [isSelected, setIsSelected] = useState(false);
  const [record,setRecord] = useState(null);

  useEffect(()=>{
    model.metadata.changed.connect(()=>{
      const initiallySelected = cell.model.metadata.get('isSelect') as boolean;
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
      cell.model.metadata.set('isSelect', true);
      
    } else {
      delete record[cell.model.id]
      cell.model.metadata.delete('isSelect');
    }
    let resultRecord = JSON.stringify(record)
    model.metadata.set('cellRecords',resultRecord)
    setRecord(record)
    setIsSelected(!isSelected);
  }
  if(!cell){
    return;
  }
  if(!isSelected) return(
    <React.Fragment>
      <div 
        title="Select"
        className={CELL_SELECT_BUTTON_CLASS} 
        onClick={handelClick}
      >
        <svg focusable="false" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
      </div>
      <div 
        className={CELL_ID_BUTTON_CLASS}
        title={id}>
        {id.slice(0,8)}
      </div>
    </React.Fragment>
    )
  return(
    <React.Fragment>
      <div className={CELL_SELECT_NUMBER_BUTTON_CLASS} onClick={handelClick}>
        {
        Object.keys(record).findIndex((item:string) =>item === id)+1
        }
      </div>
      <div 
        className={CELL_ID_BUTTON_CLASS}
        title={id}>
        {id.slice(0,8)}
      </div>
    </React.Fragment>
    )
}
