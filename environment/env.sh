#!/bin/bash

ROOTDIR=$(git rev-parse --show-toplevel)

DOCKER_COMMAND="docker"
DOCKERFILE_CPU="Dockerfile.cpu"
DOCKERFILE_GPU="Dockerfile.gpu"
IMGTAG_CPU="nnvis-cpu"
IMGTAG_GPU="nnvis-gpu"

DOCKERFILE=$DOCKERFILE_CPU
IMGTAG=$IMGTAG_CPU

usage()
{
    echo 'Usage:'
    echo "$0 start [-gpu] - build and run container (-gpu for gpu-enabled container)"
    echo "$0 connect - connect to running container"
    echo "$0 clean - remove the built image"
}

validate-args()
{
    if [ "$#" -ne 1 -a "$1" != "start" ]; then
        usage
        exit 1
    fi

    if [ "$#" -eq 2 -a "$2" != "-gpu" ]; then
        echo "Unrecognized option $2"
        usage
        exit 1
    fi
}

parse-gpu-args()
{
    if [ "$2" == "-gpu" ]; then
        if ! type "nvidia-docker" 2>/dev/null; then
            echo "nvidia-docker is required for gpu usage - please refer to the documentation for installation guides"
            exit 1
        fi
        DOCKER_COMMAND="nvidia-docker"
        DOCKERFILE=$DOCKERFILE_GPU
        IMGTAG=$IMGTAG_GPU
    elif [ ! -z "$2" ]; then
        echo "Unrecognized option $2"
        usage
        exit 1
    fi
}

do-build()
{
    "$DOCKER_COMMAND" build -t "$IMGTAG" -f "$ROOTDIR/environment/$DOCKERFILE" "$ROOTDIR/environment"
}

do-run()
{
    if [[ "$OSTYPE" == "msys" ]]; then
      ROOTDIR="$(echo "//$ROOTDIR" | tr -d : | sed -e 's|[A-Z]|\l&|')"
    fi
    if [[ "$($DOCKER_COMMAND ps | grep nnvis-container)" -eq 0 ]]; then
        "$DOCKER_COMMAND" run \
               -v $ROOTDIR:/shared \
               --rm=true \
               --name nnvis-container \
               -it \
               -p 4200:4200 \
               "$IMGTAG"
    else
        echo "Already running!"
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

do-clean()
{
    docker rmi "$IMGTAG_CPU" "$IMGTAG_GPU"
}

main()
{
    validate-args "$@"

    case $1 in
        connect|clean)
        if [ "$#" -ne 1 ]; then
            usage
            exit 1
        fi
        do-$1
        ;;
        start)
        parse-gpu-args "$@"
        do-$1
        ;;
        *)
        usage
        ;;
    esac
}

main "$@"
