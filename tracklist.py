import json,os,time,sys
from mutagen import File
reload(sys)
sys.setdefaultencoding('utf8')
##jsonFile = file('/home/itege/public_html/audio/tracklist.json')
directory = "/home/itege/public_html/audio/audio/"
fileloc = "/home/itege/public_html/audio/tracklist.json"
with open(fileloc, 'a+') as myfile:
    data=myfile.read().replace('\n', '').replace('\t','')
try:
    convertedFile = json.loads(data)
except:
    convertedFile = []
tracklist = []
for files in os.walk(directory):
    for file in files:
	musicFiles = os.path.join(file)
loop = 0
while loop < len(musicFiles):
    if ".mp3" in musicFiles[loop] or ".m4a" in musicFiles[loop]:
        i = 0
        while i < len(convertedFile) and musicFiles[loop] != convertedFile[i]["filename"]:
            i+=1
        if i == len(convertedFile):
            file = File(directory+musicFiles[loop],easy=True)
            cover = File(directory+musicFiles[loop])
            tracklist.append([musicFiles[loop],"","","","","",""])
            try:
                tracklist[len(tracklist)-1][1]=file["title"][0].replace("\"","")
            except:
                tracklist[len(tracklist)-1][1]=""
            try:
                tracklist[len(tracklist)-1][2]=file["artist"][0]
            except:
                tracklist[len(tracklist)-1][2]=""
            try:
                tracklist[len(tracklist)-1][3]=file["album"][0]
            except:
                tracklist[len(tracklist)-1][3]=""
            try:
                try:
                    if(len(str(file["tracknumber"][0]).split("/",1)[0]) >= 2):
                        disk=file["discnumber"][0].split("/",1)[0]
                    else:
                        disk=file["discnumber"][0].split("/",1)[0] + "0"
                except:
                   disk="0"     
                tracklist[len(tracklist)-1][4]=str(disk+file["tracknumber"][0]).split("/",1)[0]
            except:
                tracklist[len(tracklist)-1][4]="0"
            try:
                art = cover.tags['APIC:'].data
                with open("/home/itege/public_html/audio/images/"+file["album"][0]+'.jpg', 'wb') as img:
                    img.write(art)
                tracklist[len(tracklist)-1][5]=file["album"][0]+".jpg"
            except: 
                try:
                    art = cover['covr'][0]
                    with open("/home/itege/public_html/audio/images/"+file["album"][0]+'.jpg', 'a+') as img:
                      img.write(art)
                    tracklist[len(tracklist)-1][5]=file["album"][0]+".jpg"
                except:
                    tracklist[len(tracklist)-1][5]="blank.png"
            tracklist[len(tracklist)-1][6]=os.path.getmtime(directory+musicFiles[loop])
        file = File(directory+musicFiles[loop],easy=True)
    loop += 1
    id3r = None
print "files read"
tracklist = sorted(tracklist, key = lambda song:song[6])
print "data processed"
i = 0
while i < len(tracklist):
    convertedFile.append({"filename":tracklist[i][0],"songname":tracklist[i][1],"artist":tracklist[i][2],"album":tracklist[i][3],"tracknum":tracklist[i][4],"cover":tracklist[i][5]})
    i+=1
myFile=open(fileloc,'rw+')
myFile.write(json.dumps(convertedFile,indent=4))
print 'files written'
