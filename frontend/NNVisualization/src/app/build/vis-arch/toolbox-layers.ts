export interface ToolboxLayer {
    id: string;
    label: string;
    shortcut: string;
    color: string;
}

export const layerTemplates: ToolboxLayer[] = [
    {
        id: 'input',
        label: 'Input',
        shortcut: 'input',
        color: '#994499'
    }, {
        id: 'fc',
        label: 'Fully Connected',
        shortcut: 'fc',
        color: '#00FF00'
    }, {
        id: 'conv',
        label: 'Convolution',
        shortcut: 'conv',
        color: '#6666aa'
    }, {
        id: 'pool',
        label: 'Pooling',
        shortcut: 'pool',
        color: '#bbaa77'
    }, {
        id: 'dropout',
        label: 'Dropout',
        shortcut: 'dropout',
        color: '#77bbaa'
    }, {
        id: 'batch_norm',
        label: 'Batch Normalization',
        shortcut: 'batch norm',
        color: '#aa88a4'
    }, {
        id: 'add',
        label: 'Add',
        shortcut: 'add',
        color: '#58a7a7'
    }, {
        id: 'concat',
        label: 'Concatenation',
        shortcut: 'concat',
        color: '#99a355'
    }, {
        id: 'softmax',
        label: 'Softmax',
        shortcut: 'softmax',
        color: '#abab65'
    }
];
