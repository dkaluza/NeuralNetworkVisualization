export interface ToolboxLayer {
    id: string;
    label: string;
    shortcut: string;
    color: string;
}

export const layerTemplates: ToolboxLayer[] = [
    {
        id: 'conv',
        label: 'Convolution',
        shortcut: 'conv',
        color: '#6666aa'
    }, {
        id: 'fc',
        label: 'Fully Connected',
        shortcut: 'fc',
        color: '#00FF00'
    }, {
        id: 'input',
        label: 'Input',
        shortcut: 'input',
        color: '#994499'
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
        color: '#7812a4'
    }
];