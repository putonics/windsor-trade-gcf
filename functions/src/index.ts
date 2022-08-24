import { sendEmail } from "./classes/email/index"
import {
  signup,
  checkEmail,
  checkReferer,
  signin,
  adminSignin,
  inactiveUsers,
  addPackage,
  load,
  sendOtp,
  requestWithdrawal,
  requestPackage,
  getWithdrawalList,
  serveWithdrawal,
  shareTurnover,
  getPendingWithdrawals,
  modify,
  getPendingPackages,
  servePackage,
  modifyAdmin,
  resetPassword,
} from "./classes/user/index"
import * as functions from "firebase-functions"
import * as firebase from "firebase-admin"
import * as express from "express"
const cors = require("cors")
////////////////////////////////////////////////////////////////////////////////
const app = express()
app.use(cors())
firebase.initializeApp()

app.get("/test", (req, res) => {
  res.json({ msg: "V-1.2.3: All okay!" })
})
app.get("/test-email/:email", async (req, res) => {
  const { email } = req.params
  const sent = await sendEmail(
    email,
    "Testing Email",
    "",
    `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Windsor Trade</title>
            </head>
            <body>
                <h3>Hi this is a test email.</h3>
                <h1 style="color:#ff0000;">Just for fun</h1>
            </body>
        </html>
    `
  )
  res.json({ sent })
})
/////////////////////////////////////////////////////////////////////
app.get("/email/:email", checkEmail)
app.get("/referer/:refdocid", checkReferer)
////////////////////////////////////////////////////////////////////
app.post("/user/signup", signup)
app.post("/user/signin", signin)
app.post("/user/reset-password", resetPassword)
app.post("/user/modify", modify)
app.post("/user/load", load)
app.post("/user/inactive", inactiveUsers)
app.post("/user/package", requestPackage)
app.post("/user/withdraw", requestWithdrawal)
app.post("/user/withdrawal-list", getWithdrawalList) //only 10 withdrawal only
/////////////////////////////////////////////////////////////////////
app.post("/admin/signin", adminSignin)
app.post("/admin/modify", modifyAdmin)
app.post("/admin/package", addPackage)
app.post("/admin/package-list", getPendingPackages)
app.post("/admin/package-serve", servePackage)
app.post("/admin/withdrawal-list", getPendingWithdrawals)
app.post("/admin/withdraw-serve", serveWithdrawal)
app.post("/admin/shareturnover", shareTurnover)
/////////////////////////////////////////////////////////////////////
app.post("/send-otp", sendOtp)
/////////////////////////////////////////////////////////////////////
app.get("/*", (req, res) => res.status(404).send())
app.post("/*", (req, res) => res.status(404).send())

exports.app = functions.https.onRequest(app)

//-------------------Paymentgateway SECTION--------------------------------------------------------------
// RAZORPAY webhooks
// app.post('api/razorpay.order.paid', Razorpay.orderPaid)
// app.post('api/razorpay.payment.failed', Razorpay.paymentFailed)
// app.post('api/razorpay.refund.processed', Razorpay.refundProcessed)
// app.post('api/razorpay.refund.failed', Razorpay.refundFailed)
