#!/bin/bash

ROOTDIR=$(git rev-parse --show-toplevel)

main()
{
    if [ "$#" -ne 0 ]; then
        echo "No args pls"
        exit 1
    fi

    cd "$ROOTDIR"/frontend/NNVisualization
    npm install
    npm start
}

main "$@"
