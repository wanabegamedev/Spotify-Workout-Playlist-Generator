const clientId = "61ff8c77aec44368a4bff2552e89ba56"; 
const params = new URLSearchParams(window.location.search) 
const code = params.get("code");

const generateButton = document.getElementById("GenerateButton");

const redirectURL = 'https://prime-likely-cockatoo.ngrok-free.app/Spotify-Workout-Playlist-Generator/'; 

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    console.log(profile);

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
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
  });

  const {access_token} = await result.json();
  return access_token;

}

async function fetchProfile(token) {


    const result = await fetch("https://api.spotify.com/v1/me", {

       method: "GET", headers: { Authorization: `Bearer ${token}` }

    });

    return await result.json();
}




generateButton.addEventListener("click", GetLamaResponse)




async function GetLamaResponse()
{
        var spotifySongs = []

    var numberOfSongs = 20;

    var BPM = 128;

    var otherInfo = "songs in the britpop genre"

 
  const aiResponse = await fetch('https://ai.hackclub.com/chat/completions', {

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

        const aiOutput  = await aiResponse.json()

 

     //console.log(output.choices[0].message.content);
     document.getElementById('AIGen').innerHTML = aiOutput.choices[0].message.content

     return(aiOutput)

     


}


export async function GeneratePlaylist()
{
    songs = "";
   songs = await GetLamaResponse()

   console.log(songs.choices[0].message.content);


   songs = songs.choices[0].message.content.split(",")

   ReturnTracks(song)


}


 async function ReturnTracks(songs) {
            
            songs.forEach(songs => {
                sng =  ReturnSongData(songs, accessToken).items[0].name
                console.log(sng)
            
                
            });
        }


async function  ReturnSongData(token, song)
{
    const result = await fetch('https://api.spotify.com/v1/search?' + song, {

       method: "GET", headers: { Authorization: `Bearer ${token}` }

    });

    return await result.json();
}


