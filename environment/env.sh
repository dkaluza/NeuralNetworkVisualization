#!/bin/bash

do-build()
{
	docker build -t nnvis "environment"
}

do-run()
{
	if [ $(docker ps | grep nnvis-container) -eq 0 ]; then
		docker run --name nnvis-container -it -d -p 80:80 nnvis
	fi
}

do-connect()
{
	docker attach nnvis-container
}

main()
{
	if [ "$#" -ne 0 ]; then
		echo "No args pls"
		exit 1
	fi

	do-build
	do-run
	do-connect
}

main "$@"

