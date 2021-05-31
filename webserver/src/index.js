/*
***********************************************
	Programmer: Esteban Aguero Perez (estape11)
	Language: JavaScript (node.js)
	Version: 0.20
	Last modification: 31/05/2021
	Description: Web Server
***********************************************
*/

// Dependencias requeridas
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const forceSsl = require("express-force-ssl");
const https = require("https");
const http = require("http");
const argv = require("minimist")(process.argv.slice(2));
const path = require("path");
const history = require("connect-history-api-fallback");
const helmet = require("helmet");
const Ddos = require("ddos");

function Print(dato) {
  console.log(`Server > ${dato}`);
}

// Carga los ajustes de desde el archivo de ajustes
function CargarConfiguracion(archivo) {
  let exito = false;
  try {
    let contents = fs.readFileSync(archivo, "utf8");
    if (contents !== undefined) {
      Print(`Cargando configuraciones desde: ${archivo}`);
      let res = contents.split("\n");
      res.forEach((element) => {
        if (element[0] !== "#" && element !== "") {
          let temp = element.split("=");
          if (temp[0] === "PORT") {
            puerto = parseInt(temp[1]);
          } else if (temp[0] === "SECURE_PORT") {
            puertoSeguro = parseInt(temp[1]);
          } else if (temp[0] === "PUBLIC_PATH") {
            if (temp[1][0] === "/" && temp[1] !== __dirname) {
              // Verifica ruta absoluta
              rutaPublica = temp[1];
            }
          } else if (temp[0] === "FORCE_SSL") {
            if (temp[1] === "false") {
              forzarSSL = false;
            } else {
              forzarSSL = true;
            }
          }
        }
      });
      Print("Configuracion cargada con exito");
      exito = true;
    }
  } catch (ex) {
    Print("Error: Archivo de configuracion no cargado");
  }

  if (!exito) {
    Print("Alerta: Configuracion por defecto");
  }

  return exito;
}

// Valores configurables
let puerto = 80;
let puertoSeguro = 443;
let rutaPublica = `${__dirname}/public`;
let forzarSSL = true;

// Carga de configuraciones
if (argv.c !== undefined) {
  CargarConfiguracion(argv.c);
} else if (argv.conf_file !== undefined) {
  CargarConfiguracion(argv.conf_file);
} else if (argv.test !== undefined || argv.t !== undefined) {
  console.log("SRV0000");
  process.exit(0);
}

// Carga de certificados
let privateKey = null;
let certificate = null;
let ca = null;
try {
  privateKey = fs.readFileSync(`${__dirname}/encryption/private.key`, "utf8");
  certificate = fs.readFileSync(
    `${__dirname}/encryption/certificate.crt`,
    "utf8"
  );
  ca = fs.readFileSync(`${__dirname}/encryption/ca.crt`, "utf8");
} catch (ex) {
  Print("Error: Certificados no encontrados");
  process.exit(1);
}

// Certificado HTTPS
const certificado = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

// Instancia del server
const server = express();
const ddos = new Ddos({ burst: 15, limit: 150 });

// Configuracion del server
if (forzarSSL === true) {
  server.use(forceSsl);
}

const staticFileMiddleware = express.static(path.join(rutaPublica));

server.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
server.use(ddos.express);
server.use(history());
server.use(staticFileMiddleware);
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(function (req, res, next) {
  res.setTimeout(150000, function () {
    // time-out de 00:02:30
    Print("Alerta: Time-out");
    //res.sendStatus(408);
    res.status(408);
  });
  next();
});

// Se inicializa el server seguro
https
  .createServer(certificado, server)
  .listen(puertoSeguro, () => {
    Print(`server Seguro iniciado | Puerto: ${puertoSeguro}`);
  })
  .on("error", (err) => {
    Print("Error: server Seguro no iniciado");
  });

// Se inicializa el server normal
http
  .createServer(server)
  .listen(puerto, () => {
    Print(`server iniciado | Puerto: ${puerto}`);
  })
  .on("error", (err) => {
    Print("Error: server no iniciado");
  });

// Rutas que maneja el server
server.get("*", function (req, res) {
  let temp = `${rutaPublica}${req.originalUrl}`;
  fs.exists(temp, (exists) => {
    if (exists) {
      try {
        res.sendFile(temp);
      } catch (ex) {
        Print(`Error: Archivo no enviado > ${ex}`);
        Print(ex);
        //res.send( { message: "ERR" } );
        res
          .status("404")
          .send(`<script> location.href = "/404.html"; </script>`);
      }
    } else {
      // Retornar error.html
      Print("Alerta: Archivo solicitado no encontrado > " + temp);
      //res.send( { message: "ERR" } );
      res.status("404").send(`<script> location.href = "/404.html"; </script>`);
    }
  });
});

// Solicitudes no aceptadas
server.post("*", function (req, res) {
  res.status(404).send({ message: "Solicitud no encontrada" });
});

server.put("*", function (req, res) {
  res.status(404).send({ message: "Solicitud no encontrada" });
});
