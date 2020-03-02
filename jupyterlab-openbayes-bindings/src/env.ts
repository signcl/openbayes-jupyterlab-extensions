import { Kernel } from '@jupyterlab/services'

interface IEnv {
  url: string
  token: string
}

function Env(url: string, token: string): IEnv {
  return { url, token }
}

export async function getEnvs(): Promise<IEnv> {
  const kernel: Kernel.IKernel = await createNewKernel()
  window.addEventListener('beforeunload', () => kernel.shutdown())
  let url = await getBackend(kernel, 'OPENBAYES_JOB_URL')
  if (url.length >= 2) {
    url = (url as string).slice(1, url.length - 1)
  }
  url = (url as string).replace('http://', 'https://')
  url = (url as string).replace('openbayes-server-svc', location.host)

  let token = await getBackend(kernel, 'OPENBAYES_TOKEN')
  token = (token as string).replace("'", '')
  return Env(url, token)
}

export async function getBackend(kernel: Kernel.IKernel, name: string) {
  try {
    return await sendKernelRequest(
      kernel,
      `import os;os.environ['${name}']`,
      {}
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function createNewKernel() {
  let options: Kernel.IOptions = await Kernel.getSpecs().then(kernelSpecs => {
    return { name: kernelSpecs.default }
  })
  return await Kernel.startNew(options).then(_kernel => {
    return _kernel
  })
}

async function sendKernelRequest(
  kernel: Kernel.IKernelConnection,
  runCode: string,
  userExpressions: any,
  runSilent: boolean = false,
  storeHistory: boolean = false,
  allowStdIn: boolean = false,
  stopOnError: boolean = false
): Promise<any> {
  if (!kernel) {
    throw new Error('Kernel is null or undefined.')
  }

  await kernel.ready

  let result = {}

  let future = kernel.requestExecute({
    allow_stdin: allowStdIn,
    code: runCode,
    silent: runSilent,
    stop_on_error: stopOnError,
    store_history: storeHistory,
    user_expressions: userExpressions
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
