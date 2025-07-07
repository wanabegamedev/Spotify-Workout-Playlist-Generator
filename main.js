const clientId = "61ff8c77aec44368a4bff2552e89ba56";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

// --- DOM Elements ---
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const spotifyConnectButton = document.getElementById('SpotifyConnect');
const generateButton = document.getElementById("GenerateButton");

// --- Global State ---
var localAccessToken;
var spotifySongs = [];
var profileID;
var playlistID;
var numberOfSongs = 20;

var BPM = 128;

 var otherInfo = "songs in the britpop genre"

// --- App Initialization ---

// Use a redirect URL that points to the root of your ngrok-served folder.
const redirectURL = document.URL;


if (!code) {
    // 1. If there is no authorization code, show the login view.
    loginView.style.display = 'block';
    appView.style.display = 'none';
    spotifyConnectButton.addEventListener('click', () => redirectToAuthCodeFlow());
} else {
    handleAuthentication();
}

async function handleAuthentication() {
    try {
        const accessToken = await getAccessToken(clientId, code);
        localAccessToken = accessToken;
        const profile = await fetchProfile(accessToken);
        profileID = profile.id;
        console.log("Authentication successful for:", profile.display_name);

        // Show the main app and hide the login button
        loginView.style.display = 'none';
        appView.style.display = 'block';

        // Now that the user is logged in, attach the event listener to the generate button.
        generateButton.addEventListener("click", GeneratePlaylist);

    } catch (error) {
        console.error("Error during authentication:", error);
        // If auth fails, show login view again so the user can retry.
        loginView.style.display = 'block';
        appView.style.display = 'none';
    }
}

// --- Spotify API Functions ---

async function redirectToAuthCodeFlow() {
    // TODO: Redirect to Spotify authorization page

    const verifier = GenerateCodeVerifier(128);
    const challenge = await GenerateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();

    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectURL);
    params.append("scope", "user-read-private user-read-email playlist-modify-private playlist-modify-public");
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
                content: "Give me a list of " + numberOfSongs + "songs that are " + BPM + " beats per minute" + "considering " + otherInfo + ". Format the data in this style: remaster%20track:SONG_TITLE%20artist:ARTIST FIRST NAME OR BAND NAME%ARTIST LAST NAME (IGNORE IF YOU HAVE ALREADY PUT THE BAND NAME)    Instructions: add a comma between each track but no space. do not provide any other information about the tracks or explain why you picked them. If you make a mistake don't tell me about it"
            }]
        })
        


    })

        const aiOutput  = await aiResponse.json()

 

     //console.log(output.choices[0].message.content);
     //document.getElementById('AIGen').innerHTML = aiOutput.choices[0].message.content

     return(aiOutput)

     


}


 async function GeneratePlaylist()
{

    generateButton.classList.add("is-loading")

    var songs = "";
    playlistID = 0
    spotifySongs = []

    numberOfSongs = document.getElementById("SongCount").value;
      BPM = document.getElementById("BPM").value;
      otherInfo = document.getElementById("Info").value;

   songs = await GetLamaResponse()

   songs = songs.choices[0].message.content.split(",")

   
  await ReturnTracks(songs)

   console.log(spotifySongs);

  await CreatePlaylist("AI Playlist")
 
   console.log(playlistID)

   await AddSongsToPlaylist(spotifySongs)

   const para = document.createElement("p");
    const node = document.createTextNode("PLAYLIST CREATED GO TO YOUR SPOTIFY!");

    para.appendChild(node);

    const element = document.getElementById("Result");
    element.append(para)

      generateButton.classList.remove("is-loading")


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




