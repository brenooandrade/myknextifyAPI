const CRUD = (server, knex, errs, comum, nometabela, chaveprimaria) => {
    var dados = [];
    var resultado = '';
    
    // Consultar todos os dados da tabela  
    server.get('/'+nometabela, (req, res, next) => {  
        knex(nometabela)
        .then((dados) => {
            res.send(dados); 
        }, next)
        .catch(function(error) {
            res.send(new errs.BadRequestError(error));
        });   
    });

    // Consultar ID
    server.get('/'+nometabela+'/consulta/:id', (req, res, next) => {
        var error = [];
        comum.ValidaConsulta(req, res, error);
        if (error.length == 0)
            comum.ConsultarReg(req, res, knex, errs, nometabela, chaveprimaria, next);     
    }); 

    //Alterar dados
    server.put('/'+nometabela+'/alteracao/:id', (req, res, next) => { 
        var error = [];
        comum.ValidaAlteracao(req, res, next);
        if (error.length == 0)
            comum.AlterarReg(req, res, knex, errs, nometabela, chaveprimaria, next);               
    });
  
    //Criar novo registro 
    server.post('/'+nometabela+'/inclusao', (req, res, next) => {
        var error = [];   
        comum.ValidaInclusao(req, res, next); 
        if (error.length == 0) 
            comum.IncluirReg(req, res, knex, errs, nometabela, next); 
    }); 
    
    //Deletar dados 
    server.del('/'+nometabela+'/exclusao/:id', (req, res, next) => {  
        var error = []; 
        comum.ValidaExclusao(req, res, next); 
        if (error.length == 0)   
            comum.DeletarReg(req, res, knex, errs, nometabela, chaveprimaria, next);    
    }); 
}

module.exports = CRUD;