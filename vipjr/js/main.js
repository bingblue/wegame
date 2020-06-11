$(function() {
    var game1Result = false;
    var game2Result = false;
    var appUrl = "http://121.196.222.36/vipjr";
    var evaluationUrl = appUrl + "/evaluation";
    var lotteryUrl = appUrl + "/lottery";
    var game2NowStge = 1;

    /*$(".back").click(function() {
     history.go(-1);
     });*/
    if (localStorage.gameOne) {
        $(".game1-complate").show();
    }
    if (localStorage.gameTwo) {
        $(".game2-complate").show();
    }
    //GameOne
    for (var i = 0; i < 9; i++) {
        $(".animate li:eq(0)").insertAfter($(".animate li:eq(" + Math.floor(Math.random() * 9) + ")"));
    }
    $(".animate li").click(function() {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
        game1Result = false;
        $(".active").each(function(i) {
            if ($(".active").eq(i).attr("data-result") == "yes" && $(".active").length == 6) {
                game1Result = true;
            } else {
                game1Result = false;
                return false;
            }
        });
    });
    $(".game1-ok").click(function() {
        if (game1Result) {
            localStorage.setItem("gameOne", "true");
            $(".mask.success").show();
        } else {
            $(".mask.error").show();
        }
    });
    //GameOne End
    //GameTwo
    //判定语音分数和是否跳出结果
    window.game2ResultFun = function($this, result, score) {
        $this.siblings("span").text(score).animate({
            "opacity": 0
        });
        $this.siblings("span").animate({
            "opacity": 1
        }, 200);
        $this.attr("data-result", result);
        $(".item .read").each(function(i) {
            if ($(".item .read").eq(i).attr("data-result") == "yes") {
                game2Result = true;
                localStorage.setItem("gameTwo", "true");
            } else {
                game2Result = false;
                return false;
            }
        });
        setTimeout(function() {
            if (game2Result) {
                $(".mask.good").show();
            }
        }, 900);
    };
    function getGame2ResultFun($this) {
        $this.removeClass('active');
        //第二次点击录音结束提交
        //doing something and ajax
        wx.stopRecord({
            success: function(res) {
                var record_localId = res.localId;
                wx.uploadVoice({
                    localId: record_localId, // 需要上传的音频的本地ID，由stopRecord接口获得
                    isShowProgressTips: 1, // 默认为1，显示进度提示
                    success: function(res) {
                        $this.siblings("span").text("评测中……").animate({
                            "opacity": 0
                        });
                        $this.siblings("span").animate({
                            "opacity": 1
                        }, 200);
                        var serverId = res.serverId; // 返回音频的服务器端ID
                        evaluation($this, serverId);
                    }
                });
            }
        });
    }
    $(".read").click(function() {
        //改变图片
        var $this = $(this);
        if ($this.parents(".item").siblings(".item").find('.read.active').length > 0) {
            return false;
        }
        if ($this.hasClass('active')) {
            getGame2ResultFun($this);
        } else {
            //第一次点击开始录音
            $this.addClass('active');
            //doing something
            game2NowStge = $this.attr("data-stage");
            wx.startRecord();
            setTimeout(function() {
                if ($this.hasClass('active')) {
                    getGame2ResultFun($this);
                }
            }, 5000);
        }
    });
    //评测
    function evaluation($this, mediaId) {
        $.ajax({
            type: "post",
            url: evaluationUrl,
            dataType: "json",
            data: {
                stage: game2NowStge,
                mediaId: mediaId
            },
            async: true,
            success: function(data) {
                if (data.Code === '0') {
                    window.game2ResultFun($this, (data.Score == 'Good' || data.Score == 'Excellent') ? "yes" : "no", data.Score);
                } else {
                    window.game2ResultFun($this, "no", data.Msg);
                }
            },
            error: function(error) {
                window.game2ResultFun($this, "no", "Try again");
                alert("亲！服务器出错了哦，重新试一下吧！");
            }
        });
    }
    //GameTwo End
    //GameThree
    if (!checkUser()) {
        $(".ani-game3").addClass("ani-game3-static");
        $(".mask.people").show();
    }
    function checkUser() {
        return localStorage.getItem("UserMobile") != null
    }
    //抽奖中奖
    function getWinResult($this, winName, winPic) {
        //$(this).attr("src",$(".anti ul").attr("data-src"));
        $this.find('img:eq(1)').attr('src', winPic);
        $this.find('img').removeClass("ani0");
        $this.find('img').addClass("ani-game3-win");
        $(".mask.win h3").text(winName);
        setTimeout(function() {
            $(".mask.win").show();
        }, 1800);
    }

    if (localStorage.getItem("PrizeName") != null) {
        $(".ani-game3").addClass("ani-game3-static");
        $(".mask.win h3").text(localStorage.getItem("PrizeName"));
        $(".mask.win").show();
    } else {
        setTimeout(function() {
            $(".anti li").click(function() {
                //ajax and doing somthing
                doLottery($(this));
            });
        }, 4000);
    }
    function doLottery($anti) {
        if (checkUser()) {
            $.ajax({
                type: "post",
                url: lotteryUrl,
                dataType: "json",
                data: {
                    Email: localStorage.getItem("UserEmail"),
                    Mobile: localStorage.getItem("UserMobile")
                },
                async: true,
                success: function(data) {
                    var result = data.result;
                    var resultCode = result.ResultCode;
                    if (resultCode == 0) {
                        var prizeInfo = result.PrizeInfo;
                        localStorage.setItem("PrizeSn", prizeInfo.PrizeSn);
                        localStorage.setItem("PrizeName", prizeInfo.PrizeName);
                        localStorage.setItem("PrizeLevel", prizeInfo.PrizeLevel);
                        localStorage.setItem("IsHaveRedeemCode", prizeInfo.IsHaveRedeemCode);
                        localStorage.setItem("RedeemCode", prizeInfo.RedeemCode);
                        getWinResult($anti, localStorage.getItem("PrizeName"), 'img/' + localStorage.getItem("PrizeSn") + '.png');
                    } else if (resultCode == -1) {
                        alert("请求参数缺失");
                    } else if (resultCode == -2) {
                        alert("Token验证失败");
                    } else if (resultCode == -3) {
                        alert("未留名单，请先留名单");
                        showLinkagePage();
                    } else if (resultCode == -4) {
                        alert("活动无效");
                    } else if (resultCode == -5) {
                        alert("无抽奖机会");
                    } else {
                        alert("系统异常");
                    }
                },
                error: function(error) {
                    alert("亲！服务器出错了哦，重新试一下吧！");
                }
            });
        }
    }
    //GameThree End
    //样本播放
    $(".item1 .listen").on('touchstart', function() {
        var media1 = $("#media1").get(0);
        media1.play();
    });
    $(".item2 .listen").on('touchstart', function() {
        var media2 = $("#media2").get(0);
        media2.play();
    });
    $(".item3 .listen").on('touchstart', function() {
        var media3 = $("#media3").get(0);
        media3.play();
    });

});
