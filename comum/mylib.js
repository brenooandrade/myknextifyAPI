const mysql = require('mysql');
const errs = require('restify-errors');
const blob64 = require('./blob64');
const validationContract = require('../validator/validator');

function AbreSQL(sqlQuery, res, comum) {
    const connection = mysql.createConnection({
        host: global.mySQLhost,
        port: global.mySQLport,
        user: global.mySQLuser,
        password: global.mySQLpassword,
        database: global.mySQLdatabase,
        timezone: '+00:00'
    });
    //var DataAgora = comum.dataAtualFormatada();
    //console.log('Query no banco MySQL aberta: ' + DataAgora);
    connection.query({
        sql: sqlQuery,
        timeout: 200000
    }, function (err, rows, fields) {
        try {
            if (err) {
                connection.end(function (err) { });
                res.send(new errs.BadRequestError(err))
            } else {
                connection.end(function (err) { });
                res.send(rows);
            }
        } catch (error) {
            connection.end(function (err) { });
            res.send(new errs.BadRequestError(error));
        }
    });
}

const mylib = (server, comum) => {
    // Consulta Genérica
    server.post('/abresql', (req, res, next) => {
        let contract = new validationContract();
        contract.isRequired(req.body, 'A requisição deve conter um conteúdo JSON.');
        if (!contract.isValid()) {
            res.send(contract.errors());
            error = contract.errors();
            contract.clear;
            return next();
        }
        var sSql = req.body.SQL;
        AbreSQL(sSql, res, comum);
    });

    //Enviar email via API
    server.post('/enviaemail', async (req, res, next) => {
        let contract = new validationContract();
        try {
            var dados = req.body;
            contract.isRequired(req.params.destinatario, 'A requisição deve conter o parâmetro destinatario.');
            contract.isRequired(req.params.assunto, 'A requisição deve conter o parâmetro assunto.');
            contract.isRequired(req.params.conteudob64, 'A requisição deve conter o parâmetro conteudob64.');
            contract.isRequired(req.body, 'A requisição deve conter um conteúdo JSON.');
            if (!contract.isValid()) {
                res.send(contract.errors());
                error = contract.errors();
                contract.clear;
                return next();
            }
            if (dados.hasOwnProperty('destinatario')
                && dados.hasOwnProperty('assunto')
                && dados.hasOwnProperty('conteudob64')) {
                var conteudoEmail = blob64.DecodeBase64(dados.conteudob64);
                res.send(await comum.EnviaEmail(dados.destinatario, dados.assunto, conteudoEmail));
            } else res.send(new errs.BadRequestError('Propriedade(s) destinatario, assunto ou conteudob64 não encontrada(s) no JSON para envio do email'));
        }
        catch (e) {
            res.send(new errs.BadRequestError(e));
        };
    });

    // Retornar Configuração Blob (Texto)
    server.post('/configblobpadrao', (req, res, next) => {
        let contract = new validationContract();
        contract.isRequired(req.body, 'A requisição deve conter um conteúdo JSON.');
        if (!contract.isValid()) {
            res.send(contract.errors());
            error = contract.errors();
            contract.clear;
            return next();
        }
        var sSql = req.body.SQL;
        comum.RetornaConfigBlob(sSql, res);
    });
}

module.exports = mylib;