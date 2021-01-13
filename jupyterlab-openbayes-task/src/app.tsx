import React, { useState } from 'react'
import * as ReactDOM from 'react-dom'
import { Switch } from '@material-ui/core';
import { Widget } from '@lumino/widgets';

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

