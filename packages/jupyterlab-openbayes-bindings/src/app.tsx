import React, { useState, useEffect } from 'react'
import * as ReactDOM from 'react-dom'

import { Widget } from '@lumino/widgets'
import { getEnvs } from './env'
import {
  DatasetBinding,
  DatasetBindingTypeEnum,
  getBindings,
  JobOutputBinding
} from './api'
import { BindingsComponent, LoadingComponent } from './bindings'

export interface IProps {
  openInTerminal?: (id: string, path: string) => void
  addRunningSession?: (name: string) => void
}

export class BindingsWidget extends Widget {
  constructor(props: IProps = {}) {
    super()
    ReactDOM.render(
      <BindingComponent
        openInTerminal={props.openInTerminal}
        addRunningSession={props.addRunningSession}
      />,
      this.node
    )
  }
}

const BindingComponent = ({
  openInTerminal,
  addRunningSession
}: {
  openInTerminal?: (id: string, path: string) => void
  addRunningSession?: (name: string) => void
}) => {
  const [bindings, setBindings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const env = await getEnvs()
      getBindings(env.url, env.token)
        .then(data => {
          const result = data.datasets as Array<
            JobOutputBinding | DatasetBinding
          >
          result.map(binding => {
            let name =
              binding.type === DatasetBindingTypeEnum.DATASET
                ? binding.dataset_id
                : binding.job_id
            addRunningSession(name)
          })
          setBindings(result)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
    fetchData()
  }, [])

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <BindingsComponent bindings={bindings} openInTerminal={openInTerminal} />
  )
}
