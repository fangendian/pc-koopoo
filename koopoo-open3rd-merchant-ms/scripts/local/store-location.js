/**
 * Created by gen on 2017/8/9.
 */
shopBase.getShopInfo(function (shopInfoData) {
    //引入百度地图JS，v2.0版本的引用方式
    $('<script/>').attr('src', location.protocol +"//api.map.baidu.com/api?v=2.0&ak=E4EdC9X1k1EPbG2O7pBbn0bE4nZfa4UT&callback=initialize").appendTo('body');



    var map; //百度地图实例
    var mapLocation; //地图的地址数据
    var myGeo;
    var transform; //坐标系转换函数集合
    var $editContainer = $('#editContainer');


    /*
     * 获取企业位置的数据
     * */
    var addressListData;
    var currentAddressData; //当前的数据
    ajax.getAjaxData({
        url: 'merchant/shops/'+ shopInfoData.shop_id +'/companyaddresss/list',
        success: function (data) {
            if(data.result.length) {
                currentAddressData = data.result[0];
            }
            shopBase.setDataBinds(currentAddressData || { result: null});
        }
    });


    window.initialize = function() {
        //绑定编辑事件
        $('#btnEdit').removeAttr('disabled').on('click', function () {
            showEdit();
            //延迟是为了解决百度地图的定位错位问题
            setTimeout(function () {
                setMap();
            }, !!map ? 100 : 0);
        });
    };


    //初始化地图
    function initBap() {
        map = new BMap.Map("mapBox");
        map.enableContinuousZoom();
        map.enableScrollWheelZoom(true);
        map.setDefaultCursor("url('bird.cur')");

        // 创建地址解析器实例
        myGeo = new BMap.Geocoder();
        map.addEventListener("click", function(e){
            setMapPointIcon(e.point);
        });

        // 添加定位控件
        var geolocationControl = new BMap.GeolocationControl();
        geolocationControl.addEventListener("locationSuccess", function(e){
            map.clearOverlays();
            map.addOverlay( new BMap.Marker(e.point) );

            var addComp = e.addressComponent;
            var address = addComp.province + addComp.city;
            if(addComp.district) address += addComp.district;
            if(addComp.street) address += addComp.street;
            if(addComp.streetNumber) address += addComp.streetNumber;

            mapLocation.address = address;
            mapLocation.point = e.point;
        });
        geolocationControl.addEventListener("locationError",function(e){
            console.error('定位失败', e.message);
        });
        map.addControl(geolocationControl);
    }

    //设置地图
    function setMap() {
        if(!map) initBap(); //初始化百度地图

        if(currentAddressData) {
            mapLocation = {
                address: currentAddressData.address
            };

            //先转换坐标系
            var convertor = new BMap.Convertor();
            var pointArr = [];
            pointArr.push( new BMap.Point(currentAddressData.longitude, currentAddressData.latitude) );
            convertor.translate(pointArr, 3, 5, function (data) {
                if(data.status === 0) {
                    mapLocation.point = data.points[0];
                }
                setMapLocation(mapLocation.point);
            });

        } else { //默认北京市
            mapLocation = { address: '北京市' };
            myGeo.getPoint(mapLocation.address, function(point){
                if (point) {
                    mapLocation.point = point;
                } else {
                    mapLocation.point = {
                        lng: 116.404, lat: 39.915
                    }
                }
                setMapLocation(mapLocation.point, 11);
            }, mapLocation.address);
        }

        //设置地图上的坐标
        function setMapLocation(__point, zoom) {
            if(!__point) return;
            var point = new BMap.Point(__point.lng, __point.lat);
            map.centerAndZoom(point, zoom || 16);
            map.clearOverlays();
            map.addOverlay( new BMap.Marker(point) );
        }
    }

    //显示坐标图标
    function setMapPointIcon(point) {
        if(!point) return;
        myGeo.getLocation(point, function(res){
            // console.log('点击的坐标', res);
            mapLocation = res;
            map.clearOverlays();
            map.addOverlay( new BMap.Marker(res.point) );
            map.panTo(res.point);

            //转为火星坐标
            var point = transform.bd09togcj02(mapLocation.point.lng, mapLocation.point.lat);
            $editContainer.find('input[name=longitude]').val(point[0]);
            $editContainer.find('input[name=latitude]').val(point[1]);
        });
    }



    /*
     * 编辑
     * */
    function showEdit() {
        shopBase.setDataBinds(currentAddressData);
        $editContainer.show().siblings('#viewContainer').hide();
        $('#setAddress').removeAttr('disabled');
    }

    $editContainer.find('input[name=address]').on('change', function () {
        $(this).siblings('button').removeAttr('disabled');
    });

    //根据地址设置地图坐标
    $('#setAddress').on('click', function () {
        var value = $editContainer.find('input[name=address]').val().trim();
        if(!value) return;
        var $btn = $(this);
        myGeo.getPoint(value, function(point){
            if (point) {
                setMapPointIcon(point);
                $btn.attr('disabled', 'disabled');
            } else {
                console.warn("您选择地址没有解析到结果!");
            }
        }, mapLocation.address);
    });


    $('#btnCancel').on('click', function () {
        resetFormContent();
    });

    $('#btnSave').on('click', function () {
        var data = shopBase.getAndVerificationData($editContainer);
        if(!data) return;

        data.company_name = shopInfoData.company_name || '';
        if(currentAddressData) {
            data.is_deleted = false;
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/companyaddresss/'+ currentAddressData.company_address_id,
                data: data,
                success: function (data) {
                    shopBase.showTip('保存成功!');
                    resetFormContent();
                    currentAddressData = data;
                    shopBase.setDataBinds(data);
                }
            })
        } else {
            ajax.postAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/companyaddresss',
                data: data,
                success: function (data) {
                    shopBase.showTip('保存成功!');
                    resetFormContent();
                    currentAddressData = data;
                    shopBase.setDataBinds(data);
                }
            })
        }
    });


    /*
     * 重置表单及内容
     * */
    function resetFormContent() {
        $editContainer.hide().siblings('#viewContainer').show();
        $editContainer.find('input').val('');
    }



    /*
    * 坐标系转换
    * */
    (function() {
        var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
        var PI = 3.1415926535897932384626;
        var a = 6378245.0;
        var ee = 0.00669342162296594323;
        /**
         * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
         * 即 百度 转 谷歌、高德
         * @param bd_lon
         * @param bd_lat
         * @returns {*[]}
         */
        var bd09togcj02 = function bd09togcj02(bd_lon, bd_lat) {
            var bd_lon = +bd_lon;
            var bd_lat = +bd_lat;
            var x = bd_lon - 0.0065;
            var y = bd_lat - 0.006;
            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
            var gg_lng = z * Math.cos(theta);
            var gg_lat = z * Math.sin(theta);
            return [gg_lng, gg_lat]
        };

        /**
         * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
         * 即谷歌、高德 转 百度
         * @param lng
         * @param lat
         * @returns {*[]}
         */
        var gcj02tobd09 = function gcj02tobd09(lng, lat) {
            var lat = +lat;
            var lng = +lng;
            var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
            var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
            var bd_lng = z * Math.cos(theta) + 0.0065;
            var bd_lat = z * Math.sin(theta) + 0.006;
            return [bd_lng, bd_lat]
        };

        /**
         * WGS84转GCj02
         * @param lng
         * @param lat
         * @returns {*[]}
         */
        var wgs84togcj02 = function wgs84togcj02(lng, lat) {
            var lat = +lat;
            var lng = +lng;
            if (out_of_china(lng, lat)) {
                return [lng, lat]
            } else {
                var dlat = transformlat(lng - 105.0, lat - 35.0);
                var dlng = transformlng(lng - 105.0, lat - 35.0);
                var radlat = lat / 180.0 * PI;
                var magic = Math.sin(radlat);
                magic = 1 - ee * magic * magic;
                var sqrtmagic = Math.sqrt(magic);
                dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
                dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
                var mglat = lat + dlat;
                var mglng = lng + dlng;
                return [mglng, mglat]
            }
        };

        /**
         * GCJ02 转换为 WGS84
         * @param lng
         * @param lat
         * @returns {*[]}
         */
        var gcj02towgs84 = function gcj02towgs84(lng, lat) {
            var lat = +lat;
            var lng = +lng;
            if (out_of_china(lng, lat)) {
                return [lng, lat]
            } else {
                var dlat = transformlat(lng - 105.0, lat - 35.0);
                var dlng = transformlng(lng - 105.0, lat - 35.0);
                var radlat = lat / 180.0 * PI;
                var magic = Math.sin(radlat);
                magic = 1 - ee * magic * magic;
                var sqrtmagic = Math.sqrt(magic);
                dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
                dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
                var mglat = lat + dlat;
                var mglng = lng + dlng;
                return [lng * 2 - mglng, lat * 2 - mglat]
            }
        };

        var transformlat = function transformlat(lng, lat) {
            var lat = +lat;
            var lng = +lng;
            var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
            return ret
        };

        var transformlng = function transformlng(lng, lat) {
            var lat = +lat;
            var lng = +lng;
            var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
            return ret
        };

        /**
         * 判断是否在国内，不在国内则不做偏移
         * @param lng
         * @param lat
         * @returns {boolean}
         */
        var out_of_china = function out_of_china(lng, lat) {
            var lat = +lat;
            var lng = +lng;
            // 纬度3.86~53.55,经度73.66~135.05
            return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
        };

        transform = {
            bd09togcj02: bd09togcj02,
            gcj02tobd09: gcj02tobd09,
            wgs84togcj02: wgs84togcj02,
            gcj02towgs84: gcj02towgs84
        }
    }());
});