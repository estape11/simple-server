#!/bin/bash

#**********************************************
#	Programmer: Esteban Aguero Perez (estape11)
#	Language: Bash
#	Version: 0.10
#	Last Modification: 31/05/2021
#	Description: Unistallation script
#**********************************************

realpath() {
  OURPWD=$PWD
  cd "$(dirname "$1")"
  LINK=$(readlink "$(basename "$1")")
  while [ "$LINK" ]; do
    cd "$(dirname "$LINK")"
    LINK=$(readlink "$(basename "$1")")
  done
  REALPATH="$PWD/$(basename "$1")"
  cd "$OURPWD"
  echo "$REALPATH"
}

SCRIPT_DIR=$(realpath "$0" | sed 's|\(.*\)/.*|\1|')
HEADER="Docker | Web Server >"

if [ $UID != 0 ]; then
	echo $HEADER "Error: Script must be executed as root"
	exit 1
fi

echo $HEADER "Erasing files"
rm -rf /etc/simple-server/webserver/

echo $HEADER "Removing container"
docker stop webserver 2>/dev/null
docker rm webserver 2>/dev/null

echo $HEADER "Completed"