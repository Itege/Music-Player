$(document).ready(function(){
	document.createElement("template");
	window.fileTempl = Flint.create(document.getElementById("fileTemp").innerHTML);
	$('#upfile').change(function(){
		$('#file-display').html("");
		fileArray=$('#upfile')[0].files;
		for(var i = 0; i < fileArray.length; i++){
			if(fileArray[i].name.indexOf(".mp3") != -1 || fileArray[i].name.indexOf(".m4a") != -1){
				$('#file-display').append(fileTempl.render({'name': fileArray[i].name}));
			}
			else{
				fileArray.splice(i,1);
				i--;
			}
		}
		$('#submit').show();
	});
	$('#form').submit(function(e){
		e.preventDefault();
		$('#prevent-click').show();
		/*
		console.log(new FormData($(this)[0]));
		$.post( "upload.php", $(this).serialize()).done(function(data){
		$('#prevent-click').hide();
		alert(data);
		});*/
		var formData = new FormData($('form')[0]);
		$.ajax({
		xhr: function(){
			var xhr = new window.XMLHttpRequest();
			//Upload progress
			xhr.upload.addEventListener("progress", function(evt){
			  if (evt.lengthComputable) {
				var percentComplete = evt.loaded / evt.total;
				//Do something with upload progress
				$('#bar-fill').css({'width': (percentComplete * 100) + "%"});
			  }
			}, false);
			//Download progress
			xhr.addEventListener("progress", function(evt){
			  if (evt.lengthComputable) {
				var percentComplete = evt.loaded / evt.total;
				//Do something with download progress
				console.log(percentComplete);
			  }
			}, false);
			return xhr;
		},
		url: 'upload.php',
		type: 'POST',
		data: formData,
		async: true,
		cache: false,
		contentType: false,
		processData: false,
		success: function (returndata) {
			$('#prevent-click').hide();
			$('#upfile').val('');
			$('#submit').hide();
			$('#file-display').html('');
			reconstruct();
			console.log(returndata);
		},
		error: function () {
			alert("error in ajax form submission");
		}
		});
	});
});
