// let select = new SelectTypeExtension({
//   runCodes: async() => {
//     let codes:string = '';
//     const notebookPanel = tracker.currentWidget;

//     if (notebookPanel === null) {
//       return
//     }

//     const nbWidget = notebookPanel.content;
//     const Type = notebookPanel.content.model.metadata.get('selectType');

//     if(Type === 'Default'){

//     } else if(Type === 'Task'){
//       // 组合多段代码
//       const recordList = JSON.parse(nbWidget.model.metadata.get('cellRecords').toString())
//       const cells = nbWidget.widgets;
//       if(Object.keys(recordList).length === 0){
//         console.log('Code snippet not selected')
//         return;
//       }
//       for(let key in recordList){
//         cells.forEach(c=>{
//           const isCodeCell = isCodeCellModel(c.model)
//           if (isCodeCell && c.model.id === key) {
//             codes += `#################### cell ${key} begin #################### \n\n`
//             codes += c.model.value.text + '\n\n'
//             codes += `#################### cell ${key} end #################### \n\n`
//           }
//         })
//       }
//       console.log(codes)
//     }
//     const { commands } = app;

//     let model = await commands.execute('docmanager:new-untitled', {
//       path: "/",
//       type: 'file',
//       ext: 'py'
//     })

//     model.content = codes;
//     model.format = 'text'
//     await app.serviceManager.contents.save(model.path, model);

//     const opener: DocumentManager.IWidgetOpener = {
//       open: widget => {
//         if (!widget.id) {
//           widget.id = `document-manager-${++Private.id}`;
//         }
//         widget.title.dataset = {
//           'type': 'document-title',
//           ...widget.title.dataset
//         };
//         if (!widget.isAttached) {
//           app.shell.add(widget, "main");
//         }
//         app.shell.activateById(widget.id);
//       }
//     };
//     const registry = app.docRegistry;
//     const docManager = new DocumentManager({ registry: registry, manager: app.serviceManager, opener: opener });

//     model = await renameDialog(docManager, model.path).catch(error => {
//       if (error !== 'File not renamed') {
//         void showErrorMessage('Rename Error', error);
//       }
//     })
//   }
// });
