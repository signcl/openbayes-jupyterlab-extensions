import { NotebookPanel } from '@jupyterlab/notebook';
import { Cell,CodeCell,isCodeCellModel } from '@jupyterlab/cells';
import { PanelLayout } from '@lumino/widgets';

import {INotebookSelectButtons,AddSelectButton,RemoveSelectButton} from './cell-select';
import {createRunButton} from './cell-run';

/**
 * @description: 标记 需要事件处理的
 * @param {*}
 * @return {*}
 */
export class MarkerManager {
  private _taskType:any;
  private _content:any;
  private _notebook:any;
  private _buttonTracker:INotebookSelectButtons;
  /**
   * Construct a new marker manager.
   */
  constructor(notebook:NotebookPanel) {
    this._notebook = notebook;
    this._taskType = notebook.content.model.metadata.get('selectType');
    this._content = notebook.content;
    this._buttonTracker = {};

    // 监听 toolbar 的点击事件
    notebook.toolbar.node.addEventListener("mouseup", (event: MouseEvent) => {
      this.compileTaskType();
    });

    // 处理新增加的 cell
    notebook.content.activeCellChanged.connect((slot)=>{
      const Type = notebook.model.metadata.get('selectType');
      slot.widgets.forEach((cell: Cell) => {
        if(isCodeCellModel(cell.model)){
          if(Type=== 'Task'){
            AddSelectButton(cell,notebook.model,this._buttonTracker);
            this.addTaskSelectButton(cell);
          } else {
            RemoveSelectButton(cell);
            this.removeTaskSelectButton(cell);
          }
        }
      });
    })
  }

  compileTaskType(){
    const nowType = this._notebook.content.model.metadata.get('selectType');
    if(nowType !== this._taskType){
      this._taskType = nowType;
      this.updateTaskButton();
    }
  }

  updateTaskButton(){
    const notebook = this._content;
      if(this._taskType === 'Default'){
        notebook.widgets.map((cell: Cell) => {
          RemoveSelectButton(cell);
          if(isCodeCellModel(cell.model)){
            this.removeTaskSelectButton(cell);
          }
        });
      } else if(this._taskType === 'Task'){
        // 添加 已有的按钮
        notebook.widgets.forEach((cell: Cell) => {
          AddSelectButton(cell,notebook.model,this._buttonTracker);
          if(isCodeCellModel(cell.model)){
            this.addTaskSelectButton(cell)
          }
        });
      }
  }

  addTaskSelectButton(cell:Cell){
    // 隐藏jupyterlab自带的 prompt
    if((cell.inputArea.layout as PanelLayout).widgets[0].id === ""){
      (cell.inputArea.layout as PanelLayout).widgets[0].setHidden(true);
    }
    // 增加 openbayes 开发的 prompt
    if((cell.inputArea.layout as PanelLayout).widgets[0].id !== "run button"){
      const newPrompt = createRunButton(this._notebook ,(cell as CodeCell));
      newPrompt.id = "run button";
      newPrompt.addClass('jp-InputPrompt');
      newPrompt.addClass('jp-InputArea-prompt');
      (cell.inputArea.layout as PanelLayout).insertWidget(0,newPrompt);
    }
  }

  removeTaskSelectButton(cell:Cell){
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
