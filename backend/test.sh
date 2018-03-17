#!/bin/bash

ROOTDIR=$(git rev-parse --show-toplevel)

main()
{
    if [ "$#" -ne 0 ]; then
        echo "No args pls"
        exit 1
    fi

    (
        cd "$ROOTDIR"/backend
        python3 -m unittest discover
    )
}

main "$@"