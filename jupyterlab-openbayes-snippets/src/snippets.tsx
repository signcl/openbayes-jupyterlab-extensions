import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Widget } from '@phosphor/widgets'

export interface IProps {
  snippets?: []
  insertSnippets?: (codes: []) => void
}

export class SnippetsWidget extends Widget {
  constructor(props: IProps = {}) {
    super()

    let tsx = (
      <div>
        {props.snippets.map((snippet, i) => {
          return (
            <div key={i}>
              <span
                className="linkPath"
                onClick={() => {
                  props.insertSnippets(snippet['codes'])
                }}
              >
                {snippet['title']}
              </span>
            </div>
          )
        })}
      </div>
    )

    ReactDOM.render(tsx, this.node)
  }
}
