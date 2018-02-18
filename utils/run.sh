#!/bin/bash

ROOTDIR=$(git rev-parse --show-toplevel)

cleanup()
{
    echo ""
    echo "Cleaning up"
    kill 0
}

main()
{
    trap "exit" SIGINT SIGTERM ERR
    trap cleanup EXIT
    if [ "$#" -ne 0 ]; then
        echo "No args pls"
        exit 1
    fi

    cd "$ROOTDIR"
    ./frontend/start.sh &
    P1=$!
    ./backend/start.sh &
    P2=$!
    wait $P1 $P2
}

main "$@"
