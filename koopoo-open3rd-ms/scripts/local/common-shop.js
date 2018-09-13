/**
 * Created by gen on 2017/5/22.
 */

var shopBase = {
    baseData: {},
    extends: function (options, property) {
        var self;
        if(typeof property != 'string') self = this;
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
    logout: function (text){
        top.app.confirm({
            content: text || '<div class="pt-5 pb-15 f14">确认退出登录吗？</div>',
            otherButtons: ['取消', '退出'],
            otherButtonStyles: ['btn-default', 'btn-danger'],
            callback: function(){
                ajax.putAjaxData({
                    url: 'ms/sysusers/logout',
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
    getUserInfo: function (callback) {
        if(!(callback instanceof Function)) return;
        var __data = JSON.parse(sessionStorage.getItem(config.lsk_user_info));
        if($.isEmptyObject(__data)){
            ajax.getAjaxData({
                url: 'ms/sysusers/current_user',
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
    }
};

shopBase.extends({
    phone: /^1[3-8]\d{9}$/,
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
    removeArrayItemByKV: function (array, key, value) { //返回处理过的数组 或 原数组
        if(!$.isArray(array) || !key || typeof value == 'undefined') return array;
        for(var i = 0; i <= array.length; i++) {
            if(!$.isEmptyObject(array[i])) {
                if(array[i][key] == value) {
                    array.splice(i, 1);
                    return array;
                }
            }
        }
        return array;
    },
    getUrlParams: function (params, __string) { //将URL转为Object参数
        var query = (typeof __string == 'string' ? __string : location.search).replace(/^[^?]*\?/, '');
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
            DefaultOptionHtml = '<option>'+ (typeof defaultOption == 'string' ? defaultOption : '请选择') +'</option>';
        }
        if (!$.isArray(dataObject) || $.isEmptyObject(options)) return DefaultOptionHtml;

        var html = DefaultOptionHtml;
        if ($.isEmptyObject(options.attributes)) { //无设置属性
            dataObject.map(function (item, index) {
                var lightObject = setLight(item);
                html += '<option'+ lightObject.lightClassName +'>'+ lightObject.title + (item.title || item.name || '选项' + index) +'</option>';
            });
        } else {
            // if (!options.title) return html;
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
                html += '<option '+ attributesHtml + lightObject.lightClassName +'>'+ lightObject.title + (item[options.title] || '选项' + index) +'</option>';
            });
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
            if (value == null || value == '' || typeof value == 'undefined') {
                value = $item.attr('data-default-value'); //尝试获取默认值
                if (!value) return;
            }

            if ($item.is('input')) {
                if(nodeType == 'checkbox') {
                    $item[0].checked = value ? true : false;
                } else {
                    $item.val(value);
                }
            } else if ($item.is('select')) {
                $item.val(value).trigger('change');
            } else if ($item.attr('data-bind-type') == 'bg-img') {
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
                if(nodeType == 'checkbox' || nodeType == 'radio') {
                    $item[0].checked = false;
                } else {
                    $item.val('');
                }
            } else if ($item.is('select')) {
                $item.val('').trigger('change');
            } else if ($item.attr('data-bind-type') == 'bg-img') {
                $item.css('background-image', 'url()');
            } else {
                $item.text('');
            }
        })
    },
    //用于编辑状态的数据验证，成功后返回数据
    getAndVerificationData: function ($range, real) {
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

            if (nodeType == 'checkbox') {
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

                if (notNull && (value == '' || typeof value == 'undefined') ) {
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
                if ($item.is('select') || nodeType == 'hidden') {
                    $('body').animate({scrollTop: $item.parent().offset().top - 20}, 10);
                    $item.parent().animateCss('shake');
                } else {
                    $item.focus().animateCss('shake');
                }
                if ($item.attr('data-tip')) {
                    // app.show({ content:$item.attr('data-tip'), type:2 });
                    shopBase.showTip($item.attr('data-tip'), true);
                }
                return false; //结束each
            }
            if (!$item.attr('data-give-up') && typeof value != 'undefined') {
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
                var currentLength = $item.data('limit-type') == 'number' ? parseInt(value) : value.length; //如果类型是数字，则比较大小
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
                acceptFileTypes = /(\.|\/)(mp4|mov|rmvb|avi|quicktime)$/i;
                break;
            case 'voice':
                acceptFileTypes = /(\.|\/)(mp3|ogg|wav)$/i;
                break;
            default :
                acceptFileTypes = /(\.|\/)(gif|jpe?g|png)$/i;
                break;
        }
        var maxFileSize = options.maxFileSize || 10485760;
        $(options.fileInputId).prop('disabled', false).fileupload({
            url: config.getApiPath('merchant/files/upload'),
            type: 'post',
            dataType: 'json',
            acceptFileTypes: acceptFileTypes, //Default: Image
            maxFileSize: maxFileSize, //Default: 10MB
            add: function (e, data) {
                var errorText;
                var file = data.originalFiles[0];
                if((file.type && !acceptFileTypes.test(file.type)) || !acceptFileTypes.test(file.name)) {
                    errorText = '文件格式不正确';
                } else if(data.originalFiles[0].size > maxFileSize) {
                    var max = maxFileSize > 10240 ? (maxFileSize/1048576).toFixed(2) +'MB' : maxFileSize +'KB';
                    errorText = '请上传小于'+ max +'的文件';
                }
                if(errorText) {
                    app.show({
                        content: errorText, type: 3
                    });
                } else {
                    data.submit();
                }
                if(options.needProgress && !options.$progressBar) {
                    var $wrapper = $('#gProgressWrapper');
                    if(!$wrapper.length) $wrapper = $('<div id="gProgressWrapper" class="global-progress-wrapper"/>').appendTo('body');
                    options.$progressBar = $('<p class="global-progress-bar"><span></span></p>').appendTo($wrapper);
                }
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
                options.success(data.result); //event, data.result:{file_name, file_url}
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

        if(!options.url || typeof options.success != 'function') {
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
        if(typeof this.complete != 'function') this.complete = function () {};

        this.initPageNavBarEvent();
        if(this.autoLoad) this.request();
    },
    resetThenRequest: function(data, url){ //重置为从未加载过的状态, 然后请求数据
        this.dataIdArray = [];
        this.page.pageNumber = 1;
        this.page.lastPage = false;
        this.loadedCount = 0;
        if(url) this.url = url;
        if(Object.prototype.toString.call(data) == '[object Object]') this.data = data; //{} 空对象也会覆盖

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
                self.loadedCount++;

                //筛选重复数据
                if(!data || !data.result || !data.result.length) {
                    //没有数据
                    if(self.pageBarIdString) $(self.pageBarIdString).empty(); //清空分页HTML
                    if(self.success instanceof Function) self.success.call(self, data);
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
                if(self.success instanceof Function) self.success(data);
            },
            error: function(xhr){
                self.onLoading = false;
                if(self.error instanceof Function) self.error(xhr);
            }
        });
    },
    setPageNavBar: function(data, pageNumber){
        if(!this.pageBarIdString) return;
        var lastPageNumber = data.lastPageNumber;
        if(lastPageNumber <= 1) {
            $(this.pageBarIdString).empty();
            return;
        }

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

        var html = '<div class="page-nav"><span class="nav-btn-prev '+ (data.firstPage ? 'disabled' : '') +'">上一页</span>'+
            '<p class="nav-numbers">'+ numbersHtml +'</p>'+
            '<span class="nav-btn-next '+ (data.lastPage ? 'disabled' : '') +'">下一页</span>' +
            '<div class="inline ml-5">共<strong>'+ data.totalCount +'</strong>条信息</div></div>';
        $(this.pageBarIdString).html(html);
    },
    initPageNavBarEvent: function(){
        if(!this.pageBarIdString) return;

        var self = this;
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