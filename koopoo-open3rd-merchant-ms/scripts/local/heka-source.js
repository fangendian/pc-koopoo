/**
 * Created by yyy on 2018/1/11.
 */
(function () {
    var _initPage = function () {
        shopBase.getShopInfo(function (shopInfoData) {
            var materialType,
                maxLength = 20, /*素材最多数目*/
                selectIndex = 0,
                selectMaterialId = -1,
                baseUrl = config.getHekaFullPath() + "/SourceMaterial/",
                //TODO getHekaFullPath
                baseUploadFileUrl = config.getHekaFullPath() + "/File/";
                // baseUploadFileUrl = "https://oss.koopoo.top/koopoo-liwu/File/";
            var sourceData = {
                sourceType: sourceType,
                list: null
            };
            switch (sourceData.sourceType) {
                case 'picture':
                    sourceData.notice = '图文素材最多'+maxLength+'个 建议上传横图，视觉效果会更好';
                    materialType = 1;
                    break;
                case 'voice':
                    sourceData.notice = '音频素材最多'+maxLength+'个，20秒长度之内';
                    materialType = 2;
                    break;
                case 'video':
                    sourceData.notice = '视频素材最多'+maxLength+'个，视频长度在10秒以内， 建议上传16：9横向视频，视觉效果会更好';
                    materialType = 3;
                    break;
                default:
                    break;
            }
            //TODO 获取初始素材列表
            ajax.postAjaxData({
                url:  baseUrl + 'shoplist',
                data: {
                    materialType: materialType,
                    shopId:shopInfoData.shop_id,
                },
                success: function (result) {
                    if (!result || result.code !== 0 || result.list.length <= 0) {
                        shopBase.showTip('素材加载失败！', true)
                        return
                    }
                    sourceData.list = result.list;
                    selectMaterialId = result.list[0].sourceMaterialId;
                    $('#source').html(template('sourceTemplate', sourceData));
                    _initSource();
                }
            });

            var _initSource = function () {
                //TODO 添加素材
                shopBase.initFileUpload({
                    fileInputId: '#fileUploadImage',
                    maxFileSize: sourceType === 'picture' ? 1024 * 1024 : 1024 * 1024 * 10,
                    fileType: sourceType,
                    url: baseUploadFileUrl + "cosUpload",
                    success: function (result) {
                        if (result.code !== 0) {
                            if(result.code === 500){
                                shopBase.showTip('最多只能保留'+ maxLength +'个素材!', true);
                            }else{
                                shopBase.showTip('上传失败，请稍后重试!', true);
                            }
                            return
                        }
                        shopBase.showTip('上传完成!');
                        _initPage();
                    }
                });
                //上传素材时，添加额外参数
                $('#fileUploadImage').bind('fileuploadsubmit', function (e, data) {

                    data.formData = {
                        materialType: materialType,
                        shopId: shopInfoData.shop_id,
                        identity: 'kplw123'
                    };  //如果需要额外添加参数可以在这里添加
                });

                //选择要操作的资源-图片
                $('.source-pic').unbind().click(function () {
                    var $selectImg, $priceInput = $('#price-input');
                    if (sourceType == 'picture') {
                        $selectImg = $(this).find('img');
                        if (!$selectImg.hasClass('source-border')) {
                            $('.source-pic[data-index=' + selectIndex + ']').find('img').removeClass('source-border');
                            $selectImg.addClass('source-border');
                            selectIndex = $(this).attr('data-index');
                            selectMaterialId = $selectImg.attr('data-sourceid');

                        }
                    } else {
                        $selectImg = $(this).find('video');
                        var videoElement = $(this).find('video').get(0)
						if(!videoElement.paused){
							videoElement.pause()
						}else{
							videoElement.play()
						}
                        if (!$selectImg.hasClass('source-border')) {
                            $('.source-pic[data-index=' + selectIndex + ']').find('video').removeClass('source-border');
                            $selectImg.addClass('source-border');
                            selectIndex = $(this).attr('data-index');
                            selectMaterialId = $selectImg.attr('data-sourceid');
                        }
                    }
                });
                //选择要操作的资源 -音频
                $('.source-audio-width').unbind().click(function () {
                    var $selectImg = $(this);
                    var $sourceSelect = $('.source-audio[data-index=' + selectIndex + ']');
                    $sourceSelect.find('.source-audio-width').removeClass('source-border');
                    $selectImg.addClass('source-border');

                    $sourceSelect.find('img').attr('src', '../../images/soud.png');
                    var audioDom = $sourceSelect.find('audio').get(0);
                    if (audioDom.played.length > 0) {
                        audioDom.load()
                    }
                    setTimeout(function () {
                        $selectImg.find('audio').get(0).play();
                        $selectImg.find('img').attr('src', '../../images/sounplay.gif');
                    }, 300);
                    selectIndex = $(this).parent().attr('data-index');
                    selectMaterialId = $selectImg.find('audio').attr('data-sourceid');
                });
                $('.source-pic-size').unbind().bind('ended',function () {
                    var $img = $(this).siblings('img');
                    if($img.length>0){
                        $img.attr('src','../../images/soud.png');
                    }
                })

                //TODO 修改素材价格
                $('.btn-set-price').unbind().click(function () {
                    var $priceInput = $('#price-input');
                    var newPrice = parseFloat($priceInput.val());
                    newPrice = Math.round(newPrice*100)/100;
                    if (newPrice===0 || (!isNaN(newPrice)) && newPrice >= 0 ) {
                        ajax.postAjaxData({
                            url: baseUrl + 'updatePrice',
                            data: {
                                sourceMaterialId: selectMaterialId,
                                shopId: shopInfoData.shop_id,
                                price: newPrice
                            },
                            success: function () {
                                shopBase.showTip('价格修改完成!');
                                $priceInput.val('');
                                console.log(selectIndex);
                                if(sourceType=='voice'){
                                    $('.source-audio[data-index='+selectIndex+']').find('.price').html(newPrice===0?'免费':newPrice+'元');
                                }else{
                                    $('.source-pic[data-index='+selectIndex+']').find('.price').html(newPrice===0?'免费':newPrice+'元');
                                }
                                // window.location.reload();
                                // _initPage();
                            }
                        });
                        $('#myModal').modal('hide');
                    } else {
                        shopBase.showTip('请输入正确的金额!', true);
                    }
                })

                //TODO 删除素材
                $('.source-btn-group button').unbind().click(function () {
                    if ($(this).hasClass('source-upload')) {
                        if(sourceData.list&&sourceData.list.length >= maxLength){
                            shopBase.showTip('最多能保留'+ maxLength +'个素材!',true);
                            return;
                        }
                        $('#fileUploadImage').trigger('click');
                    } else if ($(this).hasClass('source-price')) {

                    } else if ($(this).hasClass('source-delete')) {
                        app.confirm({
                            content: '<p class="pt-10 pb-10">确定要删除当前素材吗？</p>',
                            otherButtons: ['取消', '删除'],
                            otherButtonStyles: ['btn-default', 'btn-danger'],
                            callback: function () {
                                ajax.postAjaxData({
                                    url: baseUrl + 'deleteMaterial',
                                    data: {
                                        sourceMaterialId: selectMaterialId,
                                        shopId:  shopInfoData.shop_id,
                                    },
                                    success: function (result) {
                                        if (!result || result.code !== 0) {
                                            shopBase.showTip('素材删除失败！', true)
                                        }else {
                                            _initPage();
                                        }
                                    }
                                })
                            }
                        });
                    }
                })

            }
        });

    }
    _initPage();
}())