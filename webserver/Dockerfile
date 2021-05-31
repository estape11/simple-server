#**********************************************
#	Programmer: Esteban Aguero Perez (estape11)
#	Language: Dockerfile
#	Version: 0.10
#	Last Modification: 31/05/2021
#	Description: Dockerfile Web Server
#**********************************************

# Ubuntu 20.04 + NodeJS
FROM estape11/ubuntu-node:20.04

WORKDIR /usr/src/simple-server/webserver

COPY src /usr/src/simple-server/webserver

# DEV
# RUN npm install

# PROD
RUN npm ci --only=production

# Run the app
CMD [ "npm", "start"]

# Used ports, should match the server.conf
EXPOSE 80 443