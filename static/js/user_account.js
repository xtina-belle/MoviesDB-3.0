window.onload = function(){
    const savedBaseUrl = getBaseUrl()
    if (!savedBaseUrl) {
        localStorage.setItem('apiBaseUrl', "http://127.0.0.1:5008/api");
    }
    // Attempt to retrieve the API base URL from the local storage
    LoadMovies();
}

function getBaseUrl(){
    return localStorage.getItem('apiBaseUrl')
}

function LoadMovies(){
    const username = window.location.pathname.split('/').pop();
    fetch(`${getBaseUrl()}/users/${username}`)
        .then(response => response.json())  // Parse the JSON data from the response
        .then(data => {
            const youtube_trailer_url = "https://www.youtube.com/embed/"
            const movieContainer = document.getElementsByClassName('movie-grid')[0];
            movieContainer.innerHTML = '';
            data.forEach(movie => {
                const movieArticle = document.createElement('article');
                movieArticle.className = 'movie slider image-container';
                movieArticle.innerHTML = `<img class="movie-poster blur-image" src="${movie['poster']}">
                <div class="image-overlay" ><div id="del_movie" onclick='deleteMovie("${movie.name}")'>Delete</div>
                <a href="${youtube_trailer_url}${movie['trailer_id']}" target="trailer">
                <p class="movie-title" onclick="sendTextToComment('${movie.name}', '${movie.note}')">${movie.name}
                <br>Director: ${movie.director}<br>${movie.year}<br>Rating: ${movie.rating}</p></a></div>`;
                movieContainer.appendChild(movieArticle);
            });
        })
}

function addMovie() {
    const username = window.location.pathname.split('/').pop();
    const name = document.getElementById('newMovie').value
    fetch(`${getBaseUrl()}/users/${username}/add_movie`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(name)
    })
    .then(response => {
        console.log('movie added:', name);
        LoadMovies(); // Reload the movies after adding one
    })
    .catch(error => console.error('Error:', error));

}

function deleteMovie(name) {
    const username = window.location.pathname.split('/').pop();
    fetch(`${getBaseUrl()}/users/${username}/delete_movie`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(name)
    })
    .then(response => {
        console.log('movie deleted:', name);
        LoadMovies(); // Reload the movies after deleting one
    })
    .catch(error => console.error('Error:', error));
}

function sendTextToComment(name, text) {
    // Find the target div
    let targetElements = document.querySelectorAll('.comment');
    let targetP = targetElements[0]; // First element is <p>
    let targetTextarea = targetElements[1]; // Second element is <textarea>
    let updateCommBut = document.querySelector('.update_comm')

    // Check if text is not empty or None
    if (text !== "null") {
        // Update the text content of the target div
        targetTextarea.setAttribute("hidden", "hidden");
        targetP.removeAttribute("hidden");
        targetP.textContent = text;
        updateCommBut.textContent = "Update";
        updateCommBut.removeAttribute("hidden");
        updateCommBut.setAttribute("onclick", `updateComm('${name}','${text}')`);
    } else {
        targetTextarea.setAttribute("hidden", "hidden");
        targetP.setAttribute("hidden", "hidden");
        updateCommBut.removeAttribute("hidden");
        updateCommBut.textContent = "Comment";
        updateCommBut.setAttribute("onclick", `updateComm('${name}','')`);
    }
}

function updateComm(name, text) {
    let updateCommBut = document.querySelector('.update_comm')

    let targetElements = document.querySelectorAll('.comment');
    let targetP = targetElements[0]; // First element is <p>
    let targetTextarea = targetElements[1]; // Second element is <textarea>

    targetP.setAttribute("hidden", "hidden");
    targetTextarea.removeAttribute("hidden");
    targetTextarea.value = text;
    updateCommBut.textContent = 'Save';
    updateCommBut.setAttribute("onclick", `saveComm('${name}')`);
}

function saveComm(name) {
    let targetElements = document.querySelectorAll('.comment');
    let targetTextarea = targetElements[1];
    const text = targetTextarea.value;
    const username = window.location.pathname.split('/').pop();
    fetch(`${getBaseUrl()}/users/${username}/update_movie`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, text})
    })
    .then(response => {
        console.log('movie updated:', name);
        LoadMovies(); // Reload the movies after adding one
        sendTextToComment(name, text);
    })
    .catch(error => console.error('Error:', error));
}
