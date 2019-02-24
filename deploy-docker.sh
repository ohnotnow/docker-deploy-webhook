#!/bin/bash

set -Eeuo pipefail

# Make sure the user passed a project path to deploy
if [ "$#" -ne 1 ];
then
    echo "You must supply a project path..."
    exit 1
fi

PROJ_DIR=$1
PROJECT_NAME=`basename ${PROJ_DIR}`

# Check the project exists
if [ ! -d "${PROJ_DIR}" ];
then
	echo "No matching project dir..."
	exit 2
fi

# Check the stack file exists
if [ ! -f "${PROJ_DIR}/stack.yml" ];
then
	echo "No stack.yml file for project..."
	exit 3
fi

# If there is a .env file in the project, export all the variables in it
if [ -f "${PROJ_DIR}/.env" ];
then
	OS=`uname -s`

	if [ "${OS}" = "Linux" ];
	then
	    XARG_OPT="-d '\n'"
	else
		XARG_OPT="-0"
	fi

	export $(grep -v '^#' "${PROJ_DIR}/.env" | xargs "${XARG_OPT}")
fi

# Now actually deploy the stack
echo docker stack deploy -c "${PROJ_DIR}/stack.yml" "${PROJECT_NAME}"
