//initialize some globals
var playlist = [];
var tracklist = [];
var selectedArtist = "";
//set up templates for populating elements dynamically
////set up templates for populating elements dynamically
document.createElement("template");
window.trackTempl = Flint.create(document.getElementById("track-templ").innerHTML);
window.artistTempl = Flint.create(document.getElementById("artist-templ").innerHTML);
window.albumTempl = Flint.create(document.getElementById("album-templ").innerHTML);
window.songTempl = Flint.create(document.getElementById("song-templ").innerHTML);

//Reads JSON file, checks if Hash is present and tries to match it to a song, will also read localStorage to attempt to resume a previous session

$.getJSON("tracklist.json",function(data) {
	tracklist = data.slice(0);
	if(!isNaN(parseInt(location.hash.replace("#",""))) && !isNaN(parseInt(localStorage.getItem("song")))){
		//Check if song in hash is the same as last played song, if so load play list from localstorage and resume from previous point
		if (location.hash && parseInt(location.hash.replace("#","")) == parseInt(localStorage.getItem("song"))){
			var i=0;
			var storedSong = parseInt(localStorage.getItem("song"));
			if ($.inArray(storedSong,JSON.parse(localStorage.getItem("playlist"))) != -1){
				unshuffled = JSON.parse(localStorage.getItem("playlist"));
				playlist = JSON.parse(localStorage.getItem("playlist"));
				loop = $.inArray(storedSong,playlist);
			}
			else{
				playlist.push(storedSong);
				unshuffled = playlist.slice(0);
			}

			previousIndex = loop;
			addressChange();
			song.src = "audio/"+encodeURIComponent(tracklist[playlist[loop]].filename);
			song.addEventListener("durationchange",setTime);
		}
		//if hash is not same as last session's song, check if hash is in previous playlist
		else{
			var hashSong= parseInt(location.hash.replace("#",""));
			//if in previous playlist, find index and load previous
			if ($.inArray(hashSong,JSON.parse(localStorage.getItem("playlist"))) != -1){
				unshuffled = JSON.parse(localStorage.getItem("playlist"));
				playlist = JSON.parse(localStorage.getItem("playlist"));
				loop = $.inArray(hashSong,playlist);
			}
			else{
				playlist.push(hashSong);
				unshuffled = playlist.slice(0);
			}
			previousIndex = loop;
			song.src = "audio/"+encodeURIComponent(tracklist[playlist[loop]].filename);
		}
	}
	//if hash null but not previous song
	else if(!isNaN(parseInt(localStorage.getItem("song")))){
		var storedSong = parseInt(localStorage.getItem("song"));
		if ($.inArray(storedSong,JSON.parse(localStorage.getItem("playlist"))) != -1){
			playlist = JSON.parse(localStorage.getItem("playlist"));
			unshuffled = playlist.slice(0);
			loop = $.inArray(storedSong,playlist);
		}
		else{
			playlist.push(storedSong);
			unshuffled = playlist.slice(0);
			loop = 0;
		}
		previousIndex = loop;
		addressChange();
		song.src = "audio/"+encodeURIComponent(tracklist[playlist[loop]].filename);
		song.addEventListener("durationchange",setTime);
	}
	else if(!isNaN(parseInt(location.hash.replace("#","")))){	
		var hashSong = parseInt(location.hash.replace("#",""));
		if ($.inArray(hashSong,JSON.parse(localStorage.getItem("playlist"))) != -1){
			playlist = JSON.parse(localStorage.getItem("playlist"));
			unshuffled = playlist.slice(0);
			loop = $.inArray(hashSong,playlist);
		}
		else{
			playlist.push(hashSong);
			unshuffled = playlist.slice(0);
			loop = 0;
		}
		previousIndex = loop;
		addressChange();
		song.src = "audio/"+encodeURIComponent(tracklist[playlist[loop]].filename);
		song.addEventListener("durationchange",setTime);
	}
	// if all null load full tracklist as playlist
	else{
		loop=0;
		for(var i=0;i<tracklist.length;i++){
			playlist.push(i);
		}
		unshuffled = playlist.slice(0);
		song.src ="audio/"+encodeURIComponent(tracklist[playlist[0]].filename); 
		previousIndex = loop;
		addressChange();
	}
	//if previous session was shuffled, set shuffle to true
	if(localStorage.getItem("shuffle") != null && localStorage.getItem("shuffle") == "true"){
		loadShuffle();
	}
	else{
		createList();
	}
	getTags();
	populateBrowser();
	filterCurrent();
	localStorage.setItem("song",[playlist[loop]]);
	$('#load-playlist').val(encodeAndWrite());
	preload();
});
//Generates list items in the playlist
function createList(){
	$('ul').first().html("");
	for (var i=0;i < playlist.length;i++){	
		$('ul').first().append(trackTempl.render(tracklist[playlist[i]]));

	}
	$('.song:nth-child('+(loop+1)+')').addClass("selected");
}
//change's URL's hash location
function addressChange(){
	location.hash=playlist[loop];
}

//Added 1/26/2016
//populates browser with items from the tracklist array
function populateBrowser(){
	var artists=[];
	var albums=[];
	var songs=[];
	for(var i=0;i<tracklist.length;i++){
		if($.inArray((tracklist[i].artist.charAt(0).toUpperCase() + tracklist[i].artist.slice(1)),artists)==-1){
			artists.push(tracklist[i].artist.charAt(0).toUpperCase() + tracklist[i].artist.slice(1));
		}
		if($.inArray(tracklist[i].album,albums)===-1){
			albums.push(tracklist[i].album);
		}
		songs.push(tracklist[i].songname);
	}
	artists.sort();
	albums.sort();
	songs.sort();

	$('#artists').append(artistTempl.render({"artist":".."}));
	for(var i=0;i<artists.length;i++){	
		$('#artists').append(artistTempl.render({"artist":artists[i]}));
	}
	for(var i=0;i<albums.length;i++){	
		var x;
		for(x=0;albums[i] != tracklist[x].album;x++){
		}
		$('#albums').append(albumTempl.render({"cover": "http://music.t3gs.ninja/images/"+encodeURIComponent(tracklist[x].cover),"album":albums[i]}));

	}
	for(var i=0;i<songs.length;i++){
		$('#songs').append(songTempl.render({"song":songs[i]}));	
	}
}

//Filter Albums and Songs by Artist

$('#artists').on('click', '.anArtist', function(){
	//albums and songs belonging to selected artist are stored in these arrays to prevent overlap and allow data to be sorted
	var albums = [];
	var songs = [];

	if($(this).text() === "..")
	{
		//this sets the artist to an empty string for deselecting artists to show all albums and songs
		selectedArtist="";
	}
	else{
		selectedArtist=$(this).text();
	}
	$("#albums").html("");
	$("#songs").html("");
	$('.anArtist').removeClass("selected");
	$(this).addClass("selected");
	//if selected artist isn't empty
	if(selectedArtist != ""){
		for(var i=0;i<tracklist.length;i++){
			if(tracklist[i].artist.toUpperCase() === selectedArtist.toUpperCase()){
				if($.inArray(tracklist[i].album,albums)===-1){
					albums.push(tracklist[i].album);
				}
				songs.push(tracklist[i].songname);
			}
		}
		albums.sort();
		songs.sort();
		for(var i=0;i<songs.length || i<albums.length;i++){
			if(i<albums.length){

				var x;
				for(x=0;albums[i] != tracklist[x].album;x++){
				}
				$('#albums').append(albumTempl.render({"cover": "http://music.t3gs.ninja/images/"+encodeURIComponent(tracklist[x].cover),"album":albums[i]}));
				//checks to see if currently playling song belongs to the album
				if($('#album').text() == albums[i]){
						$('.anAlbum').removeClass('selected');
						$('.anAlbum:nth-child('+(i+1)+')').addClass('selected');
				}
			}
			if(i < songs.length){
				$('#songs').append(songTempl.render({"song":songs[i]}));	
				//checks if current song in loop is the currently playing song
				if($('#songtitle').text() == songs[i]){
					$('.aSong:nth-child('+(i+1)+')').addClass('selected');
				}
			}
		}
	}
	//repopulate browser with all albums and songs
	else{
		for(var i=0;i<tracklist.length;i++){
			if($.inArray(tracklist[i].album,albums)===-1){
				albums.push(tracklist[i].album);
			}	
			songs.push(tracklist[i].songname);
		}
		albums.sort();
		songs.sort();
		for(var i=0;i<songs.length || i<albums.length;i++){
			if(i<albums.length){
				var x;
				for(x=0;albums[i] != tracklist[x].album;x++){
				}
				$('#albums').append(albumTempl.render({"cover": "http://music.t3gs.ninja/images/"+encodeURIComponent(tracklist[x].cover),"album":albums[i]}));
				//checks to see if now playing belongs to the album
				if($('#album').text() == albums[i]){
						$('.anAlbum').removeClass('selected');
						$('.anAlbum:nth-child('+(i+1)+')').addClass('selected');
				}
			}
			if(i < songs.length){
				$('#songs').append(songTempl.render({"song":songs[i]}));	
				//checks if current song in loop is the currently playing song
				if($('#songtitle').text() == songs[i]){
					$('.aSong:nth-child('+(i+1)+')').addClass('selected');
				}
			}
		}
	}
});

//Filter Songs by Album (and Artist, if applicable)

$('#albums').on('click', '.anAlbum', function(){
	//collect songs in an array to allow them to be sorted
	var songs = [];
	$("#songs").html("");
	$('.anAlbum').removeClass("selected");
	$(this).addClass("selected");
	for(var i=0;i<tracklist.length;i++){
		if(tracklist[i].album === $(this).text() && (tracklist[i].artist.toUpperCase() === selectedArtist.toUpperCase() || selectedArtist === "")){
			 songs.push({"songname": tracklist[i].songname, "tracknum": tracklist[i].tracknum});
		}
	}
	songs.sort(function(a, b) {
	    return parseFloat(a.tracknum) - parseFloat(b.tracknum);
	});
	for(var i=0;i<songs.length;i++){
		//if song is currently playing, add the selected class
		$('#songs').append(songTempl.render({"song":songs[i].songname}));	
		if($('#songtitle').text() == songs[i].songname){
			$('.aSong:nth-child('+(i+1)+')').addClass('selected');
		}
	}
});

//Play Song from browser, this clears the current playlist

$('#songs').on('dblclick', '.aSong', function(){
	var i = 0;
	for(i=0; $(this).text() != tracklist[i].songname && i < tracklist.length;i++){
	}
	playlist = [];
	unshuffled = [];
	previousindex=loop;
	playlistAddTrack(i);
	loop = playlist.length-1;
	createList();
	changeSong(loop,true);
});
//Adds clicked song to playlist in a non-destructive manor
$('#songs').on('contextmenu', '.aSong', function(e){
	e.preventDefault();
	var i;
	for(i=0; $(this).text() != tracklist[i].songname && i < tracklist.length;i++){
	}
	if(playlist.length==0){
		playlistAddTrack(i);
		loop = 0;
		changeSong(loop, false);
		play(false);
	}
	else{
		playlistAddTrack(i);
	}
});

//add album from browser, non-destructive
$('#albums').on('contextmenu', '.anAlbum', function(e){
	e.preventDefault();
	var songs = [];
	for(var i=0;i<tracklist.length;i++){
		if(tracklist[i].album === $(this).text() && (tracklist[i].artist.toUpperCase() === selectedArtist.toUpperCase() || selectedArtist === "")){
			 songs.push({"index": i, "tracknum": tracklist[i].tracknum});
		}
	}
	songs.sort(function(a, b) {
	    return parseFloat(a.tracknum) - parseFloat(b.tracknum);
	});
	for(var i=0;i<songs.length;i++){
		playlistAddTrack(songs[i].index);
	}
});
//add album to playlist, overwrites the playlist
$('#albums').on('dblclick', '.anAlbum', function(e){
	e.preventDefault();
	var songs = [];
	playlist = [];
	unshuffled = [];
	for(var i=0;i<tracklist.length;i++){
		if(tracklist[i].album === $(this).text() && (tracklist[i].artist.toUpperCase() === selectedArtist.toUpperCase() || selectedArtist === "")){
			 songs.push({"index": i, "tracknum": tracklist[i].tracknum});
		}
	}
	songs.sort(function(a, b) {
	    return parseFloat(a.tracknum) - parseFloat(b.tracknum);
	});
	for(var i=0;i<songs.length;i++){
		playlistAddTrack(songs[i].index);
	}
	previousIndex=playlist.length-1;
	loop = 0;
	createList();
	changeSong(loop,true);
});

//after DOM loads, this function is executed, recalls settings from localStorage
$( document ).ready(function(){
	if(localStorage.getItem("volume") != null){
		$("#volume").get(0).value = localStorage.getItem("volume");
		volumeChange(localStorage.getItem("volume"));
	}
	if(localStorage.getItem("visToggle") != null){
		$("#showvis").html(localStorage.getItem("visToggle"));
		toggleVis();
	}
	if(localStorage.getItem("repeat") != null){
		repeat = localStorage.getItem("repeat");
		repeatSongs();
	}	

});
//remove item from play list
$("ul").first().on('contextmenu', '.song', function(e){
	e.preventDefault();
	unshuffled.splice(unshuffled.indexOf(playlist[$(this).index()]),1);
	playlist.splice($(this).index(),1);
	//check if now playing still in playlist, if so change loop to match
	if($.inArray(loop,playlist) != -1)
	{
		loop = $.inArray(loop,playlist);
		$('.song').removeClass('selected');
		$('.song:nth-child('+(loop+1)+')').addClass('selected');
	}
	//if now playing NOT in playlist
	else{
		//reset loop to 0 and start from beginning of playlist
		if(playlist.length != 0){
			if(loop > playlist.length){
				loop = 0;
			}
			changeSong(loop,false);
			play(true);
		}
		//if playlist empty clear all things related to now playing
		else{
			$('#player').get(0).src = "";
			$('#coverArt').get(0).src = "";
			$('#songtitle').text("");
			$('#artist').text("");
			$('#album').text("");
		}
	}
	//save the playlist
	localStorage.setItem("playlist",JSON.stringify(unshuffled));
	$('#load-playlist').val(encodeAndWrite());
	createList();
});
//if previous session was shuffled, function sets values to match
function loadShuffle(){
	shuffled = true;
	unshuffled = playlist.slice(0);
	playlist = shuffle(playlist).slice(0);
	loop=playlist.indexOf(unshuffled[loop]);
	$("#shuffle").css({"color":"#999"});
	document.getElementsByTagName("ul")[0].innerHTML = "";
	createList();
}
//used to set current play time from localStorage
function setTime(){
	song.currentTime=localStorage.getItem("time");
	song.removeEventListener("durationchange",setTime);
	progressTracker();
}
//updates progress slider when audio duration changes
function ignoreTime(){
	song.removeEventListener("durationchange",setTime);
	progressTracker();
}

//adds a track to the playlist
function playlistAddTrack(track){
	//checks to see if track is already in array
	if($.inArray(track,unshuffled)===-1 && $.inArray(track,playlist)===-1){
		playlist.push(track);
		unshuffled.push(track);
	}
	//updates playlist stored in localstorage
	localStorage.setItem("playlist",JSON.stringify(unshuffled));
	createList();
	$('#load-playlist').val(encodeAndWrite());
}
//when clicked, clear current playlist, and now playing info
$("#clear").on('click', function(){
	loop = 0;
	playlist = [];
	unshuffled = [];
	createList();
	localStorage.setItem("playlist",JSON.stringify(unshuffled));
	$('#player').get(0).src = "";
	$('#coverArt').get(0).src = "http://music.t3gs.ninja/images/blank.png";
	$('#songtitle').text("");
	$('#artist').text("");
	$('#album').text("");
});
//when the songinfo for currently playing song is clicked, filter browser display to match
$('#songinfo').on('click', function(){
	//.stop cancels current animation
	$("#visualization").stop();
	$("#browser").stop();	
	//changes the visualizer toggle button icon
	$("#showvis").text("equalizer");
	$("#visualization").fadeOut(500,function(){$('#visualization').hide()});
	$("#browser").fadeIn(500);
	$("#browser").show();
	var i;
	//loops through artist to find match
	for(i = 0; i < $('.anArtist').length -1 && $('#artist').text() != $('.anArtist:nth-child('+(i+1)+')').text(); i++){
	}
	//remove/add selected class to correct artist
	$('.anArtist').removeClass('selected');
	$('.anAlbum').removeClass('selected');
	$('.aSong').removeClass('selected');
	$('.anArtist:nth-child('+(i+1)+')').addClass('selected');

	var selectedArtist=$('#artist').text();
	var albums = [];
	var songs = [];

	$("#albums").html("");
	$("#songs").html("");
	//only runs if there is a song playing
	if(selectedArtist != ""){
		//loops through all songs in tracklist
		for(var i=0;i<tracklist.length;i++){
			//checks if current song in loop belongs to selected artist
			if(tracklist[i].artist.toUpperCase() === selectedArtist.toUpperCase()){
				//if album is not in array, add it
				if($.inArray(tracklist[i].album,albums)===-1){
					albums.push(tracklist[i].album);	
				}
				//add song to array
				if(tracklist[i].album.toUpperCase() == $('#album').text().toUpperCase()){
					songs.push({"song" : tracklist[i].songname, "tracknum": tracklist[i].tracknum});
				}
			}
		}
		albums.sort();
		songs.sort(function(a, b) {
			return parseFloat(a.tracknum) - parseFloat(b.tracknum);
		});
		for(var i=0;i<songs.length || i<albums.length;i++){
			if(i<albums.length){
				var x;
				for(x=0;albums[i] != tracklist[x].album;x++){
				}
				//add album and artwork to browser
				$('#albums').append(albumTempl.render({"cover": "http://music.t3gs.ninja/images/"+encodeURIComponent(tracklist[x].cover),"album":albums[i]}));
				//highlight currently playing song's album
				if($('#album').text() == albums[i]){
						$('.anAlbum:nth-child('+(i+1)+')').addClass('selected');
				}
			}
			//add song to browser
			if(i < songs.length){
				$('#songs').append(songTempl.render({"song":songs[i].song}));	
				//highlight currently playing song
				if($('#songtitle').text() == songs[i].song){
					$('.aSong:nth-child('+(i+1)+')').addClass('selected');
				}
			}
		}
	}		
});
//this function changes the currently highlighted artist/album/song to match now playing, called when track changes
function filterCurrent(){	
	$('.aSong').removeClass('selected');
	$('.anAlbum').removeClass('selected');
	$('.anArtist').removeClass('selected');
	for(var i = 0; i < $('.aSong').length || i < $('.anAlbum').length || i < $('.anArtist').length; i++){
		if ($('#songtitle').text() == $('.aSong:nth-child('+(i+1)+')').text() && i < $('.aSong').length){
			$('.aSong:nth-child('+(i+1)+')').addClass('selected');
		}
		if ($('#artist').text() == $('.anArtist:nth-child('+(i+1)+')').text() && i < $('.anArtist').length){
			$('.anArtist:nth-child('+(i+1)+')').addClass('selected');
		}
		if ($('#album').text() == $('.anAlbum:nth-child('+(i+1)+')').text() && i < $('.anAlbum').length){
			$('.anAlbum:nth-child('+(i+1)+')').addClass('selected');
		}
	}
}

//handler for the generate button
$('#generate').on('click', function(){
	generatePlaylist();
});
//loads the playlist that has been input
$('#load-playlist').keyup(function(event){
	if(event.keyCode ==13){
		decodeAndSet($(this).val());
	}
});
//select all text when box is focus
$('#load-playlist').focus(function(){
	$(this).select();
});

//this function generates a playlist of 10 random songs, checks itself to make sure there are no duplicates
function generatePlaylist(){
	playlist = [];
	unshuffled = [];
	var index = Math.floor(Math.random() * (tracklist.length-1));
	for(var i=0; i<10; i++){
		while($.inArray(index,unshuffled) != -1){
			index = Math.floor(Math.random() * (tracklist.length-1));
		}
		playlistAddTrack(index);
	}
	previousIndex = loop = 0;
	changeSong(loop,false);
	play();
}
//grouped hover handler for clear and generate button, makes both buttons visible when one is hovered
$('#generate, #clear, #load-playlist').hover(
	function(){
		$('#clear, #generate, #load-playlist').stop();
		$('#clear, #generate, #load-playlist').animate({'opacity' : '1'},500);
	},
	function(){
		$('#clear, #generate, #load-playlist').stop();
		$('#clear, #generate, #load-playlist').animate({'opacity' : '0'},500);
});
//notifies the user when song changes
function notifyMe(thisSong) {
	try{
		//make sure browser supports notifications
		if(!("Notification" in window)){
			return;
		}
		//asks user for permission to notify(one time only)
		if (Notification.permission !== "granted"){
			Notification.requestPermission();
		}
		else{
			//create a new notification
			var notification = new Notification(thisSong.songname, {
			icon: "http://music.t3gs.ninja/images/"+encodeURIComponent(thisSong.cover),
			body: thisSong.artist + " - " + thisSong.album,
			renotify: true,
			silent: true
			});
			notification.onclick = function () {
				window.focus();      
			};
			//set lifetime for notification, removes itself after
			setTimeout(function(){notification.close();}, 2000);
		}
	}
	//if code fails to, run do nothing
	catch(err){
		return;
	}
}
//used in conjunction with upload, repopulates tracklist and browser after upload completes, re-highlights now playing in the browser
function reconstruct(){
	$.getJSON("http://music.t3gs.ninja/tracklist.json",function(data) {
		tracklist = data.slice(0);
		$('#artists').html('');
		$('#albums').html('');
		$('#songs').html('');
		populateBrowser();
		filterCurrent();
	});

}















function encodeAndWrite(){
	var arrayPlaces = (tracklist.length-1).toString().length;
	var encoded = "";
	for(var i = 0; i < playlist.length; i++){
		var tempString = playlist[i].toString(36);
		/*
		if(tempString.length < arrayPlaces){
			tempString = '0'.repeat(arrayPlaces - tempString.length) + tempString;	
		}
		*/
		encoded += tempString+',';
	}
	encoded = encoded.substring(0,encoded.length-1);
	return LZString.compressToUTF16(encoded);
}

function decodeAndSet(s){
	console.log(s);
	s= LZString.decompressFromUTF16(s);
	console.log(s);
	s = s.split(',');
	for( var i = 0; i < s.length; i++){
		s[i]=parseInt(s[i],36);
	}
	loop=0;
	playlist=s.slice(0);
	unshuffled=playlist.slice(0);
	localStorage.setItem("playlist",JSON.stringify(unshuffled));
	createList();
	changeSong(loop,false);	
	play();
}
