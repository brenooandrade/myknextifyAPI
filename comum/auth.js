const key = require('./key');
const rjwt = require('restify-jwt-community');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const auth = (server, comum, usuario, validationContract, errs) => {
    // Usando restify-jwt para levantar toda exception de autenticação
    server.use(rjwt(key.jwt).unless({
        path: ['/autenticacao', '/', '/documentacao', '/tokencompartilhamento', '/verificartoken']
    }));

    // Usando req.user do restify-jwt
    server.get('/user', (req, res, next) => {
        res.send(req.user);
    });

    //Retorna chave de autenticação
    server.post('/autenticacao', (req, res, next) => {
        let contract = new validationContract();
        contract.isRequired(req.body, 'A requisição deve conter um conteúdo JSON.');
        contract.isRequired(req.params.login, 'A requisição deve conter o parâmetro login.');
        contract.isRequired(req.params.senha, 'A requisição deve conter o parâmetro senha.');
        let { idcliente, login, senha } = req.body;
        if (!contract.isValid()) {
            res.send(contract.errors());
            error = contract.errors();
            contract.clear;
            return next();
        }
        usuario.Autenticar(login, senha, comum, errs)
            .then(data => {
                try {
                    if (data.uid != undefined) {
                        // Criando jsonwebtoken usando o secret de config.json
                        let token = jwt.sign(data, key.jwt.secret, {
                            expiresIn: '1d' // Tempo em que token expira
                        });
                        // Recuperar tempo de emissão e expiração
                        let { iat, exp } = jwt.decode(token);
                        res.send({ iat, exp, token });
                    } else res.send(new errs.BadRequestError(data));
                }
                catch (e) {
                    res.send(new errs.BadRequestError(e));
                }
            });
    });

    //Retorna chave de autenticação
    server.post('/tokencompartilhamento', (req, res, next) => {
        let contract = new validationContract();
        contract.isRequired(req.body, 'A requisição deve conter um conteúdo JSON.');
        contract.isRequired(req.params.chavesecreta, 'A requisição deve conter o parâmetro contendo a chave para geração do token.');
        let { chavesecreta } = req.body;
        if (!contract.isValid()) {
            res.send(contract.errors());
            error = contract.errors();
            contract.clear;
            return next();
        }
        usuario.Autenticar(6, chavesecreta, '', comum, errs)
            .then(data => {
                try {
                    if (data.uid != undefined) {
                        // Criando jsonwebtoken usando o secret de config.json
                        let token = jwt.sign(data, key.jwt.secret, {
                            expiresIn: '4h' // Tempo em que token expira
                        });
                        // Recuperar tempo de emissão e expiração
                        let { iat, exp } = jwt.decode(token);
                        res.send({ iat, exp, token });
                    } else res.send(new errs.BadRequestError(data));
                }
                catch (e) {
                    res.send(new errs.BadRequestError(e));
                }
            });
    });

    //Retorna chave de autenticação
    server.post('/tokenautenticacao', (req, res, next) => {
        let contract = new validationContract();
        contract.isRequired(req.body, 'A requisição deve conter um conteúdo JSON.');
        contract.isRequired(req.params.tempoexpiracao, 'A requisição deve conter o parâmetro com o tempoexpiracao do Token.');
        contract.isRequired(req.params.idCliente, 'A requisição deve conter o parâmetro com o idCliente do Usuário.');
        contract.isRequired(req.params.chavesecreta, 'A requisição deve conter o parâmetro contendo a chave para geração do token.');
        // let {chavesecreta} = req.body;
        if (!contract.isValid()) {
            res.send(contract.errors());
            error = contract.errors();
            contract.clear;
            return next();
        }
        usuario.Autenticar(req.params.chavesecreta, '', comum, errs)
            .then(data => {
                try {
                    if (data.uid != undefined) {
                        // Criando jsonwebtoken usando o secret de config.json
                        let token = jwt.sign(data, key.jwt.secret, {
                            expiresIn: req.params.tempoexpiracao + 'h' // Tempo em que token expira
                        });
                        // Recuperar tempo de emissão e expiração
                        let { iat, exp } = jwt.decode(token);
                        res.send({ iat, exp, token });
                    } else res.send(new errs.BadRequestError(data));
                }
                catch (e) {
                    res.send(new errs.BadRequestError(e));
                }
            });
    });


    //Verificar token
    server.post('/verificartoken', (req, res, next) => {
        try {
            let contract = new validationContract();
            contract.isRequired(req.body, 'A requisição deve conter um conteúdo JSON.');
            contract.isRequired(req.params.token, 'A requisição deve conter o token de autenticação.');
            let { token } = req.body;
            if (!contract.isValid()) {
                res.send(contract.errors());
                error = contract.errors();
                contract.clear;
                return next();
            }
            jwt.verify(token, key.jwt.secret, function (err, decoded) {
                if (err) {
                    var resultado = [];
                    resultado.push({ TOKENVALIDO: 0, MENSAGEM: "O Token informado não existe ou não é mais válido" });
                    res.send(resultado);
                } else {
                    var resultado = [];
                    resultado.push({ TOKENVALIDO: 1, MENSAGEM: "Token válido para autenticação" });
                    res.send(resultado);
                }
                next;
            });
        } catch (e) {
            res.send(new errs.BadRequestError(e));
        };

    });

}

module.exports = auth;
