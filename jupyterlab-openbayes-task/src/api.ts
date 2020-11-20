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

    // can not use fs.readFile
    // const data = await fs.readFile(path, "utf8");
    const data = path

    // formData is not working
    let formData = new FormData()
    formData.append(
        'file',
        new Blob(stringToBytes(data), { type: 'text/plain' }),
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
    // if (response.status === 200) {
    //     const location = await response.headers.get('Location')
    //     console.log(location)
    //     return location.replace(url, '')
    // }

    // return ''
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

export async function run(
    user: string,
    token: string,
    url: string,
    cid: string,
    command: string,
    job: any
) {

    // how to get datasets?
    const bindings = job.datasets.map((item:any)=>{
        return {
            name:`${item.user_id}/${item.name}`,
            path: item.path
        }
    })

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
            'datasets': bindings,
            'runtime': job.runtime.framework+"-"+job.runtime.version,
            'resource': job.resource.name,
        })
    })

    if (response.status === 200) {
        return await response.json()
    }

    return {}
}

function stringToBytes(str: string) {
    const bytes = new Array()
    let len, c
    len = str.length
    for (let i = 0; i < len; i++) {
        c = str.charCodeAt(i)
        if (c >= 0x010000 && c <= 0x10ffff) {
            bytes.push(((c >> 18) & 0x07) | 0xf0)
            bytes.push(((c >> 12) & 0x3f) | 0x80)
            bytes.push(((c >> 6) & 0x3f) | 0x80)
            bytes.push((c & 0x3f) | 0x80)
        } else if (c >= 0x000800 && c <= 0x00ffff) {
            bytes.push(((c >> 12) & 0x0f) | 0xe0)
            bytes.push(((c >> 6) & 0x3f) | 0x80)
            bytes.push((c & 0x3f) | 0x80)
        } else if (c >= 0x000080 && c <= 0x0007ff) {
            bytes.push(((c >> 6) & 0x1f) | 0xc0)
            bytes.push((c & 0x3f) | 0x80)
        } else {
            bytes.push(c & 0xff)
        }
    }

    return bytes
}
