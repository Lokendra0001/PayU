require("dotenv").config();
const express = require("express");
const app = express();
const payuClient = require("./payu.config");
const verifyPayment = require("./verify-payment");
const cors = require('cors');


const crypto = require("crypto");


// sha512(key | txnid | amount | productinfo | firstname | email | udf1 | udf2 | udf3 | udf4 | udf5 |||||| SALT)

function generatePayUHash({
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    salt,
}) {
    const hashString =
        `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}` +
        `|||||` +   // udf1–udf5 (5 pipes)
        `||||||` +  // extra 6 pipes
        `${salt}`;

    console.log("PayU Hash String 👉", hashString);


    return crypto
        .createHash("sha512")
        .update(hashString)
        .digest("hex");
}





app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const corsOptions = {
    origin: "*", // frontend
    methods: ["GET", "POST", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies
};

app.use(cors(corsOptions));


const PORT = process.env.PORT || 5000;
app.post("/payment", async (req, res) => {
    try {
        const { items, total } = req.body;

        const txnid = `TXN_${Date.now()}`;
        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;

        const productinfo = items.map(i => i.name).join(", ");
        const firstname = "Rakesh";
        const email = "r@gmail.com";
        const phone = "1234567990";

        // Generate hash
        const hash = generatePayUHash({
            key,
            txnid,
            amount: total.toString(),
            productinfo,
            firstname,
            email,
            salt
        });

        // HTML form that auto-submits to PayU
        const formHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Redirecting to PayU</title>
            </head>
            <body>
                <p>Redirecting to payment...</p>
            <form id="payu_form" method="post" action="https://secure.payu.in/_payment">
                    <input type="hidden" name="key" value="${key}" />
                    <input type="hidden" name="txnid" value="${txnid}" />
                    <input type="hidden" name="amount" value="${total.toString()}" />
                    <input type="hidden" name="productinfo" value="${productinfo}" />
                    <input type="hidden" name="firstname" value="${firstname}" />
                    <input type="hidden" name="email" value="${email}" />
                    <input type="hidden" name="phone" value="${phone}" />
                    <input type="hidden" name="surl" value="https://payu-socd.onrender.com/success" />
                    <input type="hidden" name="furl" value="https://payu-socd.onrender.com/failure" />
                    <input type="hidden" name="hash" value="${hash}" />
                </form>
                <script>
                    document.getElementById('payu_form').submit();
                </script>
            </body>
            </html>
        `;

        // Send the HTML page — browser will redirect automatically in same tab
        res.send(formHtml);

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});




app.post("/:status", async (req, res) => {
    try {
        const txnid = req.body.txnid;

        const verification = await payuClient.verifyPayment(txnid);
        const txnDetails = verification.transaction_details[txnid];

        if (txnDetails.status === "success") {
            return res.redirect(
                `https://pay-u-orpin.vercel.app/success?txnid=${txnDetails.txnid}&amount=${txnDetails.amt}&mode=${txnDetails.mode}&payuid=${txnDetails.mihpayid}`
            );
        } else {
            return res.redirect(
                `https://pay-u-orpin.vercel.app/failure?txnid=${txnDetails.txnid}&error=${txnDetails.error_Message}`
            );
        }
        // if (txnDetails.status === "success") {
        //     return res.redirect(
        //         `http://localhost:3000/success?txnid=${txnDetails.txnid}&amount=${txnDetails.amt}&mode=${txnDetails.mode}&payuid=${txnDetails.mihpayid}`
        //     );
        // } else {
        //     return res.redirect(
        //         `http://localhost:3000/failure?txnid=${txnDetails.txnid}&error=${txnDetails.error_Message}`
        //     );
        // }

    } catch (err) {
        console.error("Verification failed ❌", err);
        return res.redirect(
            `https://pay-u-orpin.vercel.app/payment/failure?error=Verification failed`
        );
    }
});



app.listen(PORT, () =>
    console.log(`Server Started at PORT : ${PORT}`)
);
