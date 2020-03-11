import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Widget } from '@phosphor/widgets'
import { Code, Snippet } from './api'

export interface IProps {
  snippets?: Snippet[]
  insertSnippets?: (codes: Code[]) => void
}

export class SnippetsWidget extends Widget {
  constructor(props: IProps = {}) {
    super()

    if (props.snippets && props.snippets.length > 0) {
      let tsx = (
        <div>
          {props.snippets.map((snippet, i) => {
            return (
              <div key={i}>
                <span
                  className="linkPath"
                  onClick={() => {
                    props.insertSnippets(snippet.codes)
                  }}
                >
                  {snippet.title}
                </span>
              </div>
            )
          })}
        </div>
      )

      ReactDOM.render(tsx, this.node)
    } else {
      ReactDOM.render(<div>无代码片段</div>, this.node)
    }
  }
}
