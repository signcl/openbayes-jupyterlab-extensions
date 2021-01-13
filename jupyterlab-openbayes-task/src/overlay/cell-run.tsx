import React, { useState,useEffect } from 'react';
import { NotebookPanel,NotebookActions } from '@jupyterlab/notebook';
import { CodeCell,ICodeCellModel } from '@jupyterlab/cells';
import { ToolbarButtonComponent,ReactWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { runIcon } from '@jupyterlab/ui-components';


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