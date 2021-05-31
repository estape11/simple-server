#!/bin/bash

#**********************************************
#	Programmer: Esteban Aguero Perez (estape11)
#	Language: Bash
#	Version: 0.10
#	Last Modification: 31/05/2021
#	Description: Dependencies install
#**********************************************

SCRIPT_DIR=$(realpath "$0" | sed 's|\(.*\)/.*|\1|')
HEADER="Dependencies | Web Server >"

if [ $UID != 0 ]; then
	echo $HEADER "Error: Script must be executed as root"
	exit 1
fi

apt-get update -y
apt-get install \
	apt-transport-https \
	ca-certificates \
	curl \
	gnupg-agent \
	software-properties-common -y

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
apt-key fingerprint 0EBFCD88 -y
add-apt-repository \
"deb [arch=amd64] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) \
stable" -y

apt-get update -y

apt-get install docker-ce docker-ce-cli containerd.io -y