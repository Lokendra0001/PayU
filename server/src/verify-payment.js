const crypto = require("crypto");
const payuClient = require("./payu.config");


// ---------------------------
// Verify Payment Hash
// ---------------------------
function verifyPayUCallbackHash(body, salt) {
    const {
        status,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        key,
        hash,
        udf1 = "",
        udf2 = "",
        udf3 = "",
        udf4 = "",
        udf5 = "",
        udf6 = "",
        udf7 = "",
        udf8 = "",
        udf9 = "",
        udf10 = ""
    } = body;

    const hashString =
        `${salt}|${status}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    const expectedHash = crypto
        .createHash("sha512")
        .update(hashString)
        .digest("hex");

    console.log("Expected Hash 👉", expectedHash);
    console.log("Received Hash 👉", hash);

    return expectedHash.toLowerCase() === hash.toLowerCase();
}



// ---------------------------
// Hash Generator
// ---------------------------
function generatePayUHash({ key, txnid, amount, productinfo, firstname, email, salt }) {
    const hashString =
        `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}` +
        "|||||" +  // udf1–udf5
        "||||||" +  // extra pipes
        salt;

    console.log("PayU Hash String 👉", hashString);
    return crypto.createHash("sha512").update(hashString).digest("hex");
}


module.exports = { verifyPayUCallbackHash, generatePayUHash };