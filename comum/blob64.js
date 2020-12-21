const errs = require('restify-errors');
const { StringDecoder } = require('string_decoder');

exports.BlobAsText = (valBlob) => {  
    try {
        if (!valBlob) {
            return '';
        } else {
            const decoder = new StringDecoder('utf8');
            return decoder.end(Buffer.from(valBlob));
        }
    } catch (error) {
        return(new errs.BadRequestError(error));
    }       
}

exports.Blob64AsText = (valBlob) => {  
    try {
        if (!valBlob) {
            return '';
        } else {
            const decoder = new StringDecoder('utf8');
            var strBase64 = decoder.end(Buffer.from(valBlob));
            let buff = new Buffer.from(strBase64, 'base64');
            return(buff.toString('utf8'));
        }
    } catch (error) {
        return(new errs.BadRequestError(error));
    }       
}

exports.DecodeBase64 = (valStr) => {  
    try {
        if (!valStr) {
            return '';
        } else {
            let buff = new Buffer.from(valStr, 'base64');
            return(buff.toString('utf8'));
        }
    } catch (error) {
        return(new errs.BadRequestError(error));
    }       
}

exports.VerificaBase64 = (str) => { 
    try {
        var base64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
        return (base64.test(str));
    } catch (err) {
        return false;
    }
}