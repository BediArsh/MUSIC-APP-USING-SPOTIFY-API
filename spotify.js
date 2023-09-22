document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsSection = document.getElementById('results');
    const audioPlayer = document.getElementById('audio-player');
    const nowPlaying = document.getElementById('now-playing');
    const playerSection = document.getElementById('player'); 
    let currentTrack = null;

    searchButton.addEventListener('click', () => {
        const query = searchInput.value;
        searchSpotify(query);
    });

    async function searchSpotify(query) {
        // Fetch access token
        const accessToken = await fetchAccessToken();

        // Spotify API search endpoint
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist`;
        try {
            const response = await fetch(searchUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch data from Spotify API');
            }
            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error('Error searching Spotify:', error);
            resultsSection.innerHTML = 'Error: Could not fetch data from Spotify.';
        }
    }

/* TO DISPLAY RESULTS */ 
function displayResults(data) {
    resultsSection.innerHTML = ''; // Clear previous results

    const tracks = data.tracks.items;
    const artists = data.artists.items;

    if (tracks.length === 0 && artists.length === 0) {
        resultsSection.innerHTML = 'No results found.';
        return;
    }

    const resultList = document.createElement('div'); // Create a container for results
    resultList.classList.add('results-container');

    tracks.forEach((track) => {
        const listItem = document.createElement('div'); // Use div instead of ul/li
        listItem.classList.add('result-item');
        const albumImage = track.album.images[0]; // Get the first album image
        const imageUrl = albumImage ? albumImage.url : 'default_image_url.jpg';
        listItem.innerHTML = `
            <div class="result-item">
                <div class="result-image">
                    <img src="${imageUrl}" alt="${track.name} Album Art">
                </div>
                <div class="result-details">
                    <strong>${track.name}</strong> by ${track.artists[0].name}
                    <button class="green-button" data-track-id="${track.id}">Play</button>
                </div>
            </div>
        `;
        resultList.appendChild(listItem);

        // Add a click event listener to each play button
        listItem.querySelector('.green-button').addEventListener('click', () => {
            playTrack(track);
        });
    });

    resultsSection.appendChild(resultList);
}


/* CONTOLLER FUNCTIONS */
    function playTrack(track) {
        // Pause
        if (currentTrack) {
            audioPlayer.pause();
        }
        // new song
        currentTrack = track;

        // Update and play the track
        audioPlayer.src = track.preview_url;
        audioPlayer.play();

        // Update the "Now Playing" text
        nowPlaying.textContent = `Now Playing: ${track.name} by ${track.artists[0].name}`;

        // Show the player section
        playerSection.style.display = 'block';
    }

/* USING ASYNC FUNCTION */ 
    async function fetchAccessToken() {
        const clientId = ''; //ADD YOUR SPOTIFY CLIENT ID HERE
        const clientSecret = ''; // ADD YOUR CLIENT SECRET HERE
        const tokenUrl = 'https://accounts.spotify.com/api/token';

        const basicAuth = btoa(`${clientId}:${clientSecret}`);
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        };
        try {
            const response = await fetch(tokenUrl, requestOptions);

            if (!response.ok) {
                throw new Error('Failed to fetch access token');
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error fetching access token:', error);
            throw error;
        }
    }
});
