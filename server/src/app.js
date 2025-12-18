require("dotenv").config();
const express = require("express");
const app = express();
const payuClient = require("./payu.config");
const verifyPayment = require("./verify-payment");
const cors = require('cors')
const crypto = require("crypto");

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

app.get("/", (req, res) => {
    res.send("HELLO FROM SERVER");
});


// static
app.get("/get-payment", async (req, res) => {
    try {
        const txnid = `TXN_${Date.now()}`;




        const data = await payuClient.paymentInitiate({
            txnid,
            amount: "120000",
            productinfo: "Samsung Galaxy S24 (Black)",
            firstname: "Rakesh",
            email: "r@gmail.com",
            phone: "1234567990",
            surl: "https://payu-socd.onrender.com/verify/success",
            furl: "https://payu-socd.onrender.com/verify/failure",
            isAmountFilledByCustomer: false,
            hash
        });
        res.send(data);

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});


// Dynamic
app.post("/payment", async (req, res) => {
    try {
        const { items, total } = req.body;

        const txnid = `TXN_${Date.now()}`;

        function hashPwd({ key, txnid, amount, productinfo, firstname, email, salt }) {
            const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
            return crypto.createHash("sha512").update(hashString).digest("hex");
        }

        const hash = hashPwd({
            key: process.env.PAYU_KEY,
            txnid,
            amount: "120000",
            productinfo: "Samsung Galaxy S24 (Black)",
            firstname: "Rakesh",
            email: "r@gmail.com",
            salt: process.env.PAYU_SALT
        });



        const data = await payuClient.paymentInitiate({
            txnid,
            amount: total,
            productinfo: items.map(i => i.name).join(", "),
            firstname: "Rakesh",
            email: "r@gmail.com",
            phone: "1234567990",
            surl: "https://payu-socd.onrender.com/verify/success",
            furl: "https://payu-socd.onrender.com/verify/failure",
            isAmountFilledByCustomer: false,
            hash
        });
        res.json(data);

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
})


app.post("/verify/:status", async (req, res) => {
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
