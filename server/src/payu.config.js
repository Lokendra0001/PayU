require("dotenv").config();
const PayU = require("payu-websdk");


const payuClient = new PayU({
    key: process.env.PAYU_KEY,
    salt: process.env.PAYU_SALT,
    env: "production",
    baseUrl: "https://secure.payu.in/_payment"
});

module.exports = payuClient;
