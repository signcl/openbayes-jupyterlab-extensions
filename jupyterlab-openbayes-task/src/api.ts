export async function uploadRequest(user: string, token: string, jobURL: string) {
    const url = jobURL + '/upload-request'
    const response = await fetch(url, {
        method: 'post',
        headers: {
            authorization: 'Bearer ' + token,
            accept: 'application/json',
            'content-type': 'application/json'
        }
    })
    if (response.status === 200) {
        return await response.json()
    }
    return {}
}

export async function uploadCode(
    url: string,
    token: string,
    path: string,
    filename: string = 'main.py'
) {
    let data = await (await fetch(path)).blob()

    let formData = new FormData()
    formData.append(
        'file',
        data,
        filename
    )

    const response = await fetch(url, {
        method: 'post',
        headers: {
            authorization: 'Bearer ' +token,
            accept: 'application/json'
        },
        body: formData
    })

    const resp = await response.json()

    return resp.id

}

export async function getJobDetail(url: string, token: string) {
    if (url === '' || token === '') {
        return
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
    return
}

type DatasetBindings = {
  name:string;
  path:string;
}

export async function run(
    user: string,
    token: string,
    url: string,
    cid: string,
    command: string,
    job: any
) {
    let datasets:Array<DatasetBindings> = [];
    job.datasets.forEach((item:any) => {
        if (item.job_id !== job.id || item.path !== "/output") {
            datasets.push({
                name: item.semantic_binding_name,
                path: item.path
            })
        }
    });

    const response = await fetch(url, {
        method: 'post',
        headers: {
            authorization: 'Bearer ' + token,
            accept: 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            'project_id': job.project_id,
            'mode': 'TASK',
            'code': cid,
            'command': command,
            'datasets': datasets,
            'runtime': job.runtime.framework+"-"+job.runtime.version,
            'resource': job.resource.name,
        })
    })

    if (response.status === 200) {
        return await response.json()
    }

    return {}
}

