window.onload = function(){
    const savedBaseUrl = getBaseUrl()
    if (!savedBaseUrl) {
        localStorage.setItem('apiBaseUrl', "http://127.0.0.1:5008/api");
    }
    fill_username();
    }

function getBaseUrl(){
    return localStorage.getItem('apiBaseUrl');
}

function fill_username() {
        // Get the full URL of the current page
    const url = window.location.href;

    const lastSlashIndex = url.lastIndexOf('/');
    // Find the index of the question mark '?'
    const questionMarkIndex = url.indexOf('?');
    // Extract the substring between the last slash and the question mark
    const operationPart = url.substring(lastSlashIndex + 1, questionMarkIndex);

    // Create a URLSearchParams object to parse the query parameters
    const params = new URLSearchParams(url.split('?')[1]);
    // Get the value of the 'user' parameter
    const user = params.get('user');
    let user_name = document.getElementById('username');
    const loginBtn = document.getElementById('login-btn');
    if (user == 'new') {
        loginBtn.setAttribute("onclick", "createAndLogin()");
    } else if (operationPart == 'del') {
        user_name.value = user;
        loginBtn.setAttribute("onclick", "deleteUser()");
    }else {
        user_name.value = user;
        loginBtn.setAttribute("onclick", "loginUser()");
    }
}

function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simulate API request with password check
    setTimeout(() => {
        checkPassword(username, password);
    }, 1000);
}

const errorMessage = document.getElementById('error-message');

function createAndLogin(){
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${getBaseUrl()}/users/newlogin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
        })
        .then(data => {
        // Assuming the API returns a JSON object with a 'success' property
        if (data.success) {
            errorMessage.textContent = 'New login created successfully!';
            errorMessage.style.color = 'green';
            redirectToAccountPage(username);
        } else {
            errorMessage.textContent = `${data.error}`;
            errorMessage.style.color = 'red';
        }
    })
    .catch(error => console.error('Error:', error));
}

function checkPassword(username, password) {
    fetch(`${getBaseUrl()}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Assuming the API returns a JSON object with a 'success' property
        if (data.success) {
            errorMessage.textContent = 'Login successful!';
            errorMessage.style.color = 'green';
            redirectToAccountPage(username);
        } else {
            errorMessage.textContent = 'Invalid password';
            errorMessage.style.color = 'red';
        }
    })
    .catch(error => {
        errorMessage.textContent = 'Error: ' + error.message;
        errorMessage.style.color = 'red';
    });
}

function deleteUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${getBaseUrl()}/users/del`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Assuming the API returns a JSON object with a 'success' property
        if (data.success) {
            errorMessage.textContent = 'User deleted!';
            errorMessage.style.color = 'green';
            backToUsers();
        } else {
            errorMessage.textContent = 'Invalid password';
            errorMessage.style.color = 'red';
        }
    })
    .catch(error => {
        errorMessage.textContent = 'Error: ' + error.message;
        errorMessage.style.color = 'red';
    });
}

function redirectToAccountPage(user){
    window.location.href = `/users/${user}`;
}

function backToUsers() {
    window.location.href = `/users`;
}