var config = {
//  addShareTicket  : '/lottery/addShareTicket',
  isLogin: '/lottery/isLogin',
  lottery: '/lottery/lottery'
}
memberId = ''
$(function () {
  $.ajax({
    type: 'GET',
    url: config.isLogin,
    dataType: 'json',
    success: function(data){
      if(data.login==false){
        window.location.href = data.toLoginUrl
      }else{
        $('#lotteryQuantity').text(data.lotteryQuantity)
        memberId = data.memberId
        // 设置跑马灯
      }
        setMarqueeStr(data.middleList)
    },
    error: function(){
      alert('网络异常，请重试!')
      setTimeout(function(){
        window.location.reload(true)
      },1000)
    }
  })
  /**
   * 测试跑马灯
   */
  // var data = {
  //   middleList: [{
  //     prize: '奖品1',
  //     username: 'iyv****71'
  //   },{
  //     prize: '奖品2',
  //     username: 'iyv****72'
  //   },{
  //     prize: '奖品3',
  //     username: 'iyv****73'
  //   },{
  //     prize: '奖品4',
  //     username: 'iyv****74'
  //   }]
  // }
  // setMarqueeStr(data.middleList)
  /**
   * 游戏规则
   */
  $('.rule').click(function(){
    $('.mask-rule').show()
  })
  /**
   * 分享
   */
  $('.share').click(function(){
    $('.mask-share').show()
  })
  /**
   * 点击弹层关闭
   */
  $('.mask').click(function(){
    $('.mask').hide()
  })
  /**
   * 开始砸蛋动画
   */
  $('.egg').click(function(){
    $.ajax({
      type: 'POST',
      url: config.lottery,
      dataType: 'json',
      success: function(data){
        // var data = {
        //   resultCode: '1',
        //   prize: {
        //     name: 'iPhone 100',
        //     linkUrl: 'bingblue.com'
        //   }
        // }
        if(data.resultCode=='1'){
          //抽奖成功
          var isWin = '.mask-fail'
          var num = $('#lotteryQuantity').text()*1 - 1
          if(num < 0){
              num = 0
          }
          $('#lotteryQuantity').text(num)
          if(data.prize){
            isWin = '.mask-win'
            $('#prizeName').text(data.prize.name)
            $('.btn-win').attr('href',data.prize.linkUrl)
          }
          $('.mask-break').show()
          $('.ani-hammer').addClass('active')
          setTimeout(function(){
            $('.jq-bg').attr('src','img/egg_stat2.png')
          },1100)
          setTimeout(function(){
            $('.mask-break').fadeOut(800,function(){
              $('.jq-bg').attr('src','img/egg_stat1.png')
            })
            setTimeout(function(){
              $(isWin).fadeIn(300)
            }, 450)
          },1750)
        }else if(data.resultCode=='2'){
          //无抽奖资格
          alert('无法抽奖，抽奖次数已用尽！')
        }else if(data.resultCode=='3'){
          //活动结束
          alert('对不起，活动已经结束！')
        }else{
          //未登录或其他情况
          window.location.reload(true)
        }
      },
      error: function(){
        alert('网络异常，请重试!')
        setTimeout(function(){
          window.location.reload(true)
        },1000)
      }
    })
  })

  /**
   * 设置跑马灯字符串
   */
  function setMarqueeStr(arr){
    var marqueeStr = ''
    for(var i=0;i<arr.length;i++){
      marqueeStr += '&nbsp;&nbsp;&nbsp;&nbsp;手机号&nbsp;' + arr[i].username + '&nbsp;砸出&nbsp;' + arr[i].prize
    }
    $('.marquee').html(marqueeStr)
  }
})
