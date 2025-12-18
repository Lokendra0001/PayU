require("dotenv").config();
const PayU = require("payu-websdk");


const payuClient = new PayU({
    key: process.env.PAYU_KEY,
    salt: process.env.PAYU_SALT,
    env: process.env.PAYU_ENVIRONMENT // TEST or PROD
});

module.exports = payuClient;
