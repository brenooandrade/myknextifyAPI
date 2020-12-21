'use strict';

const code = 'ErroDeValidacao';

let errors = [];

function ValidationContract() {
    errors = [];
}

ValidationContract.prototype.isRequired = (value, message) => {
    if (value == 'undefined' || !value)
        errors.push({ code: code,  message: message });
}

ValidationContract.prototype.hasProperty = (value, property, message) => {
    if ((!value) || (!(value.hasOwnProperty(property))))
        errors.push({ code: code,  message: message });
}

ValidationContract.prototype.isNumber = (value, message) => {
    if (!value || value.length <= 0)
        errors.push({ code: code,  message: message });
}

ValidationContract.prototype.hasMinLen = (value, min, message) => {
    if (!value || value.length < min)
        errors.push({ code: code,  message: message });
}

ValidationContract.prototype.hasMaxLen = (value, max, message) => {
    if (!value || value.length > max)
        errors.push({ code: code,  message: message });
}

ValidationContract.prototype.isFixedLen = (value, len, message) => {
    if (value.length != len)
        errors.push({ code: code,  message: message });
}

ValidationContract.prototype.isEmail = (value, message) => {
    var reg = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);
    if (!reg.test(value))
        errors.push({ code: code,  message: message });
}

ValidationContract.prototype.errors = () => { 
    return errors; 
}

ValidationContract.prototype.clear = () => {
    errors = [];
}

ValidationContract.prototype.isValid = () => {
    return errors.length == 0;
}

module.exports = ValidationContract;