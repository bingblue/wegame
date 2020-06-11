$(function() {
    var video = $("#myvideo")[0];
    // video.addEventListener("loadeddata",function(){
    //   console.log("loadeddata下载完成！");
    //   $(".mask1").fadeIn(200);
    // });
    // video.addEventListener("canplay",function(){
    //   console.log("canplay下载完成！");
    //   $(".mask1").fadeIn(200);
    // });
    // video.addEventListener("play",function(){
    //   console.log("play下载完成！");
    //   $(".mask1").fadeIn(200);
    // });
    // $("#myvideo").load(function(){
    //   console.log("onload下载完成！");
    //   alert('document');
    //   $(".mask1").fadeIn(200);
    // });
    setTimeout(function() {
        $(".mask1").fadeIn(200);
    }, 3000);
    $(".star").click(function() {
        $(".wrap1").hide();
        $("#myvideo").show();
        video.play();
    });
    video.addEventListener("ended", function() {
        console.log("播放完成！");
        document.getElementById("myvideo").pause();
        $("#myvideo").hide();
        $(".wrap2").show();
        //setTimeout(function(){
        $(".mask2").fadeIn(200);
        //},1300);
    });
});

var tokenServerUrl = "http://kugou.cloudplug.cn/WechatToken/getJsConfig";
document.write("<script src='" + tokenServerUrl + "?url=" + encodeURIComponent(window.location.href) + "&jsApiList=onMenuShareTimeline,onMenuShareAppMessage,onMenuShareQQ,onMenuShareWeibo,onMenuShareQZone'><\/script>");
//微信Start
var shareTitle = "《变形金刚5》“幕后花絮”抢先看！剧透慎点！";
var shareUrl = "http://kugou.cloudplug.cn/kugou/index.html";
var shareImg = "http://kugou.cloudplug.cn/kugou/img/logo.jpg";
var shareDesc = "变5神秘新角色，原来是这样诞生的。";
wx.ready(function() {
    //分享到朋友圈
    wx.onMenuShareTimeline({
        title: shareTitle, // 分享标题
        link: shareUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: shareImg, // 分享图标
        success: function() {
            // 用户确认分享后执行的回调函数
        },
        cancel: function() {
            // 用户取消分享后执行的回调函数
        }
    });
    //分享给朋友
    wx.onMenuShareAppMessage({
        title: shareTitle, // 分享标题
        desc: shareDesc, // 分享描述
        link: shareUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: shareImg, // 分享图标
        type: 'link', // 分享类型,music、video或link，不填默认为link
        dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
        success: function() {
            // 用户确认分享后执行的回调函数
        },
        cancel: function() {
            // 用户取消分享后执行的回调函数
        }
    });
    //分享到QQ
    wx.onMenuShareQQ({
        title: shareTitle, // 分享标题
        desc: shareDesc, // 分享描述
        link: shareUrl, // 分享链接
        imgUrl: shareImg, // 分享图标
        success: function() {
            // 用户确认分享后执行的回调函数
        },
        cancel: function() {
            // 用户取消分享后执行的回调函数
        }
    });
    //分享到腾讯微博
    wx.onMenuShareWeibo({
        title: shareTitle, // 分享标题
        desc: shareDesc, // 分享描述
        link: shareUrl, // 分享链接
        imgUrl: shareImg, // 分享图标
        success: function() {
            // 用户确认分享后执行的回调函数
        },
        cancel: function() {
            // 用户取消分享后执行的回调函数
        }
    });
    //分享到QQ空间
    wx.onMenuShareQZone({
        title: shareTitle, // 分享标题
        desc: shareDesc, // 分享描述
        link: shareUrl, // 分享链接
        imgUrl: shareImg, // 分享图标
        success: function() {
            // 用户确认分享后执行的回调函数
        },
        cancel: function() {
            // 用户取消分享后执行的回调函数
        }
    });
});
//微信End