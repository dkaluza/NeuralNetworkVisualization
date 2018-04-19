#!/bin/bash

ROOTDIR=$(git rev-parse --show-toplevel)

main()
{
    if [ "$#" -ne 0 ]; then
        echo "No args pls"
        exit 1
    fi

    cd "$ROOTDIR"/backend

    # Kinda hack, should be changed in docker
    export LC_ALL=C.UTF-8
    export LANG=C.UTF-8

    python3 run.py
}

main "$@"
