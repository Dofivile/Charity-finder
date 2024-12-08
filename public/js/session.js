// public/js/session-handler.js

// Function to save user info to session storage
function saveUserInfo(userName, userEmail) {
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('userEmail', userEmail);
}

// Function to get user info from session storage
function getUserInfo() {
    return {
        userName: sessionStorage.getItem('userName'),
        userEmail: sessionStorage.getItem('userEmail')
    };
}

// Function to clear user info from session storage
function clearUserInfo() {
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userEmail');
}

// Check if we're on the search page and there's a form submission
document.addEventListener('DOMContentLoaded', function() {
    const userInfoForm = document.querySelector('.user-info-form form');
    if (userInfoForm) {
        userInfoForm.addEventListener('submit', function(e) {
            const userName = document.getElementById('userName').value;
            const userEmail = document.getElementById('userEmail').value;
            saveUserInfo(userName, userEmail);
        });
    }

    // If we're on the saved charities page, check for stored user info
    if (window.location.pathname.includes('/search/goals')) {
        const userInfo = getUserInfo();
        if (userInfo.userName && userInfo.userEmail) {
            // Redirect to the goals page with user info
            if (!window.location.search.includes('userEmail')) {
                window.location.href = `/search/goals?userEmail=${encodeURIComponent(userInfo.userEmail)}&userName=${encodeURIComponent(userInfo.userName)}`;
            }
        }
    }

    // Populate hidden inputs with session data if they exist
    const hiddenUserNameInputs = document.querySelectorAll('input[name="userName"][type="hidden"]');
    const hiddenUserEmailInputs = document.querySelectorAll('input[name="userEmail"][type="hidden"]');
    const userInfo = getUserInfo();
    
    if (userInfo.userName && userInfo.userEmail) {
        hiddenUserNameInputs.forEach(input => {
            input.value = userInfo.userName;
        });
        hiddenUserEmailInputs.forEach(input => {
            input.value = userInfo.userEmail;
        });
    }
});