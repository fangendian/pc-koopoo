/**
 * Created by gen on 2017/8/8.
 */

function initPageForPhotoWithContent(options) {
    if($.isEmptyObject(options) || options.initailized) return;

    if(!options.idStrContentArticle) options.idStrContentArticle = 'article';
    options.initailized = true;

    //初始化批量上传图片
    shopBase.initFileUpload({
        fileInputId: options.idStrContentFile,
        maxFileSize: 1024 * 1024,
        add: function (data) {
            if(options.$currentTarget) {
                var __data = {
                    type: 'images',
                    _file_id: data.files[0].__id
                };
                editAddContent(options.$currentTarget, 'images', __data, 'multiple');
            }
        },
        success: function (result, data) {
            if(options.$currentTarget) {
                var $section =  options.$currentTarget.getParentByTagName('article').find('section[data-file-id=' + data.files[0].__id + ']');
                $section.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
                $section.find('input[name=videotex_picture_src]').val(result.file_name);
                $section.slideToggle();
            }
        }
    });


    options.$formContainer.find(options.idStrContentArticle).on('click', '.btn-file-single', function () { //触发上传图片(单张)
        options.$currentTarget = $(this).getParentByTagName('section');
        $(options.idStrInputFile).trigger('click');
    });

    //点击增加、移除等功能
    options.$formContainer.find(options.idStrContentArticle).on('click', '.btn-control', function () {
        var mode = $(this).data('mode');
        var $section = $(this).getParentByTagName('section');
        switch (mode) {
            case 'image':
            case 'title':
            case 'content':
                editAddContent($section, mode);
                break;
            case 'images':
                editAddImages($section);
                break;
            case 'remove':
                editRemoveContent($section);
                break;
            case 'move-up':
                editMoveContentUp($section);
                break;
            case 'move-down':
                editMoveContentDown($section);
                break;
            default:
                break;
        }
        options.isChange = true;
    });

    function editAddContent($section, mode, data, isReady) {
        var item = data || { type: mode };
        var $newSection = $(template(options.strEditContentTemplate, {
            result: [item], defaultImageUrl: options.defaultImageUrl, display: 'none'
        })).insertAfter($section);
        if(isReady) {
            $newSection.attr('data-file-id', data._file_id);
            options.$currentTarget = $newSection;
        } else {
            $newSection.slideToggle();
        }
    }
    function editAddImages($section) { //触发批量上传图片
        options.$currentTarget = $section;
        $(options.idStrContentFile).trigger('click');
    }
    function editRemoveContent($section) {
        if($section.siblings('section').length) {
            var data = shopBase.getAndVerificationData($section);
            if(data.videotex_picture_src || data.videotex_title || data.videotex_content) {
                app.confirm({
                    content: '确定要移除此项吗',
                    callback: function () {
                        $section.slideToggle(function () {
                            $(this).remove()
                        });
                    }
                });
            } else {
                $section.slideToggle(function () {
                    $(this).remove()
                });
            }
        } else {
            app.show({
                type: 3, content: '至少要有一组内容!'
            });
        }
    }
    function editMoveContentUp($section) {
        if($section.prev('section').length) {
            $section.insertBefore($section.prev());
        }
    }
    function editMoveContentDown($section) {
        if($section.next('section').length) {
            $section.insertAfter($section.next());
        }
    }
}