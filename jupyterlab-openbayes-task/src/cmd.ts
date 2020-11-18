import { Kernel, KernelManager } from '@jupyterlab/services'

export async function runTask(path: string) {
    const kernel: Kernel.IKernelConnection = await createNewKernel()
    window.addEventListener('beforeunload', () => kernel.shutdown())
    await gearRunTask(kernel, path)
}

export async function gearRunTask(
    kernel: Kernel.IKernelConnection,
    path: string,
) {
    try {
        return await sendKernelRequest(kernel, `import os;os.system('bayes gear init;bayes gear run task -- python ${path}')`)
    } catch (error) {
        throw new Error(error)
    }
}

export async function createNewKernel() {
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
