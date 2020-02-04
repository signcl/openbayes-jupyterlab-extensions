import * as React from 'react';
import * as ReactDOM from "react-dom";

import { Widget } from '@phosphor/widgets';

export const NAMESPACE = 'openbayes-bindings';

export class BindingsWidget extends Widget {

    constructor() {
        super();

        let tsx = (<h1> Bindings </h1>);

        ReactDOM.render(tsx, this.node)
    }
}



