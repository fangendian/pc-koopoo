/**
 * Created by gen on 2017/5/22.
 */

var shopBase = {
    version: window.__version,
    isTest: window.__test,
    baseData: {},
    extends: function (options, property) {
        var self;
        if(typeof property !== 'string') self = this;
        else self = this[property] || (this[property] = {});

        if(!$.isEmptyObject(options)) {
            for (var key in options) {
                if(!self.hasOwnProperty(key)) self[key] = options[key];
                else console.warn('重复的键名:', key);
            }
        } else if(options instanceof Function) {
            options.call(self, this);
        }
    },
    logout: function (text, otherButtons){
        top.app.confirm({
            content: text || '<div class="pt-5 pb-15 f14">确认退出登录吗？</div>',
            otherButtons: otherButtons || ['取消', '退出'],
            otherButtonStyles: ['btn-default', 'btn-danger'],
            callback: function(){
                ajax.putAjaxData({
                    url: 'merchant/merchants/logout',
                    complete: function(){
                        sessionStorage.removeItem(config.lsk_shop_id);
                        sessionStorage.removeItem(config.lsk_shop_info);
                        sessionStorage.removeItem(config.lsk_user_info);
                        location.href = config.getFullPath('page/login.html');
                    }
                });
            }
        });
    },
    goToShopById: function (data, params) {
        if($.isEmptyObject(data) || !data.shopId || !data.name) return;
        sessionStorage.setItem(config.lsk_shop_id, data.shopId);
        var self = this;
        ajax.putAjaxData({
            url: 'merchant/shops/'+ data.shopId +'/manager',
            success: function () {
                sessionStorage.removeItem(config.lsk_shop_info);
                if(self.version) {
                    if(!params) params = {};
                    params.v = self.version;
                }
                var search = self.parseObjectToUrlParams(params);
                location.href = config.getFullPath('stores/'+ data.name +'/page/main.html') + search;
            }
        });
    },
    getShopInfo: function (callback, reload, errorCallback) {
        if(!(callback instanceof Function)) return;
        var __data = JSON.parse(sessionStorage.getItem(config.lsk_shop_info));
        if(reload || $.isEmptyObject(__data)){
            var shopId = sessionStorage.getItem(config.lsk_shop_id);
            if(!shopId) {
                this.logout('找不到小程序信息，请重新登录', ['取消', '登录']);
                return;
            }
            ajax.getAjaxData({
                url: 'merchant/shops/'+ shopId,
                cache: false,
                success: function (data) {
                    sessionStorage.setItem(config.lsk_shop_info, JSON.stringify(data));
                    callback(data);
                },
                error: errorCallback
            });
        } else {
            callback(__data);
        }
    },
    getUserInfo: function (callback) {
        if(!(callback instanceof Function)) return;
        var __data = JSON.parse(sessionStorage.getItem(config.lsk_user_info));
        if($.isEmptyObject(__data)){
            ajax.getAjaxData({
                url: 'merchant/merchants/current_user',
                success: function (data) {
                    sessionStorage.setItem(config.lsk_user_info, JSON.stringify(data));
                    callback(data);
                }
            });
        } else {
            callback(__data);
        }
    },
    getProvinces: function (callback, errorCallback) {
        if(!(callback instanceof Function)) return;
        var self = this;
        if(!self.locationData) {
            ajax.getAjaxData({
                url: 'commons/geographys/province/all',
                fail_up: false,
                success: function (data) {
                    self.locationData = data;
                    callback(data.provinceList);
                },
                error: errorCallback
            });
        } else {
            callback(self.locationData.provinceList);
        }
    },
    getCities: function (code, callback, errorCallback) {
        if(!code || !(callback instanceof Function)) return;
        if(this.locationData) {
            callback(this.locationData.cityListMap[code]);
        } else if(errorCallback instanceof Function) {
            errorCallback();
        }
    },
    getDistricts: function (code, callback, errorCallback) {
        if(!code || !(callback instanceof Function)) return;
        if(this.locationData) {
            callback(this.locationData.districtListMap[code]);
        } else if(errorCallback instanceof Function) {
            errorCallback();
        }
    },
    getTemplateConfig: function (callback, errorCallback) {
        if(!app.isFunction(callback)) return;
        var self = this;
        if(this.baseData.templateConfig) {
            callback(this.baseData.templateConfig);
        } else {
            top.app.blockUI();
            $.ajax({
                url: config.getFullPath('stores/config.json') + (this.version ? '?v='+this.version : ''),
                type: 'get',
                success: function (data) {
                    self.baseData.templateConfig = data;
                    callback(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    app.ajaxError(jqXHR, textStatus, errorThrown);
                    if(app.isFunction(errorCallback)) errorCallback();
                },
                complete: function () {
                    top.app.unblockUI();
                }
            })
        }
    }
};

shopBase.extends({
    phone: /^1[3-8]\d{9}$|^\d{2,4}\-\d{5,8}$|^400\d{7}$/,
    float: /^\d+(\.\d+)?$/,
    email: /^[\w\.]+@(?:[\w\-]+\.){1,}[a-zA-Z]+$/,
    url: /^https?:\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/
}, 'regs');

shopBase.extends({
    findItemInObjectArray: function (array, key, value) { //返回匹配的项 或 null
        if(!$.isArray(array) || !key || typeof value == 'undefined') return null;
        for(var i = 0; i <= array.length; i++) {
            if(!$.isEmptyObject(array[i])) {
                if(array[i][key] == value) return array[i];
            }
        }
        return null;
    },
    findItemInObjectArrayByParams: function (array, params, options) { //返回匹配的[项, ...] 或 []
        if(!$.isArray(array) || $.isEmptyObject(params)) return null;
        if($.isEmptyObject(options)) options = {};
        var likeReg = /__like$/;
        var isMultiple = options.isMultiple !== false;
        var currentKey; //临时需要查询的键名
        var result = [];

        for (var isMatching, i = 0; i <= array.length; i++) {
            if($.isEmptyObject(array[i])) continue;

            isMatching = true;
            for (var key in params) { //循环多个匹配值
                if( likeReg.test(key) ) { //模糊查询
                    currentKey = key.replace(likeReg, '');
                    if( !new RegExp(params[key]).test(array[i][currentKey]) ) {
                        isMatching = false;
                        break;
                    }
                } else { //绝对匹配
                    if(array[i][key] !== params[key]) {
                        isMatching = false;
                        break;
                    }
                }
            }

            if (isMatching) {
                var item;
                if (options.isCopy) {
                    item = $.extend({}, array[i]);
                } else {
                    item = array[i];
                }
                result.push(item);
                if (!isMultiple) {
                    break;
                }
            }
        }
        return result;
    },
    removeArrayItemByKV: function (array, key, value) { //返回处理过的数组 或 原数组
        if(!$.isArray(array) || !key) return array;
        if(typeof key === 'number') { //key 可以是索引值
            if(array[key]) {
                array.splice(key, 1);
            }
        } else {
            if(typeof value === 'undefined') return value;
            for(var i = 0; i <= array.length; i++) {
                if(!$.isEmptyObject(array[i])) {
                    if(array[i][key] == value) {
                        array.splice(i, 1);
                        break;
                    }
                }
            }
        }
        return array;
    },
    getUrlParams: function (params, __string) { //将URL转为Object参数
        var query = (typeof __string === 'string' ? __string : location.search).replace(/^[^?]*\?/, '');
        var object = params || {};
        if (query) {
            var items = query.split('&');
            for (var i = 0, item; i < items.length; i++) {
                item = items[i].split('=');
                object[item[0]] = item[1];
            }
        }
        if(!params) return object;
    },
    parseObjectToUrlParams: function (object) { //解析对象为url参数形式的字符串
        if($.isEmptyObject(object)) return '';
        var string = '';
        for(var key in object) {
            if(object[key]) string += '&'+ key +'='+ object[key];
        }
        return string.replace(/^&/, '?');
    },
    getPageDir: function(){ //返回page目录之前的路径 /xx/v2
        if(!this.baseData.pageDirctory) {
            var result = location.pathname.match(/.*(?=\/page\/)/);
            this.baseData.pageDirctory = (result ? result[0] : '/');
        }
        return this.baseData.pageDirctory;
    },
    getCurrentPageName: function () { //返回当前的页面文件名字
        if(!this.baseData.pageName){
            this.baseData.pageName = location.pathname.match(/([^/.]+)(\.\w+)?$/)[1];
        }
        return this.baseData.pageName;
    },
    buttonCountDown: function(target, reset){
        if(!target) return; //js原生DOM对象
        var self = this;
        if(reset) {
            resetStatus();
            return;
        }
        if(this._timerRunning) return; else this._timerRunning = true;

        $(target).addClass('disabled').attr('disabled', 'disabled');
        var time = 60;
        run();
        this._timer = setInterval(run, 1000);
        function run(){
            if(time === 1 || !self._timerRunning) {
                resetStatus();
            } else {
                target.innerText = (time--) +' 秒';
            }
        }

        function resetStatus(){
            self._timerRunning = false;
            clearInterval(self._timer);
            $(target).text('获取验证码').removeClass('disabled').removeAttr('disabled');
        }
    },
    /*
     * 处理Select的选项
     * 返回HTML
     *
     * @param options
     * title 默认的展示标题key
     * lightKey: '', lightBoolean: false, lightAddTitle: '', lightClassName: ''
     *
     * @param options.attributes { key: value }
     * key用于数据的key, value用于data-{value}
     * */
    setOptionsHtml: function (dataObject, options, defaultOption) {
        var DefaultOptionHtml = '';
        if (defaultOption !== false) {
            DefaultOptionHtml = '<option>'+ (typeof defaultOption === 'string' ? defaultOption : '请选择') +'</option>';
        }
        if (!$.isArray(dataObject) || $.isEmptyObject(options)) return DefaultOptionHtml;

        var html = DefaultOptionHtml;
        if ($.isEmptyObject(options.attributes)) { //无设置属性
            dataObject.map(function (item, index) {
                var lightObject = setLight(item);
                html += '<option'+ lightObject.lightClassName +'>'+ lightObject.title + (item.title || item.name || '选项' + index) +'</option>';
            });
        } else {
            var valueIsFalse = options.lightBoolean === false;
            var attributes = options.attributes;
            dataObject.map(function (item, index) {
                var value;
                var attributesHtml = '';
                for (var key in attributes) {
                    value = item[key];
                    if (typeof value != 'undefined' || value != null) {
                        attributesHtml += ' data-'+ attributes[key] +'="'+ value +'"';
                    }
                }
                var lightObject = setLight(item);
                var titleTip = '';
                if (options.showTip && item[options.title]) {
                    titleTip = ' title="'+ item[options.title] +'"';
                }
                html += '<option '+ attributesHtml + lightObject.lightClassName + titleTip +'>'+ lightObject.title + (item[options.title] || '选项 ' + index) +'</option>';
            });
            // console.log(options);
        }

        //高亮显示,一般只用于multiple
        function setLight(item) {
            var title = '', lightClassName = '';
            if(options.lightKey) {
                var value = item[options.lightKey];
                var isReal = false;
                if(valueIsFalse) {
                    if(!value) isReal = true;
                } else if(value) {
                    isReal = true;
                }
                if(isReal) {
                    if(options.lightAddTitle) title = options.lightAddTitle;
                    if(options.lightClassName) lightClassName = ' class="'+ options.lightClassName +'" ';
                }
            }
            return {
                title: title, lightClassName: lightClassName
            }
        }
        return html;
    },
    setDataBinds: function (data, range) {
        if ($.isEmptyObject(data)) return;
        $(range || 'body').find('[data-bind]').each(function () {
            var $item = $(this),
                key = $item.data('bind'), nodeType = $item.attr('type'),
                value, isHtml;
            if (!key) return;
            if (/^#/.test(key)) {
                isHtml = true;
                key = key.replace(/#/, '');
            }
            value = data[key];
            if (app.isEmpty(value)) {
                value = $item.attr('data-default-value'); //尝试获取默认值
                if (!value) return;
            }

            if ($item.is('input')) {
                if(nodeType === 'checkbox') {
                    $item[0].checked = !!value;
                } else {
                    $item.val(value);
                }
            } else if ($item.is('select')) {
                $item.val(value).trigger('change');
            } else if ($item.attr('data-bind-type') === 'bg-img') {
                $item.css('background-image', 'url(' + value + ')');
            } else {
                if (isHtml) $item.html(value); else $item.text(value);
            }
        })
    },
    setDataUnbind: function (range) {
        $(range || 'body').find('[data-bind]').each(function () {
            var $item = $(this),
                nodeType = $item.attr('type');
            if ($item.is('input')) {
                if(nodeType === 'checkbox' || nodeType === 'radio') {
                    $item[0].checked = false;
                } else {
                    $item.val('');
                }
            } else if ($item.is('select')) {
                $item.val('').trigger('change');
            } else if ($item.attr('data-bind-type') === 'bg-img') {
                $item.css('background-image', 'url()');
            } else {
                $item.text('');
            }
        })
    },
    //用于编辑状态的数据验证，成功后返回数据
    getAndVerificationData: function ($range, real, noAnimate) {
        if (!$range) return null;
        var form = $('[name]', $($range)); //检索所有的包含name属性的标签
        if (!form.length) return null;

        var data = {};
        var hasError = false;
        form.each(function (i, item) {
            var $item = $(this),
                notNull = $item.attr('data-not-null'),
                type = $item.attr('data-type'), nodeType = $item.attr('type'),
                name = $item.attr('name'),
                value;

            if (nodeType === 'checkbox') {
                value = !!item.checked;
                if (notNull && !value) { //必须勾选
                    hasError = true;
                }
            } else if ($item.is('select')) {
                value = $(':selected', this).attr('data-value') || '';
                if (notNull && !value) {
                    if ($item.attr('data-may-null')) { //此select无值时可以为空
                        if ($('option', this).length > 1) hasError = true;
                    } else {
                        hasError = true;
                    }
                }
            } else {
                value = $item.val();

                if (notNull && (value === '' || typeof value === 'undefined') ) {
                    hasError = true;
                } else if (value) {
                    switch (type) {
                        case 'number':
                            if (/\D+/.test(value)) {
                                hasError = true;
                            } else {
                                value = parseInt(value);
                                verificationLimit($item, value);
                            }
                            break;
                        case 'float':
                            if (!shopBase.regs.float.test(value)) hasError = true;
                            break;
                        case 'phone':
                            if (!shopBase.regs.phone.test(value)) hasError = true;
                            break;
                        case 'email':
                            if (!shopBase.regs.email.test(value)) hasError = true;
                            break;
                        case 'url':
                            if (!shopBase.regs.url.test(value)) hasError = true;
                            break;
                        default:
                            verificationLimit($item, value);
                            break;
                    }
                }
            }
            if (hasError) {
                if(noAnimate === false && $.isEmptyObject(data)) { //没有内容时不需要动画
                    return false;
                }
                if ($item.is('select') || nodeType === 'hidden') {
                    $('body').animate({scrollTop: $item.parent().offset().top - 20}, 10);
                    $item.focus().parent().animateCss('shake');
                } else {
                    $item.focus().animateCss('shake');
                }
                if ($item.attr('data-tip')) {
                    // app.show({ content:$item.attr('data-tip'), type:2 });
                    shopBase.showTip($item.attr('data-tip'), true);
                }
                return false; //结束each
            }
            if (!$item.attr('data-give-up') && typeof value !== 'undefined') {
                if (real) {
                    if (value !== '') data[name] = value;
                } else {
                    data[name] = value;
                }
            }//否则，丢弃取值
        });

        function verificationLimit($item, value) {
            var limit = $item.attr('data-limit'); //attr()必须保证是字符串
            if (limit) {
                limit = limit ? limit.split('~') : [-1];
                var min = parseInt(limit[0]), max = parseInt(limit[1]);
                var currentLength = $item.data('limit-type') === 'number' ? parseInt(value) : value.length; //如果类型是数字，则比较大小
                if (currentLength < min || (max && max < currentLength)) hasError = true;
            }
        }
        if (hasError) return null;

        return data;
    },
    showTip: function (text, type) {
        if (!text) return;

        var elm = $('#errorYlm');
        var _type = parseInt(type);
        var errorClassName = 'alert-tip-error',
            okIClassName = ['glyphicon-ok-sign', 'glyphicon-info-sign'][!_type ? 0 : _type-1] || 'glyphicon-ok-sign',
            errorIClassName = 'glyphicon-remove-sign';
        if (!elm.length) {
            elm = $('<div class="alert-tip" id="errorYlm"><p><i class="glyphicon '+ okIClassName +'"></i>' +
                '<span class="alert-tip-text">' + text + '</span></p></div>').appendTo('body');
        } else {
            if(elm.css('display') == 'block' && elm.find('.alert-tip-tex').text() == text) return; //还未消失不能重复
            elm.find('.alert-tip-text').text(text);
        }
        clearTimeout(this.showErrorTimer);
        if (!type || _type) {
            elm.removeClass(errorClassName).find('i').removeClass(errorIClassName).addClass(okIClassName);
        } else {
            elm.addClass(errorClassName).find('i').removeClass(okIClassName).addClass(errorIClassName);
        }
        elm.css('display', 'block').transition({opacity: 1, 'transform': 'translate(0,-15px)'}, 300);
        this.showErrorTimer = setTimeout(function () {
            elm.transition({opacity: 0, 'transform': 'translate(0,15px)'}, 300, 'ease', function () {
                elm.css('display', 'none').removeClass(errorClassName)
                    .find('i').removeClass(errorIClassName).addClass(okIClassName);
            });
        }, 2800);
    },
    initFileUpload: function(options){
        if(!$.support.fileInput || $.isEmptyObject(options) || !options.fileInputId) return;

        if(!(options.progress instanceof Function)) options.needProgress = true;

        var acceptFileTypes;
        switch (options.fileType) {
            case 'video':
                acceptFileTypes = /(\.|\/)(mp4|mov|rmvb|3pg|quicktime)$/i;
                break;
            case 'voice':
                acceptFileTypes = /(\.|\/)(mpeg|mp3|ogg|wav)$/i;
                break;
            case 'zip'://TODO tar
                acceptFileTypes = /(\.|\/)(x-zip-compressed|x-tar|zip|tar)$/i;
                break;
            default :
                acceptFileTypes = /(\.|\/)(gif|jpe?g|png)$/i;
                break;
        }

        var maxFileSize = options.maxFileSize || 10485760;
        $(options.fileInputId).prop('disabled', false).fileupload({
            url: options.url||config.getApiPath('merchant/files/upload'),
            type: 'post',
            dataType: 'json',
            acceptFileTypes: acceptFileTypes, //Default: Image
            maxFileSize: maxFileSize, //Default: 10MB
            add: function (e, data) {
                var errorText;
                var file = data.files[0];
                if((!!file.type.trim() && !acceptFileTypes.test(file.type)) || !acceptFileTypes.test(file.name)) {
                    errorText = '文件格式不正确！';
                } else if(data.originalFiles[0].size > maxFileSize) {
                    var max = maxFileSize > 10240 ? (maxFileSize/1048576).toFixed(2) +'MB' : maxFileSize +'KB';
                    errorText = '请上传小于'+ max +'的文件';
                }
                if(errorText) {
                    app.show({ content: errorText, type: 3 });
                    return;
                } else {
                    data.submit();
                }
                if(options.needProgress && !options.$progressBar) {
                    var $wrapper = $('#gProgressWrapper');
                    if(!$wrapper.length) $wrapper = $('<div id="gProgressWrapper" class="global-progress-wrapper"/>').appendTo('body');
                    options.$progressBar = $('<p class="global-progress-bar"><span></span></p>').appendTo($wrapper);
                }
                if(config.isFunction(options.add)) options.add(data);
            },
            send: function(){
                top.app.blockUI();
            },
            progressall: function (e, data) {
                var p = parseInt(data.loaded / data.total * 100, 10);
                if(options.$progressBar) {
                    options.$progressBar.find('span').width(p +'%');
                } else {
                    if(options.progress) options.progress(p);
                }
            },
            done: function (e, data) {
                options.success(data.result, data); //event, data.result:{file_name, file_url}
            },
            error: function(jqXHR, textStatus, errorThrown){
                app.ajaxError(jqXHR, textStatus, errorThrown);
                if(options.error) options.error();
            },
            complete: function(){
                top.app.unblockUI();
                if(options.$progressBar) {
                    options.$progressBar.remove();
                    options.$progressBar = null;
                }
                if(options.complete instanceof Function) options.complete();
            }
        });
    }
});


/*
 * 分页加载器
 */
function PagesLoader(options){
    this.init(options);
}
PagesLoader.prototype = {
    init: function (options) {
        if($.isEmptyObject(options)) return false;

        if(!options.url || !config.isFunction(options.success)) {
            console.warn('分页加载器:', '缺少必要参数!');
            this.isError = true;
            return false;
        }
        for(var key in options) {
            if(!this.hasOwnProperty(key)) this[key] = options[key];
        }

        if($.isEmptyObject(options.page)) this.page = {};
        if(!this.page.pageNumber || this.page.pageNumber < 1) this.page.pageNumber = 1;
        if(!this.page.pageSize || this.page.pageSize < 1) this.page.pageSize = 10;
        this.loadedCount = 0;
        if(!config.isFunction(this.complete)) this.complete = function () {};

        this.initPageNavBarEvent();
        if(this.autoLoad) this.request();
    },
    resetThenRequest: function(data, url, pageNumber){ //重置为从未加载过的状态, 然后请求数据
        this.dataIdArray = [];
        if(url) this.url = url;
        if(Object.prototype.toString.call(data) === '[object Object]') this.data = data; //{} 空对象也会覆盖
        if(data !== true) {
            this.page.pageNumber = parseInt(pageNumber) || 1;
        }
        this.page.lastPage = false;
        this.loadedCount = 0;

        this.request();
    },
    request: function(isFirst){
        if(this.onLoading) return; else this.onLoading = true; //设置为正在加载状态

        if(isFirst && this.loadedCount > 0) return;
        if(!this.page.pageNumber || this.page.pageNumber < 1) {
            this.page.pageNumber = 1;
        } else if(this.page.pageNumber > this.page.lastPageNumber) {
            this.page.pageNumber = this.page.lastPageNumber;
        }

        // if(this.ajaxObject) this.ajaxObject.abort();
        this.ajax();
    },
    ajax: function(){
        var self = this;
        var __data = this.data || {};
        __data.pageNumber = this.page.pageNumber;
        __data.pageSize = this.page.pageSize;

        ajax.getAjaxData({
            url: this.url,
            data: __data,
            needToken: this.needToken,
            success: function(data){
                self.onLoading = false;
                self.page.lastPageNumber = data.lastPageNumber;
                self.page.lastPage = data.lastPage;
                self.page.totalCount = data.totalCount;
                self.loadedCount++;

                //筛选重复数据
                if(!data || !data.result || !data.result.length) {
                    //没有数据
                    if(self.pageBarIdString) $(self.pageBarIdString).empty(); //清空分页HTML
                    if(config.isFunction(self.success)) self.success.call(self, data);
                    return console.warn("没有分页数据");
                } else {
                    if(self.idKey){
                        if(repeated) data.result = newResult; //替换为筛选过的结果
                        var newResult = [], newDataIdArray = [],
                            repeated = false,
                            allIdLength = self.dataIdArray.length;
                        data.result.map(function(item){
                            var repeat, idValue = item[self.idKey];
                            for(var i = 0; i < allIdLength; i++){
                                if(idValue == self.dataIdArray[i]){
                                    repeat = true; //存在重复
                                    break;
                                }
                            }
                            if(!repeat){
                                newDataIdArray.push(idValue);
                                newResult.push(item);
                                repeated = true;
                            }
                        });
                        self.dataIdArray = self.dataIdArray.concat(newDataIdArray); //更新id数组
                    }
                }
                self.setPageNavBar(data, data.thisPageNumber);
                if(config.isFunction(self.success)) self.success.call(self, data);
            },
            error: function(xhr){
                self.onLoading = false;
                if(config.isFunction(self.error)) self.error(xhr);
            }
        });
    },
    setPageNavBar: function(data, pageNumber){
        if(!this.pageBarIdString) return;
        var $pageWrapper = $(this.pageBarIdString);

        var lastPageNumber = data.lastPageNumber;
        if(lastPageNumber <= 1) {
            $pageWrapper.empty();
            return;
        }
        var html = '';
        //点击更多模式
        if(this.showWay === 2) {
            if(this.page.lastPage) {
                $pageWrapper.empty();
            } else if(!$pageWrapper.children().length) {
                html += '<div class="text-center loader-bar"><span class="btn btn-default btn-sm btn-loader-more">加载更多</span></div>';
                $pageWrapper.html(html);
            }
            return;
        }

        //导航分页模式
        var numbersHtml = '';
        if(lastPageNumber > 9) {
            var middleNumber = lastPageNumber / 2;
            var firstHtml = '', lastHtml = '';
            var numbersArray = [];
            var bLackNumber = pageNumber - 4, aLackNumber =  pageNumber + 4;
            var beforeIndex, afterIndex;

            if(pageNumber <= middleNumber) {
                if(bLackNumber <= 0) { //before
                    beforeIndex = 1;
                    aLackNumber += Math.abs(bLackNumber) + 1;
                } else { //after
                    beforeIndex = bLackNumber;
                    if(bLackNumber > 1) firstHtml += '<span data-id="1">1</span>';
                    if(bLackNumber > 2) firstHtml += '<b>...</b>';
                }
                if(aLackNumber + 1 < lastPageNumber) lastHtml += '<b>...</b>';
                if(aLackNumber < lastPageNumber) lastHtml += '<span data-id="'+ lastPageNumber +'">'+ lastPageNumber +'</span>';
            } else {
                if(aLackNumber >= lastPageNumber) { //after
                    bLackNumber -= (aLackNumber - lastPageNumber) + 1;
                } else { //before
                    if(aLackNumber < lastPageNumber - 1) lastHtml += '<b>...</b>';
                    if(aLackNumber < lastPageNumber) lastHtml += '<span data-id="'+ lastPageNumber +'">'+ lastPageNumber +'</span>';
                }
                beforeIndex = bLackNumber;
                if(beforeIndex > 1) firstHtml += '<span data-id="1">1</span><b>...</b>';
            }

            /* 计算前面的数字 */
            for(; beforeIndex < pageNumber; beforeIndex++) {
                numbersArray.push(beforeIndex);
            }
            /* 计算后面的数字 */
            for(afterIndex = pageNumber; afterIndex <= aLackNumber; afterIndex++) {
                if(afterIndex > lastPageNumber) break;
                numbersArray.push(afterIndex);
            }

            numbersArray.forEach(function (number) {
                numbersHtml += '<span data-id="'+ number +'" '+ (pageNumber == number ? 'class="active"' : '') +'>'+ number +'</span>';
            });
            numbersHtml = firstHtml + numbersHtml + lastHtml;
        } else {
            for(var i = 1; i <= lastPageNumber; i++) {
                numbersHtml += '<span data-id="'+ i +'" '+ (pageNumber == i ? 'class="active"' : '') +'>'+ i +'</span>';
            }
        }

        html = '<div class="page-nav"><span class="nav-btn-prev '+ (data.firstPage ? 'disabled' : '') +'">上一页</span>'+
            '<p class="nav-numbers">'+ numbersHtml +'</p>'+
            '<span class="nav-btn-next '+ (data.lastPage ? 'disabled' : '') +'">下一页</span>' +
            '<div class="inline ml-5">共<strong>'+ data.totalCount +'</strong>条信息</div></div>';
        $pageWrapper.html(html);
    },
    initPageNavBarEvent: function(){
        if(!this.pageBarIdString) return;

        var self = this;
        if(this.showWay === 2) {
            $(this.pageBarIdString).on('click', '.btn-loader-more', function(){
                self.page.pageNumber++;
                self.request();
            });
            return;
        }

        $(this.pageBarIdString).on('click', '.nav-btn-prev', function(){
            if($(this).hasClass('disabled')) return;
            self.page.pageNumber--;
            self.request();
        }).on('click', '.nav-btn-next', function(){
            if($(this).hasClass('disabled')) return;
            self.page.pageNumber++;
            self.request();
        }).on('click', '.nav-numbers>span', function(){
            if($(this).hasClass('active')) return;

            var number = parseInt($(this).attr('data-id'));
            if(!number) return console.warn('No Number');
            self.page.pageNumber = number;
            self.request();
        });
    }
};