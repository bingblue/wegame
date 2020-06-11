var baseUrl = "http://h5.gelaoguan.sh.cn" //http://h5.gelaoguan.sh.cn http://localhost:8080/jl
var config = {
  submitLottery: baseUrl + "/submitLottery", // 用户抽奖订单提交
  shareLottery: baseUrl + "/shareLottery", // 用户分享成功后添加抽奖订单
  getActivityInfo: baseUrl + "/getActivityInfo", // 获取活动信息
  getPrizeList: baseUrl + "/getPrizeList", // 获取奖品列表
  getWinnerList: baseUrl + "/getWinnerList", // 获取中奖名单
  getImageCode: baseUrl + "/getImageCode", // 获取图片验证码
  getWxConfig: baseUrl + "/getWxConfig", // 获取微信分享Config
  countdown: 5, // 倒计时秒数
}

function muGet(url, cb) {
  $.ajax({
    type: "GET",
    url: url,
    dataType: "json",
    success: function (data) {
      if (data.status == 0) {
        cb(data)
      } else {
        alert(data.message)
      }
    },
    error: function () {
      alert("网络异常，请重试!")
      setTimeout(function () {
        window.location.reload(true)
      }, 1000)
    },
  })
}
function muPost(url, data, cb) {
  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json charset=utf-8",
    success: function (data) {
      if (data.status == 0) {
        cb(data)
      } else {
        alert(data.message)
      }
    },
    error: function () {
      alert("网络异常，请重试!")
      setTimeout(function () {
        window.location.reload(true)
      }, 1000)
    },
  })
}
function countdown(date, startDate) {
  // var date = '2019-01-12 20:48:59'
  var diff = 0
  if (startDate - new Date() > 0) {
    diff = date - startDate
  } else {
    diff = date - new Date()
  }

  if (diff <= 0) {
    $(".txt-d").text("00")
    $(".txt-h").text("00")
    $(".txt-m").text("00")
    $(".txt-s").text("00")
    return false
  }
  var d = Math.floor(diff / (24 * 3600 * 1000))
  d = d > 9 ? d : "0" + d
  var l1 = diff % (24 * 3600 * 1000)
  var h = Math.floor(l1 / (3600 * 1000))
  h = h > 9 ? h : "0" + h
  var l2 = l1 % (3600 * 1000)
  var m = Math.floor(l2 / (60 * 1000))
  m = m > 9 ? m : "0" + m
  var l3 = l2 % (60 * 1000)
  var s = Math.round(l3 / 1000)
  s = s > 9 ? s : "0" + s
  $(".txt-d").text(d)
  $(".txt-h").text(h)
  $(".txt-m").text(m)
  $(".txt-s").text(s)
  setTimeout(function () {
    countdown(date, startDate)
  }, 1000)
}
function initWxShare(shareSuccessCallback) {
  var url = window.location.href
  url = "?url=" + encodeURIComponent(url)

  muGet(config.getWxConfig + url, function (data) {
    var configData = {
      appId: data.data.appId, // 必填，公众号的唯一标识
      timestamp: data.data.timestamp, // 必填，生成签名的时间戳
      nonceStr: data.data.nonceStr, // 必填，生成签名的随机串
      signature: data.data.signature, // 必填，签名
      jsApiList: [
        "updateAppMessageShareData",
        "updateTimeLineShareData",
        "onMenuShareTimeline",
        "onMenuShareAppMessage",
      ], // 必填，需要使用的JS接口列表
    }
    wx.config(configData)
    wx.ready(function () {
      var shareData = {
        title: data.data.shareData.title, // 分享标题
        desc: data.data.shareData.content, // 分享描述
        link: data.data.shareData.url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: data.data.shareData.imgUrl, // 分享图标
        success: shareSuccessCallback,
      }
      try {
        // 分享给朋友
        wx.updateAppMessageShareData(shareData)
      } catch (err) {
        console.log(err)
      }
      try {
        // 分享到朋友圈
        wx.updateTimeLineShareData(shareData)
      } catch (err) {
        console.log(err)
      }
      try {
        wx.onMenuShareTimeline(shareData)
      } catch (err) {
        console.log(err)
      }
      try {
        wx.onMenuShareAppMessage(shareData)
      } catch (err) {
        console.log(err)
      }
    })
  })
}
$(function () {
  /**
   * 倒计时功能
   */
  // var isSend = false
  // var num = config.countdown
  // $('.btn-send').click(function(){
  //   if(isSend) return
  //   isSend = true
  //   var t = setInterval(function() {
  //     if(num <= 0) {
  //       $('.btn-send').css({
  //         background: 'transparent'
  //       }).text('')
  //       clearInterval(t)
  //       isSend = false
  //       num = config.countdown
  //       return
  //     }
  //     --num
  //     $('.btn-send').css({
  //       background: '#fc6'
  //     }).text(num+'秒')
  //   }, 1000)
  // })
})
