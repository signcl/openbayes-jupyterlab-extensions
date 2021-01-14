import { NotebookPanel } from '@jupyterlab/notebook';

import { notebookIcon } from '@jupyterlab/ui-components';

import { UUID } from '@lumino/coreutils';
import { Panel,Widget } from '@lumino/widgets';

export namespace ClonedOutputArea {
  export interface IOptions {
    /**
     * The notebook associated with the cloned output area.
     */
    notebook: NotebookPanel;

    /**
     * task select cell content
     */
    cellContent:any;
  }
}
export class ClonedOutputArea extends Panel {
  constructor(options: ClonedOutputArea.IOptions) {
    super();
    this._notebook = options.notebook;
    this._cellContent = options.cellContent;

    this.id = `LinkedOutputView-${UUID.uuid4()}`;
    this.title.label = 'Select View';
    this.title.icon = notebookIcon;
    this.title.caption = this._notebook.title.label
      ? `For Notebook: %1 ${this._notebook.title.label}`
      : 'For Notebook:';
    this.addClass('jp-LinkedOutputView');

    // Wait for the notebook to be loaded before
    // cloning the output area.
    void this._notebook.context.ready.then(() => {
      if(!this._cellContent){
        console.log('无内容');
        return;
      }
      const content = this._cellContent;
      let contentDom = new Widget({ node: document.createElement('div') });
      // contentDom.addClass('jp-GatherLabel');
      contentDom.node.textContent = content;
      this.addWidget(contentDom);
    });
  }

  private _notebook: NotebookPanel;
  private _cellContent:any;
}