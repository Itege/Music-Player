//script for drawing the visualizer
	var viz = document.getElementById("visualization");
	var audSrc = (new AudioContext()).createMediaElementSource(document.getElementById("player"));
	var audAnal = audSrc.context.createAnalyser();
	/*var audSplit = audSrc.context.createChannelSplitter();
	var audAnalL = audSrc.context.createAnalyser();
	var audAnalR = audSrc.context.createAnalyser();
	audAnalL.smoothingTimeConstant = .96;
	audAnalR.smoothingTimeConstant = .96;
	audSplit.connect(audAnalL, 0, 0);
	audSplit.connect(audAnalR, 1, 0);*/
	audSrc.connect(audAnal);
	var bufLen = audAnal.frequencyBinCount;
	var audBuf = new Uint8Array(bufLen);
	var volume = audSrc.context.createGain();
	audSrc.connect(volume);
	volume.connect(audSrc.context.destination);
	var vizHeight = viz.height = viz.clientHeight;
	var vizWidth = viz.width = viz.clientWidth;
	var vizCtx = viz.getContext("2d");
	var pixPerBar = vizWidth/Math.floor((bufLen-325)/8);
	//vizCtx.fillStyle = "#EF2263";
	var leftGradient = vizCtx.createLinearGradient(0,0,0,vizHeight);
	var color = ["#536DFE","#607D8B"];
	leftGradient.addColorStop(0,color[0]);
	leftGradient.addColorStop(1,color[1]);
	vizCtx.strokeStyle = leftGradient;
	vizCtx.fillStyle = leftGradient;

/*function rgbToHex(r, g, b) {
	var rh = r.toString(16); 
	if (r < 16) { 
		rh = "0" + rh;
	} 
	var gh = g.toString(16);
	if (g < 16) {
		gh = "0" + gh; 
	}
	var bh = b.toString(16);
	if (b < 16) {
			bh = "0" + bh; 
	}
	return "#" + rh + gh + bh;
}
$(document).ready(function(){
		for( var i =88; i>0; i--){
			document.body.innerHTML = ('<div style="width: 21px; height: 21px; background: red; position: relative; top: 0px; left: 0px; float: left; z-index: 10000; padding: 0px; margin: 0px;">'+i+'</div>') + document.body.innerHTML;
		}
})*/
/*
(function() {

	function draw() {
		vizCtx.clearRect(0, 0, vizWidth, vizHeight);
		audAnalL.getByteFrequencyData(audBuf);
		x = -1023+325;
		for (var i = bufLen-320; i > 0; i-=8){
			var start = vizWidth + x * pixPerBar -1;
			var height = (.45 * audBuf[i]) * vizHeight / 256 + 1;
			//vizCtx.fillStyle =rgbToHex( audBuf[i], 255, 255);
			vizCtx.fillRect(Math.floor((.125)*(vizWidth - start - pixPerBar)), vizHeight/2 - height, Math.floor(pixPerBar*.8), height);
			x+=8;
		}
		x=-1023+325;
		audAnalR.getByteFrequencyData(audBuf);
		for (var i = bufLen-320; i > 0; i-=8) {
			var start = vizWidth + x * pixPerBar -1;
			var height= (.45*audBuf[i]) * vizHeight /256 + 1;
			//vizCtx.fillStyle = rgbToHex(audBuf[i], 64, 255);
			vizCtx.fillRect(Math.floor((.125)*(vizWidth - start - pixPerBar)), (vizHeight/2 + height), Math.floor(pixPerBar*.8), -1*height);
			x+=8;
		}
		requestAnimationFrame(draw);
	}

	requestAnimationFrame(draw);
*/
(function() {
	var oldBuf = [];
	var re=0;
	var MAXDEPTH = 16;
	function draw(){
		vizCtx.clearRect(0, 0, vizWidth, vizHeight);
		audAnal.getByteTimeDomainData(audBuf);
		vizCtx.lineWidth=4;
		vizCtx.beginPath();
		var bufferLength = audAnal.frequencyBinCount;
		var sliceWidth = 1*(vizWidth * 1.0/ audAnal.frequencyBinCount);
		var x = 0;
		var y = 0;

		for(var i = 0; i < bufferLength; i++) {
        	var v = audBuf[i];
			if(oldBuf!=null){
				for(var n = 0; n < oldBuf.length; n++){
					v+=oldBuf[n][i];
				}
				v= (v/oldBuf.length);
			}
			v = (v/128)*.94;
        	y = Math.floor(v * vizHeight/2) +.5;

        	if(i === 0) {
          		vizCtx.moveTo(0, vizHeight-y);
        	}
			else {
          		vizCtx.lineTo(x, vizHeight-y);
				if(vizHeight-y< ((3/8)*.94) * vizHeight){
					vizCtx.fillRect(x-.5*sliceWidth,1,sliceWidth,2);
				}
				else if(vizHeight-y > ((5/8)*.94)*vizHeight){
					vizCtx.fillRect(x-.5*sliceWidth,vizHeight-3,sliceWidth,2);
				}
        	}

        	x += sliceWidth;
     	}
		vizCtx.lineTo(x + (vizWidth -x), vizHeight - y);
		vizCtx.stroke();
		if(oldBuf.length >= MAXDEPTH){
			oldBuf.splice(re,1,audBuf.slice(0));
		}
		else if (oldBuf.length < 50){
			oldBuf.push(audBuf.slice(0));
		}
		re++;
		if (re == MAXDEPTH){
			re=0;
		}
			setTimeout(function(){requestAnimationFrame(draw);},MAXDEPTH);
	}	
	if(window.location.href.indexOf('ionic.html') == -1 || window.location.href.indexOf('file') == -1){
		requestAnimationFrame(draw);
	}

	$(window).on('resize', function(){
		$('html').css({"width":"100%", "height": "100%"});
		$('body').css({"width":"100%", "height": "100%"});
		var viz = document.getElementById("visualization");
		vizHeight = viz.height = viz.clientHeight;
		vizWidth = viz.width = viz.clientWidth;
		pixPerBar = vizWidth/Math.floor((bufLen-325)/8);
		leftGradient = vizCtx.createLinearGradient(0,0,0,vizHeight);
		leftGradient.addColorStop(1,color[0]);
		leftGradient.addColorStop(0,color[1]);
		vizCtx.strokeStyle = leftGradient;
		vizCtx.fillStyle = leftGradient;
	});
})();

