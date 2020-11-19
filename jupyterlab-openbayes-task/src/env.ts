import { Kernel, KernelManager } from '@jupyterlab/services'

interface ITaskEnv {
    user: string
    token: string
    url: string
}

function Env(user: string, token: string, url: string): ITaskEnv {
    return { user, token, url }
}

export async function getEnvs(): Promise<ITaskEnv> {
    const kernel: Kernel.IKernelConnection = await createNewKernel()
    window.addEventListener('beforeunload', () => kernel.shutdown())
    let url = await getBackend(kernel, 'OPENBAYES_JOB_URL')
    if (url.length >= 2) {
        url = (url as string).slice(1, url.length - 1)
    }
    url = (url as string).replace('http://', 'https://')
    url = (url as string).replace('openbayes-server-svc', location.host)

    let token = await getBackend(kernel, 'OPENBAYES_TOKEN')
    if (token.length >= 2) {
        token = (token as string).slice(1, token.length - 1)
    }

    let user = await getBackend(kernel, 'OPENBAYES_ORG')
    if (user.length >= 2) {
        user = (user as string).slice(1, user.length - 1)
    }

    return Env(user, token, url)
}

async function getBackend(
    kernel: Kernel.IKernelConnection,
    name: string
) {
    try {
        return await sendKernelRequest(kernel, `import os;os.environ['${name}']`)
    } catch (error) {
        throw new Error(error)
    }
}

async function createNewKernel() {
    let kernelManager = new KernelManager()
    return await kernelManager.startNew({ name: 'python' })
}

async function sendKernelRequest(
    kernel: Kernel.IKernelConnection,
    runCode: string
): Promise<any> {
    if (!kernel) {
        throw new Error('Kernel is null or undefined.')
    }

    let result = {}

    let future = kernel.requestExecute({
        code: runCode
    })

    future.onIOPub = msg => {
        if (msg.header.msg_type == 'execute_result') {
            if ('data' in msg.content) {
                result = msg.content.data['text/plain']
            }
        }
    }

    await future.done

    return result
}
