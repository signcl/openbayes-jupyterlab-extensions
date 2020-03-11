export interface JobOutputBinding {
  name: string
  user_id: string
  job_id: string
  path: string
  type: JobOutputBindingTypeEnum
  semantic_binding_name: string
  updated_at: string
  links?: JobOutputBindingLinks
}

export enum JobOutputBindingTypeEnum {
  OUTPUT = 'OUTPUT'
}

export interface JobOutputBindingLinks {
  open?: string
}

export interface DatasetBinding {
  name: string
  user_id: string
  dataset_id: string
  path: string
  type: DatasetBindingTypeEnum
  semantic_binding_name: string
  version: number
  updated_at: string
  links: DatasetBindingLinks
}

export enum DatasetBindingTypeEnum {
  DATASET = 'DATASET'
}

export interface DatasetBindingLinks {
  self: string
  open: string
}

export async function getBindings(url: string, token: string) {
  if (url === '' || token === '') {
    return []
  }
  const response = await fetch(url, {
    method: 'get',
    headers: {
      authorization: 'Bearer ' + token,
      accept: 'application/json',
      'content-type': 'application/json'
    }
  })
  if (response.status === 200) {
    return await response.json()
  }
  return []
}
