import CryptoJS from 'crypto-js';
var cryptoKey   = 'LRMLvkxDLrUKT8kU';

const encrypt = (data) => {
    return CryptoJS.AES.encrypt(data, cryptoKey);
}

const decrypt = (data) => {
    var decryptedBytes = CryptoJS.AES.decrypt(data, cryptoKey);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
}

export { encrypt, decrypt };