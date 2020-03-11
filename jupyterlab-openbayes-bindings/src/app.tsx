import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { DatasetBinding, JobOutputBinding } from './api'
import { BindingsComponent } from './bindings'
import { Widget } from '@phosphor/widgets'

export const NAMESPACE = 'openbayes-bindings'

export interface IProps {
  bindings?: Array<JobOutputBinding | DatasetBinding>
  openInTerminal?: (path: string) => void
}

export class BindingsWidget extends Widget {
  constructor(props: IProps = {}) {
    super()
    ReactDOM.render(<BindingsComponent {...props} />, this.node)
  }
}
