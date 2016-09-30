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
		'.js_item': {
		    click: function (e) {
		        var id = $(this).data('id');
		        pageManager.go(id);
		    }
		},
	    '#showTooltips': {
	        click: function () {

	        	if($('input[type=text]').val() == ""){
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
						url:"http://localhost/chdzsfw/index.php/Portal/Da/Search",
						type:"post",
						data:{
							key:$('.query-string').eq(-1).val()
						},
						success:function(data){
                            var result = '';
                            if(data.status == 0){
                                pageManager.go('no_result');
                            }else{
                                $('.result-list').html(4);
                                
                                $.each(data.list,function(i,val){
                                    result += '<a class="weui-cell weui-cell_access" href="javascript:;" data-id="'+val.id+'"><div class="weui-cell__bd"><p>'+val.name+'</p></div><div class="weui-cell__ft">'+val.college+'</div></a>';
                                });
                                pageManager.go('list');
                            }
                            setTimeout(function(){
                                $('.result-list').html(result);
                            },10);
							
							/*$.each(data.list, function(i,val) {
								$("#search-list ul").append('<li class="ui-border-t search-result-list" //data-id="'+val.id+'"><					p>'+	val.name+' [<span //class="ui-txt-//rning"> '+val.college+' </span>]</p></li>');
							});*/
						
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
                        url:"http://localhost/chdzsfw/index.php/Portal/Da/getinfo",
                        type:"post",
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