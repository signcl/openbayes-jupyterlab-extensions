
import React, { useState,useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { INotebookModel } from '@jupyterlab/notebook';
import { Cell } from '@jupyterlab/cells';
import { PanelLayout,Widget } from '@lumino/widgets';


// save-button
const CELL_SELECTTYPE_WRAPPER_CLASS = 'select-wrapper';
const CELL_SELECT_BUTTON_CLASS = 'select-button';
const CELL_SELECT_NUMBER_BUTTON_CLASS = 'select-number-button';
const CELL_ID_BUTTON_CLASS = 'id-button';


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
    // 将 widget 添加至末尾
    (cell.inputArea.layout as PanelLayout).addWidget(selectButton);
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

