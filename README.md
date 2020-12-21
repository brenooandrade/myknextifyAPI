# myknextify API
![Badge](https://img.shields.io/badge/RESTful-RESTIFY+KNEX+MySQL-%339933?style=for-the-badge&logo=ghost)
## Informações:
API RESTful em NodeJS criada por Breno Novais Andrade para que seja possível criar CRUDs em tabelas de maneira fácil e rápida utilizando a biblioteca Restify para gerenciamento de requisições ao servidor, CORS, SSL e autenticação segura por JWT. Utilizei a lib MySQL para execução de querys e algumas libs internas para padronizar a disponibilização dos CRUDS nas tabelas do banco através do query builder Knex JS.

## Objetivo:
O modelo abaixo utilizando o SGDB MySQL traz de uma forma simples uma API RESTful em NodeJS com autenticação segura baseada em JWT onde será possível criar rotas de CRUD - Create (POST), Read (GET), Update (PUT) e Delete (DELETE) das tabelas desejadas, o método utilizado para criar essas rotas é padronizado e a API contém tratativa de erros, contrato de validações de parâmetros e validações de payloads, sintam-se a vontade para copiar, usar e melhorar!

## Como usar:
Iremos utilizar como modelo o banco **_bd_hollywood_testes.sql_** disponível na raiz do projeto, utilize um servidor de sua preferência e realize a importação desse script para que possamos seguir o roteiro abaixo.

#### 1. Ajustando a biblioteca restify-https (SSL) - Local
⚠️ **Para testes locais utilize sempre http ao invés de https:// como URL base.**
Como utilizamos a bibilioteca **restify-https** para habilitar a comunicação segura via SSL quando utilizamos um servidor que possuí um certificado emitido, precisaremos ajustar o arquivo **\node_modules\restify-https\index.js** para que possamos realizar testes localmente (sem SSL).

##### 1.1. Dê o comando **npm install** para instalar as dependências do projeto.
#
##### 1.2. Abra o arquivo: **\node_modules\restify-https\index.js** e apague tudo o que há nele, em seguida cole o seguinte código:
#
```
'use strict';

var url = require('url');

module.exports = function (opts) {
    opts = opts || {};
    var https = function(req, res, next) {
        return next();
    };
    return (https);
};

```
#### 2. Configurando o Banco de Dados
Abra o arquivo **\comum\config.js** e coloque a configuração do banco de dados MySQL que será utilizado nos testes. 
Para realizar os testes aqui demonstrados, realize a importação/execução do script disponível no arquivo **_bd_hollywood_testes.sql_** do projeto.
#### 3. Gerando um Token seguro (JWT - JSON Web TOKEN)
📄 A regra de negócio para geração do JWT está no arquivo **\comum\auth.js**, como importamos o banco **_bd_hollywood_testes.sql_** deveremos utilizar algum usuário da tabela **_usuarios_** para gerar o JWT, no meu caso irei utilizar o usuário:
|usuario_login|nome_usuario|senha_usuario|
|-------------|------------|-------------|
|breno.andrade|Breno Novais Andrade|senhadomestre123|
#
📄 A regra de consulta (SQL) para validar a autenticação está em **\comum\usuarios.js**.
Iremos agora consumir a rota que nos fornecerá o JWT:
```
Método: POST
URI: http://127.0.0.1:3000/autenticacao
Payload (body): {"login": "breno.andrade", "senha": "senhadomestre123"}

Exemplo de retorno: 
{
    "iat": 1608393405,
    "exp": 1608479805,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsIm5hbWUiOiJCcmVubyBOb3ZhaXMgQW5kcmFkZSIsImFkbWluIjpmYWxzZSwiaWF0IjoxNjA4MzkzNDA1LCJleHAiOjE2MDg0Nzk4MDV9.Jg-W-yf5iSvdt6BRijGyEgz5HbmgI9OLkOimXCiqWLI"
}
```
**Iremos salvar o token recebido para que possamos enviar junto com o Header de nossas requisições na API.** Será necessário adicionar o seguinte parâmetro no Header de nossas requisições: 

**Nome:** Authorization
**Valor:** Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsIm5hbWUiOiJCcmVubyBOb3ZhaXMgQW5kcmFkZSIsImFkbWluIjpmYWxzZSwiaWF0IjoxNjA4MzkzNDA1LCJleHAiOjE2MDg0Nzk4MDV9.Jg-W-yf5iSvdt6BRijGyEgz5HbmgI9OLkOimXCiqWLI

#### 4. Criando os CRUDs com Endpoints padronizados
Irei exemplificar a criação dos endpoints para realizar CRUD nas tabelas: **`aluguel` e `ator`** disponíveis no banco **_bd_hollywood_testes.sql_**.

#### ⚠️ ATENÇÃO!!!
Aqui é onde acontece a **mágica** 🧙🏼‍♂️🎩, iremos acessar o arquivo **\server\server.js** e a partir da linha 87 onde há o comentário:
```
/* ## MAPEAMENTO DE ROTAS PARA CRUDS DE TABELAS CONFORME NECESSIDADE ## */
```
Iremos definir quais tabelas queremos que os Endpoints dos CRUDs sejam disponibilizados, vejam no código de exemplo abaixo para _ativar_ o CRUD das tabelas: **`aluguel` e `ator`**.
```
//CRUD tabela aluguel
CRUD = require('../routes/CRUD');
CRUD(server, knex, errs, comum, 'aluguel', 'aluguel_id');

//CRUD tabela ator
CRUD = require('../routes/CRUD');
CRUD(server, knex, errs, comum, 'ator', 'ator_id');
```
Na linha 3 acima, passei como parametros o **nometabela:** `aluguel` e a **chaveprimaria:** `aluguel_id`, portanto para todas as tabelas do banco de dados que queremos disponibilizar as rotas de CRUD - Create (POST), Read (GET), Update (PUT) e Delete (DELETE), **teremos que repetir as linhas acima enviando como parâmetro o nome da tabela e a chave primária**, assim as funções criadas por mim irão criar o mapeamento dos Endpoints.

Os Endpoints serão criados sempre de acordo com o nome da tabela, vejam o exemplo da tabela `aluguel`:

##### GET - Retorna todos os registros da tabela
#
```
Autenticação: Informar Authorization no Header conforme orientações no tópico 3. 
Método: GET
URI: http://localhost:3000/aluguel
```
##### GET - Retornar registro de acordo com PK (parâmetro na URI)
#
```
Autenticação: Informar Authorization no Header conforme orientações no tópico 3. 
Método: GET
URI: http://localhost:3000/aluguel/consulta/11
```
##### PUT - Alterar valores de campos de acordo com PK (parâmetro na URI)
#
```
Autenticação: Informar Authorization no Header conforme orientações no tópico 3. 
Método: PUT
URI: http://localhost:3000/aluguel/alteracao/11
Payload (body): 
                {"data_de_devolucao": "2020-12-12T12:00:00",
                "funcionario_id": 2,
                "ultima_atualizacao": "2020-12-12T12:00:00"}
```
##### POST - Incluir registro(s) na tabela
#
```
Autenticação: Informar Authorization no Header conforme orientações no tópico 3. 
Método: POST
URI: http://localhost:3000/aluguel/inclusao
Payload (body): 
    {
        "data_de_aluguel": "2020-12-24T03:00:00",
        "inventario_id": 1711,
        "cliente_id": 130,
        "funcionario_id": 2,
        "ultima_atualizacao": "2020-12-24T03:00:00"
    }
```
##### DELETE - Deletar registro da tabela (parâmetro na URI)
#
```
Autenticação: Informar Authorization no Header conforme orientações no tópico 3. 
Método: DELETE
URI: http://localhost:3000/aluguel/exclusao/11
```

#### 5. Realizando consulta de acordo com Query enviado
Como qualquer outro Query Builder, o [Knex JS](http://knexjs.org/) limita nossas possibilidades no que diz respeito a liberdade para a realização de consultas SQL, então eu precisei criar um Endpoint específico para abrir minhas querys de forma dinâmica, recebendo os dados em JSON e tratando os campos e valores retornados.
#
✅ No arquivo **\comum\mylib.js** temos o Endpoint **/abresql** onde podemos enviar qualquer query para abrir no banco de dados e em seguida receber os dados retornados de uma forma padronizada via JSON.
#
**Com o nosso banco de exemplo, vamos criar uma Query para nos buscar todos os atores de um determinado filme.**
##### POST - Consultar dados de acordo com Query enviada
#
```
Autenticação: Informar Authorization no Header conforme orientações no tópico 3. 
Método: POST
URI: http://localhost:3000/abresql
Payload (body): 
    {"SQL": "SELECT aa.primeiro_nome, aa.ultimo_nome, fa.ultima_atualizacao, ff.titulo, ff.ano_de_lancamento FROM ATOR aa inner join filme_ator fa on fa.ator_id = aa.ator_id inner join filme ff on ff.filme_id =  fa.filme_id where ff.titulo = 'MULAN MOON'"}
```
#
![](myKnextify_demonstracao.gif)
#

### Features
- [x] RESTful para CRUD em tabelas com apenas uma PK
- [x] SSL, JWT e CORS ativados
- [x] Validação de parâmetros e payloads conforme regra de negócio definida
- [x] Rota para realizar consulta SQL de acordo com Query enviada
- [X] Inclusão de vários registros com apenas uma requisição de JSON
- [ ] RESTful para CRUD em tabelas com PK composta
- [ ] Rate limit
- [ ] Adaptar o funcionamento para outros banco de dados

## Referências / Tecnologias:
- [Node.js](https://nodejs.org/en/)
- [Restify](http://restify.com/)
- [Knex JS](http://knexjs.org/)
- [MySQL lib](https://www.npmjs.com/package/MySQL)