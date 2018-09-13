(function () {
    var __basePath = '/koopoo-open3rd-merchant-ms/';
    var __v = getUrlParams().v;

    document.write('<script src="'+ __basePath +'scripts/loadfiles.js?v='+ (__v || new Date().getTime()) +'"><\/script>');
    function getUrlParams(){var e,g,f,c=location.search.replace(/^[^?]*\?/,""),d={};if(c)for(e=c.split("&"),f=0;f<e.length;f++)g=e[f].split("="),d[g[0]]=g[1];return d}
    window.__v = __v;
    window.__basePath = __basePath;
}());

