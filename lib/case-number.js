function changeCaseNumber(){
	var host = window.location.host;
	var caseNumber = $('#case-number');
//	if(host === 'http://www.koopoo.top/'){
//		caseNumber.text('版权所有 沪ICP备17018952号-2')
//	}else if(host === '127.0.0.1:8020'){
//		caseNumber.text('版权所有 沪ICP备18007100号-1======')
//	}
	if(host === 'www.koopoo.top'){
		caseNumber.text('版权所有 沪ICP备17018952号-2')
	}else if(host === 'www.koopoo.com.cn'){
		caseNumber.text('版权所有 沪ICP备18007100号-1')
	}	
}
changeCaseNumber();
