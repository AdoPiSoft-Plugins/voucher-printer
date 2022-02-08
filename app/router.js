const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const controller = require("./controllers/controller.js")
const auth = require('@adopisoft/core/middlewares/auth.js')

router.get("/voucher-printer-settings", auth, controller.getSettings)
router.post("/voucher-printer-settings", auth, bodyParser.json(), controller.updateSettings) 
router.post("/voucher-printer-reset", auth, bodyParser.json(), controller.resetSettings)
router.post("/generate-printable-vouchers", auth, bodyParser.json(), controller.generatePrintableVouchers)

module.exports = router;