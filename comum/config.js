global.ambiente = process.env.NODE_ENV;
global.PORT = process.env.PORT;
if (ambiente == 'production') {
    global.mySQLhost = '';
    global.mySQLuser = '';
    global.mySQLpassword = '';
    global.mySQLdatabase = '';
    global.mySQLport = '';
} else if (ambiente == 'development') {
    global.mySQLhost = 'localhost';
    global.mySQLuser = 'root';
    global.mySQLpassword = '';
    global.mySQLdatabase = 'hollywood_testes';
    global.mySQLport = '3306';
}
module.exports = {
    versao: 0.01
}