require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const crypto = require("crypto");
const payuClient = require("./payu.config");
const verifyPayment = require("./verify-payment");

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

// ---------------------------
// Middleware
// ---------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const corsOptions = {
    origin: "*", // frontend domain
    methods: ["GET", "POST", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

app.use(cors(corsOptions));

// ---------------------------
// Payment Route
// ---------------------------
app.post("/payment", async (req, res) => {
    try {
        const { items, total } = req.body;

        const txnid = `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const amountStr = parseFloat(total).toFixed(2);

        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;

        const productinfo = items.map(i => i.name).join(", ");
        const firstname = "Rakesh";
        const email = "r@gmail.com";
        const phone = "1234567990";

        const hash = generatePayUHash({ key, txnid, amount: amountStr, productinfo, firstname, email, salt });

        const formHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Redirecting to PayU</title>
        </head>
        <body>
            <p>Redirecting to payment...</p>
          <form id="payu_form" method="post" action="https://secure.payu.in/_payment" target="_self">
                <input type="hidden" name="key" value="${key}" />
                <input type="hidden" name="txnid" value="${txnid}" />
                <input type="hidden" name="amount" value="${amountStr}" />
                <input type="hidden" name="productinfo" value="${productinfo}" />
                <input type="hidden" name="firstname" value="${firstname}" />
                <input type="hidden" name="email" value="${email}" />
                <input type="hidden" name="phone" value="${phone}" />
                <input type="hidden" name="surl" value="https://payu-socd.onrender.com/success" />
                <input type="hidden" name="furl" value="https://payu-socd.onrender.com/failure" />
                <input type="hidden" name="hash" value="${hash}" />
            </form>
            <script>document.getElementById('payu_form').submit();</script>
        </body>
        </html>
        `;

        res.send(formHtml);

    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ msg: error.message });
    }
});

app.get("/", (req, res) => {
    res.send("HELLO FROM SERVER!");
});

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
// Callback Route
// ---------------------------
app.post("/:status", (req, res) => {
    const { status } = req.params;

    console.log("PayU Callback Data 👉", req.body);

    if (status !== "success" && status !== "failure") {
        console.error("Invalid PayU callback path");
        return res.redirect(`https://pay-u-orpin.vercel.app/failure?error=Invalid callback URL`);
    }

    const isValid = verifyPayUCallbackHash(req.body, process.env.PAYU_SALT);
    if (!isValid) {
        console.error("❌ Hash verification failed");
        return res.redirect(`https://pay-u-orpin.vercel.app/failure?txnid=${req.body?.txnid || ""}&error=Hash verification failed`);
    }

    if (req.body.status === "success") {
        return res.redirect(`https://pay-u-orpin.vercel.app/success?txnid=${req.body.txnid}&payuid=${req.body.mihpayid}`);
    }

    return res.redirect(`https://pay-u-orpin.vercel.app/failure?txnid=${req.body.txnid}&error=${req.body.error_Message}`);
});

// ---------------------------
// Server
// ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));

// ----------------------------------------------------------------------------------


// require("dotenv").config();
// const express = require("express");
// const app = express();
// const cors = require("cors");
// const crypto = require("crypto");
// const payuClient = require("./payu.config");
// const verifyPayment = require("./verify-payment");

// // ---------------------------
// // Hash Generator
// // ---------------------------
// function generatePayUHash({ key, txnid, amount, productinfo, firstname, email, salt }) {
//     const hashString =
//         `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}` +
//         "|||||" +  // udf1–udf5
//         "||||||" +  // extra pipes
//         salt;

//     console.log("PayU Hash String 👉", hashString);
//     return crypto.createHash("sha512").update(hashString).digest("hex");
// }

// // ---------------------------
// // Middleware
// // ---------------------------
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// const corsOptions = {
//     origin: "*", // frontend domain
//     methods: ["GET", "POST", "PUT", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
// };

// app.use(cors(corsOptions));

// // ---------------------------
// // Payment Route
// // ---------------------------
// app.post("/payment", async (req, res) => {
//     try {
//         const { items, total } = req.body;

//         const txnid = `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
//         const amountStr = parseFloat(total).toFixed(2);

//         const key = process.env.PAYU_KEY;
//         const salt = process.env.PAYU_SALT;

//         const productinfo = items.map(i => i.name).join(", ");
//         const firstname = "Rakesh";
//         const email = "r@gmail.com";
//         const phone = "1234567990";

//         const hash = generatePayUHash({ key, txnid, amount: amountStr, productinfo, firstname, email, salt });

//         const formHtml = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <title>Redirecting to PayU</title>
//         </head>
//         <body>
//             <p>Redirecting to payment...</p>
//           <form id="payu_form" method="post" action="https://test.payu.in/_payment" target="_self">
//                 <input type="hidden" name="key" value="${key}" />
//                 <input type="hidden" name="txnid" value="${txnid}" />
//                 <input type="hidden" name="amount" value="${amountStr}" />
//                 <input type="hidden" name="productinfo" value="${productinfo}" />
//                 <input type="hidden" name="firstname" value="${firstname}" />
//                 <input type="hidden" name="email" value="${email}" />
//                 <input type="hidden" name="phone" value="${phone}" />
//                 <input type="hidden" name="surl" value="http://localhost:5000/success" />
//                 <input type="hidden" name="furl" value="http://localhost:5000/failure" />
//                 <input type="hidden" name="hash" value="${hash}" />
//             </form>
//             <script>document.getElementById('payu_form').submit();</script>
//         </body>
//         </html>
//         `;

//         res.send(formHtml);

//     } catch (error) {
//         console.error("Payment Error:", error);
//         res.status(500).json({ msg: error.message });
//     }
// });

// app.get("/", (req, res) => {
//     res.send("HELLO FROM SERVER!");
// });

// // ---------------------------
// // Verify Payment Hash
// // ---------------------------
// function verifyPayUCallbackHash(body, salt) {
//     const {
//         status,
//         txnid,
//         amount,
//         productinfo,
//         firstname,
//         email,
//         key,
//         hash,
//         udf1 = "",
//         udf2 = "",
//         udf3 = "",
//         udf4 = "",
//         udf5 = "",
//         udf6 = "",
//         udf7 = "",
//         udf8 = "",
//         udf9 = "",
//         udf10 = ""
//     } = body;

//     const hashString =
//         `${salt}|${status}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

//     const expectedHash = crypto
//         .createHash("sha512")
//         .update(hashString)
//         .digest("hex");

//     console.log("Expected Hash 👉", expectedHash);
//     console.log("Received Hash 👉", hash);

//     return expectedHash.toLowerCase() === hash.toLowerCase();
// }

// // ---------------------------
// // Callback Route
// // ---------------------------
// app.post("/:status", (req, res) => {
//     const { status } = req.params;

//     console.log("PayU Callback Data 👉", req.body);

//     if (status !== "success" && status !== "failure") {
//         console.error("Invalid PayU callback path");
//         return res.redirect(`http://localhost:3000/failure?error=Invalid callback URL`);
//     }

//     const isValid = verifyPayUCallbackHash(req.body, process.env.PAYU_SALT);
//     if (!isValid) {
//         console.error("❌ Hash verification failed");
//         return res.redirect(`http://localhost:3000/failure?txnid=${req.body?.txnid || ""}&error=Hash verification failed`);
//     }

//     if (req.body.status === "success") {
//         return res.redirect(`http://localhost:3000/success?txnid=${req.body.txnid}&payuid=${req.body.mihpayid}`);
//     }

//     return res.redirect(`http://localhost:3000/failure?txnid=${req.body.txnid}&error=${req.body.error_Message}`);
// });

// // ---------------------------
// // Server
// // ---------------------------
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
