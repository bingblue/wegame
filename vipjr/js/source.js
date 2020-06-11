/*!
 * jQuery Placeholder Plugin v2.3.1
 * https://github.com/mathiasbynens/jquery-placeholder
 *
 * Copyright 2011, 2015 Mathias Bynens
 * Released under the MIT license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    
    /**** 
     * Allows plugin behavior simulation in modern browsers for easier debugging.
     * When setting to true, use attribute "placeholder-x" rather than the usual "placeholder" in your inputs/textareas
     * i.e. <input type="text" placeholder-x="my placeholder text" />
     */
    var debugMode = false;

    if (!$("head style[_placeholder]").length) {
        var styleHtml = "<style _uiPlaceholder='lock'>" +
            ".placeholder{color: #999999;} " +
            "</style>";

        $("head").append(styleHtml);
    }

    // Opera Mini v7 doesn't support placeholder although its DOM seems to indicate so
    var isOperaMini = Object.prototype.toString.call(window.operamini) === '[object OperaMini]';
    var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini && !debugMode;
    var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini && !debugMode;
    var valHooks = $.valHooks;
    var propHooks = $.propHooks;
    var hooks;
    var placeholder;
    var settings = {};

    if (isInputSupported && isTextareaSupported) {

        placeholder = $.fn.placeholder = function () {
            return this;
        };

        placeholder.input = true;
        placeholder.textarea = true;

    } else {

        placeholder = $.fn.placeholder = function (options) {

            var defaults = {
                customClass: 'placeholder'
            };
            settings = $.extend({}, defaults, options);

            return this.filter((isInputSupported ? 'textarea' : ':input') + '[' + (debugMode ? 'placeholder-x' : 'placeholder') + ']')
                .not('.' + settings.customClass)
                .not(':radio, :checkbox, [type=hidden]')
                .bind({
                    'focus.placeholder': clearPlaceholder,
                    'blur.placeholder': setPlaceholder
                })
                .data('placeholder-enabled', true)
                .trigger('blur.placeholder');
        };

        placeholder.input = isInputSupported;
        placeholder.textarea = isTextareaSupported;

        hooks = {
            'get': function (element) {

                var $element = $(element);
                var $passwordInput = $element.data('placeholder-password');

                if ($passwordInput) {
                    return $passwordInput[0].value;
                }

                return $element.data('placeholder-enabled') && $element.hasClass(settings.customClass) ? '' : element.value;
            },
            'set': function (element, value) {

                var $element = $(element);
                var $replacement;
                var $passwordInput;

                if (value !== '') {

                    $replacement = $element.data('placeholder-textinput');
                    $passwordInput = $element.data('placeholder-password');

                    if ($replacement) {
                        clearPlaceholder.call($replacement[0], true, value) || (element.value = value);
                        $replacement[0].value = value;

                    } else if ($passwordInput) {
                        clearPlaceholder.call(element, true, value) || ($passwordInput[0].value = value);
                        element.value = value;
                    }
                }

                if (!$element.data('placeholder-enabled')) {
                    element.value = value;
                    return $element;
                }

                if (value === '') {

                    element.value = value;

                    // Setting the placeholder causes problems if the element continues to have focus.
                    if (element != safeActiveElement()) {
                        // We can't use `triggerHandler` here because of dummy text/password inputs :(
                        setPlaceholder.call(element);
                    }

                } else {

                    if ($element.hasClass(settings.customClass)) {
                        clearPlaceholder.call(element);
                    }

                    element.value = value;
                }
                // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
                return $element;
            }
        };

        if (!isInputSupported) {
            valHooks.input = hooks;
            propHooks.value = hooks;
        }

        if (!isTextareaSupported) {
            valHooks.textarea = hooks;
            propHooks.value = hooks;
        }

        $(function () {
            // Look for forms
            $(document).delegate('form', 'submit.placeholder', function () {

                // Clear the placeholder values so they don't get submitted
                var $inputs = $('.' + settings.customClass, this).each(function () {
                    clearPlaceholder.call(this, true, '');
                });

                setTimeout(function () {
                    $inputs.each(setPlaceholder);
                }, 10);
            });
        });

        // Clear placeholder values upon page reload
        $(window).bind('beforeunload.placeholder', function () {

            var clearPlaceholders = true;

            try {
                // Prevent IE javascript:void(0) anchors from causing cleared values
                if (document.activeElement.toString() === 'javascript:void(0)') {
                    clearPlaceholders = false;
                }
            } catch (exception) {
            }

            if (clearPlaceholders) {
                $('.' + settings.customClass).each(function () {
                    this.value = '';
                });
            }
        });
    }

    function args(elem) {
        // Return an object of element attributes
        var newAttrs = {};
        var rinlinejQuery = /^jQuery\d+$/;

        $.each(elem.attributes, function (i, attr) {
            if (attr.specified && !rinlinejQuery.test(attr.name)) {
                newAttrs[attr.name] = attr.value;
            }
        });

        return newAttrs;
    }

    function clearPlaceholder(event, value) {

        var input = this;
        var $input = $(this);

        if (input.value === $input.attr((debugMode ? 'placeholder-x' : 'placeholder')) && $input.hasClass(settings.customClass)) {

            input.value = '';
            $input.removeClass(settings.customClass);

            if ($input.data('placeholder-password')) {

                $input = $input.hide().nextAll('input[type="password"]:first').show().attr('id', $input.removeAttr('id').data('placeholder-id'));

                // If `clearPlaceholder` was called from `$.valHooks.input.set`
                if (event === true) {
                    $input[0].value = value;

                    return value;
                }

                $input.focus();

            } else {
                input == safeActiveElement() && input.select();
            }
        }
    }

    function setPlaceholder(event) {
        var $replacement;
        var input = this;
        var $input = $(this);
        var id = input.id;

        // If the placeholder is activated, triggering blur event (`$input.trigger('blur')`) should do nothing.
        if (event && event.type === 'blur' && $input.hasClass(settings.customClass)) {
            return;
        }

        if (input.value === '') {
            if (input.type === 'password') {
                if (!$input.data('placeholder-textinput')) {

                    try {
                        $replacement = $input.clone().prop({
                            'type': 'text'
                        });
                    } catch (e) {
                        $replacement = $('<input>').attr($.extend(args(this), {
                            'type': 'text'
                        }));
                    }

                    $replacement
                        .removeAttr('name')
                        .data({
                            'placeholder-enabled': true,
                            'placeholder-password': $input,
                            'placeholder-id': id
                        })
                        .bind('focus.placeholder', clearPlaceholder);

                    $input
                        .data({
                            'placeholder-textinput': $replacement,
                            'placeholder-id': id
                        })
                        .before($replacement);
                }

                input.value = '';
                $input = $input.removeAttr('id').hide().prevAll('input[type="text"]:first').attr('id', $input.data('placeholder-id')).show();

            } else {

                var $passwordInput = $input.data('placeholder-password');

                if ($passwordInput) {
                    $passwordInput[0].value = '';
                    $input.attr('id', $input.data('placeholder-id')).show().nextAll('input[type="password"]:last').hide().removeAttr('id');
                }
            }

            $input.addClass(settings.customClass);
            $input[0].value = $input.attr((debugMode ? 'placeholder-x' : 'placeholder'));

        } else {
            $input.removeClass(settings.customClass);
        }
    }

    function safeActiveElement() {
        // Avoid IE9 `document.activeElement` of death
        try {
            return document.activeElement;
        } catch (exception) {
        }
    }

    $.extend({
        "vPlaceholder": {
            "disabled": function ($ele) {
                if (isInputSupported && isTextareaSupported) {
                    $ele.attr("placeholder", "");
                    return this;
                }
                $ele.unbind("focus.placeholder");
                $ele.unbind("blur.placeholder");

                if ($ele[0].value == $ele.attr((debugMode ? 'placeholder-x' : 'placeholder'))) {
                    $ele[0].value = "";
                    $ele.attr("placeholder", "");
                }

                $ele.removeClass("placeholder");
                return this;
            }
        }
    })
}));
"use strict"; + function($, window, undefined) {
	$.extend($.fn, {
		vSelect: function(options, form) {

			if (!$("head style[_ui]").length) {
				var styleHtml = "<style _ui='lock'>" +
					".has-error .select_current{color: rgb(246, 86, 98)!important}" +
					".has-success{border: 1px solid rgb(106, 196, 81)!important;} " +
					".has-success .select_current{color: #000000}" +
					"</style>";

				$("head").append(styleHtml);
			}

			var selector = this.selector;

			var config = {};

			$.extend(true, config, options);

			$(this).each(function(index, element) {

				var self = $(element);

				if (self.parent(".select_wrap").length > 0) {
					return false;
				}

				var parentHash = "jQuery_" + new Date().getTime();

				self.wrap('<span class="select_wrap" _select=' + parentHash + '></span>');

				$('<span class="select_current"></span>' + '<span class="select_list"><dl></dl></span>' + '<span class="select_btn"></span>').insertBefore(self);

				var _parentId = "[_select='" + parentHash + "']";
				var _lists = _parentId + " .select_list";
				var _current = _parentId + " .select_current";
				var _arrow = _parentId + " .select_btn";
				var _list = _lists + " dl dd";
				var _selected = _parentId + " select option:selected";
				var _index = $(_selected).index();
				var _text = $(_selected).text();

				$(_current).text(_text);

				self.children().length && self.children().each(function(index, element) {

					if ($.nodeName(element, "OPTION")) {
						if (config.lp && !$(element).val()) {
							$(_lists + " dl").append('<dd style="display: none;">' + $(element).text() + '</dd>');
						} else {
							$(_lists + " dl").append('<dd>' + $(element).text() + '</dd>');
						}

					} else if ($.nodeName(element, "OPTGROUP")) {
						$(_lists + " dl").append('<dt>' + $(element).attr("label") + '</dt>');
						$(element).children().length && $(element).children().each(function(index, element) {
							$(_lists + " dl").append('<dd>' + $(element).text() + '</dd>');
						});
					}

				});

				/**
				 * [events bind]
				 */

				$(_current + ", " + _arrow).on("click", function(event) {

					event.stopPropagation();

					var _this = this;

					$("[_select]").each(function(index, element) {
						if ($(element).attr("_select") != parentHash) {
							$(element).find(".select_btn").removeClass("select_btn_on");
							$(element).find(".select_list").hide();
						}
					});

					$(_parentId).removeClass("has-error");
					$(_current).css("border", "");

					var bh = $(window).height() - $(_parentId).offset().top;
					var h = $(_lists).height();
					var _top = $(_current).height();

					if (h >= 350) {
						h = -350;
					} else {
						h = -h;
					}
					if ($(_parentId).offset().top - $(window).scrollTop() < 350) {
						$(_lists).css({
							"top": _top
						});
					} else {
						$(_list).css({
							"top": h
						});
					}

					$(_lists).stop().toggle();
					$(_arrow).toggleClass("select_btn_on");

					return false;

				});

				$(_list).each(function(index, element) {

					$(element).on("click", function(event) {

						event.stopPropagation();

						$(_current).text($(this).text());
						$(this).addClass("selected").siblings().removeClass("selected");

						$(_lists).removeAttr("style");

						$(_arrow).removeClass("select_btn_on");

						// self.get(0).selectedIndex = index + 1;
						self.get(0).selectedIndex = index;
						self.trigger("change");

						// no idea
						$(_parentId + " .msg-box").empty();


						if ($(this).text() != _text) {
							$(_parentId).addClass("has-success");
						} else {
							$(_parentId).removeClass("has-success");
						}

						return false;

					});

				});

				$(document).on("click", function(argument) {
					$(_lists).stop().hide();
					$(_arrow).removeClass("select_btn_on");
				});

				// for mobile
				if (navigator.userAgent.match(/mobile/i)) {

					$(_list).off("click").hide();
					$(_current).off("click");
					$(_arrow).off("click");
					$(_parentId).find("select").show().css({
						"opacity": 0,
						"z-index": 300,
						"visibility": "visible"
					}).change(function() {

						var sel_val = $(this).find("option:selected").text();

						$(_current).text(sel_val);

						if (sel_val != _text) {
							$(_parentId).addClass("has-success");
						} else {
							$(_parentId).removeClass("has-success");
						}

					});

				}

			});



		},
		vRadio: function(options, form) {

			var selector = this.selector;

			if (this.parent(".radio_wrap").length > 0) {
				return this;
			}

			this.wrap('<span class="radio_wrap"></span>'); //wrap the radio
			this.find("input").filter(":radio[checked]").parents(".radio_wrap").addClass("radio_on_wrap"); //add the class="radio_on_wrap" for selected option

			this.on("click", function() {
				$(form).find("input[type='radio']").removeAttr("checked");
				$(this).find("input").prop("checked", "true");

				$(form).find(".radio_wrap").removeClass("radio_on_wrap");
				$(this).parent(".radio_wrap").addClass("radio_on_wrap");
			});
			return this;

		},
		vCheckBox: function(argument) {
			// body...
		}
	});

}(jQuery, window, undefined);
"use strict";
+function ($, window, undefined) {
    $.extend($.fn, {
        validator: function (name, options) {

            if (!$("head style[_uiValidate]").length) {
                var styleHtml = "<style _uiValidate='lock'>" +
                    ".has-success{border: 1px solid rgb(106, 196, 81)!important;} " +
                    ".has-error{border: 1px solid rgb(246, 86, 98)!important;}" +
                    "" +
                    "" +
                    "</style>";

                $("head").append(styleHtml);
            }

            var rule = name;

            return this.each(function () {

                var self = $(this);

                var config = {};

                // last config
                config = $.extend(true, config, options);

                // error message
                config.rmsg = config.rmsg ? config.rmsg : $.validator.enumeration.message[rule];

                // function[ajax] message
                config.fnmsg = config.fnmsg ? config.fnmsg : $.validator.enumeration.message[rule];

                // 验证规则
                config.type = $.validator.enumeration[rule] ? $.validator.enumeration[rule] : config.rule;

                // blur回调
                config.fn = $.validator.enumeration[rule] ? $.validator.enumeration[rule] : null;

                var validtaorHash = "jQuery_" + Math.floor((new Date().getTime() * Math.random() * 10));

                self.parent().attr("_validtaor", validtaorHash);

                if (!self.attr("id")) {
                    self.attr("id", validtaorHash);
                }

                var _parent = "[_validtaor='" + validtaorHash + "']";
                var _error = _parent + " .meg-error";


                if (!!config.errorTarget) {
                    _error = config.errorTarget;
                } else {
                    if ($(_error).length == 0) {
                        self.after($("<label>", {
                            "class": "meg-error",
                            "for": self.attr("id")
                        }));
                    }
                }

                $(_error).stop().hide(0);

                self.on("focus", function () {

                    $(_parent).removeClass("has-error has-success has-warning");
                    $(_error).hide(0);

                }).on("blur", function (event, tag) {

                    var v = false,
                        errormsg,
                        value = $(this).val();

                    if (!!config.errorTarget) {
                        $(_error).attr("for", validtaorHash);
                    }

                    if (!$.trim(value)) {
                        if (!config.required) {
                            v = true;
                            errormsg = "";
                        } else {
                            $.vPlaceholder.disabled(self);
                            errormsg = config.rmsg;
                        }
                    } else if ($.trim(value) && config.type) {
                        if (Object.prototype.toString.call(config.type) == '[object Function]' && !config.type(value, self)) {
                            errormsg = config.rmsg
                        } else if (Object.prototype.toString.call(config.type) == "[object RegExp]" && !config.type.test(value)) {
                            errormsg = config.rmsg
                        } else {
                            v = true;
                        }
                    } else if ($.trim(value) && config.fn && !config.fn.call($(this), value, self, tag)) {
                        errormsg = config.fnmsg;
                    } else {
                        v = true;
                    }

                    if (v) {
                        if ($.trim(value)) {
                            $(_parent).removeClass("has-error has-success has-warning").addClass("has-success");
                        } else {
                            $(_parent).removeClass("has-error has-success has-warning");
                        }
                    } else {
                        $(_parent).removeClass("has-error has-success has-warning").addClass("has-error");
                        $(_error).text(errormsg).show();
                    }
                    $(this).data("validator", v);
                });
            });
        }
    });

    $.extend({
        "validator": {
            addRule: function (ruleName, rule, msg) {
                if (this.enumeration[ruleName]) {
                    window.console && console.warn("你确定重写验证规则！");
                }

                this.enumeration[ruleName] = rule;

                this.enumeration.message[ruleName] = msg;

            },
            enumeration: {
                username: /[\u4e00-\u9fa5A-Za-z]{2,20}|[\u4e00-\u9fa5]{2,8}/i,
                "name": function (v) {
                    v = $.trim(v);
                    var temp1 = /^[\u4e00-\u9fa5]{2,8}$/i.test(v);
                    var temp2 = /^([A-Za-z]+\s?)*[A-Za-z]$/.test(v);
                    var temp3 = /^[\u4e00-\u9fa5A-Za-z]{2,20}$/i.test(v);
                    var isTrue = (temp1 || temp2 || temp3) && (v.length <= 20);
                    return isTrue;
                },
                mobile: /^1[3,4,5,7,8]{1}[0-9]{9}$/,
                cphone: /^1[3,4,5,7,8]{1}[0-9]{9}$/,
                nation_code: function (v) {
                    v = $.trim(v);
                    var reg = /\+{0,1}[0-9]{1,4}/i;

                    if (!reg.test(v)) {
                        return false;
                    }
                    v = v.replace(/\+/i, "");

                    if (!(v * 1)) {
                        return false;
                    }
                    return /^[0-9]{1,4}$/i.test(v);
                },
                nation_phone: function (v, obj) {
                    v = $.trim(v);
                    this.rmsg = "请输入正确的手机";
                    var regJson = {
                        "86": /^1[3,4,5,7,8]{1}[0-9]{9}$/,
                        "852": /^[5,6,9][0-9]{7}$/,
                        "886": /^9[0-9]{8}$/,
                        "81": /^0[5|6|7|8|9]0[0-9]{8}$/
                    };

                    var nationCodeString = $(obj).parents("form").find("[name='nation_code']").val(),
                        regEx;
                    nationCodeString.replace(/\D/g, "");
                    var nationCode = nationCodeString * 1;

                    if (!nationCode) {
                        this.rmsg = "请输入正确的国码";
                        if (this.errorTarget) {
                            $(this.errorTarget).attr("for", $(obj).parents("form").find("[name='nation_code']").attr("id"));
                        }
                        return false;
                    }

                    regEx = nationCode in regJson ? regJson[nationCode] : /^(?:0|\d{1,4})[\s-]?((?:\d{6,10}))$/;

                    return regEx.test(v);

                },
                email: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
                mail: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
                //password: /^\S{6,}$/,
                password: /^(?!\d+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{6,18}$/,
                nickname: /^[A-Za-z0-9\u4E00-\u9FA5]+$/,
                identity: /^\d{17}[\d,x,X]$/,
                bankcard: /^\d{16,19}$/,
                chinname: /^[\u2E80-\u9FFF]{2,5}(?:•[\u2E80-\u9FFF]{2,5})*$/,
                coding: /^\d{12}$/,
                QQ: /^[1-9]{1}[0-9]{4,9}$/,
                captcha: /^\w{4}$/,
                message: {
                    username: "用户名错误",
                    name: "请输入正确的姓名",
                    mobile: "请输入正确的手机",
                    cphone: "请输入正确的手机",
                    nation_code: "请输入正确的国码",
                    nation_phone: "请输入正确的手机",
                    email: "请输入正确的邮箱",
                    mail: "请输入正确的邮箱",
                    password: "密码格式错误",
                    nickname: "昵称只能用中文、英文、数字组合",
                    identity: "身份证格式错误",
                    checkIdCard: "身份证号码错误",
                    bankcard: "银行卡格式错误",
                    chinname: "中文姓名格式有误",
                    coding: "员工编码格式错误",
                    QQ: "QQ号码格式错误",
                    captcha: "验证码格式错误"
                }
            },
            showError: function (target, msg) {

                var selector = target.selector;

                target.each(function (index, element) {

                    if ($.nodeName(element, "SELECT") && $(element).parent().attr("_select")) {

                        $(element).parent().addClass("has-error");

                        if (!!msg) {
                            $(element).parent().find(".select_current").html(msg);
                        }

                    }

                });

            }
        }
    });

}(jQuery, window, undefined);
"use strict";
/**
 * Created by harry on 16/5/23.
 */

+function ($, window, undefined) {

    $.extend($.fn, {
        vForm: function (options) {

            var selector = this.selector;

            var _ApiProtocol = (("https:" == document.location.protocol) ? " https://" : " http://");

            var index_exe_api_url = window.index_exe_api_url ? window.index_exe_api_url : _ApiProtocol + "openapi.vipabc.com/VMD/OfficalWebAPI/LandingPageAPI/LandingPage";

            var config = {
                "placeholder": true,
                "ui": {
                    "lp": true
                },
                "rules": {
                    "name": {
                        "required": true
                    },
                    "sex": {
                        "required": true
                    },
                    "age_area": {
                        "required": true
                    },
                    "cphone": {
                        "required": true
                    },
                    "nation_code": {
                        "required": true,
                        "errorTarget": $(this).find("._error-phone-target").selector
                    },
                    "nation_phone": {
                        "required": true,
                        "errorTarget": $(this).find("._error-phone-target").selector
                    },
                    "mail": {
                        "required": true
                    }
                },
                "target": false,
                "ajaxUrl": index_exe_api_url,
                "submitHandler": $.vForm.defaultSubmit
            };

            config = $.extend(true, config, options);

            $(this).each(function (index, element) {

                var self = $(element),
                    target = self.find("[type='submit']");

                // ! 将初始化内容储存，以便后续充值表单
                self.data({
                    "reset": self.html(),
                    "form": index
                });

                if (config.placeholder) {
                    !$.fn.placeholder && window.console && console.warn("vForm依赖，placeholder插件，请引用该插件！");
                    $.fn.placeholder && self.find("[placeholder]").placeholder();
                }

                if (config.ui) {
                    self.find("select").vSelect(config.ui, element);
                    // self.find("input[type='radio']").vRadio(config.ui, element);
                    self.find("input[type='radio']").parent().vRadio(config.ui, element);
                }

                if (config.rules && !$.isEmptyObject(config.rules)) {

                    if (!$.fn.validator) {
                        window.console && console.warn("vForm依赖，validator插件，请引用该插件！");
                        config.rules = null;
                    }
                    for (var key in config.rules) {
                        self.find("[name='" + key + "']").length && self.find("[name='" + key + "']").validator(key, config.rules[key]);
                    }

                }

                if (!config.target && !target.length && !self.find("[type='button']").length && !self.find("button").length) {
                    window.console && console.warn("请添加提交按钮，或者配置target节点对象！");
                    target = self;
                }

                if (config.target) {
                    target = self.find(config.target);
                }

                if (!target.length && !!self.find("[type='button']").length) {
                    target = self.find("[type='button']");
                } else if (!target.length && !!self.find("button").length) {
                    target = self.find("button");
                }

                target.off("click");
                target.on("click", function (event) {
                    // 检查信息是否合格
                    if (config.rules && !$.isEmptyObject(config.rules)) {

                        var passport = $.vForm.validate.call(self, config.rules);

                        if (passport) {
                            config.submitHandler.call(self, config, target);
                        }

                    } else {
                        config.submitHandler.call(self, config, target);
                    }

                    return false;
                });
                self.off("keydown");
                self.on("keydown", function (event) {
                    if (event.type === "keydown" && event.keyCode == 13) {
                        // 检查信息是否合格
                        if (config.rules && !$.isEmptyObject(config.rules)) {

                            var passport = $.vForm.validate.call(self, config.rules);

                            if (passport) {
                                config.submitHandler.call(self, config, target);
                            }

                        } else {
                            config.submitHandler.call(self, config, target);
                        }
                    }

                });
            });

            return this;

        }
    });

    $.extend({
        "vForm": {
            cookie: function (name, value, options) {
                if (typeof value != 'undefined') {
                    options = options || {};
                    if (value === null) {
                        value = '';
                        options = $.extend({}, options);
                        options.expires = -1;
                    }
                    var expires = '';
                    if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                        var date;
                        if (typeof options.expires == 'number') {
                            date = new Date();
                            date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                        } else {
                            date = options.expires;
                        }
                        expires = '; expires=' + date.toUTCString();
                    }
                    var path = options.path ? '; path=' + (options.path) : '';
                    var domain = options.domain ? '; domain=' + (options.domain) : '';
                    var secure = options.secure ? '; secure' : '';
                    document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
                } else {
                    var cookieValue = null;
                    if (document.cookie && document.cookie != '') {
                        var cookies = document.cookie.split(';');
                        for (var i = 0; i < cookies.length; i++) {
                            var cookie = jQuery.trim(cookies[i]);
                            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                break;
                            }
                        }
                    }
                    return cookieValue;
                }
            },
            validate: function (rules) {
                var passport = true;

                for (var key in rules) {
                    var isExist = !!this.find("[name='" + key + "']").length,
                        validateTarget = this.find("[name='" + key + "']"),
                        radio = isExist && $.nodeName(validateTarget[0], "INPUT") && validateTarget[0].type == "radio",
                        checkbox = isExist && $.nodeName(validateTarget[0], "INPUT") && validateTarget[0].type == "checkbox",
                        normalInput = isExist && $.nodeName(validateTarget[0], "INPUT") && !radio && !checkbox;

                    normalInput && validateTarget.trigger("blur");
                    if (isExist && $.nodeName(validateTarget[0], "SELECT") && !validateTarget.val()) {
                        passport = false;
                        if (validateTarget[0].name == "age_area") {
                            $.validator.showError(validateTarget, "请选择年龄");
                        } else {
                            $.validator.showError(validateTarget);
                        }
                        return false;
                    } else if (radio) {

                    } else if (checkbox) {

                    } else if (normalInput && !validateTarget.data("validator")) {
                        passport = false;
                        return false;
                    }
                }

                return passport;
            },
            defaultSubmit: function (options, target) {
                // 数据获取.
                var self = this,
                    postData = {};

                postData = $.vForm.serialize(postData, this, {});

                postData = $.vForm.washData.call(self, postData);

                $.vForm.beforeSubmitAnalytics(self[0]);

                var canSubmit = $.vForm.loading(self, target);

                if (!canSubmit) {
                    return false;
                }

                $.ajax({
                    type: "GET",
                    cache: false,
                    dataType: 'jsonp',
                    url: options.ajaxUrl,
                    data: postData,
                    success: function (status) {
                        $.vForm.afterSubmitAnalytics.call(self, status);
                        $.vForm.afterSubmitAnalyticsExtend.call(self, status);
                        $.vForm.reset.call(self, options);
                        $.vForm.afterSubmit.call(self, status, postData);
                    },
                    error: function (error) {
                        $.vForm.reset.call(self, options);
                        alert("亲！服务器出错了哦，重新试一下吧！");
                    }
                });

            },
            beforeSubmitAnalytics: function (form) {

                if (window._trackingCode) {
                    window._trackingCode.mediavBeforeSubmit();
                    window._trackingCode.xadBeforeSubmit();
                } else if (window.TrackingCode && Object.prototype.toString.call(window.TrackingCode) == "[object RegExp]") {
                    var _trackingCode = new window.TrackingCode();
                    _trackingCode.mediavBeforeSubmit();
                    _trackingCode.xadBeforeSubmit();
                }

            },
            afterSubmitAnalytics: function (data) {

                var productList = this.find('.select_current').html(),
                    JSUUID = data.JSUUID ? data.JSUUID : "",
                    _productList;

                switch (productList) {
                    case '26~35岁':
                        _productList = ">=26";
                        break;
                    case '36~45岁':
                        _productList = ">=26";
                        break;
                    case '46~55岁':
                        _productList = ">=26";
                        break;
                    case '56岁以上':
                        _productList = ">=26";
                        break;
                    default:
                        _productList = "<26";
                        break;
                }

                if (window._trackingCode) {
                    window._trackingCode.mediavSuccessCallback(JSUUID);
                    window._trackingCode.pinyouSuccessCallback(JSUUID, _productList);
                    window._trackingCode.xadSuccessCallback();
                    window._trackingCode.gridsumSuccessCallback();
                    window._trackingCode.sociomanticSuccessCallback();
                } else if (window.TrackingCode && Object.prototype.toString.call(window.TrackingCode) == "[object RegExp]") {
                    var _trackingCode = new window.TrackingCode();
                    _trackingCode.mediavSuccessCallback(JSUUID);
                    _trackingCode.pinyouSuccessCallback(JSUUID, _productList);
                    _trackingCode.xadSuccessCallback();
                    _trackingCode.gridsumSuccessCallback();
                    _trackingCode.sociomanticSuccessCallback();
                }

            },
            afterSubmitAnalyticsExtend: function (data) {

            },
            afterSubmit: function (data, postData) {
                localStorage.setItem("UserName", postData.name);
                localStorage.setItem("UserEmail", postData.mail);
                localStorage.setItem("UserMobile", postData.cphone);
                location.reload(true);
                /*var brand = 0,
                    callBackBrand = data.Brand ? data.Brand : "",
                    JSUUID = data.JSUUID ? data.JSUUID : "";

                if (postData.jr) {
                    brand = postData.jr
                } else if (callBackBrand === "jr") {
                    brand = "1";
                }

                var _ApiProtocol = (("https:" == document.location.protocol) ? " https://" : " http://");

                if (brand == 0) {
                    window.location.href = _ApiProtocol + "lp.tutorabc.com.cn/lpgs/eplKuraZzW/index.html?fromwhere=" + $.vForm.getQueryString("fromwhere") + "&jsid=" + JSUUID;
                } else {
                    //for junior
                    window.location.href = _ApiProtocol + "lp.vipjr.com/landingpage/include/thankyou.html?fromwhere=" + $.vForm.getQueryString("fromwhere") + "&jsid=" + JSUUID;
                }*/
            },
            reset: function (config) {

                this.html(this.data("reset")).vForm(config).data({});

            },
            loading: function (moduleForm, targetSubmit) {

                var $submit = targetSubmit;

                if ($submit.data("lock") == "lock") {
                    return false;
                }

                $submit.data({
                    "lock": "lock"
                });

                moduleForm.find("input").attr("disabled", true);

                if (moduleForm.find("select")) {
                    moduleForm.find("select").attr("disabled", true);
                }

                $submit.val("提交中...");
                $submit.parent(".submit-wrap").css({
                    "position": "relative"
                }).append("<div class='waite' style='position:absolute;z-index:1000;background:#000 url(img/loading.gif) no-repeat center center;'></div>");
                //Loading background
                $(".waite").css({
                    "width": "100%",
                    "height": "100%",
                    "top": 0,
                    "left": 0,
                    "opacity": 0.5
                });

                return true;

            },
            serialize: function (conf, sel, extend) {

                var json = {};

                sel.find("input[name]").each(function (index, element) {

                    var type = $(this).attr("type");

                    if (type == "radio" && !this.checked) return;
                    if (type == "checkbox" && !this.checked) return;

                    if (element.value && type != "checkbox") {
                        json[element.name] = $.trim(element.value);
                    } else if (element.value && type == "checkbox") {
                        json[element.name] = json[element.name] ? json[element.name] : [];
                        json[element.name].push(element.value);
                    }

                });

                sel.find("select[name]").each(function (index, element) {
                    if (element.value) {
                        json[element.name] = element.value;
                    }
                });

                sel.find("textarea[name]").each(function (index, element) {
                    if (element.value) {
                        json[element.name] = $.trim(element.value);
                    }
                });

                if (extend) {
                    $.extend(true, json, extend);
                }

                $.extend(true, conf, json);

                return conf;

            },
            getQueryString: function (name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) {
                    return unescape(r[2]);
                }
                return null;
            },
            getUTMData: function (options) {
                var config = {
                    "utm_source": "",
                    "utm_campaign": "",
                    "utm_adgroup": "",
                    "utm_term": "",
                    "utm_medium": "",
                    "utm_channel": "",
                    "utm_account": "",
                    "utm_content": ""
                };

                $.extend(true, config, options);

                for (var key in config) {
                    config[key] = this.getQueryString(key) || "";
                }
                return config;
            },
            washData: function (data) {

                if (!!data["nation_phone"] && !data["cphone"]) {
                    data["cphone"] = data["nation_phone"];
                    delete data["nation_phone"];
                }

                if (!!data["nation_code"]) {
                    data["nation_code"] = "+" + data["nation_code"].replace(/\+/i, "");
                }

                if (!/utm\_[source|campaign|adgroup|term|medium|channel|account|content]/i.test(window.location.search.substr(1))) {
                    var configUtm = {
                        "utm_source": "",
                        "utm_campaign": "",
                        "utm_adgroup": "",
                        "utm_term": "",
                        "utm_medium": "",
                        "utm_channel": "",
                        "utm_account": "",
                        "utm_content": ""
                    };

                    var utmString = $.vForm.cookie("utmStorage");
                    /**
                     * 先获取cookie中保存的utm参数
                     */
                    if (!!utmString) {
                        for (var utm in configUtm) {
                            var reg = new RegExp("(^|&)" + utm + "=([^&]*)(&|$)", "i");
                            var r = utmString.match(reg);
                            if (r != null) {
                                configUtm[utm] = unescape(r[2]);
                                try {
                                    data[utm] = decodeURIComponent(escape(configUtm[utm]));
                                } catch (err) {
                                    data[utm] = "";
                                }
                            }
                        }
                    }
                }

                /**
                 * 获取location中的utm参数，权限比cookie的高
                 */
                var utmObj = $.vForm.getUTMData();

                if (utmObj) {
                    for (var utm in utmObj) {
                        if (utmObj[utm] != "") {
                            try {
                                data[utm] = decodeURIComponent(escape(utmObj[utm]));
                            } catch (err) {
                                data[utm] = "";
                            }
                        }
                    }
                }

                var str_jr = "0",
                    str_brand = "",
                    str_age_area = this.find("select").val(),
                    LpNameOfDecideBrandByAge = [
                        "/TheGreatWallofChina/", "/TheGreatWallofChina2/", "/TheGreatWallofChina3/", "/High_End/", "/AcceleratedCourse/", "/MobileYaoMingTop/"
                    ];

                //Distinguish VJR with VIPABC for CTI Call Center
                if (str_age_area == 8 || (str_age_area >= 20 && str_age_area <= 31 && str_age_area != 24)) {

                    str_jr = "1";
                    //VJR User
                }

                var getWhetherDecideBrandByAge = function (defaultVal) {
                    var res = defaultVal;
                    var len = LpNameOfDecideBrandByAge.length;
                    for (var i = 0; i < len; i++) {
                        var reg = new RegExp(LpNameOfDecideBrandByAge[i]);
                        if (reg.test(location.href)) {
                            res = 1;
                            break;
                        }
                    }
                    return res;
                };

                $.extend(true, data, {
                    "fromwhere": $.vForm.getQueryString("fromwhere"),
                    "jr": str_jr,
                    "forceAgeBranding": (getWhetherDecideBrandByAge(str_brand) || 0)
                });

                return data;
            }
        }
    });

}(jQuery, window, undefined);