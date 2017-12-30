#!/bin/bash

ROOTDIR=$(git rev-parse --show-toplevel)

do-build()
{
    docker build -t nnvis "$ROOTDIR/environment"
}

do-run()
{
    if [[ "$(docker ps | grep nnvis-container)" -eq 0 ]]; then
        docker run \
               -v $ROOTDIR:/shared \
               --rm=true \
               --name nnvis-container \
               -it \
               -p 80:80 \
               nnvis
    fi
}

main()
{
    if [ "$#" -ne 0 ]; then
        echo "No args pls"
        exit 1
    fi

    do-build
    do-run
}

main "$@"

