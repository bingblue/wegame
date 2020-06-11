if (typeof TrackingCode == "function" && Object.prototype.toString.call(TrackingCode) == "[object Function]") {

    var trackingCode = new TrackingCode();

    trackingCode.load();

    trackingCode.util.on(window.gridsum, "load", function(argument) {
        trackingCode.trackForm("linkagePage-form");
    });

    window._trackingCode = trackingCode;

}


var _ApiProtocol = (("https:" == document.location.protocol) ? " https://" : " http://");

//var index_exe_api_url = index_exe_api_url ? index_exe_api_url : _ApiProtocol + "openapi.vipabc.com/VMD/OfficalWebAPI/LandingPageAPI/LandingPageExtend";//正式

var index_exe_api_url = index_exe_api_url ? index_exe_api_url : _ApiProtocol + "121.196.222.36/vipjr/index.jsp";//test

$(function() {


    if ($.fn.vForm) {
        $(".linkagePage-form").vForm({
            "ajaxUrl": index_exe_api_url
        });
    }

});