const restify = require('restify'),https = require('restify-https');
const errs = require('restify-errors');
const corsMiddleware = require('restify-cors-middleware');
const fs = require('fs');
const bodyParser = require('body-parser');
const validationContract = require('../validator/validator');
const comum = require('../comum/comum');
const usuario = require('../comum/usuario');
const config = require('../comum/config');

//Criando servidor Restify
const server = restify.createServer({
    name: 'myKnextifyAPI',
    version: '1.0.0'
});


//Utilizando CORS, https, plugins restify, body-parser e query-parser
var cors = corsMiddleware({
    preflightMaxAge: 5,
    origins: ['*'],
    allowHeaders: ['*', 'Authorization'],
    exposeHeaders: []
});

server.pre(cors.preflight);
server.use(cors.actual);
server.use(https({ override: false }));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.bodyParser({
    mapParams: true,
    mapFiles: false,
    overrideParams: false
}));

server.use(restify.plugins.queryParser());

//Utilizar porta padrão
const port = normalizePort(global.PORT || 3000);
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
}

//Subindo servidor na porta padrão
server.listen(port, function () {
    console.log('myKnextify Api Online - Porta: %s Ambiente: %s', process.env.PORT, process.env.NODE_ENV);
    console.log('Host Mysql: %s Banco: %s', global.mySQLhost, global.mySQLdatabase);
});

//Instanciando knex para CRUDs
var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: global.mySQLhost,
        user: global.mySQLuser,
        password: global.mySQLpassword,
        database: global.mySQLdatabase,
        acquireConnectionTimeout: 200000,
        log: {
            warn(message) {
            },
            error(message) {
            },
            deprecate(message) {
            },
            debug(message) {
            },
        }
    }
});

//URL principal
server.get('/', function (req, res, next) {
    res.send('myKnextify Api Online!');
});

//auth - JWT
auth = require('../comum/auth');
auth(server, comum, usuario, validationContract, errs);

/* ## MAPEAMENTO DE ROTAS PARA CRUDS DE TABELAS CONFORME NECESSIDADE ## */

//CRUD tabela aluguel
CRUD = require('../routes/CRUD');
CRUD(server, knex, errs, comum, 'aluguel', 'aluguel_id');

//CRUD tabela ator
CRUD = require('../routes/CRUD');
CRUD(server, knex, errs, comum, 'ator', 'ator_id');

/* ## ROTA DE CONSULTA VIA QUERY, ENVIO DE EMAIL DENTRE OUTROS ENDPOINTS POSSÍVEIS DE CRIAÇÃO ## */

//mylib - Lib interna com funções "comuns"
mylib = require('../comum/mylib');
mylib(server, comum);

module.exports = server;

