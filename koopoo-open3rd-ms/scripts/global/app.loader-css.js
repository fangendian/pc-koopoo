(function(){
	var files = [
		'scripts/jqueryui/jquery-ui.min.css?xx',
		'scripts/bootstrap/css/bootstrap.min.css',

		'scripts/jqgrid/css/ui.jqgrid-bootstrap.min.css',
		'scripts/jqgrid/css/ui.jqgrid-bootstrap-ui.min.css',

		'scripts/fontawesome/css/font-awesome.min.css',

		'scripts/gritter/css/jquery.gritter.min.css',
		'scripts/select2/css/select2.min.css',
		'scripts/multiselect/css/bootstrap-multiselect.css',
		'scripts/datetimepicker/css/bootstrap-datetimepicker.min.css',

		'styles/common.css',
		'styles/jqgrid.hack.css'
	];

	//参数2 是否阻止缓存
	$.include(files, false);

	if(window.cssfiles && $.isArray(window.cssfiles)){
		$.include(cssfiles, false);
	}

}());