///spotifySongs = []

//numberOfSongs = 20;

//BPM = 128;

//otherInfo = "songs in the britpop genre"




const clientId = "61ff8c77aec44368a4bff2552e89ba56"; 
const params = new URLSearchParams(window.location.search) 
const code = params.get("code");

const redirectURL = 'https://dbe0-86-4-195-110.ngrok-free.app/Spotify-Workout-Playlist-Generator/index.html'; 

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    populateUI(profile);
}



export async function redirectToAuthCodeFlow(clientId) {
    // TODO: Redirect to Spotify authorization page

    const verifier = GenerateCodeVerifier(128);
    const challenge = await GenerateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();

    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectURL);
    params.append("scope", "user-read-private user-read-email playlist-modify-private");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

       document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}


//These two functions verify that the account login is legit

function GenerateCodeVerifier(length)
{
    let text = "";
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
        
    }

    return text;
}

async function GenerateCodeChallenge(codeVerifier)
{
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data)
     return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");
  
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectURL);
    params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: params

  });

  const {access_token} = await result.json();
  return access_token;

}

async function fetchProfile(token) {
    // TODO: Call Web API
}

function populateUI(profile) {
    // TODO: Update UI with profile data
}






async function GetLamaResponse()
{
    output = "";
  aiResponse = await fetch('https://ai.hackclub.com/chat/completions', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'

        },

        body: JSON.stringify({
            messages: [{
                role: 'user',
                content: "Give me a list of " + 4 + "songs that are " + BPM + " beats per minute" + "considering " + otherInfo + ". Format the data in this style: remaster%20track:SONG_TITLE%20artist:ARTIST FIRST NAME OR BAND NAME%ARTIST LAST NAME (IGNORE IF YOU HAVE ALREADY PUT THE BAND NAME)    Instructions: add a comma between each track and do not provide any other information about the tracks or explain why you picked them"
            }]
        })
        


    })

     output = await aiResponse.json()

 

     //console.log(output.choices[0].message.content);
     document.getElementById('AIGen').innerHTML = output.choices[0].message.content

     return(output)

     


}


async function GeneratePlaylist()
{
    songs = "";
   songs = await GetLamaResponse()

   console.log(songs.choices[0].message.content);


   songs = songs.choices[0].message.content.split(",")


    console.log(APIController.GetToken())
}


 const ReturnTracks = async(songs, token) => {
            
            songs.forEach(song => {
                sng =  FetchSpotifyWebAPI('v1/search?q=' + song, 'GET')
                
                console.log(sng);
            });
        }