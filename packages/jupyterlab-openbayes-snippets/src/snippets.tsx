import React, { useState, useEffect } from 'react'
import * as ReactDOM from 'react-dom'

import { Widget } from '@lumino/widgets'
import { Highlight } from 'react-fast-highlight'
import { Code, Snippet, getSnippets } from './api'

export interface IProps {
  snippets?: Snippet[]
  insertSnippets?: (codes: Code[]) => void
}


export class SnippetsWidget extends Widget {
  constructor(props: IProps = {}) {
    super()
    ReactDOM.render(<SnippetComponent insertSnippets={props.insertSnippets} />, this.node)
  }
}

const SnippetComponent = ({ insertSnippets }: { insertSnippets: (codes: Code[]) => void }) => {
  const [snippets, setSnippets] = useState([])
  const [currentSnippet, setCurrentSnippet] = useState(null)
  const [searchKey, setSearchKey] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const results = await getSnippets()
      setSnippets(results);
      if (!currentSnippet) { 
        setCurrentSnippet(results[0])
      }
    }
    fetchData()
  }, [])

  if (currentSnippet == null) {
    return <div>Loading...</div>
  }

  return (
    <div className="code-snippet-widget">
      <h2>Code Snippets</h2>
      <input className="filter-input" type="text" value={searchKey} onChange={e => setSearchKey(e.target.value)} placeholder="搜索代码" />
      <SnippetList 
          snippets={snippets.filter(snippet => snippet.title.toLowerCase().indexOf(searchKey.toLowerCase()) != -1)} 
          selectSnippet={(snippet: Snippet) => setCurrentSnippet(snippet)} 
          currentSnippet={currentSnippet} />
      {
        currentSnippet && <SnippetPreview snippet={currentSnippet} insertSnippet={insertSnippets} />
      }
    </div>
  )
}

const SnippetList = ({ snippets, selectSnippet, currentSnippet }: { snippets: Snippet[], selectSnippet: any, currentSnippet: Snippet }) => {
  return (
    <ul className="snippet-list">
      {snippets.map(snippet => {
        return (
          <li key={snippet.id}>
            <a
              className={currentSnippet.id === snippet.id ? 'active' : ''}
              onClick={() => selectSnippet(snippet)}
            >
              {snippet.title}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

const SnippetPreview = ({ snippet, insertSnippet }: { snippet: Snippet, insertSnippet: (codes: Code[]) => void }) => {
  return (
    <div>
      <h3>{snippet.title}</h3>
      <div>
        {snippet.description}
      </div>
      <div>
        {snippet.codes.map((code, index) => <CodePreview key={index} code={code.content} />)}
      </div>
      <button onClick={() => insertSnippet(snippet.codes)}>插入</button>
    </div>
  )
}

const CodePreview = ({ code }: { code: string }) => (
  <Highlight languages={['python']} className="code">{code}</Highlight>
)