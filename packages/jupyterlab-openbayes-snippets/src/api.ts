export interface Snippet {
  id: number
  title: string
  description?: string
  created_at: string
  updated_at: string
  codes: Array<Code>
}

export interface Code {
  id: number
  content: string
}

export async function getSnippets() {
  // 'https://' + location.host
  const prefix = 'https://stg.openbayes.com'
  const response = await fetch(prefix + '/strapi/jupyter-snippets')
  if (response.status === 200) {
    return await response.json()
  }
  return []
}
