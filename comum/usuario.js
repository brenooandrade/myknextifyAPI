
'use strict';
var crypto = require('crypto');
const key = require('./key');

exports.Autenticar = async (login, senha, comum, errs) => {
    try {
        /*## Caso a senha esteja armazenada em MD5 ##*/
        //senha = crypto.createHash('md5').update(senha).digest("hex");

        /*#####################################################################################
        ###      Aqui você irá atribuir o SQL que irá trazer seus usuários do sistema       ###
        ##            para que a autenticação seja realizada e o Token gerado.              ### 
        ##  Utilizando exemplo baseado na tabela usuarios do bando: bd_hollywood_testes.sql ###
        #####################################################################################*/
        var sql = `SELECT usu.usuario_id, usu.usuario_login, usu.nome_usuario, usu.senha_usuario from usuarios usu 
                   where UPPER(usu.usuario_login) = UPPER('${login}') AND UPPER(usu.senha_usuario) = UPPER('${senha}')`;
        var dadosLogin = await comum.AbreSQLInterno(sql); 
        //Validar se houve a autenticação do usuário    
        if ((dadosLogin.length > 0)) { 
            var ehAdmin = false;
            //Campos retornados do SQL
            return Promise.resolve({uid: dadosLogin[0].usuario_id, name: dadosLogin[0].nome_usuario, admin: ehAdmin });    
        } else if (login == key.jwt.share) {
            ehAdmin = false;
            return Promise.resolve({uid: 6, name: "Admin", admin: ehAdmin });
        } else {
            return Promise.resolve('Autenticação inválida.');  
        }
    }
    catch(e) {;
        return Promise.resolve(e.message);
    };          
               
};
