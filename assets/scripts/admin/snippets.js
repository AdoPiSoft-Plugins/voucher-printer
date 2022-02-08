! function() {
  "use strict";
  try {
    style = angular.module("AdoPiSoft")
  } catch (e) {
    style = angular.module("adopisoft")
  }
  var $scope, initialized = !1;
  $(document).on("change", '.vouchers-list vouchers .vouchers-table [ng-change="updateAllSelect(this)"], .vouchers-list vouchers .vouchers-table [ng-change="selectAll()"]', function() {
    var el;
    initialized && $(".print-btn").length || (el = angular.element(".vouchers-table"), $scope = el.scope(), el.injector().invoke(function($rootScope, $compile, VoucherPrinterService, CatchHttpError, $timeout) {
      function print(vouchers, opts) {
        $("body .to-print").remove(), VoucherPrinterService.generatePrintableVouchers(vouchers, opts || {}).then(function(div) {
          $("#http-spinner").show(), $("body div:visible:not(.no-print)").addClass("no-print");
          var content = div.data.content,
            div = document.createElement("div");
          div.classList.add("to-print"), div.innerHTML = content;
          var o_title = document.title;
          $("body").append(div), $timeout(function() {
            document.title = "vouchers.pdf", $("#http-spinner").hide(), window.print()
          }, 3e3), window.onafterprint = function() {
            document.title = o_title
          }
        }).catch(CatchHttpError)
      }
      $rootScope.printVouchers = function() {
        return print($scope.selectedVouchers())
      }, $rootScope.printVouchersWithQr = function() {
        return print($scope.selectedVouchers(), {
          with_qr: !0
        })
      }, $rootScope.selectedVouchers = $scope.selectedVouchers, $(".vouchers-list .btn-group-padded:first").append($compile('<div class="btn-group dropdown print-btn" uib-dropdown style="" ng-show="selectedVouchers().length"><button id="voucher-print" type="button" class="btn btn-success ng-binding" ng-click="printVouchers()"><i class="fa fa-print">&nbsp;</i>Print Vouchers</button><button type="button" class="btn btn-success" uib-dropdown-toggle><span class="caret"></span></button><ul class="dropdown-menu" uib-dropdown-menu="" role="menu" aria-labelledby="voucher-print"><li role="menuitem"><a ng-click="printVouchersWithQr()">+ QR Codes</a></li></ul></div>')($rootScope))
    }), initialized = !0)
  }), style.service("VoucherPrinterService", ["$http", "toastr", "CatchHttpError", "$q", function($http, toastr, CatchHttpError, $q) {
    this.generatePrintableVouchers = function(vouchers, opts) {
      return $http.post("/generate-printable-vouchers", {
        vouchers: vouchers,
        opts: opts
      })
    }
  }]);
  var style = document.createElement("style");
  style.textContent = "@media print { .to-print{   display: block;   margin: 0 auto; } .no-print{   display: none; }}@media not print { .to-print{   display: inline-block;   width:1px !important;   height:1px  !important;   overflow: hidden; }}", document.head.append(style)
}();