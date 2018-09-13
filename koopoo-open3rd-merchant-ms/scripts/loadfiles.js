/**
 * Created by Gen on 2017/8/10.
 */
(function () {
    var __jsVersion = window.__v || '1.0.6.2',
        __isTest = false, //是否是测试环境
        __commonIsChanged = true; //公共Js是否有修改


    //JS文件载入方法
    var jsLoaded = false;
    window.loadJs = function (options) {
        if(Object.prototype.toString.call(options) !== '[object Object]') options = {};

        var html = '';
        var version = options.version || __jsVersion;
        var basePath = window.__basePath +'scripts/';
        if(!jsLoaded) { //载入公共Js
            var __files = [
                'base.js',
                'bootstrap/js/bootstrap.min.js'
            ];

            if(options.fileUploadJs) { //上传文件模块
                __files.push('jqueryfileupload/js/vendor/jquery.ui.widget.js');
                __files.push('jqueryfileupload/js/jquery.fileupload.js');
                __files.push('jqueryfileupload/js/jquery.fileupload-process.js');
            }
            __files.push('../../js/env.config.js');
            __files.push('global/app.common.js');
            __files.push('local/app.shop.common.js');

            __files.forEach(function (src) {
                html += '<script src="'+ basePath + src + (__commonIsChanged ? (/\?/.test(src)?'&':'?')+'v='+version : '') +'"></script>';
            });
        }
        if(options.files && options.files.length) {
            options.files.forEach(function (src) {
                html += '<script src="'+ src + (/\?/.test(src)?'&':'?') +'v='+version +'"></script>';
            });
        }

        //用于全局的变量
        window.__version = version;
        window.__test = __isTest;

        document.write(html);
    };
}());


//遍历数据
if(typeof Array.prototype.forEach !== "function") {
    Array.prototype.forEach = function (callback) {
        if(typeof callback !== 'function') return;
        for(var i = 0; i < this.length; i++) callback(this[i], i);
    }
}
