//let baseUrl = "http://sayming.iok.la:29850"
let baseUrl = "http://yx.zuotingyouyuan.com"
let config = {
  updateMobile: baseUrl + "/publicApi/updateMobile",        // 更新登录会员手机号
  prizeList: baseUrl + "/publicApi/prize/list",             // 奖品列表
  quantity: baseUrl + "/publicApi/member/quantity",         // 获取抽奖次数
  source: baseUrl + "/publicApi/member/integralAvailable",  // 查询可用积分额
  lottery: baseUrl + "/publicApi/lottery",                  // 抽奖
  change: baseUrl + "/publicApi/member/addQuantity",        // 积分兑换
  
  wxConfig:{}
}
/**
 * 获取抽奖次数，积分等信息
 */
function getInfo() {
  muGet(config.quantity, res => {
    $('.btn-source span').text(res)
  })
  muGet(config.source, res => {
    // 不用显示积分
  })
}
/**
 * 奖品列表
 */
function prizeList() {
  muGet(config.prizeList, res => {
    $('.my-prize').empty()
    res.forEach(item => {
      $(`<li><a href="${item.url}">${item.name}</a></li>`).appenTo('.my-prize')
    })
  })
}
/**
 * 封装 get 请求
 * @param {String} url 请求地址
 * @param {Function} cb 回调方法
 */
function muGet(url, cb) {
  // return
  $.ajax({
    type: "GET",
    url: url,
    dataType: "json",
    success: function (data) {
      let dataStr = JSON.stringify(data)
      if (data.code == 200) {
        cb(data.data)
      } else {
        alert(data.message)
      }
    },
    error: function (err) {
      let dataStr = JSON.stringify(err)
      setTimeout(function () {
        // window.location.reload(true)
      }, 1000)
    },
  })
}
/**
 * 封装 post 请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Function} cb 回调方法
 */
function muPost(url, data, cb) {
  // return
  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json charset=utf-8",
    success: function (data) {
      let dataStr = JSON.stringify(data)
//      alert(dataStr)
      if (data.code == 200) {
        cb(data)
      } else {
        alert(data.message)
      }
    },
    error: function (err) {
      let dataStr = JSON.stringify(err)
//      alert(dataStr)
      setTimeout(function () {
        // window.location.reload(true)
      }, 1000)
    },
  })
}

function checkUser(){
	let userInfo = config.wxConfig.userInfo;
	if(userInfo == null || userInfo == ""){// 登录
		window.location.href = config.wxConfig.userLoginUrl
	}else if(userInfo.mobile == null || userInfo.mobile == ""){// 注册手机
		$('.mask-phone').show()
		return false;
	}
	return true;
}

function initWxShare(shareSuccessCallback) {
  let url = window.location.href
  url = "?url=" + encodeURIComponent(url)

  muGet(config.getWxConfig + url, function (data) {
	config.wxConfig = data.data;
	checkUser();
    let configData = {
      appId: data.data.appId, // 必填，公众号的唯一标识
      timestamp: data.data.timestamp, // 必填，生成签名的时间戳
      nonceStr: data.data.nonceStr, // 必填，生成签名的随机串
      signature: data.data.signature, // 必填，签名
      jsApiList: [
        "onMenuShareAppMessage",
        "onMenuShareTimeline"
      ], // 必填，需要使用的JS接口列表
    }
    wx.config(configData)
    wx.ready(function () {
      let shareData = {
        title: data.data.shareData.title, // 分享标题
        desc: data.data.shareData.content, // 分享描述
        link: data.data.shareData.url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: data.data.shareData.imgUrl, // 分享图标
        success: shareSuccessCallback,
      }
      try {
        // 分享给朋友
        wx.onMenuShareAppMessage(shareData)
      } catch (err) {
        console.log(err)
      }
      try {
        // 分享到朋友圈
        wx.onMenuShareTimeline(shareData)
      } catch (err) {
        console.log(err)
      }
    })
  })
}

function getUrlParam(name){
  let reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  let r = window.location.search.substr(1).match(reg);  //匹配目标参数
  if (r!=null) return unescape(r[2]); return null; //返回参数值
}