﻿var baseUrl = "http://h5.gelaoguan.sh.cn" //http://h5.gelaoguan.sh.cn http://localhost:8080/jl
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
/* 计时 */
let minute = 0
let second = 0
let millisecond = 0
let millisecond2 = 0
let t = null
let t2 = null
function timer () {
  millisecond += 100
  console.log(millisecond)
  if( millisecond >= 1000) {
    millisecond = 0
    second += 1
  }
  if(second >= 60) {
    second = 0
    minute += 1
  }
  millisecondStr = millisecond.toString()
  secondStr = second.toString()
  minuteStr = minute.toString()
  let num1 = minute > 9 ? minuteStr[0] : 0
  let num2 = minuteStr[1] || minuteStr[0]
  let num3 = second > 9 ? secondStr[0] : 0
  let num4 = secondStr[1] || secondStr[0]
  let num5 = millisecond > 99 ? millisecondStr[0] : 0
  let num6 = millisecond > 9 ? millisecondStr[1] : 0
  let num7 = millisecondStr[4] || millisecondStr[3] || millisecondStr[2] || millisecondStr[1] || millisecondStr[0]
  $(".num1").text(num1)
  $(".num2").text(num2)
  $(".num3").text(num3)
  $(".num4").text(num4)
  $(".num5").text(num5)
  // $(".num6").text(num6)
  // $(".num7").text(num7)
}
function timer2 () {
  millisecond2 += 1
  if (millisecond2 > 9) millisecond2 = 0
  $(".num6").text(millisecond2)
  let num7 = millisecond2 + 1
  $(".num7").text(num7.toString()[0])
}
function startTimer () {
  t = setInterval(function () {
    timer()
  }, 100)
  t2 = setInterval(function () {
    timer2()
  }, 30)
}
function clearTimer () {
  window.clearTimeout(t)
  window.clearTimeout(t2)
}
/* 计时 END */

let touchFlag = true
function change ($this, diff) {
  if (!touchFlag) return false
  touchFlag = false
  let imgs = $('.games img')
  let index = imgs.index($this)
  let changeIndex = index + diff
  if (changeIndex < 0 || changeIndex >= imgs.length) return false
  let temp = imgs[index]
  imgs[index] = imgs[changeIndex]
  imgs[changeIndex] = temp
  $(".games").html(imgs)
  if(success()) {
    // 成功
    alert('成功')
    clearTimer()
  } else {
    touch()
    setTimeout(function(){
      touchFlag = true
    }, 500)
  }
}

function touch () {
  $('.games img').mutouch({
    banRight: true,
    offsetX : 50,
    offsetY : 50,
    onSwipeLeft: function(type) {
      // 左滑滑动
      console.log('左滑滑动')
      change(this.$this[0], -1)
    },
    onSwipeRight: function(type) {
      // 右滑滑动
      console.log('右滑滑动')
      change(this.$this[0], 1)
    },
    onSwipeTop: function(type) {
      if(type=="left"){
        // 上左滑动
        console.log('上左滑动')
        change(this.$this[0], -4)
      }else if(type=="right"){
        // 上右滑动
        console.log('上右滑动')
        change(this.$this[0], -2)
      }else{
        // 上滑滑动
        console.log('上滑滑动')
        change(this.$this[0], -3)
      }
    },
    onSwipeDown: function(type) {
      if(type=="left"){
        // 下左滑动
        console.log('下左滑动')
        change(this.$this[0], 2)
      }else if(type=="right"){
        // 下右滑动
        console.log('下右滑动')
        change(this.$this[0], 4)
      }else{
        // 下滑滑动
        console.log('下滑滑动')
        change(this.$this[0], 3)
      }
    }
  })
}

function success () {
  let result = true
  $('.games img').each(function(i, v){
    let order = $(this).data('order')
    console.log(i, order)
    if ((i+1) != order) result = false
  })
  return result
}
/**
 * 打乱 dom 顺序
 */
function random () {
  $(".games").html(Array.prototype.sort.call($('.games img'), function () {
    return Math.random() - 0.5
  }))
}

let infoArray = [{
  name: '牛舌：',
  img: 'img/part/part1.png',
  desc: '牛的舌头，肉质香软，嚼劲十足。'
},{
  name: '雪花：',
  img: 'img/part/part2.png',
  desc: '牛脖仁，红白相间，呈大理石纹，爽滑略带嚼劲（即西餐中常见的上脑）。'
},{
  name: '吊龙：',
  img: 'img/part/part3.png',
  desc: '牛里脊，肉质鲜嫩，淡淡的油脂甘香（即西餐中常见的西冷和菲力）。'
},{
  name: '鲜牛肉：',
  img: 'img/part/part4.png',
  desc: '位于牛后腿上部嫩肉部分，嫩肉瘦中带肥，鲜嫩可口(即西餐中常见的肋眼牛排)'
},{
  name: '匙皮肉：',
  img: 'img/part/part5.png',
  desc: '牛肩胛里脊肉，肥瘦适中，爽滑鲜嫩。'
},{
  name: '胸口朥：',
  img: 'img/part/part6.png',
  desc: '牛胸口油，爽嫩弹压。'
},{
  name: '匙柄：',
  img: 'img/part/part7.png',
  desc: '牛前腿肉，穿插细筋，成树冠状，鲜嫩无渣。'
},{
  name: '肥胼：',
  img: 'img/part/part8.png',
  desc: '牛腹夹层肉，略有嚼劲。'
},{
  name: '腱子肉：',
  img: 'img/part/part9.png',
  desc: '牛腱子肉，口感介于脆嫩之间。'
}]
/**
 * 设置 info 页面内容
 */
function setInfo (index) {
  let obj = infoArray[index-1]
  $('.info-title').text(obj.name)
  $('.info-img').attr("src", obj.img)
  $('.info-desc').text(obj.desc)
  $('.mask-info').show()
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
  // $('.mask-info').show()
  touch()
})
