import { NotebookPanel } from '@jupyterlab/notebook';

import { notebookIcon } from '@jupyterlab/ui-components';

import { CodeCell } from '@jupyterlab/cells';

import { ArrayExt } from '@lumino/algorithm';
import { UUID } from '@lumino/coreutils';
import { Panel } from '@lumino/widgets';

export namespace ClonedOutputArea {
  export interface IOptions {
    /**
     * The notebook associated with the cloned output area.
     */
    notebook: NotebookPanel;

    /**
     * The cell for which to clone the output area.
     */
    cell?: CodeCell;

    /**
     * If the cell is not available, provide the index
     * of the cell for when the notebook is loaded.
     */
    index?: number;

    /**
     * If the cell is not available, provide the index
     * of the cell for when the notebook is loaded.
     */
    // translator?: ITranslator;
  }
}
export class ClonedOutputArea extends Panel {
  constructor(options: ClonedOutputArea.IOptions) {
    super();
    this._notebook = options.notebook;
    this._index = options.index !== undefined ? options.index : -1;
    this._cell = options.cell || null;
    this.id = `LinkedOutputView-${UUID.uuid4()}`;
    this.title.label = 'Output View';
    this.title.icon = notebookIcon;
    this.title.caption = this._notebook.title.label
      ? `For Notebook: %1 ${this._notebook.title.label}`
      : 'For Notebook:';
    this.addClass('jp-LinkedOutputView');

    // Wait for the notebook to be loaded before
    // cloning the output area.
    void this._notebook.context.ready.then(() => {
      if (!this._cell) {
        this._cell = this._notebook.content.widgets[this._index] as CodeCell;
      }
      if (!this._cell || this._cell.model.type !== 'code') {
        this.dispose();
        return;
      }
      const clone = this._cell.cloneOutputArea();
      this.addWidget(clone);
    });
  }

  /**
   * The index of the cell in the notebook.
   */
  get index(): number {
    return this._cell
      ? ArrayExt.findFirstIndex(
          this._notebook.content.widgets,
          c => c === this._cell
        )
      : this._index;
  }

  /**
   * The path of the notebook for the cloned output area.
   */
  get path(): string {
    return this._notebook.context.path;
  }

  private _notebook: NotebookPanel;
  private _index: number;
  private _cell: CodeCell | null = null;
}