function saveUserInfo(userName, userEmail) {
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('userEmail', userEmail);
}

function getUserInfo() {
    return {
        userName: sessionStorage.getItem('userName'),
        userEmail: sessionStorage.getItem('userEmail')
    };
}

function clearUserInfo() {
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userEmail');
}

document.addEventListener('DOMContentLoaded', function() {
    const userInfoForm = document.querySelector('.user-info-form form');
    if (userInfoForm) {
        userInfoForm.addEventListener('submit', function(e) {
            const userName = document.getElementById('userName').value;
            const userEmail = document.getElementById('userEmail').value;
            saveUserInfo(userName, userEmail);
        });
    }

    if (window.location.pathname.includes('/search/goals')) {
        const userInfo = getUserInfo();
        if (userInfo.userName && userInfo.userEmail) {
            if (!window.location.search.includes('userEmail')) {
                window.location.href = `/search/goals?userEmail=${encodeURIComponent(userInfo.userEmail)}&userName=${encodeURIComponent(userInfo.userName)}`;
            }
        }
    }

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