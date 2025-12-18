require("dotenv").config();
const PayU = require("payu-websdk");


const payuClient = new PayU({
    key: process.env.PAYU_KEY,
    salt: process.env.PAYU_SALT,
    env: process.env.PAYU_ENVIRONMENT,
    // isProduction: true,
    // env: "production",              // ✅ THIS is where you set PROD or TEST
    // baseUrl: "https://secure.payu.in/_payment" // production URL
});

module.exports = payuClient;
