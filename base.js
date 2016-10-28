$(function () {
	var winH = $(window).height();
	var supportTouch = function(){
	    try {
	        document.createEvent("TouchEvent");
	        return true;
	    } catch (e) {
	        return false;
	    }
	}();
	var pageManager = {
		$container: $('#container'),
		_pageStack: [],
		_configs: [],
		_pageAppend: function(){},
		_defaultPage: null,
		_pageIndex: 1,
		setDefault: function (defaultPage) {
		    this._defaultPage = this._find('name', defaultPage);
		    return this;
		},
		setPageAppend: function (pageAppend) {
		    this._pageAppend = pageAppend;
		    return this;
		},
		init: function () {
		    var self = this;

		    $(window).on('hashchange', function () {
		        var state = history.state || {};
		        var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
		        var page = self._find('url', url) || self._defaultPage;
		        if (state._pageIndex <= self._pageIndex || self._findInStack(url)) {
		            self._back(page);
		        } else {
		            self._go(page);
		        }
		    });

		    if (history.state && history.state._pageIndex) {
		        this._pageIndex = history.state._pageIndex;
		    }

		    this._pageIndex--;

		    var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
		    var page = self._find('url', url) || self._defaultPage;
		    this._go(page);
		    return this;
		},
		push: function (config) {
		    this._configs.push(config);
		    return this;
		},
		go: function (to) {
		    var config = this._find('name', to);
		    if (!config) {
		        return;
		    }
		    location.hash = config.url;
		},
		_go: function (config) {
		    this._pageIndex ++;

		    history.replaceState && history.replaceState({_pageIndex: this._pageIndex}, '', location.href);

		    var html = $(config.template).html();
		    var $html = $(html).addClass('slideIn').addClass(config.name);
		    $html.on('animationend webkitAnimationEnd', function(){
		        $html.removeClass('slideIn').addClass('js_show');
		    });
		    this.$container.append($html);
		    this._pageAppend.call(this, $html);
		    this._pageStack.push({
		        config: config,
		        dom: $html
		    });

		    if (!config.isBind) {
		        this._bind(config);
		    }

		    return this;
		},
		back: function () {
		    history.back();
		},
		_back: function (config) {
		    this._pageIndex --;

		    var stack = this._pageStack.pop();
		    if (!stack) {
		        return;
		    }

		    var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
		    var found = this._findInStack(url);
		    if (!found) {
		        var html = $(config.template).html();
		        var $html = $(html).css('opacity', 1).addClass(config.name);
		        $html.insertBefore(stack.dom);

		        if (!config.isBind) {
		            this._bind(config);
		        }

		        this._pageStack.push({
		            config: config,
		            dom: $html
		        });
		    }

		    stack.dom.addClass('slideOut').on('animationend', function () {
		        stack.dom.remove();
		    }).on('webkitAnimationEnd', function () {
		        stack.dom.remove();
		    });

		    return this;
		},
		_findInStack: function (url) {
		    var found = null;
		    for(var i = 0, len = this._pageStack.length; i < len; i++){
		        var stack = this._pageStack[i];
		        if (stack.config.url === url) {
		            found = stack;
		            break;
		        }
		    }
		    return found;
		},
	    _find: function (key, value) {
	        var page = null;
	        for (var i = 0, len = this._configs.length; i < len; i++) {
	            if (this._configs[i][key] === value) {
	                page = this._configs[i];
	                break;
	            }
	        }
	        return page;
	    },
	    _bind: function (page) {
	        var events = page.events || {};
	        for (var t in events) {
	            for (var type in events[t]) {
	                var that = this;
	                if(type == 'click' && supportTouch){
	                    (function(dom, event){
	                        var touchStartY;
	                        that.$container.on('touchstart', dom, function (e) {
	                            touchStartY = e.changedTouches[0].clientY;
	                        });
	                        that.$container.on('touchend', dom, function (e) {
	                            if (Math.abs(e.changedTouches[0].clientY - touchStartY) > 10) return;
	                            e.preventDefault();

	                            events[dom][event].call(this, e);
	                        });
	                    })(t, type);
	                }else{
	                    this.$container.on(type, t, events[t][type]);
	                }
	            }
	        }
	        page.isBind = true;
	    }
	};
	var pages = {}, tpls = $('script[type="text/html"]');

	if(window.location.host == 'localhost'){
		var GLOBAL = {
			library_login: '//localhost/dangan/verify.php',
			library_query: '//localhost/dangan/query.php',
			library_verify_img: '//localhost/dangan/getVerifyCode.php',
			library_renew: '//localhost/dangan/renew.php',
			library_king:'//localhost/dangan/king.php',
			dangan_search: '//localhost/changanlib/public/api/dangan/search',
			dangan_getinfo: '//localhost/changanlib/public/api/dangan/getinfo',
			king:{
				my:'',
				nick:'',
				per:''
			}
		};
	}else{
		var GLOBAL = {
			library_login: '//app.ohao.ren/verify.php',
	 		library_query: '//app.ohao.ren/query.php',
	 		library_verify_img: '//app.ohao.ren/getVerifyCode.php',
	 		library_renew: '//app.ohao.ren/renew.php',
	 		library_king:'//app.ohao.ren/king.php',
	 		dangan_search: '//service.ohao.ren/public/index.php?s=/api/dangan/search',
	 		dangan_getinfo: '//service.ohao.ren/public/index.php?s=/api/dangan/getinfo'
	 	};
	}
	
	window.home = function(){
	    location.hash = '';
	};

	for (var i = 0, len = tpls.length; i < len; ++i) {
		var tpl = tpls[i], name = tpl.id.replace(/tpl_/, '');
		pages[name] = {
	        name: name,
	        url: '#' + name,
	        template: '#' + tpl.id
	    };
	}
	pages.home.events = {
		'.js_category': {
		    click: function (e) {
		        var id = $(this).data('id');
		        pageManager.go(id);
		    }
		},
	};

	pages.library.events = {
		'#submit-query':{
			click: function(){
				var $loadingToast = $('#loadingToast');
                $loadingToast.fadeIn(100);
                $.ajax({
                	url  : GLOBAL.library_login,
                	type : "post",
                	dataType: "json", 
                	data : {
                		n:$("#chd-number").val(),
                		p:$("#chd-passwd").val(),
                		c:$("#chd-captcha").val()
                	},
                	success:function(data){
                		$loadingToast.fadeOut(200);
                		if(data.code == 0){
                			pageManager.go('error');
                			setTimeout(function(){
                                $('.error_reasons').html(data.info);
                            },10);
                		}else{
                			pageManager.go('borrow_info');
                		}
                	}
                });
			}
		},
		'.weui-vcode-img':{
			click: function(){
				$(this).attr('src',GLOBAL.library_verify_img+'?_='+Math.random());
			},
			ready: function(){
				$('.weui-vcode-img').attr('src',GLOBAL.library_verify_img+'?_='+Math.random());
			}
		}
	};

	pages.borrow_info.events={
		'.show-borrowed-list':{
			click: function(){
				$('#dialog-title').html($(this).children('.weui-cell__bd').html());
				$('#dialog-borrowed-time').html("借入日期:"+$(this).attr('data-borrowed'));
				$('#dialog-back-time').html("应还日期:"+$(this).attr('data-back'));
				$('#iosDialog1').fadeIn(200);
				$('#iosDialog1').find('.renew').attr('data-id',$(this).attr('data-id'));
				$('#iosDialog1').find('.renew').attr('data-check',$(this).attr('data-check'));
			}
		},
		'.renew':{
			click: function(){
				$('#iosDialog1 .weui-dialog__ft').html('<a href="javascript:;" bar_code="'+$(this).attr('data-id')+'" check="'+$(this).attr('data-check')+'" class="weui-dialog__btn weui-dialog__btn_primary do-renew">确认续借</a>');
			
				$('#iosDialog1 .weui-dialog__bd').html('<img src="'+GLOBAL.library_verify_img+'"/><input class="weui-input renew-captcha" type="text" autocomplete="off" placeholder="输入验证码">');
			}
		},
		'.lib-competive':{
			click:function(){
				var $loadingToast = $('#loadingToast');
                $loadingToast.fadeIn(100);
                $.ajax({
                	url  : GLOBAL.library_king,
                	type : "get",
                	dataType: "json", 
                	data : {
                		id:$(".chd-id").html(),
                	},
                	success:function(data){
                		$loadingToast.fadeOut(200);
                		if(data.code == 0){
                			pageManager.go('error');
                			setTimeout(function(){
                                $('.error_reasons').html('未知错误，请重新来过');
                            },10);
                		}else{
                			console.log(data);
                			wx.config({
        					    debug: false,
        					    appId: data.jssdk.appId,
        					    timestamp: data.jssdk.timestamp,
        					    nonceStr: data.jssdk.nonceStr,
        					    signature: data.jssdk.signature,
        					    jsApiList: [
        					      'checkJsApi',
        					      'onMenuShareTimeline',
        					      'onMenuShareAppMessage'
        					    ]
        					});
                			pageManager.go('king');
                			setTimeout(function(){
                				$('.chd-my').html(data.my);
                				$('.chd-percent').html(data.per+'%');
                				var result = '';
                				$.each(data.rank,function(i,val){
                					result += '<div class="weui-cell"><div class="weui-cell__hd"></div><div class="weui-cell__bd"><p>'+val.name+'</p>['+val.college+']</div><div class="weui-cell__ft">'+val.total+'本</div></div>';
                				});
                				$('.chd-rank').html(result);
               					var title = '书霸在哪儿|我共借了'+data.my+'本书，击败了'+data.per+'%的人，获得“'+data.nick+'”称号';
								var shareData = {
    							  title: '书霸在哪儿',
    							  desc: title,
    							  link: 'http://app.ohao.ren/#library',
    							  imgUrl: 'http://cdn.ohao.ren/image/weui/icon_nav_library.png',
    							};
								wx.onMenuShareTimeline(shareData);
								wx.onMenuShareAppMessage(shareData);
                            },10);
                		}
                	}
                });
			}
		},
		'.do-renew':{
			click:function(){
				var $loadingToast = $('#loadingToast');
                $loadingToast.fadeIn(100);
                $.ajax({
                	url  : GLOBAL.library_renew,
                	type : "get",
                	dataType: "json", 
                	data : {
                		bar_code: $(this).attr('bar_code'),
						check: $(this).attr('check'),
						captcha: $('.renew-captcha').val(),
						time: new Date().getTime()
                	},
                	success:function(data){
                		if(data.code == 0){
                			setTimeout(function(){
                                console.log('续借失败');
                            },10);
                		}else{		
                			setTimeout(function(){
                				$('#iosDialog2 .weui-dialog__bd').html(data.info);
                				$('#iosDialog2').fadeIn(200);
                            },10);
                		}
                	}
                });
			}
		},
		'body':{
			ready:function(){
				var $loadingToast = $('#loadingToast');
                $loadingToast.fadeIn(100);
				$.ajax({
                	url  : GLOBAL.library_query,
                	type : "get",
                	dataType: "json", 
                	success:function(data){
                		$loadingToast.fadeOut(200);
                		if(data.code == 0){
                			pageManager.go('error');
                			setTimeout(function(){
                                $('.error_reasons').html(data.info);
                                console.log(data.info);
                            },10);
                		}else{
                			var resultList = '';
                            $('.chd-name').html(data.info.name);
                            $('.chd-sex').html(data.info.sex);
                            $('.chd-id').html(data.info.id);
                            $('.chd-college').html(data.info.college);
                            $('.chd-total').html(data.info.total);
                            $('.chd-expiring').html(data.info.expiring);
                            $('.chd-expired').html(data.info.expired);
                            $.each(data.book,function(i,val){
                            	resultList += '<a class="weui-cell weui-cell_access show-borrowed-list" href="javascript:;" data-id="'+val.id+'" data-check="'+val.check+'" data-borrowed="'+val.borrowed+'" data-back="'+val.back+'"><div class="weui-cell__bd"><p>'+val.bookName+'</p></div><div class="weui-cell__ft"></div></a>';
                            });
                            $('.borrowed-list').html(resultList);
                		}
                	}
                });

			}
		}

	};

	pages.king.events = {
		'body':{
			ready:function(){
				console.log('king ready');
			}
		}
	}

	pages.dangan.events = {
		
	    '#showTooltips': {
	        click: function () {

	        	if($('.query-string').eq(-1).val() == ""){
	        		var $tooltips = $('.js_tooltips');
	            	if ($tooltips.css('display') != 'none') {
	                	return;
	            	}
	            	// 如果有`animation`, `position: fixed`不生效
	            	$('.page.cell').removeClass('slideIn');
	            	$tooltips.css('display', 'block');
	            	setTimeout(function () {
	            	    $tooltips.css('display', 'none');
	            	}, 2000);
	        	}else{
                    
	        		var $loadingToast = $('#loadingToast');
		        	$loadingToast.fadeIn(100);
		        	$.ajax({
						url:GLOBAL.dangan_search,
						type:"post",
						data:{
							key:$('.query-string').eq(-1).val()
						},
						success:function(data){
                            var result = '';
                            if(data.status == 0){
                                pageManager.go('no_result');
                            }else{
                                $('.result-list').html();
                                
                                $.each(data.list,function(i,val){
                                    result += '<a class="weui-cell weui-cell_access" href="javascript:;" data-id="'+val.id+'"><div class="weui-cell__bd"><p>'+val.name+'</p></div><div class="weui-cell__ft">'+val.college+'</div></a>';
                                });
                                pageManager.go('list');
                            }
                            setTimeout(function(){
                                $('.result-list').html(result);
                            },10);
						
						}
					});
	        	}
	            
	        }
	    }
	};

    pages.list.events = {
        '.weui-cell_access':{
            click: function(e){
                var $loadingToast = $('#loadingToast');
                    $loadingToast.fadeIn(100);
                    $.ajax({
                        url:GLOBAL.dangan_getinfo,
                        type:"post",
                        dataType: "json", 
                        data:{
                            key:$(this).data('id')
                        },
                        success:function(data){
                            var result = '<p><label class="weui-form-preview__label">姓名</label><span class="weui-form-preview__value">'+data.info.name+'</span></p><p><label class="weui-form-preview__label">学院</label><span class="weui-form-preview__value">'+data.info.college+'</span></p><p><label class="weui-form-preview__label">学号</label><span class="weui-form-preview__value">'+data.info.id+'</span></p><p><label class="weui-form-preview__label">毕业时间</label><span class="weui-form-preview__value">'+data.info.graduation_time+'</span></p><p><label class="weui-form-preview__label">遗留原因</label><span class="weui-form-preview__value">&nbsp;'+data.info.historical_reasons+'</span></p>';
                            pageManager.go('result');
                            setTimeout(function(){
                                $('.result-content').html(result);
                            },10);
                        }
                    });
            }
        },
        '.weui-form-preview__btn_primary':{
            click:function(e){
                pageManager.go('yes_result');
            }
        }
    };

	for (var page in pages) {
		pageManager.push(pages[page]);
	}
	pageManager
	    .setPageAppend(function($html){
	        var $foot = $html.find('.page__ft');
	        if($foot.length < 1) return;

	        if($foot.position().top + $foot.height() < winH){
	            $foot.addClass('j_bottom');
	        }else{
	            $foot.removeClass('j_bottom');
	        }
	    })
	    .setDefault('home')
	    .init();
	// .container 设置了 overflow 属性, 导致 Android 手机下输入框获取焦点时, 输入法挡住输入框的 bug
	// 相关 issue: https://github.com/weui/weui/issues/15
	// 解决方法:
	// 0. .container 去掉 overflow 属性, 但此 demo 下会引发别的问题
	// 1. 参考 http://stackoverflow.com/questions/23757345/android-does-not-correctly-scroll-on-input-focus-if-not-		body-element
	//    Android 手机下, input 或 textarea 元素聚焦时, 主动滚一把
	if (/Android/gi.test(navigator.userAgent)) {
	    window.addEventListener('resize', function () {
	        if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
	            window.setTimeout(function () {
	                document.activeElement.scrollIntoViewIfNeeded();
	            }, 0);
	        }
	    })
	}
});