/**
 * ueditor完整配置项
 * 可以在这里配置整个编辑器的特性
 */
(function () {

    /**
     * 编辑器资源文件根路径。它所表示的含义是：以编辑器实例化页面为当前路径，指向编辑器资源文件（即dialog等文件夹）的路径。
     * 鉴于很多同学在使用编辑器的时候出现的种种路径问题，此处强烈建议大家使用"相对于网站根目录的相对路径"进行配置。
     * "相对于网站根目录的相对路径"也就是以斜杠开头的形如"/myProject/ueditor/"这样的路径。
     * 如果站点中有多个不在同一层级的页面需要实例化编辑器，且引用了同一UEditor的时候，此处的URL可能不适用于每个页面的编辑器。
     * 因此，UEditor提供了针对不同页面的编辑器可单独配置的根路径，具体来说，在需要实例化编辑器的页面最顶部写上如下代码即可。当然，需要令此处的URL等于对应的配置。
     * window.UEDITOR_HOME_URL = "/xxxx/xxxx/";
     */
    var URL = window.UEDITOR_HOME_URL || getUEBasePath();
    // var URL_back = URL.replace("koopoo-open3rd-merchant-ms/scripts","koopoo-open3rd");
    var URL_back = URL.replace("koopoo-open3rd-merchant-ms/scripts/ueditor","koopoo-open3rd");
    /**
     * 配置项主体。注意，此处所有涉及到路径的配置别遗漏URL变量。
     */
    window.UEDITOR_CONFIG = {
        //为编辑器实例添加一个路径，这个不能被注释
        UEDITOR_HOME_URL: URL

        // 服务器统一请求接口路径
        // , serverUrl: URL_back + "jsp/controller.jsp"
        , serverUrl: URL_back + "merchant/files/ueditor"

        //工具栏上的所有的功能按钮和下拉框，可以在new编辑器的实例时选择自己需要的重新定义
        , toolbars:[
            [
                'undo', 'redo', '|', 'fontsize', '|', 'source', '|', 'removeformat'/*, 'link', 'unlink'*/
            ], [
                'forecolor', '|',
                'bold', 'italic', 'underline', 'strikethrough', '|',
                'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
                'insertimage', '|', 'insertproduct'
            ]
        ]
        ,initialStyle:'p{line-height:1.6em;font-size: 14px;}'
        ,imageScaleEnabled: false   //图片拉伸
        ,autoTransWordToList: true  //禁止word中粘贴进来的列表自动变成列表标签
        ,fontsize:[10, 11, 12, 13, 14, 16, 18, 20, 24]

        ,wordCount: false   //是否开启字数统计
        ,wordCountMsg:'当前字数：{#count}'   //当前已输入 {#count} 个字符，您还可以输入{#leave} 个字符

        // xss 过滤是否开启,inserthtml等操作
        ,xssFilterRules: true
        //input xss过滤
        ,inputXssFilter: true
        //output xss过滤
        ,outputXssFilter: true
        // xss过滤白名单 名单来源: https://raw.githubusercontent.com/leizongmin/js-xss/master/lib/default.js
    };

    function getUEBasePath(docUrl, confUrl) {
        return getBasePath(docUrl || self.document.URL || self.location.href, confUrl || getConfigFilePath());
    }

    function getConfigFilePath() {
        var configPath = document.getElementsByTagName('script');
        return configPath[ configPath.length - 1 ].src;
    }

    function getBasePath(docUrl, confUrl) {
        var basePath = confUrl;
        if (/^(\/|\\\\)/.test(confUrl)) {
            basePath = /^.+?\w(\/|\\\\)/.exec(docUrl)[0] + confUrl.replace(/^(\/|\\\\)/, '');
        } else if (!/^[a-z]+:/i.test(confUrl)) {
            docUrl = docUrl.split("#")[0].split("?")[0].replace(/[^\\\/]+$/, '');
            basePath = docUrl + "" + confUrl;
        }
        return optimizationPath(basePath);
    }

    function optimizationPath(path) {
        var protocol = /^[a-z]+:\/\//.exec(path)[ 0 ],
            tmp = null,
            res = [];
        path = path.replace(protocol, "").split("?")[0].split("#")[0];
        path = path.replace(/\\/g, '/').split(/\//);
        path[ path.length - 1 ] = "";
        while (path.length) {
            if (( tmp = path.shift() ) === "..") {
                res.pop();
            } else if (tmp !== ".") {
                res.push(tmp);
            }
        }
        return protocol + res.join("/");
    }

    window.UE = {
        getUEBasePath: getUEBasePath
    };

})();
