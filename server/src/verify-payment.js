const crypto = require('crypto');
const payuClient = require('./payu.config');

const verifyPayment = (body) => {
    const salt = payuClient.salt;

    // Extract UDFs (user-defined fields) safely
    const udf = [];
    for (let i = 1; i <= 10; i++) {
        udf.push(body[`udf${i}`] || '');
    }

    // Build hash string exactly as PayU expects
    const hashString = [
        body.key,
        body.txnid,
        body.amount,
        body.productinfo,
        body.firstname,
        body.email,
        ...udf,
        salt
    ].join('|');

    const calculatedHash = crypto.createHash("sha512").update(hashString).digest('hex');

    console.log(calculatedHash);
    console.log(body.hash);

    console.log("Hash string:", hashString);
    console.log("Calculated hash:", calculatedHash);
    console.log("Received hash:", body.hash);

    return calculatedHash === body.hash;
}

module.exports = verifyPayment;
