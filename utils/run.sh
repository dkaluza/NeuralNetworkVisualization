#!/bin/bash

ROOTDIR=$(git rev-parse --show-toplevel)

main()
{
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
