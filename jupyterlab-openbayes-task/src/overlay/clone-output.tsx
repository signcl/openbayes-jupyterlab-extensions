import { NotebookPanel } from '@jupyterlab/notebook';
import { notebookIcon } from '@jupyterlab/ui-components';
import { isCodeCellModel } from '@jupyterlab/cells';

import { UUID } from '@lumino/coreutils';
import { Panel,Widget } from '@lumino/widgets';


export namespace ClonedOutputArea {
  export interface IOptions {
    /**
     * The notebook associated with the cloned output area.
     */
    notebook: NotebookPanel;
  }
}
export class ClonedOutputArea extends Panel {
  constructor(options: ClonedOutputArea.IOptions) {
    super();
    this._notebook = options.notebook;

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
      this.getCellList();
    });
  }

  getCellList(){
    const current = this._notebook;
    const nbWidget = current.content;
    const recordList = JSON.parse(nbWidget.model.metadata.get('cellRecords').toString())
    const cells = nbWidget.widgets;

    if(Object.keys(recordList).length === 0){
      console.log('Code snippet not selected')
      return;
    }
    for(let key in recordList){
      cells.forEach(c=>{
        const isCodeCell = isCodeCellModel(c.model)
        if (isCodeCell && c.model.id === key) {
          let beigin = `#################### cell ${key} begin #################### \n\n`
          this.createWidget(beigin);
          let cellValue = c.model.value.text.split('\n');
          cellValue.forEach(content=>{
            this.createWidget(content);
          })
          let end = `#################### cell ${key} end #################### \n\n`;
          this.createWidget(end);
        }
      })
    }
  }

  createWidget(content:string){
      let contentDom = new Widget({ node: document.createElement('div') });
      contentDom.node.textContent = content;
      this.addWidget(contentDom);
  }

  private _notebook: NotebookPanel;
  // private _widgetList:Array<Widget>;
}