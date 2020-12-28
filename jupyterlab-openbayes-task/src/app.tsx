import React, { useState,useEffect } from 'react'
import * as ReactDOM from 'react-dom'
import { Switch } from '@material-ui/core';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  Notebook,NotebookPanel, INotebookModel,NotebookActions
} from '@jupyterlab/notebook';

import {
  HTMLSelect,
  runIcon,
  notebookIcon
} from '@jupyterlab/ui-components';

import {
  Cell,CodeCell,isCodeCellModel,ICodeCellModel
} from '@jupyterlab/cells';

import { 
  ToolbarButtonComponent,ReactWidget
} from '@jupyterlab/apputils';

import { ArrayExt } from '@lumino/algorithm';
import {UUID} from '@lumino/coreutils';
import {IDisposable, DisposableDelegate} from '@lumino/disposable';
import { Panel,PanelLayout,Widget } from '@lumino/widgets';


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
    this.id = 'openbayes-task-widget'
    this.title.iconClass = 'task-icon'
    this.title.caption = 'OpenBayes Task'
    this.title.closable = true
    this.addClass('task-widget')
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
      notebook.widgets.forEach((cell: Cell) => {
        AddSelectButton(cell,notebook.model,tracker);
        if(isCodeCellModel(cell.model)){
          // 隐藏jupyterlab自带的 prompt
          if((cell.inputArea.layout as PanelLayout).widgets[0].id === ""){
            (cell.inputArea.layout as PanelLayout).widgets[0].setHidden(true);
          }
          // 增加 openbayes 开发的 prompt
          if((cell.inputArea.layout as PanelLayout).widgets[0].id !== "run button"){
            const newPrompt = createRunButton(panel,(cell as CodeCell));
            newPrompt.id = "run button";
            newPrompt.addClass('jp-InputPrompt');
            newPrompt.addClass('jp-InputArea-prompt');
            (cell.inputArea.layout as PanelLayout).insertWidget(0,newPrompt);
          }
        }
      });

      // 处理新增加的 cell
      notebook.activeCellChanged.connect((slot)=>{
        const Type = notebook.model.metadata.get('selectType');
        slot.widgets.forEach((cell: Cell) => {
          if(isCodeCellModel(cell.model)){
            if(Type=== 'Task'){
              AddSelectButton(cell,notebook.model,tracker);
              // 隐藏jupyterlab自带的 prompt
              if((cell.inputArea.layout as PanelLayout).widgets[0].id === ""){
                (cell.inputArea.layout as PanelLayout).widgets[0].setHidden(true);
              }
              // 增加 openbayes 开发的 prompt
              if((cell.inputArea.layout as PanelLayout).widgets[0].id !== "run button"){
                const newPrompt = createRunButton(panel,(cell as CodeCell));
                newPrompt.id = "run button";
                newPrompt.addClass('jp-InputPrompt');
                newPrompt.addClass('jp-InputArea-prompt');
                (cell.inputArea.layout as PanelLayout).insertWidget(0,newPrompt);
              }
            } else {
              // 隐藏 openbayes 开发的 prompt
              if((cell.inputArea.layout as PanelLayout).widgets[0].id === "run button"){
                (cell.inputArea.layout as PanelLayout).removeWidgetAt(0);
              }
              // 显示jupyterlab自带的 prompt
              if((cell.inputArea.layout as PanelLayout).widgets[0].id === ""){
                (cell.inputArea.layout as PanelLayout).widgets[0].setHidden(false);
              }
            }
          }
        });
      })
    } else {
      notebook.model.metadata.set('selectType','Default');
      notebook.widgets.map((cell: Cell) => {
        RemoveSelectButton(cell);
        if(isCodeCellModel(cell.model)){
          // 隐藏 openbayes 开发的 prompt
          if((cell.inputArea.layout as PanelLayout).widgets[0].id === "run button"){
            (cell.inputArea.layout as PanelLayout).removeWidgetAt(0);
          }
          // 显示jupyterlab自带的 prompt
          if((cell.inputArea.layout as PanelLayout).widgets[0].id === ""){
            (cell.inputArea.layout as PanelLayout).widgets[0].setHidden(false);
          }
        }
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

/**
 * @description: 覆盖写入 inputArea 的 prompt
 * @param panel 当前的 notebook 的 widget
 * @return dom 返回新的 dom 节点
 */
export function createRunButton(
  panel: NotebookPanel,
  cell: CodeCell
): Widget {
  function onClick() {
    void NotebookActions.run(panel.content, panel.sessionContext)
  }
  return ReactWidget.create(
    <RunButtonComponent panel={panel} cell={cell} onClickEvent={onClick}></RunButtonComponent>
    );
}
interface RunButtonComponentProps {
  panel: NotebookPanel;
  cell: CodeCell;
  onClickEvent:()=>void;
}
const RunButtonComponent = ({panel,cell,onClickEvent}:RunButtonComponentProps)=>{
  const [showRun,setShowRun] = useState(false);
  const [runTime,setRunTime] = useState(0);
  let delayTimer:any = null;

  useEffect(()=>{
    if(cell.model){
      const count = (cell.model as ICodeCellModel).executionCount;
      setRunTime(count);
    }
  },[cell])

  const clickRunButton = ()=>{
    console.log('点击了按钮')
    setShowRun(false);
    onClickEvent();
    const value = (cell.model as ICodeCellModel).executionCount;
    // todo: 存在bug 数字标号未及时更新
    setRunTime(value);
  }
  const changeRunButton = (value:boolean)=>{
    if(delayTimer){
      clearTimeout(delayTimer);
    }
    delayTimer = setTimeout(()=>{
      setShowRun(value);
    },300);
    
  };
  return(
  <div
    style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', minHeight: '25px'}}
    onMouseEnter={()=>changeRunButton(true)}
    onMouseLeave={()=>changeRunButton(false)}
  >
    {
      showRun ?
      <div >
        <ToolbarButtonComponent
          icon={runIcon}
          onClick={clickRunButton}
          tooltip={'Run the selected cells'}
          enabled={
            !!(
              panel &&
              panel.context &&
              panel.context.contentsModel &&
              panel.context.contentsModel.writable
            )
          }
        />
      </div>
      :
      <div 
        className={'lm-Widget p-Widget'}
      >[{runTime && runTime > 0 ? runTime: ' '}]:
      </div>
    }
    </div>
    )
}
export namespace ClonedOutputArea {
  export interface IOptions {
    /**
     * The notebook associated with the cloned output area.
     */
    notebook: NotebookPanel;

    /**
     * The cell for which to clone the output area.
     */
    cell?: CodeCell;

    /**
     * If the cell is not available, provide the index
     * of the cell for when the notebook is loaded.
     */
    index?: number;

    /**
     * If the cell is not available, provide the index
     * of the cell for when the notebook is loaded.
     */
    // translator?: ITranslator;
  }
}
export class ClonedOutputArea extends Panel {
  constructor(options: ClonedOutputArea.IOptions) {
    super();
    this._notebook = options.notebook;
    this._index = options.index !== undefined ? options.index : -1;
    this._cell = options.cell || null;
    this.id = `LinkedOutputView-${UUID.uuid4()}`;
    this.title.label = 'Output View';
    this.title.icon = notebookIcon;
    this.title.caption = this._notebook.title.label
      ? `For Notebook: %1 ${this._notebook.title.label}`
      : 'For Notebook:';
    this.addClass('jp-LinkedOutputView');

    // Wait for the notebook to be loaded before
    // cloning the output area.
    void this._notebook.context.ready.then(() => {
      if (!this._cell) {
        this._cell = this._notebook.content.widgets[this._index] as CodeCell;
      }
      if (!this._cell || this._cell.model.type !== 'code') {
        this.dispose();
        return;
      }
      const clone = this._cell.cloneOutputArea();
      this.addWidget(clone);
    });
  }

  /**
   * The index of the cell in the notebook.
   */
  get index(): number {
    return this._cell
      ? ArrayExt.findFirstIndex(
          this._notebook.content.widgets,
          c => c === this._cell
        )
      : this._index;
  }

  /**
   * The path of the notebook for the cloned output area.
   */
  get path(): string {
    return this._notebook.context.path;
  }

  private _notebook: NotebookPanel;
  private _index: number;
  private _cell: CodeCell | null = null;
}
