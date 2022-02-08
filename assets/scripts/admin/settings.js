! function() {
  "use strict";
  var App = angular.module("Plugins");
  App.config(function($stateProvider) {
    $stateProvider.state("plugins.voucher_printer", {
      templateUrl: "/public/plugins/voucher-printer/views/index.html",
      controller: "VoucherPrinterSettingsCtrl",
      url: "/voucher-printer",
      title: "Voucher Printer"
    })
  }), App.service("PrinterSettingsService", ["$http", "toastr", "CatchHttpError", "$q", function($http, toastr, CatchHttpError, $q) {
    this.get = function() {
      return $http.get("/voucher-printer-settings").catch(CatchHttpError)
    }, this.update = function(cfg) {
      return $http.post("/voucher-printer-settings", cfg).catch(CatchHttpError)
    }, this.reset = function() {
      return $http.post("/voucher-printer-reset").catch(CatchHttpError)
    }
  }]), App.controller("VoucherPrinterSettingsCtrl", function($scope, $sce, PrinterSettingsService, toastr) {
    PrinterSettingsService.get().then(function(data) {
      data = data.data;
      $scope.content = data.content
    }), $scope.submit = function() {
      $scope.saving = !0;
      var cfg = {
        content: $scope.content
      };
      PrinterSettingsService.update(cfg).then(function() {
        toastr.success("Plugin settings successfully saved")
      }).finally(function() {
        $scope.saving = !1
      })
    }, $scope.previewVoucherQR = function() {
      return $scope.previewVoucher(!0)
    }, $scope.previewVoucher = function(withQr) {
      var preview = angular.copy($scope.content);
      return preview ? (preview = (preview = (preview = preview.replace(/<batchnumber\s?>/gi, "5")).replace(/<ratetype\s?>/gi, "Time")).replace(/<ratevalue\s?>/gi, "2hrs."), preview = (preview = (preview = (preview = (preview = (preview = (preview = withQr ? preview.replace(/<qrcode\s?>/gi, '<img src="/public/plugins/voucher-printer/images/qr.png" style="width:60%;margin:10px"></img>') : preview.replace(/<qrcode\s?>/gi, "")).replace(/<maxuser\s?>/gi, "1")).replace(/<expiration\s?>/gi, "1D")).replace(/<price\s?>/gi, "10")).replace(/<bandwidthdown\s?>/gi, "10MB")).replace(/<bandwidthup\s?>/gi, "10MB")).replace(/<vouchercode\s?>/gi, "DF123121"), $sce.trustAsHtml(preview)) : ""
    }, $scope.resetSettings = function() {
      PrinterSettingsService.reset().then(function(res) {
        $scope.content = res.data.content, toastr.success("Plugin settings successfully reset")
      }).finally(function() {
        $scope.saving = !1
      })
    }
  })
}();