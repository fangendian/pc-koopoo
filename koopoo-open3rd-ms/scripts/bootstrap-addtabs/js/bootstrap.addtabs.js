
$.fn.addtabs = function (options) {
    obj = $(this);
    Addtabs.options = $.extend({
        content: '', //直接指定所有页面TABS内容
        close: true, //是否可以关闭
        monitor: 'body', //监视的区域
        iframeUse: true, //使用iframe还是ajax
        iframeHeight: $(document).height() - 107, //固定TAB中IFRAME高度,根据需要自己修改
        method: 'init',
        callback: function () { //关闭后回调函数
        }
    }, options || {});


    /*$(Addtabs.options.monitor).on('click', '[data-addtab]', function () {
        Addtabs.add({
            id: $(this).attr('data-addtab'),
            title: $(this).attr('title') ? $(this).attr('title') : $(this).html(),
            content: Addtabs.options.content ? Addtabs.options.content : $(this).attr('content'),
            url: $(this).attr('url'),
            ajax: $(this).attr('ajax') ? true : false
        });
    });*/


    //关闭自身
    obj.on('click', 'nav.page-tabs i.fa-times-circle', function () {
        var id = $(this).parent().attr("aria-controls");
        Addtabs.close(id);
        $('#popMenu').fadeOut();
    });
    //刷新
    obj.on('click', '.dropdown-menu-right > li.tabRefreshActive', function () {
        var $active = $('nav.page-tabs li.active');
        if(!$active.attr('id')) return console.warn('当前是Home');

        Addtabs.add({
            'id': $active.attr("aria-controls").substring(4),
            'url':$active.attr('aria-url')
        });
    });
    //定位当前
    obj.on('click', '.dropdown-menu-right > li.tabShowActive', function () {
        Addtabs.rollTabItem(null, true);
    });
    //关闭所有
    obj.on('click', '.dropdown-menu-right > li.tabCloseAll', Addtabs.closeAll);
    //关闭其他
    obj.on('click', '.dropdown-menu-right > li.tabCloseOther', function () {
        var tab_id = $('nav.page-tabs li.active').attr("aria-controls");
        obj.find('nav.page-tabs li').each(function () {
            var id = $(this).attr('id');
            if (id && id != 'tab_' + tab_id) {
                Addtabs.close($(this).attr('aria-controls'));
            }
        });
    });

    obj.on('click', '.J_tabLeft', Addtabs.rollLeftTabItem);
    obj.on('click', '.J_tabRight', Addtabs.rollRightTabItem);

    $(window).resize(function () {
        obj.find('iframe').attr('height', Addtabs.options.iframeHeight);
        Addtabs.rollTabItem();
    });

};

window.Addtabs = {
    options: {},
    add: function (opts) {
        var id = 'tab_' + opts.id;
        $('li[role = "presentation"].active').removeClass('active');
        $('div[role = "tabpanel"].active').removeClass('active');

        app.blockUI();

        var content, __content;
        var delay = parseInt(Addtabs.options.delay) || 300;
        //如果TAB不存在，创建一个新的TAB
        if (!$("#" + id)[0]) {
            //创建新TAB的title
            var title = $('<li>', {
                'role': 'presentation',
                'id': 'tab_' + id,
                'aria-url':opts.url,
                'aria-controls': id,
                'href': '#' + id,
                'data-toggle': 'tab'
            }).html(opts.title);

            //是否允许关闭
            if (Addtabs.options.close) {
                title.append(
                    $('<i>', {'class': 'fa fa-times-circle'})
                );
            }
            //创建新TAB的内容
            content = $('<div>', {
                'class': 'tab-pane',
                'id': id,
                'role': 'tabpanel'
            });

            //加入TABS
            obj.find('.page-tabs-content').append(title);
            obj.children(".tab-content").append(content);
        } else {
            content = $('#' + id).html('');
        }

        if (Addtabs.options.iframeUse && !opts.ajax) {//没有内容，使用IFRAME打开链接
            __content = $('<iframe>', {
                // 'class': 'iframeClass',
                // 'height': Addtabs.options.iframeHeight,
                'scrolling': "no",
                'border': "0",
                'src': opts.url
            });
        } else {
            $.get(opts.url, function (data) {
                __content = data;
                setTimeout(commit, delay);
            });
        }


        //激活TAB
        $('#tab_' + id).addClass('active');
        Addtabs.rollTabItem();
        setTimeout(commit, delay);

        function commit() {
            $('#' + id).addClass('active').append(__content);
            app.unblockUI();
        }
    },
    close: function (id) {
        //如果关闭的是当前激活的TAB，激活他的前一个TAB
        if (obj.find("li.active").attr('id') === "tab_" + id) {
            $("#tab_" + id).prev().addClass('active');
            $("#" + id).prev().addClass('active');
        }
        //关闭TAB
        $("#tab_" + id).remove();
        $("#" + id).remove();
        Addtabs.rollTabItem();
        Addtabs.options.callback();
    },
    closeAll: function () {
        var $content = obj.find('ul.page-tabs-content');
        $content.find('li[id]').each(function () {
            var id = $(this).attr('aria-controls');
            $("#tab_" + id).remove();
            $("#" + id).remove();
        });
        var $first = $content.find('li[role=presentation]').first().addClass('active');
        var firstID = $first.attr('aria-controls');
        $('#'+ firstID).addClass('active');
        Addtabs.rollTabItem();
    },
    rollTabItem: function ($active, isAnimate) {
        var $contentTabs = $('.content-tabs'),
            $pageTabsContent = $contentTabs.find('ul.page-tabs-content');
        if(!$active || !$active.length) {
            $active = $('li.active', $contentTabs);
        }
        var o = __getOtherWidth($($active).prevAll()),
            q = __getOtherWidth($($active).nextAll());
        var outerWidth = $contentTabs.outerWidth(true) - __getOtherWidth($contentTabs.children('.J_menuTabs').siblings());
        var tabContentWidth = $pageTabsContent.outerWidth();

        var p = 0;
        if (tabContentWidth < outerWidth) {
            p = 0
        } else {
            if (q <= (outerWidth - $($active).outerWidth(true) - $($active).next().outerWidth(true))) {
                if ((outerWidth - $($active).next().outerWidth(true)) > q) {
                    p = o;
                    var m = $active;
                    while ((p - $(m).outerWidth()) > (tabContentWidth - outerWidth)) {
                        p -= $(m).prev().outerWidth();
                        m = $(m).prev()
                    }
                }
            } else {
                if (o > (outerWidth - $($active).outerWidth(true) - $($active).prev().outerWidth(true))) {
                    p = o - $($active).prev().outerWidth(true)
                }
            }
        }
        $pageTabsContent.animate({
            marginLeft: 0 - p + "px"
        }, "fast");
    },
    rollLeftTabItem: function () {
        var $contentTabs = $('.content-tabs'),
            $pageTabsContent = $contentTabs.find('ul.page-tabs-content');

        var o = Math.abs(parseInt($pageTabsContent.css("margin-left")));
        var outerWidth = $contentTabs.outerWidth(true) - __getOtherWidth($contentTabs.children('.J_menuTabs').siblings());
        var p = 0;
        if ($pageTabsContent.width() < outerWidth) {
            return false
        } else {
            var m = $("li:first", $pageTabsContent);
            var n = 0;
            while ((n + $(m).outerWidth(true)) <= o) {
                n += $(m).outerWidth(true);
                m = $(m).next()
            }
            n = 0;
            if (__getOtherWidth($(m).prevAll()) > outerWidth) {
                while ((n + $(m).outerWidth(true)) < (outerWidth) && m.length > 0) {
                    n += $(m).outerWidth(true);
                    m = $(m).prev()
                }
                p = __getOtherWidth($(m).prevAll())
            }
        }
        $pageTabsContent.animate({
            marginLeft: 0 - p + "px"
        }, 500);
    },
    rollRightTabItem: function () {
        var $contentTabs = $('.content-tabs'),
            $pageTabsContent = $contentTabs.find('ul.page-tabs-content');

        var o = Math.abs(parseInt($pageTabsContent.css("margin-left")));
        var outerWidth = $contentTabs.outerWidth(true) - __getOtherWidth($contentTabs.children('.J_menuTabs').siblings());
        var p = 0;
        if ($pageTabsContent.width() < outerWidth) {
            return false
        } else {
            var m = $("li:first", $pageTabsContent);
            var n = 0;
            while ((n + $(m).outerWidth(true)) <= o) {
                n += $(m).outerWidth(true);
                m = $(m).next()
            }
            n = 0;
            while ((n + $(m).outerWidth(true)) < (outerWidth) && m.length > 0) {
                n += $(m).outerWidth(true);
                m = $(m).next()
            }
            p = __getOtherWidth($(m).prevAll());
            if (p > 0) {
                $pageTabsContent.animate({
                    marginLeft: 0 - p + "px"
                }, 500);
            }
        }
    }
};

function __getOtherWidth(l) {
    var k = 0;
    $(l).each(function() {
        k += $(this).outerWidth(true)
    });
    return k;
}