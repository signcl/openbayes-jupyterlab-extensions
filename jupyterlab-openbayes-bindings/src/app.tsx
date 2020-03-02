import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { DatasetBinding, JobOutputBinding } from './model'
import { BindingsComponent } from './bindings'
import { Widget } from '@phosphor/widgets'

export const NAMESPACE = 'openbayes-bindings'

export interface IProps {
  bindings?: Array<JobOutputBinding | DatasetBinding>
  openInTerminal?: (path: string) => void
  url?: string
  token?: string
}

export class BindingsWidget extends Widget {
  constructor(props: IProps = {}) {
    super()

    if (props.url === '' || props.token == '') {
      ReactDOM.render(<BindingsComponent {...props} />, this.node)
      return
    }

    console.log(`fetch url: ${props.url}`)
    fetch(props.url, {
      method: 'get',
      headers: {
        authorization: 'Bearer ' + props.token,
        accept: 'application/json',
        'content-type': 'application/json'
      }
    }).then(
      response => {
        if (response.status === 200) {
          response.json().then(data => {
            props.bindings = data.datasets
            ReactDOM.render(<BindingsComponent {...props} />, this.node)
            return Promise.resolve()
          })
        }
        props.bindings = null
        ReactDOM.render(<BindingsComponent {...props} />, this.node)
        return Promise.resolve()
      },
      () => {
        props.bindings = null
        ReactDOM.render(<BindingsComponent {...props} />, this.node)
        return Promise.resolve()
      }
    )

    ReactDOM.render(<BindingsComponent {...props} />, this.node)
  }
}
