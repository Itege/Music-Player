document.addEventListener('backbutton', function(){
	alert('ping');
	if(parseInt($('#songlist').css('right')) > -500){
		$('#songlist').animate({right: "-500"}, 500,function(){
			$('#songlist').hide();
		});
		$('#playlist').css({"color" : "#000"});
		return false;
	}
	else{
		ionic.Platform.exitApp();
		return false;
	}
});
