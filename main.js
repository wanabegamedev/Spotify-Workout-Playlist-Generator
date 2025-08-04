

const generateButton = document.getElementById("GenerateButton");

const port = 3000

// --- Global State ---
var localAccessToken;
var spotifySongs = [];
var profileID;
var playlistID;
var numberOfSongs = 20;

var BPM = 128;

var otherInfo = "songs in the britpop genre"

var playlistName = "AI Playlist"

var playlistLink = "";





generateButton.addEventListener("click", GeneratePlaylist);


async function GetSpotifyCreds()
{ 
    const response = await fetch("http://localhost:" + port + "/api/token");
   const data = await response.json();

    localAccessToken = data.access_token;
    profileID = data.user_id;
}


 async function GeneratePlaylist()
{

    generateButton.classList.add("is-loading")
    

    await GetSpotifyCreds()

    var songs = "";
    playlistID = 0
    spotifySongs = []


    numberOfSongs = document.getElementById("SongCount").value;

      BPM = document.getElementById("BPM").value;
      otherInfo = document.getElementById("Info").value;
      playlistName = document.getElementById("PlaylistName").value;

      //Validation Code
    if(numberOfSongs <= 0)
    {
        numberOfSongs = 1
    }
    if (BPM <= 0)
    {
        BPM = 128;
    }
    if (otherInfo == "" || otherInfo == null)
    {
        otherInfo = "A 90s Britpop playlist!"
    }
    if (playlistName == "" || playlistName == null)
    {
        playlistName = "A 90s Britpop playlist!"
    }

   songs = await GetGeminiResponse()

   songs = songs.choices[0].message.content.split(",")

   
  await ReturnTracks(songs)

   console.log(spotifySongs);

  await CreatePlaylist(playlistName)
 
   console.log(playlistID)

   await AddSongsToPlaylist(spotifySongs)

   const para = document.createElement("p");

    const node = document.createTextNode("PLAYLIST CREATED GO TO YOUR SPOTIFY TO SEE THE PLAYLIST!");

    para.appendChild(node);

    const element = document.getElementById("Result");
    element.append(para)

      generateButton.classList.remove("is-loading")

  


}


async function GetGeminiResponse() {
    
  
const prompt =  "Give me a list of " + numberOfSongs + "songs that are " + BPM + " beats per minute" + "considering " + otherInfo + ". Format the data in this style: remaster%20track:SONG_TITLE%20artist:ARTIST FIRST NAME OR BAND NAME%ARTIST LAST NAME (IGNORE IF YOU HAVE ALREADY PUT THE BAND NAME)    Instructions: add a comma between each track but no space. do not provide any other information about the tracks or explain why you picked them. If you make a mistake don't tell me about it"

    const response = await fetch("http://localhost:3000/api/get-ai-response", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // Send the prompt in the request body
        body: JSON.stringify({ prompt: prompt })
    });

    return await response.json();

}


async function GetLamaResponse()
{

    

 
  const aiResponse = await fetch('https://ai.hackclub.com/chat/completions', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'

        },

        body: JSON.stringify({
            messages: [{
                role: 'user',
                content: "YOU ARE A ROBOT WHO RECOMENDS SONGS DO NOT SAY ANYTHING BESIDES THE TRACK NAME IN THE FOLLOWING FORMAT : remaster%20track:SONG_TITLE%20artist:ARTIST FIRST NAME OR BAND NAME%ARTIST LAST NAME (IGNORE IF YOU HAVE ALREADY PUT THE BAND NAME) IMPORTANT INSTRUCTIONS add a comma between each track but no space. do not provide information about the tracks or explain why you picked them (it is a suprise!). If you make a mistake don't tell them about it. do not say anything about your thinking process (it is a suprise), just print out the track names in the format mentioned before"
            }]
        })
        


    })

        const aiOutput  = await aiResponse.json()

 

     console.log(aiOutput.choices[0].message.content);
     //document.getElementById('AIGen').innerHTML = aiOutput.choices[0].message.content

     return(aiOutput)

}


 async function ReturnTracks(songs) {
   
    for (const song of songs) {
        if (!song) continue; // Skip empty strings from split
        
        const params = new URLSearchParams();
        params.append('q', song);
        params.append('type', 'track');
        params.append('limit', '1'); // Get the top result

        const result = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
            method: "GET", 
            headers: { Authorization: `Bearer ${localAccessToken}` }
        });

        const sng =  await result.json();

        if (sng.tracks && sng.tracks.items.length > 0) {

            spotifySongs.push(sng.tracks.items[0].uri)

        } else {
            console.log(`No results found for "${song}"`);
        }
    }
 }

 async function CreatePlaylist(playlistName)
 {
    const result = await fetch(`https://api.spotify.com/v1/users/${profileID}/playlists`, {
            method: "POST", 
            headers: {  'Content-Type': 'application/json',
                
                Authorization: `Bearer ${localAccessToken}` },

            body: JSON.stringify({
                'name': playlistName,
                'description': "AI Generated Playlist",
                "public": false

            
         })


        });

      
       
    const data = await result.json();
    playlistID = data.id;
 }

 async function AddSongsToPlaylist(tracks)
 {
    const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
            method: "POST", 
            headers: {  'Content-Type': 'application/json',
                Authorization: `Bearer ${localAccessToken}` 
            },
            body: JSON.stringify({ 
                uris: tracks 
            })
        });

    return await result.json();
 }




