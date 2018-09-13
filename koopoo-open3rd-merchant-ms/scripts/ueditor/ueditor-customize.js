/**
 * Created by Gen on 16/7/26.
 */

//自定义的图片文件夹,绝对路径(阿里云)
var ueditorImagesPath = 'http://ih.yuele.me/upload/ueditor-static';


function filterRules() {
    return {
        //$:{}表示不保留任何属性
        br: {$: {}},

        article: transformToP,
        header: transformToP,
        section: transformToP,
        footer: transformToP,
        pre: function (node) {
            node.setStyle('width', 'auto');
            node.tagName = 'p';
        },

        select: {$: {}},
        input: {$: {}},
        textarea: {$: {}},
        button: {$: {}},
        tbody: {$: {}},
        caption: {$: {}},
        th: {$: {}},
        //黑名单，以下标签及其子节点都会被过滤掉
        '-': 'script style meta iframe embed object'
    }
}

function transformToP(node) {
    node.tagName = 'p';
}

/*
UE.registerUI('separtor', function(editor){
    if(!editor.options.contentOrigin.type || editor.options.contentOrigin.type == 2) return;
    return new UE.ui.Separator();
});
*/


/*
* 创建编辑器的UI
* */
function createUEditorUI(title) {
    if(typeof title !== 'string') title = '插入商品';
    //插入商品小图标
    UE.registerUI('insert-shop',function(editor,uiName){
        //创建dialog
        var dialog = new UE.ui.Dialog({
            iframeUrl: config.getFullPath('scripts/ueditor/dialogs/insertproduct/product.html'),
            editor: editor,
            name: uiName,
            title: title,
            cssRules: "width:600px;height:500px;",
            buttons:[
                {
                    className:'edui-okbutton',
                    label:'确定',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'取消',
                    onclick:function () {
                        dialog.close(false);
                    }
                }
            ]});

        var btn = new UE.ui.Button({
            name: uiName,
            title: title,
            label: title,
            showIcon: false,
            onclick:function () {
                //渲染dialog
                dialog.render();
                dialog.open();
            }
        });

        editor.addListener('selectionchange', function (type, causeByUi, uiReady) {
            if (!uiReady) {
                var state = editor.queryCommandState(uiName);
                if (state == -1) {
                    btn.setDisabled(true); //禁用
                } else {
                    btn.setDisabled(false);
                }
            }
        });

        return btn;
    });
}



/**
 * 更改图片的宽度
 * @command imagewidth
 * @param { String } cmd 命令字符串
 */
//command名字不能有大写，fuck!!!!!!!!!
UE.commands['imagewidth'] = {
    execCommand:function () {
        var range = this.selection.getRange();
        if (!range.collapsed) {
            var img = range.getClosedNode();
            if (!img || !img.tagName == 'IMG') return;

            var oldIsAuto = false, style = {};
            if(img.hasAttribute('data-width')){
                var _oldStyle = img.getAttribute('data-width').split(',');
                if(_oldStyle.length && _oldStyle[0] == 'auto') oldIsAuto = true;
                else oldIsAuto = false;
            }else{
                oldIsAuto = true;
            }
            if(oldIsAuto){
                style.width = '100%';
            }else{
                style.width = 'auto';
            }
            style.height = 'auto';
            //UE.dom.domUtils.setStyle(img, 'width', widthStyle);
            UE.dom.domUtils.setStyles(img, style);
            img.setAttribute('data-width', style.width +','+ style.height);
        }
    }
};

function getRootDirctory(){
    var url = location.href.match(/https?:\/\/[^/]+\/[^/]+/);
    return url ? url[0] : location.origin;
}


function transformUECode($node, __Node) {
    if(!$node.length) {
        __Node = null;
        return;
    }
    __Node.name = $node[0].nodeType === 1 ? $node[0].tagName.toLocaleLowerCase() : 'text';
    //console.log(str +'| nodeName', __Node.name);

    if(__Node.name === 'br') {
        setByBr(__Node);
        return;
    }

    __Node.attrs = {};
    if($node.attr('style')) {
        __Node.attrs.style = $node.attr('style').replace(/([:;,])\s+/g, '$1')//.replace(/px;/g, 'rpx;');
    }

    if(__Node.name === 'img') {
        setByImg($node, __Node);
    } else if(__Node.name === 'text' || __Node.name === 'pre') {
        var text = $node.text();
        if(text) {
            delete __Node.children;
            __Node.type = 'text';
            __Node.text = text;
        }
    } else {
        if($node.data('type') === 'shop') { //插入商品
            __Node.dataType = 1;
            __Node.id = $node.data('id');
            __Node.attrs.class = 'insert-shop';
        } else {
            switch (__Node.name) {
                case 'a':
                    if(!$node.text().trim()) {
                        __Node = null; //不起效。
                        return;
                    }
                    break;
                case 'ul':
                    __Node.attrs.class = 'rich-ul';
                    break;
                case 'li':
                    __Node.attrs.class = 'rich-li';
                    break;
            }
        }

        var $children = $node.contents(); //所有下一集子节点
        if($children.length) {
            __Node.children = []; //还有子集
            $children.each(function () {
                var child2Node = {};
                transformUECode($(this), child2Node);
                __Node.children.push(child2Node);
            });
        } else {
            /*if($node.parent().is('a') && !$node.text().trim()) {
                __Node = null;
            }*/
        }
    }
    if(!hasAttr(__Node.attrs)) {
        delete __Node.attrs;
    }
}

function setByBr(__Node) {
    __Node.attrs = {
        class: 'p-none', //BR父级样式名
        style: 'opacity:0;'
    };
    __Node.children = [{
        type: 'text', text: '<br>'
    }];
}

function setByImg($node, __Node, __parentNode) {
    __Node.attrs.src = $node.attr('src');
    __Node.attrs.class = 'rich-img';
    __Node.attrs.mode = 'widthFix';

    /*if(__parentNode) {
     if(!__parentNode.attrs) __parentNode.attrs = {};
     __parentNode.attrs.class = 'img-wrap';
     }*/
}

function hasAttr(attrs) {
    for(var key in attrs) return !!attrs[key];
    return false;
}
