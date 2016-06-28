var loop = 0;
var previousIndex=0;
var listExpanded = false;
var playing = false;
var shuffled = false;
var unshuffled = [];
var song = document.getElementById("player");
var tracker = document.getElementById("progressTracker");
var repeat = 0;

//General Handlers

$("#showvis").on('click', function(){toggleVis()});

$('#playlist').on('click', function() {
	$('#songlist').stop();
	if (listExpanded == false){
		$('#songlist').animate({right: "2"}, 500);
		$('#songlist').show();
		$('#playlist').css({"color" : '#999'});
		listExpanded = true;
	}
	else{
		$('#songlist').animate({right: "-500"}, 500,function(){
			$('#songlist').hide();
		});
		$('#playlist').css({"color" : "#000"});
		listExpanded = false;
	}
});
$('#upload-button').on('click',function(){
	$('#upload-container').stop();	
	$('#upload-container').animate({top: "30"},500);
});
$('#close-upload').on('click',function(){
	$('#upload-container').stop();	
	$('#upload-container').animate({top: "-500"},500);
});
$('ul').first().on('dblclick', '.song', function() {
	loop = $(this).index();
	changeSong(loop,true);
});

//General Functions

function getTags(){
	$("#coverArt").get(0).src = "http://music.t3gs.ninja/images/"+encodeURIComponent(tracklist[playlist[loop]].cover);
	$("#songtitle").text(tracklist[playlist[loop]].songname);
	$("#artist").text(tracklist[playlist[loop]].artist);
	$("#album").text(tracklist[playlist[loop]].album);
	document.title = tracklist[playlist[loop]].artist + " - " + tracklist[playlist[loop]].songname;
	notifyMe(tracklist[playlist[loop]]);
}
$("#coverArt").on("load", function(){
	try{
		document.styleSheets[2].rules.length;
		var colorThief = new ColorThief();
		color = colorThief.getPalette($('#coverArt').get(0),2,1);
		color = [rgbToHex(color[0][0],color[0][1],color[0][2]),rgbToHex(color[1][0],color[1][1],color[1][2])];
		$('#play').css({'background' : color[0]});
		$('#coverArt').css({'border-color': color[0]});
		$('#clear').css({'background' : color[0]});
		$('#generate').css({'background' : color[1]});
		$('.mdl-slider__background-lower').css({'background': color[0]});
		var leftGradient = vizCtx.createLinearGradient(0,0,0,vizHeight);
		leftGradient.addColorStop(0,color[0]);
		leftGradient.addColorStop(1,color[1]);
		vizCtx.strokeStyle = leftGradient;
		vizCtx.fillStyle = leftGradient;

		var i = 0;
		for(i = 0; "*::-webkit-slider-thumb" != document.styleSheets[2].rules[i].selectorText && i < document.styleSheets[2].rules.length - 1; i++){
		}
		if(i == document.styleSheets[2].rules.length - 1){
			document.styleSheets[2].addRule("::-webkit-slider-thumb", "background: " + color[0] + " !important;");
		}
		else{
			document.styleSheets[2].deleteRule(i);
			document.styleSheets[2].addRule("::-webkit-slider-thumb", "background: " + color[0] + " !important;");
		}
	}
	catch(err){
		color = ["#536DFE","#607D8B"];
		$('#play').css({'background' : "#536DFE"});
		$('#clear').css({'background' : "#536DFE"});
		$('#generate').css({'background' : "#607D8B"});
		$('.mdl-slider__background-lower').css({'background': "#536DFE"});
	}
});
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


//Transport Handlers

$("#play").on("click", function(){
	play();
});
function volumeChange(e){
	localStorage.setItem("volume", e);
	volume.gain.value = e;
	$("#volupper").css({"flex": (1-e/1) + " 1 0%"});
	$("#vollower").css({"flex": e/1 + " 1 0%"});
	$("#volume").blur();
}

function toggleVis(){
	localStorage.setItem("visToggle", $("#showvis").text());
	$("#visualization").stop();
	$("#browser").stop();
	if($("#showvis").text() === "equalizer"){
		$("#showvis").text("music_video");
		$("#visualization").fadeIn(500);
		$("#visualization").show();
		$("#browser").fadeOut(500,function(){$('#browser').hide()});
	}
	else{
		$("#showvis").text("equalizer");
		$("#visualization").fadeOut(500,function(){$('#visualization').hide()});
		$("#browser").fadeIn(500);
		$("#browser").show();
	}
}
song.addEventListener("timeupdate", function(){
	progressTracker()
});

$('#volume').on('drag', function(){
	volumeChange(this.value);
});
$('#volume').on('change', function(){
	volumeChange(this.value);
});

$('#progressTracker').on('change', function(){
	changeCurrentTime()
});
$('#progressTracker').on('drag', function(){
	changeCurrentTime();
});

song.addEventListener("ended", function(){
if (repeat!=2){
	loop++;
	if ((loop >= playlist.length)&&(repeat == 1)){
		loop=0;
	}
	else if ((loop >= playlist.length)&&(repeat == 0)){
		loop = 0;
		changeSong(loop, true);
		play(false);
		return;
	}
	if ((loop < playlist.length)){
		changeSong(loop,true);
	}
}
else{
	changeSong(loop,true);
}
});

$("#next").on("click", function(){
		nextSong();
});

$("#previous").on("click", function(){
	if(song.currentTime > 10){
		song.currentTime = 0;
		localStorage.setItem("time",song.currentTime);
	}else{
		previousSong();
	}
});

$("#shuffle").on("click", function(){
	shuffleSongs();
});

$("#repeat").on("click", function(){
	repeatSongs();
});
$('#volup').on('click', volUp); 
function volUp(){
	song.muted = false;
	$('#voldown').text('volume_down');
	var volume = Math.round(Number($('#volume').get(0).value)*10)/10;
	$('#volume').get(0).value=volume + .1;
	volumeChange(Number($('#volume').get(0).value));
}

$('#voldown').on('click', volDown);
function volDown(e){
	if (e.shiftKey){
		if(song.muted == false){
			song.muted = true;
			$('#voldown').text('volume_off');
		}
		else{
			song.muted = false;
			$('#voldown').text('volume_down');
		}
	}
	else{
		song.muted = false;
		var volume = Math.round(Number($('#volume').get(0).value)*10)/10;
		$('#volume').get(0).value=volume - .1;
		$('#voldown').text('volume_down');
		volumeChange(Number($('#volume').get(0).value));
	}
}
//Keybinds

$(document).keydown(function(e){
	if (document.activeElement != document.getElementById("search")){
		if(e.which == 32){
			$('#play').click();
			return false;
		}
		else if(e.which == 39){
			$('#next').click();;
			return false;
		}
		else if(e.which == 37){
			$('#previous').click();
			return false;
		}
		else if(e.which == 9){
			$('#showvis').click();
			return false;
		}
		else if(e.which == 38){
			$('#volup').click();
			return false;
		}
		else if(e.which == 40){
			volDown(e);
			return false;
		}
	}
});

//Transport Functions

function changeCurrentTime(){
	song.currentTime = tracker.value;
	$("#tracklower").css({"width":(tracker.value/tracker.max)*100 + "%"});
	tracker.blur();
	localStorage.setItem("time",song.currentTime);
}

function progressTracker(){
	tracker.value=song.currentTime;
	tracker.max=song.duration;
	$("#tracklower").css({"width":(tracker.value/tracker.max)*100 + "%"});
	localStorage.setItem("time",song.currentTime);
}

function nextSong(){
	play();
	if (loop+1 == playlist.length)
	{
		loop=0;
		changeSong(loop);
	}
	else
	{
		loop++;
		changeSong(loop);
	}
	song.addEventListener("durationchange",ignoreTime);
}

function previousSong(){
	play();
	if (loop-1 == -1)
	{
		loop = playlist.length -1;
		changeSong(loop);
	}
	else
	{
		loop--;
		changeSong(loop);
	}
	song.addEventListener("durationchange",ignoreTime);
}

function changeSong(loop,isShuffle){
		song.src= "http://music.t3gs.ninja/audio/"+encodeURIComponent(tracklist[playlist[loop]].filename);
		play.currentTime = 0;
		addressChange();
		getTags();
		$('.song').removeClass("selected");
		$('.song:nth-child('+(loop+1)+')').addClass("selected");
		if(isShuffle == true)
		{
			play(true);
		}
		else if(isShuffle != true)
		{
			play(false);
		}
		previousIndex = loop;
		preload();
		filterCurrent();
		localStorage.setItem("time",song.currentTime);
		localStorage.setItem("song",playlist[loop]);
}

function shuffle(o){
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}

function shuffleSongs(){
	if(shuffled == false){
		shuffled=true;
		unshuffled = playlist.slice(0);
		playlist = shuffle(playlist).slice(0);
		loop = 0;
		$("#shuffle").css({"color" : "#999"});
		changeSong(loop,true);
	}
	else if(shuffled == true){
		shuffled=false;
		loop = unshuffled.indexOf(playlist[loop]);
		playlist=unshuffled.slice(0);
		$("#shuffle").css({"color" : "#000"});
	}
	localStorage.setItem("shuffle",shuffled);
	document.getElementsByTagName("ul")[0].innerHTML = "";
	createList();
}

function repeatSongs(){
	if (repeat == 0){
		repeat = 1;
		localStorage.setItem("repeat",0);
		$("#repeat").css({"color":"#999"});
		$("#repeat").html('repeat');
	}
	else if (repeat == 1){
		repeat = 2;
		localStorage.setItem("repeat",1);
		$("#repeat").css({"color":"#999"});
		$("#repeat").html('repeat_one');
	}
	else if (repeat == 2){
		repeat = 0;
		localStorage.setItem("repeat",2);	
		$("#repeat").css({"color":"#000"});
		$("#repeat").html('repeat');
	}
}
$('#player').bind('play',function(){
	$("#play i").html('pause');
});
$('#player').bind('pause',function(){
	$("#play i").html('play_arrow');
});
function play(isChange){
	if(playing == false){
		$("#player").get(0).play();
		playing=true;
	}
	else if(isChange == true && playing == true){
		$("#player").get(0).play();
		playing=true;
	}
	else if(isChange != true && playing == true){
		$("#player").get(0).pause();
		playing=false;
	}
}


//Search Handler
/*
$('#search').on('keyup', function() {
	i=0;
	while(i < playlist.length)
	{
		if((((playlist[i].artist).toLowerCase()).indexOf((this.value).toLowerCase()) == -1) && (((playlist[i].songname).toLowerCase()).indexOf((this.value).toLowerCase()) == -1) && (((playlist[i].album).toLowerCase()).indexOf((this.);value).toLowerCase()) == -1)){
			$(".song:nth-child("+(i+1)+")").css({"display":"none"});
		}
		else{
			$(".song:nth-child("+(i+1)+")").css({"display":"list-item"});
		}
		i++;
	}
});*/

function preload(){
	if (loop < playlist.length-1){
		$('#preload').get(0).src = 'http://music.t3gs.ninja/audio/'+encodeURIComponent(tracklist[playlist[loop+1]].filename);
	}
	else{
		$('#preload').get(0).src = 'http://music.t3gs.ninja/audio/'+encodeURIComponent(tracklist[playlist[0]].filename);
	}
}
