import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application'
import { MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils'
import { IRunningSessionManagers, IRunningSessions } from '@jupyterlab/running'
// Name-only import so as to not trigger inclusion in main bundle
import * as WidgetModuleType from '@jupyterlab/terminal/lib/widget'
import { ITerminal } from '@jupyterlab/terminal'
import { Terminal } from '@jupyterlab/services'
import { toArray } from '@lumino/algorithm'
import { terminalIcon } from '@jupyterlab/ui-components'

import { BindingsWidget } from './app'
import { getEnvs } from './env'
import {
  DatasetBinding,
  DatasetBindingTypeEnum,
  getBindings,
  JobOutputBinding
} from './api'

export const NAMESPACE = 'openbayes-bindings'

namespace CommandIDs {
  export const createNew = 'bindings-terminal:create-new'
  export const open = 'bindings-terminal:open'
}

/**
 * Initialization data for the jupyterlab-openbayes-bindings extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-openbayes-bindings',
  autoStart: true,
  requires: [ILayoutRestorer],
  activate: async (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    runningSessionManagers: IRunningSessionManagers
  ) => {
    console.log(
      'JupyterLab extension jupyterlab-openbayes-bindings is activated!'
    )

    const { commands } = app

    const createWidget = (
      bindings: Array<JobOutputBinding | DatasetBinding>
    ) => {
      bindings.map((binding, i) => {
        if (runningSessionManagers) {
          let name =
            binding.type === DatasetBindingTypeEnum.DATASET
              ? binding.dataset_id
              : binding.job_id
          addRunningSessionManager(runningSessionManagers, app, name)
        }
      })

      const widget = new BindingsWidget({
        bindings: bindings || [],
        openInTerminal: (id, path) => {
          return commands.execute(CommandIDs.open, {
            name: id,
            path: path
          })
        }
      })

      widget.id = 'openbayes-bindings-widget'
      widget.title.iconClass = 'bindings-icon'
      widget.title.caption = 'OpenBayes Bindings'
      widget.title.closable = true
      widget.addClass('bindings-widget')

      restorer.add(widget, NAMESPACE)
      app.shell.add(widget, 'left', { rank: 101 })
    }

    addCommands(app)

    getEnvs().then(env => {
      getBindings(env.url, env.token).then(
        data => {
          createWidget(data.datasets)
        },
        () => {
          createWidget([])
        }
      )
    })

    return
  }
}

export default extension

function addRunningSessionManager(
  managers: IRunningSessionManagers,
  app: JupyterFrontEnd,
  name: string
) {
  let manager = app.serviceManager.terminals

  managers.add({
    name: name,
    running: () =>
      toArray(manager.running()).map(model => new RunningTerminal(model)),
    shutdownAll: () => manager.shutdownAll(),
    refreshRunning: () => manager.refreshRunning(),
    runningChanged: manager.runningChanged
  })

  class RunningTerminal implements IRunningSessions.IRunningItem {
    constructor(model: Terminal.IModel) {
      this._model = model
    }
    open() {
      void app.commands.execute('terminal:open', { name: this._model.name })
    }
    icon() {
      return terminalIcon
    }
    label() {
      return `terminals/${this._model.name}`
    }
    shutdown() {
      return manager.shutdown(this._model.name)
    }

    private _model: Terminal.IModel
  }
}

function addCommands(app: JupyterFrontEnd) {
  const { commands, serviceManager } = app
  const TERMINAL_ICON_CLASS = 'jp-TerminalIcon'

  const namespace = 'bindings-terminal'
  const tracker = new WidgetTracker<MainAreaWidget<ITerminal.ITerminal>>({
    namespace
  })

  commands.addCommand(CommandIDs.createNew, {
    label: args => (args['isPalette'] ? 'New Terminal' : 'Terminal'),
    caption: 'Start a new terminal session',
    iconClass: args => (args['isPalette'] ? '' : TERMINAL_ICON_CLASS),
    execute: async args => {
      let Terminal: typeof WidgetModuleType.Terminal
      try {
        Terminal = (await Private.ensureWidget()).Terminal
      } catch (err) {
        Private.showErrorMessage(err)
      }

      const name = args['name'] as string
      const path = args['path'] as string

      const session = await (name
        ? serviceManager.terminals.connectTo({ model: { name } })
        : serviceManager.terminals.startNew())

      const term = new Terminal(session, {
        initialCommand: 'cd ' + path + '\n' + 'ls -lhF| head -n 10'
      })

      term.title.icon = TERMINAL_ICON_CLASS
      term.title.label = '...'

      let main = new MainAreaWidget<ITerminal.ITerminal>({ content: term })
      app.shell.add(main)
      await tracker.add(main)
      app.shell.activateById(main.id)
      return main
    }
  })

  commands.addCommand(CommandIDs.open, {
    execute: args => {
      const name = args['name'] as string
      const path = args['path'] as string
      const widget = tracker.find(value => {
        let content = value.content
        return content.session.name === name || false
      })
      if (widget) {
        app.shell.activateById(widget.id)
      } else {
        return commands.execute(CommandIDs.createNew, { name, path })
      }
    }
  })
}

/**
 * A namespace for private data.
 */
namespace Private {
  /**
   * A Promise for the initial load of the terminal widget.
   */
  export let widgetReady: Promise<typeof WidgetModuleType>

  /**
   * Lazy-load the widget (and xterm library and addons)
   */
  export function ensureWidget(): Promise<typeof WidgetModuleType> {
    if (widgetReady) {
      return widgetReady
    }

    widgetReady = import('@jupyterlab/terminal/lib/widget')

    return widgetReady
  }

  /**
   *  Utility function for consistent error reporting
   */
  export function showErrorMessage(error: Error): void {
    console.error(`Failed to configure ${extension.id}: ${error.message}`)
  }
}
