window.onload = function(){
    const savedBaseUrl = getBaseUrl()
    if (!savedBaseUrl) {
        localStorage.setItem('apiBaseUrl', "http://127.0.0.1:5008/api");
    }
    // Attempt to retrieve the API base URL from the local storage
    LoadUsers();
}

function getBaseUrl(){
    return localStorage.getItem('apiBaseUrl')
}

function LoadUsers() {
    fetch(getBaseUrl() + "/users")
        .then(response => response.json())  // Parse the JSON data from the response
        .then(data => {  // Once the data is ready, we can use it
            // Clear out the user container first
            const userContainer = document.getElementById('user-container');
            userContainer.innerHTML = '';

            // For each user in the response, create a new user element and add it to the page
            data.forEach((user, index) => {
                const userLi = document.createElement('li');
                userLi.className = 'user';
                userLi.id = index;
                const uniqueId = `pwd_field_${index}`;
                userLi.innerHTML = `<button id="login" onclick="redirectToLoginPage('${user}')"><h2>${user}</h2></button>
                <div id="del_user" onclick='deleteUser("${user}")'>Delete</div>`;
                userContainer.appendChild(userLi);
            });
        })
        .catch(error => console.error('Error:', error));  // If an error occurs, log it to the console
}

function redirectToLoginPage(user){
    const baseUrl = getBaseUrl();
    const nextPageUrl = `/users/login?user=${user}`;
    window.location.href = nextPageUrl;
}

function deleteUser(user){
    const nextPageUrl = `/users/del?user=${user}`;
    window.location.href = nextPageUrl;
}
