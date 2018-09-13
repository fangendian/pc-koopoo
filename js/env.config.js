/**
 * User: yanyangyang@koopoo.com.cn
 * Date: 2018/2/8
 * Time: 14:12
 * Detail: 配置域名
 *
 */
var SASS_DEV = false;
/* 通过域名判断是否是正式环境 */
if(document.domain == 'demo.koopoo.top'){
    SASS_DEV = true;
}
var SASS_PATH = {
    development: SASS_DEV
}

if(SASS_PATH.development){
    SASS_PATH.api_path_top = 'https://demo.koopoo.top/';
    SASS_PATH.api_path_heka = '/demo-hs-saas/';
    SASS_PATH.api_path = '/demo-saas/'
}else{
    SASS_PATH.api_path_top = 'https://open3rd.koopoo.top/';
    SASS_PATH.api_path_heka = '/koopoo-xs-saas/';//heka路径
    SASS_PATH.api_path = '/koopoo-open3rd/'//第三方路径
}