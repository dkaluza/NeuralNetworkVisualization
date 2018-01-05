#!/bin/bash

ROOTDIR=$(git rev-parse --show-toplevel)

usage()
{
    echo 'Usage:'
    echo "$0 start - build and run container"
    echo "$0 connect - connect to running container"
}

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
               -p 4200:4200 \
               nnvis
    fi
}

do-start()
{
    do-build
    do-run
}

do-connect()
{
    docker exec -it nnvis-container /bin/bash
}

main()
{
    if [ "$#" -ne 1 ]; then
        usage
        exit 1
    fi

    case $1 in
        start|connect) do-$1 ;;
        *) usage ;;
    esac
}

main "$@"

