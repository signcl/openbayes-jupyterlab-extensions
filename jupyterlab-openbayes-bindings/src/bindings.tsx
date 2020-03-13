import React from 'react'

import {
  DatasetBinding,
  DatasetBindingTypeEnum,
  JobOutputBinding,
  JobOutputBindingTypeEnum
} from './api'
import { IProps } from './app'

export function BindingsComponent(props: IProps) {
  if (props.bindings && props.bindings.length > 0) {
    return bindingComponent(props.bindings, props.openInTerminal)
  }
  return noBindingComponent()
}

const noBindingComponent = () => {
  return (
    <div className="bindings-block">
      <h2 className="title">暂无绑定数据集</h2>
      <div>
        <span>请参考我们的帮助文档&nbsp;&nbsp;</span>
        <a
          className="linkPath"
          target="_blank"
          href="https://openbayes.com/docs/bayesgear/"
        >
          数据集绑定
        </a>
      </div>
    </div>
  )
}

const bindingComponent = (
  bindings: Array<JobOutputBinding | DatasetBinding>,
  openInTerminal?: (id: string, path: string) => void
) => {
  return (
    <div className="bindings-block">
      <h2 className="title">已绑定数据</h2>
      {bindings.map((binding, i) => {
        if (binding.type === DatasetBindingTypeEnum.DATASET) {
          return (
            <div key={i} className="dataset">
              <div className="nameWrap">
                <span className="dataset-private"> 数据集 </span>
                <div className="dataset-title">
                  <a
                    className="linkPath"
                    target="_blank"
                    href={
                      `https://${location.host}/console/` +
                      `${binding.user_id}/datasets/${binding.dataset_id}/${binding.version}`
                    }
                  >
                    {binding.name}
                  </a>
                </div>
              </div>
              <div className="dataset-path">
                <span>在终端打开：</span>
                <span
                  className="linkPath"
                  onClick={() => {
                    openInTerminal(
                      binding.dataset_id,
                      `/openbayes/input${binding.path}`
                    )
                  }}
                >
                  /openbayes/input{binding.path}
                </span>
              </div>
            </div>
          )
        } else if (binding.type === JobOutputBindingTypeEnum.OUTPUT) {
          return (
            <div key={i} className="dataset">
              <div className="nameWrap">
                <span className="job-output">输出</span>
                <div className="dataset-title">
                  <a
                    className="linkPath"
                    target="_blank"
                    href={
                      `https://${location.host}/console/` +
                      `${binding.user_id}/jobs/${binding.job_id}/output`
                    }
                  >
                    {binding.name}
                  </a>
                </div>
              </div>
              <div className="dataset-path">
                <span>在终端打开：</span>
                <span
                  className="linkPath"
                  onClick={() => {
                    openInTerminal(binding.job_id, `${binding.path}`)
                  }}
                >
                  {binding.path}
                </span>
              </div>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}
