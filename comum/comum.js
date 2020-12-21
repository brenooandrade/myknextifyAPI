const mysql = require('mysql');
const validationContract = require('../validator/validator');
const errs = require('restify-errors');
const { StringDecoder } = require('string_decoder');
const nodemailer = require('nodemailer');
const error = [];

exports.BlobAsText = (valBlob) => {
    try {
        if (!valBlob) {
            return '';
        } else {
            const decoder = new StringDecoder('utf8');
            return decoder.end(Buffer.from(valBlob));
        }
    } catch (error) {
        return (new errs.BadRequestError(error));
    }
}

exports.dataAtualFormatada = () => {
    var data = new Date();
    var dia = data.getDate().toString().padStart(2, '0');
    var mes = (data.getMonth() + 1).toString().padStart(2, '0');
    var ano = data.getFullYear();
    var hora = data.getHours().toString().padStart(2, '0');
    var minutos = data.getMinutes().toString().padStart(2, '0');
    var segundos = data.getSeconds().toString().padStart(2, '0');
    return (dia + '/' + mes + '/' + ano + ' ' + hora + ':' + minutos + ':' + segundos);
}

exports.validarEmail = (email) => {
    return new Promise((resolve, reject) => {
        var re = /\S+@\S+\.\S+/;
        resolve(re.test(email));
    });
}

exports.RetornaConfigBlob = (sqlQuery, res) => {
    const connection = mysql.createConnection({
        host: global.mySQLhost,
        user: global.mySQLuser,
        password: global.mySQLpassword,
        database: global.mySQLdatabase
    });
    var DataAgora = this.dataAtualFormatada();
    console.log('Retorna ConfigBlob: ' + DataAgora);
    connection.query({
        sql: sqlQuery,
        timeout: 200000
    }, function (err, rows) {
        try {
            if (err) {
                connection.end(function (err) { });
                res.send(new errs.BadRequestError(err))
            } else {
                connection.end(function (err) { });
                if (!rows[0]) {
                    res.send(new errs.NotFoundError('Nenhum registro encontrado'));
                } else {
                    //Resultado
                    var resultado = [];
                    for (var i = 0, l = rows.length; i < l; i++) {
                        //Gerar lista de Conteúdo texto do BLOB
                        if (rows[i].hasOwnProperty("CAMPOBLOB")) {
                            let jsonLista = JSON.stringify(rows[i].CAMPOBLOB);
                            let bufferOriginal = Buffer.from(JSON.parse(jsonLista).data);
                            var strLista = bufferOriginal.toString('utf8');
                            //Verificar se configuração está na Base64 e recuperar
                            const blob64 = require('./blob64');
                            if (blob64.VerificaBase64(strLista) == true) strLista = blob64.Blob64AsText(strLista);
                            resultado.push({ CAMPOBLOB: strLista });
                        }
                    }
                    res.send(resultado);
                }
            }
        } catch (error) {
            connection.end(function (err) { });
            res.send(new errs.BadRequestError(error));
        }
    });
}

exports.ValidaConsulta = (req, res, error) => {
    try {
        let contract = new validationContract();
        contract.isNumber(req.params.id, 'A requisição deve conter parâmetro(s) de entrada.');
        // Se os dados forem inválidos
        if (!contract.isValid()) {
            res.send(contract.errors());
            error = contract.errors();
            contract.clear;
            return next();
        }
    } catch (error) {
        res.send(new errs.BadRequestError(error));
    }     
}

exports.ValidaAlteracao = (req, res, error) => {
    try {
        let contract = new validationContract();
        contract.isNumber(req.params.id, 'A requisição deve conter parâmetro(s) de entrada.');
        contract.isRequired(req.body, 'A requisição deve conter um conteúdo JSON.');
        // Se os dados forem inválidos
        if (!contract.isValid()) {
            console.log(contract.errors());
            res.send(contract.errors());
            error = contract.errors();
            contract.clear;
            //return next();
        }
    } catch (error) {
        res.send(new errs.BadRequestError(error));
    }   
}

exports.ValidaExclusao = (req, res, error) => {
    try {
        let contract = new validationContract();
        contract.isNumber(req.params.id, 'A requisição deve conter parâmetro(s) de entrada.');
        // Se os dados forem inválidos
        if (!contract.isValid()) {
            res.send(contract.errors());
            error = contract.errors();
            contract.clear;
            return next();
        }
    } catch (error) {
        res.send(new errs.BadRequestError(error));
    }     
}

exports.ValidaInclusao = (req, res, error) => {
    try {
        let contract = new validationContract();
        contract.isRequired(req.body, 'A requisição deve conter um conteúdo JSON.');
        // Se os dados forem inválidos
        if (!contract.isValid()) {
            res.send(contract.errors());
            error = contract.errors();
            contract.clear;
            return next();
        }
    } catch (error) {
        res.send(new errs.BadRequestError(error));
    }     
}

exports.ConsultarReg = (req, res, knex, errs, tabela, chave, next) => {
    const { id } = req.params;
    //LOG
    var DataAgora = this.dataAtualFormatada();
    console.log('Consulta: ' + tabela + ' Chave: ' + chave + ' Valor: ' + id + ' ' + DataAgora);
    try 
    {
        knex(tabela)
            .where(chave, id)
            .then((dados) => {
                if (!dados) res.send(new errs.NotFoundError('Nenhum registro encontrado'))
                else {
                    //Retornando Dados
                    res.send(dados);
                }
            }, next)
            .catch(function (error) {
                res.send(new errs.BadRequestError(error));
            });
    }
    catch {
        res.send(new errs.BadRequestError(error));
    }      
}

exports.AlterarReg = (req, res, knex, errs, tabela, chave, next) => {
    const { id } = req.params;
    var dados = req.body;
    //LOG
    var DataAgora = this.dataAtualFormatada();
    console.log('Alteracao: ' + tabela + ' Chave: ' + chave + ' Valor: ' + id + ' ' + DataAgora);
    //Alteração
    try 
    {
        knex(tabela)
            .where(chave, id)
            .update(dados)
            .then((dados) => {
                if (!dados) res.send(new errs.NotFoundError('Nenhum registro encontrado'))
                else {
                    resultado = '{"retorno": "' + dados + '", "message": "Registro alterado com sucesso"}';
                    obj = JSON.parse(resultado);
                    res.send(obj);
                }
            }, next)
            .catch(function (error) {
                res.send(new errs.BadRequestError(error));
            })
    }
    catch {
        res.send(new errs.BadRequestError(error));
    }
}

exports.DeletarReg = (req, res, knex, errs, tabela, chave, next) => {
    const { id } = req.params;
    var DataAgora = this.dataAtualFormatada();
    //LOG
    console.log('Exclusao: ' + tabela + ' Chave: ' + chave + ' Valor: ' + id + ' ' + DataAgora);
    try 
    {
        knex(tabela)
            .where(chave, id)
            .delete()
            .then((dados) => {
                if (!dados) res.send(new errs.NotFoundError('Nenhum registro encontrado'))
                else {
                    resultado = '{"retorno": "' + dados + '", "msg": "Registro removido com sucesso"}';
                    obj = JSON.parse(resultado);
                    res.send(obj);
                }
            }, next)
            .catch(function (error) {
                res.send(new errs.BadRequestError(error));
            });
    }
    catch {
        res.send(new errs.BadRequestError(error));
    }       
}

exports.IncluirReg = (req, res, knex, errs, tabela, next) => {
    var DataAgora = this.dataAtualFormatada();
    console.log('Inclusao: ' + tabela + ' ' + DataAgora);
    var dados = req.body;
    var resultado = '';
    try 
    {
        knex(tabela)
            .insert(dados)
            .then(function (dados) {
                resultado = '{"retorno": "' + dados + '"}';
                obj = JSON.parse(resultado);
                res.send(obj);
            }, next)
            .catch(function (error) {
                res.send(new errs.BadRequestError(error));
            });
    }
    catch {
        res.send(new errs.BadRequestError(error));
    }
}

//Error handler
const errorHandler = (msg, rejectFunction) => {
    console.error(msg);
    rejectFunction({ error: "InternalError", message: msg });
}

exports.AbreSQLInterno = async (sqlQuery, res) => {
    return new Promise(async(resolve, reject) => {
        const connection = mysql.createConnection({
            host: global.mySQLhost,
            port: global.mySQLport,
            user: global.mySQLuser,
            password: global.mySQLpassword,
            database: global.mySQLdatabase
        });
        //LOG
        var DataAgora = this.dataAtualFormatada();
        console.log('Abre SQL Interno: ' + DataAgora);
        try {
            await connection.query({
                sql: sqlQuery,
                timeout: 200000
            }, async (err, rows) => {
                try {
                    if (err) {
                        connection.end(function (err) { });
                        res.send(new errs.BadRequestError(err));
                        //errorHandler(err, reject);
                        reject(err);
                    } else {
                        connection.end(function (err) { });
                        resolve(rows);
                    }
                } catch (error) {
                    connection.end(function (err) { });
                    res.send(new errs.BadRequestError(err));
                    reject(err);
                    
                }
            });
        } catch(error) {
            res.send(new errs.BadRequestError(error));
            reject(error);  
        }
    });
}

exports.makeid = (length) => {
    return new Promise((resolve, reject) => {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        resolve(result);
    });
 }

exports.EnviaEmail = (destinatario, assunto, conteudo) => {
    return new Promise((resolve, reject) => {
        var DataAgora = this.dataAtualFormatada();
        console.log('Envio de email: ' + DataAgora);
        //Criar transporter
        const transporter = nodemailer.createTransport({
            host: "",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "contato@myknextify.com.br",
                pass: "senha"
            },
            tls: { rejectUnauthorized: false }
        });
        //Objeto e-mail
        const email = {
            from: 'myKnextify <contato@myKnextify.com.br>',
            to: destinatario,
            subject: assunto,
            html: conteudo
        }
        transporter.sendMail(email, (err, result) => {
            if (err) {
                resolve(new errs.BadRequestError(err))
            } else {
                if (result === 'undefined') {
                    resolve(new errs.BadRequestError('Falha ao enviar email.'));
                }
                else {
                    resolve(JSON.parse('{"codigo": 1, "resultado": "Email enviado com sucesso: ' + result.response + '"}'));
                }
            }
        });
    });
}
