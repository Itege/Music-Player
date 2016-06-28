<?php

header("Content-Type: text/plain; charset=utf-8");

for($i = 0; $i<count($_FILES["upfile"]["name"]);$i++){
	try {
    	// Undefined | Multiple Files | $_FILES Corruption Attack
    	// If this request falls under any of them, treat it invalid.
    	if (
        	!isset($_FILES["upfile"]["error"][$i]) ||
        	is_array($_FILES["upfile"]["error"][$i])
    	) {
        	throw new RuntimeException("Invalid parameters.");
    	}

    	// Check $_FILES["upfile"]["error"] value.
    	switch ($_FILES["upfile"]["error"][$i]) {
        	case UPLOAD_ERR_OK:
            	break;
        	case UPLOAD_ERR_NO_FILE:
            	throw new RuntimeException("No file sent.");
        	case UPLOAD_ERR_INI_SIZE:
        	case UPLOAD_ERR_FORM_SIZE:
            	throw new RuntimeException("Exceeded filesize limit.");
        	default:
            	throw new RuntimeException("Unknown errors.");
    	}
	/*
    	// You should also check filesize here. 
    	if ($_FILES["upfile"]["size"] > 10000000) {
        	throw new RuntimeException("Exceeded filesize limit.");
    	}
	*/
    	// DO NOT TRUST $_FILES["upfile"]["mime"] VALUE !!
    	// Check MIME Type by yourself.
    	$finfo = new finfo(FILEINFO_MIME_TYPE);
    	if (false === array_search(
        	$finfo->file($_FILES["upfile"]["tmp_name"][$i]),
        	array(
				"application/octet-stream",
            	"audio/mp3",
            	"audio/x-mpeg-3",
            	"audio/mpeg3",
            	"audio/mpeg",
				"audio/mp4",
				"audio/x-m4a"
        	),
        	true
    	)) {
			 echo ".".$finfo->file($_FILES["upfile"]["tmp_name"][$i]).".\n";
        	throw new RuntimeException("Invalid file format.\n");
    	}

    	// You should name it uniquely.
   		// DO NOT USE $_FILES["upfile"]["name"] WITHOUT ANY VALIDATION !!
    	// On this example, obtain safe unique name from its binary data.
    	if (!move_uploaded_file(
        	$_FILES["upfile"]["tmp_name"][$i],
        	sprintf("./audio/%s",
            	$_FILES["upfile"]["name"][$i]
        	)
    	)) {
        	throw new RuntimeException("Failed to move uploaded file.\n");
    	}

		echo chmod("audio/".str_replace(" ","\ ",$_FILES["upfile"]["name"][$i]),0777);

	} catch (RuntimeException $e) {
    	echo $e->getMessage();
	}
}
chmod("tracklist.json",0777);
chdir("/home/itege/");
shell_exec("./updatemusic.sh");
echo "Upload complete.";
?>
