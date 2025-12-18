require("dotenv").config();
const express = require("express");
const app = express();
const payuClient = require("./payu.config");
const cors = require("cors");

const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
    origin: ["https://pay-u-orpin.vercel.app"],
    methods: ["GET", "POST"],
}));

app.get("/get-payment", async (req, res) => {
    const txnid = `TXN_${Date.now()}`;

    const data = await payuClient.paymentInitiate({
        txnid,
        amount: "120000",
        productinfo: "Samsung Galaxy S24 (Black)",
        firstname: "Rakesh",
        email: "r@gmail.com",
        phone: "1234567990",
        surl: `${BASE_URL}/verify/success`,
        furl: `${BASE_URL}/verify/failure`,
        isAmountFilledByCustomer: false
    });

    res.json(data);
});

app.post("/payment", async (req, res) => {
    const { items, total } = req.body;
    const txnid = `TXN_${Date.now()}`;

    const data = await payuClient.paymentInitiate({
        txnid,
        amount: total,
        productinfo: items.map(i => i.name).join(", "),
        firstname: "Rakesh",
        email: "r@gmail.com",
        phone: "1234567990",
        surl: `${BASE_URL}/verify/success`,
        furl: `${BASE_URL}/verify/failure`,
        isAmountFilledByCustomer: false
    });

    res.json(data);
});

app.post("/verify/:status", async (req, res) => {
    const txnid = req.body.txnid;
    const verification = await payuClient.verifyPayment(txnid);
    const txnDetails = verification.transaction_details[txnid];

    if (txnDetails.status === "success") {
        return res.redirect(
            `https://pay-u-orpin.vercel.app/success?txnid=${txnDetails.txnid}&amount=${txnDetails.amt}`
        );
    }

    return res.redirect(
        `https://pay-u-orpin.vercel.app/failure?error=${txnDetails.error_Message}`
    );
});

app.listen(PORT, () =>
    console.log(`Server Started at PORT : ${PORT}`)
);
