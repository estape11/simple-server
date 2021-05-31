#!/bin/bash

#**********************************************
#	Programmer: Esteban Aguero Perez (estape11)
#	Language: Bash
#	Version: 0.10
#	Last Modification: 31/05/2021
#	Description: Installation script
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

if [[ $1 == "-d" || $1 == "--dependencies" ]]; then
	bash $SCRIPT_DIR/dependencies.sh

fi

echo $HEADER "Creating folders"
mkdir -p /etc/simple-server/webserver/

echo $HEADER "Copying files"
cp -rf $SCRIPT_DIR/src/public/ /etc/simple-server/webserver/public/

echo $HEADER "Removing already created containers"
docker stop webserver 2>/dev/null
docker rm webserver 2>/dev/null

echo $HEADER "Building container"
docker build --tag=webserver $SCRIPT_DIR
docker run --publish 80:80 --publish 443:443 \
           --volume /etc/simple-server/webserver/public/:/usr/src/simple-server/webserver/public/ \
           --name webserver --detach webserver

echo $HEADER "Completed"