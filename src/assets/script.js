// Navigation system
document.addEventListener("DOMContentLoaded", function () {
    const containerDiv = document.getElementById('container');

    function showPage(content) {
        containerDiv.innerHTML = content;
    }

    // add selected menu class (background and text color)
    function applyClass(pageName) {
        const links = document.querySelectorAll('.spa-link');
        links.forEach(link => {
            if (link.attributes.href.value === "#" + pageName) {
                if (pageName === 'login') {
                    link.classList.add('text-white');
                } else {
                    link.classList.remove('text-gray-300');
                    link.classList.add('text-white');
                    link.classList.add('bg-gray-900');
                }

            } else {
                link.classList.remove('text-white');
                link.classList.remove('bg-gray-900');
                link.classList.add('text-gray-300');
            }
        })

        document.title = pageName;
    }

    function navigateToPage() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            fetchPage(hash);
        } else {
            // Default to home page if no hash
            fetchPage('home');
        }
    }

    // get requested page content
    async function fetchPage(pageName) {

        if (pageName === 'dashboard') {
            if (!isUserLoggedIn()) {
                window.location.hash = '#login';
                return
            }
        }

        try {
            const response = await fetch('pages/' + pageName + '.html');
            if (!response.ok) {
                throw new Error('Page not found');
            }
            const content = await response.text();
            showPage(content);
            applyClass(pageName)
        } catch (error) {
            console.error(error);
            showPage('<h1>Error: Page not found</h1>');
        }
    }

    // Event listeners for navigation
    window.addEventListener('hashchange', navigateToPage);

    navigateToPage();
});

const auth = {
    user: null,
    passwords: []
}

// check if user already logged in to the app
function isUserLoggedIn() {
    // if user exists in the auth
    if (auth.user !== null && auth.user !== undefined) {

        return true
    }

    let user = JSON.parse(sessionStorage.getItem('auth_user')) || null;
    if (user) {
        auth.user = user
        loadPasswords()
        return true
    }

    return false
}

function loadPasswords() {
    let passwords = []
    // check if user has password in the local storage
    if (localStorage.hasOwnProperty('passwords_' + auth.user.id)) {

        let bytes = CryptoJS.AES.decrypt(localStorage.getItem('passwords_' + auth.user.id), auth.user.pure_password);
        passwords = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    auth.passwords = passwords;
}

// check if user exists
function isUserExists(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let user = users.find(user => user.email === email);
    if (user) {
        return true;
    } else {
        return false;
    }
}

// login
function login() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let password_encrypted = CryptoJS.SHA256(password).toString()
    if (!email || !password) {
        password_error.innerHTML = 'Email and password are required.'

        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    // decode stored password and compare with submitted password.
    let user = users.find(user => user.email === email && user.password === password_encrypted);

    if (user) {
        setLoggedIn(user, password)
        window.location.hash = '#dashboard';
        window.location.reload()
    } else {
        password_error.innerHTML = 'Invalid email or password!'

    }
}

// set user as logged in
function setLoggedIn(user, pure_password) {
    user.pure_password = pure_password
    auth.user = user
    loadPasswords()
    sessionStorage.setItem('auth_user', JSON.stringify(user));
}

// check if password is valid
function validatePassword(password, password_confirmation) {
    if (password.length < 6) {
        console.log('Password length should be at least 6 characters');
        return false;
    }

    if (password !== password_confirmation) {
        passwordConfirmation_error.innerHTML = 'Password and Password Confirmation do not match!'
        return false;
    }
    return true;
}

// register
function storeNewUser() {
    let fullName = document.getElementById('fullname').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let password_confirmation = document.getElementById('password_confirmation').value;

    // errors
    let password_error = document.getElementById('password_error')
    let fullName_error = document.getElementById('fullName_error')
    let email_error = document.getElementById('email_error')
    let passwordConfirmation_error = document.getElementById('passwordConfirmation_error')
    let userExists_error = document.getElementById('userExists_error')


    fullName_error.innerHTML = ''
    if (!fullName) {
        fullName_error.innerHTML = 'Name is empty'
    }

    email_error.innerHTML = ''
    if (!email) {
        email_error.innerHTML = 'Email address is empty!'
    }

    password_error.innerHTML = ''
    if (!password) {
        password_error.innerHTML = 'Password is Empty!'
    } else {
        if (!checkPassword(password)) {
            password_error.innerHTML = 'password is not strong! (use upper,lower case character and number)'
            return;
        }
    }


    passwordConfirmation_error.innerHTML = ''
    if (!password_confirmation) {
        passwordConfirmation_error.innerHTML = 'Password Confirmation is empty'
    }

    if (!validatePassword(password, password_confirmation)) {
        return;
    }

    userExists_error.innerHTML = ''
    if (isUserExists(email)) {
        userExists_error.innerHTML = 'You have already registered!'
        return;
    }

    // encode user password before saving it
    let encrypted_password = CryptoJS.SHA256(encodeURIComponent(password));
    let newUser = {
        id: new Date().getTime(),
        fullname: fullName,
        email: email,
        password: encrypted_password.toString()
    };

//Convert user object to JSON  (JSON is a data type  similar to string)
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    userExists_error.classList.remove('text-red-500')
    userExists_error.classList.add('text-green-500')
    userExists_error.classList.add('text-lg')
    userExists_error.innerHTML = 'You have successfully registered! you will be redirected to the login page!'

    setTimeout(function () {
        window.location.hash = '#login'
    }, 6000)

}

function checkPassword(str) {
    //Comp1003 regular expression cheat sheet v2
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
}

function logout() {
    sessionStorage.removeItem('auth_user')
    window.location.reload()
}

function togglePassword(id, status) {
    let eye_closed = document.getElementById('eye_closed_' + id)
    let eye_open = document.getElementById('eye_open_' + id)
    let passwordHolder = document.getElementById('pw_placeholder_' + id)

    if (status) {
        eye_closed.classList.add('hidden')
        eye_open.classList.remove('hidden')

        passwordHolder.innerHTML = auth.passwords.find(p => p.id === id).password
    } else {
        eye_open.classList.add('hidden')
        eye_closed.classList.remove('hidden')

        passwordHolder.innerHTML = '*********'
    }

}

// open add password modal
function openAddPasswordModal() {
    let modal = document.getElementById('addPasswordModal')
    modal.classList.add('flex')
    modal.classList.remove('hidden')
}

// close add password modal
function closeAddPasswordModal() {
    let modal = document.getElementById('addPasswordModal')
    modal.classList.add('hidden')
    modal.classList.remove('flex')
}

// add password
function addPassword() {

    let form = document.querySelector('#addPasswordForm');
    let formData = new FormData(form);

    // prevent form from submitting
    event.preventDefault();

    // read addPasswordForm values
    let record = {
        id: new Date().getTime(),
        website: formData.get('website'),
        username: formData.get('website-username'),
        password: formData.get('website-password')
    }

    // errors
    let password_error = document.getElementById('w_password_error')

    password_error.innerHTML = ''
    if (!record.password) {
        password_error.innerHTML = 'Password is Empty!'
    } else {
        if (!checkPassword(record.password)) {
            password_error.innerHTML = 'password is not strong! (use upper,lower case character and number)'
        }
    }

    let passwords = []
    // check if user has password in the local storage
    if (localStorage.hasOwnProperty('passwords_' + auth.user.id)) {

        let bytes = CryptoJS.AES.decrypt(localStorage.getItem('passwords_' + auth.user.id), auth.user.pure_password);
        passwords = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }

    passwords.push(record);
    auth.passwords = passwords;
    let encrypted_passwords = CryptoJS.AES.encrypt(JSON.stringify(passwords), auth.user.pure_password).toString();
    localStorage.setItem('passwords_' + auth.user.id, encrypted_passwords);


    console.log(auth)

    closeAddPasswordModal()
    window.location.reload()
}

function showPasswordsInDashboard() {
    let passwords = auth.passwords;
    console.log(passwords)
    let passwordList = document.getElementById('passwordList')
    let passwordHtml = ''
    passwords.forEach(password => {
        passwordHtml += `
        <div class="w-full flex items-center justify-between hover:bg-gray-50 duration-200 px-2 py-1 ">
                            <div>
                                <div>
                                    <span class="font-medium">${password.website}</span>
                                </div>
                                <div>
                                    <span class="text-sm text-gray-700">${password.username}</span>
                                </div>
                            </div>
                            <div>
                                <span id="pw_placeholder_${password.id}">********</span>
                            </div>
                            <div class="text-gray-500">

                                <div class="text-gray-500">
                                    <button onclick="togglePassword(${password.id},true)" id="eye_closed_${password.id}" class="hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             class="icon icon-tabler icon-tabler-eye-closed w-6 h-6"
                                             viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none"
                                             stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4"/>
                                            <path d="M3 15l2.5 -3.8"/>
                                            <path d="M21 14.976l-2.492 -3.776"/>
                                            <path d="M9 17l.5 -4"/>
                                            <path d="M15 17l-.5 -4"/>
                                        </svg>
                                    </button>

                                    <button onclick="togglePassword(${password.id},false)" id="eye_open_${password.id}" class="hidden hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-eye w-6 h-6"
                                             viewBox="0 0 24 24" stroke-width="1.5"
                                             stroke="currentColor" fill="none" stroke-linecap="round"
                                             stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/>
                                            <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/>
                                        </svg>
                                    </button>

                                    <button class="hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             class="icon icon-tabler icon-tabler-copy w-6 h-6"
                                             viewBox="0 0 24 24" stroke-width="1.5"
                                             stroke="currentColor" fill="none" stroke-linecap="round"
                                             stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/>
                                            <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>
                                        </svg>
                                    </button>
                                    <button class="hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             class="icon icon-tabler icon-tabler-pencil w-6 h-6"
                                             viewBox="0 0 24 24" stroke-width="1.5"
                                             stroke="currentColor" fill="none" stroke-linecap="round"
                                             stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/>
                                            <path d="M13.5 6.5l4 4"/>
                                        </svg>
                                    </button>
                                    <button class="text-red-500 hover:text-red-600">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             class="icon icon-tabler icon-tabler-trash h-6 w-6"
                                             viewBox="0 0 24 24" stroke-width="1.5"
                                             stroke="currentColor" fill="none" stroke-linecap="round"
                                             stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 7l16 0"/>
                                            <path d="M10 11l0 6"/>
                                            <path d="M14 11l0 6"/>
                                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
                                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
                                        </svg>
                                    </button>

                                </div>

                            </div>
                        </div>
        `
    })
    passwordList.innerHTML = passwordHtml
}


document.addEventListener("DOMContentLoaded", function () {
    // dashboard
    const page = window.location.hash.substring(1);
    if (page === 'dashboard') {
        setTimeout(
            function () {
                let a = document.getElementById('dashboard_user_welcome')
                a.innerHTML = 'Hi, ' + auth.user.fullname
                showPasswordsInDashboard()
            }, 300
        )
    }

    // replace login with logout
    let login_button = document.getElementById('login_button')
    let logout_button = document.getElementById('logout_button')


    if (isUserLoggedIn()) {
        // User is logged in, show logout button and hide login button
        if (login_button) {
            login_button.classList.add('hidden');
        }
        if (logout_button) {
            logout_button.classList.remove('hidden');
        }
    } else {
        // User is not logged in, show login button and hide logout button
        if (login_button) {
            login_button.classList.remove('hidden');
        }
        if (logout_button) {
            logout_button.classList.add('hidden');
        }
    }

});