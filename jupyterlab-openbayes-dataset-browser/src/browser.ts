import {
    ILayoutRestorer, IRouter, JupyterFrontEnd, JupyterFrontEndPlugin,
} from "@jupyterlab/application";

import {
    ContentsManager,
} from "@jupyterlab/services";

import {
    DocumentRegistry,
} from "@jupyterlab/docregistry";

import {
    IDocumentManager,
} from "@jupyterlab/docmanager";

import {
    PageConfig, PathExt, URLExt,
} from "@jupyterlab/coreutils";

import {
    IWindowResolver,
} from "@jupyterlab/apputils";

import {
    PanelLayout, Widget,
} from "@phosphor/widgets";

import "../style/index.css";

namespace CommandIDs {
    export const navigate = "datasetbrowser:navigate";
    export const toggle = "datasetbrowser:toggle";
    export const select = "datasetbrowser:select";
    export const set_context = "datasetbrowser:set-context";
}

namespace Patterns {

    export const tree = new RegExp(`^${PageConfig.getOption("treeUrl")}([^?]+)`);
    export const workspace = new RegExp(`^${PageConfig.getOption("workspacesUrl")}[^?\/]+/tree/([^?]+)`);

}

export class DatasetBrowserWidget extends Widget {
    public cm: ContentsManager;
    public dr: DocumentRegistry;
    public commands: any;
    public table: HTMLTableElement;
    public tree: HTMLElement;
    public controller: any;
    public selected: string;
    public basepath: string;

    constructor(lab: JupyterFrontEnd,
                basepath: string = "",
                id: string = "jupyterlab-datasetbrowser") {
        super();
        this.id = id;
        this.title.iconClass = "datasetbrowser-icon";
        this.title.caption = "Dataset Browser";
        this.title.closable = true;
        this.addClass("jp-datasetbrowser-widget");
        this.addClass(id);

        this.cm = lab.serviceManager.contents;
        this.dr = lab.docRegistry;
        this.commands = lab.commands;
        this.controller = {};
        this.selected = "";

        this.layout = new PanelLayout();
        this.basepath = basepath === "" ? basepath : basepath + ":";

        const base = this.cm.get(this.basepath);
        base.then((res) => {
            this.controller[""] = {last_modified: res.last_modified, open: true};

            const result = [];

            for (const index in res.content) {
                if (res.content[index].name === "input") {
                    result.push(res.content[index]);
                }
            }

            const table = this.buildTable(["Name", "Size"], result);
            this.node.appendChild(table);


            const row = 'input';
            const level = 2;
            let row_element = this.node.querySelector("[id='" + btoa(row) + "']") as HTMLElement;

            if (row_element.nextElementSibling && atob(row_element.nextElementSibling.id).startsWith(row + "/")) { // next element in folder, already constructed
                const display = switchView((this.node.querySelector("[id='" + row_element.nextElementSibling.id + "']") as HTMLElement).style.display);
                this.controller[row].open = !(this.controller[row].open);
                const open_flag = this.controller[row].open;
                // open folder
                while (row_element.nextElementSibling && atob(row_element.nextElementSibling.id).startsWith(row + "/")) {
                    row_element = (this.node.querySelector("[id='" + row_element.nextElementSibling.id + "']") as HTMLElement);
                    // check if the parent folder is open
                    if (!(open_flag) || this.controller[PathExt.dirname(atob(row_element.id))].open) {
                        row_element.style.display = display;
                    }
                }
            } else { // if children elements don't exist yet
                const base = lab.serviceManager.contents.get(this.basepath + row);
                base.then((res) => {
                    this.buildTableContents(res.content, level, row_element);
                    this.controller[row] = {last_modified: res.last_modified, open: true};
                });
            }
        });
    }

    public buildTable(headers: any, data: any) {
        const table = document.createElement("table");
        table.className = "datasetbrowser-head";
        const thead = table.createTHead();
        const tbody = table.createTBody();
        tbody.id = "datasetbrowser-body";
        const headRow = document.createElement("tr");
        headers.forEach((el: string) => {
            const th = document.createElement("th");
            th.align = "left";
            th.className = "datasetbrowser-header";
            th.appendChild(document.createTextNode(el));
            headRow.appendChild(th);
        });
        headRow.children[headRow.children.length - 1].className += " modified";
        thead.appendChild(headRow);
        table.appendChild(thead);

        this.table = table;
        this.tree = tbody;
        this.buildTableContents(data, 1, "");

        table.appendChild(tbody);

        return table;
    }

    public buildTableContents(data: any, level: number, parent: any) {
        const commands = this.commands;
        const map = this.sortContents(data);
        for (const index in data) {
            const sorted_entry = map[parseInt(index)];
            const entry = data[sorted_entry[1]];
            const tr = this.createTreeElement(entry, level);

            let path = entry.path;
            if (path.startsWith("/")) {
                path = path.slice(1);
            }

            tr.oncontextmenu = () => { commands.execute((CommandIDs.set_context + ":" + this.id), {path}); };

            if (entry.type === "directory") {
                tr.onclick = (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    commands.execute((CommandIDs.select + ":" + this.id), {path});
                    commands.execute((CommandIDs.toggle + ":" + this.id), {row: path, level: level + 1});
                };

                if (!(path in this.controller)) {
                    this.controller[path] = {last_modified: entry.last_modified, open: false};
                }
            } else {
                tr.onclick = (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    commands.execute((CommandIDs.select + ":" + this.id), {path});
                };
                tr.ondblclick = () => { commands.execute("docmanager:open", {path: this.basepath + path}); };
            }

            if (level === 1) {
                this.tree.appendChild(tr);
            } else {
                parent.after(tr);
                parent = tr;
            }
        }
    }

    public sortContents(data: any) {
        const names = [];
        for (const i in data) {
            names[names.length] = [data[i].name, parseInt(i)];
        }
        return names.sort();
    }

    public createTreeElement(object: any, level: number) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        const td1 = document.createElement("td");
        tr.className = "datasetbrowser-item";

        const icon = document.createElement("span");
        icon.className = "jp-DirListing-itemIcon ";
        if (object.type === "directory") {
            icon.className += this.dr.getFileType("directory").iconClass;
            tr.className += " datasetbrowser-folder";
        } else {
            const iconClass = this.dr.getFileTypesForPath(object.path);
            tr.className += " datasetbrowser-file";
            if (iconClass.length === 0) {
                icon.className += this.dr.getFileType("text").iconClass;
            } else {
                icon.className += this.dr.getFileTypesForPath(object.path)[0].iconClass;
            }
        }

        // icon and name
        td.appendChild(icon);
        const title = document.createElement("span");
        title.innerHTML = object.name;
        title.className = "datasetbrowser-name-span";
        td.appendChild(title);
        td.className = "datasetbrowser-item-name";
        td.style.setProperty("--indent", level + "em");

        // file size
        const size = document.createElement("span");
        size.innerHTML = fileSizeString(object.size);
        td1.className = "datasetbrowser-attribute";
        td1.appendChild(size);

        tr.appendChild(td);
        tr.appendChild(td1);
        tr.id = btoa(object.path);

        return tr;
    }

}

function switchView(mode: any) {
    if (mode === "none") { return ""; } else { return "none"; }
}

function fileSizeString(fileBytes: number) {
    if (fileBytes == null) {
        return "";
    }
    if (fileBytes < 1024) {
        return fileBytes + " B";
    }

    let i = -1;
    const byteUnits = [" KB", " MB", " GB", " TB"];
    do {
        fileBytes = fileBytes / 1024;
        i++;
    } while (fileBytes > 1024);

    return Math.max(fileBytes, 0.1).toFixed(1) + byteUnits[i];
}

function activate(app: JupyterFrontEnd, paths: JupyterFrontEnd.IPaths, resolver: IWindowResolver, restorer: ILayoutRestorer, manager: IDocumentManager, router: IRouter) {
    // tslint:disable-next-line: no-console
    console.log("JupyterLab extension jupyterlab-openbayes-dataset-browser is activated!");
    constructDatasetBrowserWidget(app, "", "dataset-browser", "left", paths, resolver, restorer, manager, router);
}

export
function constructDatasetBrowserWidget(app: JupyterFrontEnd,
                                       basepath: string = "",
                                       id: string = "dataset-browser",
                                       side: string = "left",
                                       paths: JupyterFrontEnd.IPaths,
                                       resolver: IWindowResolver,
                                       restorer: ILayoutRestorer,
                                       manager: IDocumentManager,
                                       router: IRouter) {

    const widget = new DatasetBrowserWidget(app, basepath, id || "jupyterlab-datasetbrowser");
    restorer.add(widget, widget.id);
    app.shell.add(widget, side, {rank: 101});



    app.commands.addCommand((CommandIDs.toggle + ":" + widget.id), {
        execute: (args) => {
            const row = args.row as string;
            const level = args.level as number;

            let row_element = widget.node.querySelector("[id='" + btoa(row) + "']") as HTMLElement;

            if (row_element.nextElementSibling && atob(row_element.nextElementSibling.id).startsWith(row + "/")) { // next element in folder, already constructed
                const display = switchView((widget.node.querySelector("[id='" + row_element.nextElementSibling.id + "']") as HTMLElement).style.display);
                widget.controller[row].open = !(widget.controller[row].open);
                const open_flag = widget.controller[row].open;
                // open folder
                while (row_element.nextElementSibling && atob(row_element.nextElementSibling.id).startsWith(row + "/")) {
                    row_element = (widget.node.querySelector("[id='" + row_element.nextElementSibling.id + "']") as HTMLElement);
                    // check if the parent folder is open
                    if (!(open_flag) || widget.controller[PathExt.dirname(atob(row_element.id))].open) {
                        row_element.style.display = display;
                    }
                }
            } else { // if children elements don't exist yet
                const base = app.serviceManager.contents.get(widget.basepath + row);
                base.then((res) => {
                    widget.buildTableContents(res.content, level, row_element);
                    widget.controller[row] = {last_modified: res.last_modified, open: true};
                });
            }
        },
    });

    app.commands.addCommand((CommandIDs.navigate + ":" + widget.id), {
        execute: async (args) => {
            const treeMatch = router.current.path.match(Patterns.tree);
            const workspaceMatch = router.current.path.match(Patterns.workspace);
            const match = treeMatch || workspaceMatch;
            const path = decodeURI(match[1]);
            // const { page, workspaces } = app.info.urls;
            const workspace = PathExt.basename(resolver.name);
            const url =
                (workspaceMatch ? URLExt.join(paths.urls.workspaces, workspace) : paths.urls.app) +
                router.current.search +
                router.current.hash;

            router.navigate(url);

            try {
                const tree_paths: string[] = [];
                const temp: string[] = path.split("/");
                let current: string = "";
                for (const t in temp) {
                    current += (current === "") ? temp[t] : "/" + temp[t];
                    tree_paths.push(current);
                }
                const array: Array<Promise<any>> = [];
                tree_paths.forEach((key) => {
                    array.push(app.serviceManager.contents.get(key));
                });
                Promise.all(array).then((results) => {
                    for (const r in results) {
                        if (results[r].type === "directory") {
                            const row_element = widget.node.querySelector("[id='" + btoa(results[r].path) + "']");
                            widget.buildTableContents(results[r].content, 1 + results[r].path.split("/").length, row_element);
                        }
                    }
                });
            } catch (error) {
                // tslint:disable-next-line: no-console
                console.warn("Tree routing failed.", error);
            }
        },
    });

    router.register({ command: (CommandIDs.navigate + ":" + widget.id), pattern: Patterns.tree });
    router.register({ command: (CommandIDs.navigate + ":" + widget.id), pattern: Patterns.workspace });

    app.commands.addCommand((CommandIDs.set_context + ":" + widget.id), {
        execute: (args) => {
            if (widget.selected !== "") {
                const element = (widget.node.querySelector("[id='" + btoa(widget.selected) + "']") as HTMLElement);
                if (element !== null) {
                    element.className = element.className.replace("selected", "");
                }
            }
            widget.selected = args.path as string;
            if (widget.selected !== "") {
                const element = widget.node.querySelector("[id='" + btoa(widget.selected) + "']");
                if (element !== null) {
                    element.className += " selected";
                }
            }
        },
        label: "Need some Context",
    });

    app.commands.addCommand((CommandIDs.select + ":" + widget.id), {
        execute: (args) => {
            if (widget.selected !== "") {
                // tslint:disable-next-line: no-shadowed-variable
                const element = (widget.node.querySelector("[id='" + btoa(widget.selected) + "']") as HTMLElement);
                if (element !== null) {
                    element.className = element.className.replace("selected", "");
                }
            }
            if (args.path === "") { return; }
            widget.selected = args.path as string;
            const element = widget.node.querySelector("[id='" + btoa(widget.selected) + "']");
            if (element !== null) {
                element.className += " selected";
            }
        },
        label: "Select",
    });

    // remove context highlight on context menu exit
    document.ondblclick = () => { app.commands.execute((CommandIDs.set_context + ":" + widget.id), {path: ""}); };
    widget.node.onclick = (event) => { app.commands.execute((CommandIDs.select + ":" + widget.id), {path: ""}); };
}

const extension: JupyterFrontEndPlugin<void> = {
    activate,
    autoStart: true,
    id: "jupyterlab-openbayes-dataset-browser",
    requires: [JupyterFrontEnd.IPaths, IWindowResolver, ILayoutRestorer, IDocumentManager, IRouter],
};

export default extension;
