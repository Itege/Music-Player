var isStreaming=true;
function panelVolume(e){
	var socket = io('http://localhost:3000');
	socket.emit('client-volume', e);
}
function panelStart(){	
	var socket = io('http://localhost:3000');
	socket.on('requestinfo', function(request){
		socket.emit('clientinfo', tracklist[playlist[loop]].artist + " - " + tracklist[playlist[loop]].songname);
	});
	socket.on('volume', function(vol){
		$('#volume').val(parseFloat(vol));
		volumeChange(parseFloat(vol));
	});
}
function pushSong(){
	var socket = io('http://localhost:3000');
	socket.emit('clientinfo', tracklist[playlist[loop]].artist + " - " + tracklist[playlist[loop]].songname);
}
function sendTime(){
	var socket = io('http://localhost:3000');
	socket.emit('timeUpdate', (tracker.value/tracker.max)*100);
}
