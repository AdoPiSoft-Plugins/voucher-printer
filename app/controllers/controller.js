"use strict";
var QRCode = require("qrcode"),
  path = require("path"),
  fs = require("fs"),
  util = require("util"),
  readFile = util.promisify(fs.readFile),
  writeFile = util.promisify(fs.writeFile),
  tpl_path = "development" === process.env.NODE_ENV ? path.join(__dirname, "../voucher.tpl") : path.join("/etc", "voucher.tpl"),
  default_tpl_path = path.join(__dirname, "../voucher-default.tpl");

function formatTime(minutes) {
  if (minutes < 60) return minutes + "Mins.";
  if (minutes < 1440) {
    var days = parseInt(minutes / 60);
    return days < minutes / 60 ? days + "Hr" + (1 < days ? "s" : "") + ". : " + (minutes - 60 * days) + "Mins." : days + "Hr" + (1 < days ? "s" : "") + "."
  }
  days = parseInt(minutes / 60 / 24);
  return days < minutes / 60 / 24 ? days + "D : " + formatTime(minutes - 60 * days * 24) : days + "D"
}

function formatData(mb) {
  return mb < 1024 ? mb + "MB" : (mb / 1024).toFixed(2) + "GB"
}
var rate_types = {
  time: "Time",
  data: "Data",
  time_or_data: "Time/Data",
  subscription: "Subscription"
};
exports.generatePrintableVouchers = async(req, res, next) => {
  try {
    var {
      vouchers,
      opts
    } = req.body, {
      with_qr
    } = opts || {};
    try {
      var tpl = await readFile(tpl_path, "utf8")
    } catch (e) {
      tpl = await readFile(default_tpl_path, "utf8")
    }
    for (var vouchers = vouchers.sort((a, b) => a.batch_number - b.batch_number), content = "", i = 0; i < vouchers.length; i++) {
      var rateval, exp, qr, v = vouchers[i],
        c = tpl.replace(/<batchnumber\s?>/gi, v.batch_number);
      switch (c = (c = c.replace(/<vouchercode\s?>/gi, v.code)).replace(/<ratetype\s?>/gi, rate_types[v.type] || v.type), v.type) {
        case "time":
          rateval = formatTime(v.minutes), exp = v.expiration_hours ? formatTime(60 * v.expiration_hours) : "N/A";
          break;
        case "data":
          rateval = formatData(v.megabytes), exp = v.expiration_hours ? formatTime(60 * v.expiration_hours) : "N/A";
          break;
        case "eload":
          rateval = v.eload_amount, exp = v.expiration_hours ? formatTime(60 * v.expiration_hours) : "N/A";
          break;
        case "time_or_data":
          rateval = formatTime(v.minutes) + " / " + formatData(v.megabytes), exp = v.expiration_hours ? formatTime(60 * v.expiration_hours) : "N/A";
          break;
        case "subscription":
          rateval = "N/A", exp = v.expiration_hours ? formatTime(60 * v.expiration_hours) : "N/A"
      }
      c = (c = (c = (c = (c = (c = (c = (c = (c = c.replace(/<eloadamount\s?>/gi, v.eload_amount || "")).replace(/<minutes\s?>/gi, formatTime(v.minutes))).replace(/<megabytes\s?>/gi, formatData(v.megabytes))).replace(/<price\s?>/gi, v.price)).replace(/<bandwidthdown\s?>/gi, (v.bandwidth_down_kbps / 1024).toFixed(2))).replace(/<bandwidthup\s?>/gi, (v.bandwidth_up_kbps / 1024).toFixed(2))).replace(/<ratevalue\s?>/gi, rateval || "N/A")).replace(/<maxuser\s?>/gi, v.max_users)).replace(/<expiration\s?>/gi, exp || "N/A"), with_qr && (qr = await QRCode.toDataURL(v.code), c = c.replace(/<qrcode\s?>/gi, '<img src="' + qr + '">')), content += c
    }
    content || next("Something went wrong"), res.send({
      content: content
    })
  } catch (e) {
    next(e)
  }
}, exports.getSettings = async(req, res, next) => {
  try {
    var content = await readFile(tpl_path, "utf8");
    res.json({
      content: content
    })
  } catch (e) {
    try {
      content = await readFile(default_tpl_path, "utf8"), res.json({
        content: content
      })
    } catch (e) {
      next(e)
    }
  }
}, exports.updateSettings = async(req, res, next) => {
  try {
    await writeFile(tpl_path, req.body.content), res.json({
      content: req.body.content
    })
  } catch (e) {
    next(e)
  }
}, exports.resetSettings = async(req, res, next) => {
  try {
    var content = await readFile(default_tpl_path, "utf8");
    await writeFile(tpl_path, content), res.json({
      content: content
    })
  } catch (e) {
    next(e)
  }
};