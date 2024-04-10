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

            setTimeout(
                function () {
                    let a = document.getElementById('dashboard_user_welcome')
                    a.innerHTML = 'Welcome, ' + `<span class="font-medium">${auth.user.fullname}</span>`
                    showPasswordsInDashboard()
                }, 400
            )
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
    let password_encrypted = CryptoJS.SHA256(encodeURIComponent(password)).toString()
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
function openAddPasswordModal(id = null) {
    let passwordModalTitle = document.getElementById('passwordModalTitle')
    let modalSubmitButton = document.getElementById('password-modal-submit-button')
    let form = document.querySelector('#addPasswordForm');
    if (id) {
        let password = auth.passwords.find(p => p.id === id)
        form.elements['id'].value = password.id
        form.elements['website'].value = password.website
        form.elements['website-username'].value = password.username
        form.elements['website-password'].value = password.password
        passwordModalTitle.innerHTML = 'Edit Password'
        modalSubmitButton.innerHTML = 'Update Password'
        measurePasswordStrength(password.password)
    } else {
        passwordModalTitle.innerHTML = 'Add New Password'
        form.reset()
    }

    let modal = document.getElementById('addPasswordModal')
    modal.classList.add('flex')
    modal.classList.remove('hidden')


    let password_input = document.getElementById('website_password')
    // listen for password input changes
    password_input.addEventListener('input', function () {
        measurePasswordStrength(this.value)
    })

}

// close add password modal
function closeAddPasswordModal() {
    let modal = document.getElementById('addPasswordModal')
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    // clear form
    let form = document.querySelector('#addPasswordForm');
    form.reset()

    let website_error = document.getElementById('w_website_error')
    let username_error = document.getElementById('w_username_error')
    let password_error = document.getElementById('w_password_error')


    let password_input = document.getElementById('website_password')
    password_input.removeEventListener('input', function () {
        measurePasswordStrength(this.value)
    })

    website_error.classList.add('hidden')
    username_error.classList.add('hidden')
    password_error.classList.add('hidden')

}

// add password
function addPassword() {

    let form = document.querySelector('#addPasswordForm');
    let formData = new FormData(form);

    // prevent form from submitting
    event.preventDefault();

    // read addPasswordForm values
    let record = {
        id: parseInt(formData.get('id')),
        website: formData.get('website_name'),
        username: formData.get('website-username'),
        password: formData.get('website-password')
    }

    // errors
    let website_error = document.getElementById('w_website_error')
    let username_error = document.getElementById('w_username_error')
    let password_error = document.getElementById('w_password_error')


    website_error.innerHTML = ''
    if (!record.website) {
        website_error.innerHTML = 'Website is empty'
        website_error.classList.remove('hidden')
        return;
    }

    username_error.innerHTML = ''
    if (!record.username) {
        username_error.innerHTML = 'Username is empty'
        username_error.classList.remove('hidden')
        return;
    }

    password_error.innerHTML = ''
    if (!record.password) {
        password_error.innerHTML = 'Password is Empty!'
        password_error.classList.remove('hidden')
        return;
    } else {
        // if (!checkPassword(record.password)) {
        //     password_error.innerHTML = 'password is not strong! (use upper,lower case character and number)'
        //     password_error.classList.remove('hidden')
        //     return;
        // }
    }

    let passwords = []
    // check if user has password in the local storage
    if (localStorage.hasOwnProperty('passwords_' + auth.user.id)) {

        let bytes = CryptoJS.AES.decrypt(localStorage.getItem('passwords_' + auth.user.id), auth.user.pure_password);
        passwords = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }

    if (record.id) {
        let index = passwords.findIndex(p => p.id === record.id)
        passwords[index] = record
    } else {
        record.id = new Date().getTime()
        passwords.push(record);
    }

    auth.passwords = passwords;
    let encrypted_passwords = CryptoJS.AES.encrypt(JSON.stringify(passwords), auth.user.pure_password).toString();
    localStorage.setItem('passwords_' + auth.user.id, encrypted_passwords);

    closeAddPasswordModal()
    window.location.reload()
}

const passwordToDeleteId = {
    id: null
};

function openDeletePasswordModal(id) {
    passwordToDeleteId.id = id
    let modal = document.getElementById('deletePasswordModal')
    modal.classList.add('flex')
    modal.classList.remove('hidden')
}

function closeDeletePasswordModal() {
    let modal = document.getElementById('deletePasswordModal')
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    passwordToDeleteId.id = null
}

function deletePassword() {
    let passwords = auth.passwords;
    let index = passwords.findIndex(p => p.id === passwordToDeleteId.id)
    passwords.splice(index, 1)
    auth.passwords = passwords;
    let encrypted_passwords = CryptoJS.AES.encrypt(JSON.stringify(passwords), auth.user.pure_password).toString();
    localStorage.setItem('passwords_' + auth.user.id, encrypted_passwords);
    window.location.reload()
}

function searchPasswords(query) {
    let passwords = auth.passwords;
    let filteredPasswords = passwords.filter(p => p.website.toLowerCase().includes(query.toLowerCase()))
    UpdatePasswordsList(filteredPasswords)
}

function showPasswordsInDashboard() {
    let passwords = auth.passwords;
    UpdatePasswordsList(passwords)
    updateStatistics()
}

function updateStatistics() {
    let passwords = auth.passwords
    let totalPasswords = passwords.length
    let weakPasswords = passwords.filter(p => getPasswordsStrength(p.password)[1] === 'Weak').length
    let mediumPasswords = passwords.filter(p => getPasswordsStrength(p.password)[1] === 'Medium').length
    let strongPasswords = passwords.filter(p => getPasswordsStrength(p.password)[1] === 'Strong').length
    let veryStrongPasswords = passwords.filter(p => getPasswordsStrength(p.password)[1] === 'Very Strong').length
    let repeatedPasswords = passwords.filter((p, index, self) =>
            index !== self.findIndex((t) => (
                t.password === p.password
            ))
    ).length

    let totalPasswordsElement = document.getElementById('totalPasswords')
    let weakPasswordsElement = document.getElementById('weakPasswords')
    let repeatedPasswordsElement = document.getElementById('repeatedPasswords')
    let strongPasswordsElement = document.getElementById('strongPasswords')

    totalPasswordsElement.innerHTML = totalPasswords.toString()
    weakPasswordsElement.innerHTML = (weakPasswords + mediumPasswords).toString()
    repeatedPasswordsElement.innerHTML = repeatedPasswords.toString()
    strongPasswordsElement.innerHTML = (strongPasswords + veryStrongPasswords).toString()
}

function UpdatePasswordsList(passwords) {
    let passwordList = document.getElementById('passwordListTable')
    let passwordHtml = ''
    if (passwords.length === 0) {
        passwordHtml = `
          <div class="w-full flex items-center justify-between hover:bg-gray-50 duration-200 px-2 py-1 ">
             <div>
                  <div>
                        <span class="font-medium">No Passwords Found</span>
                  </div>
             </div>
            </div>
          `
    } else {
        passwords.forEach(password => {
            console.log(password)
            let strength = getPasswordsStrength(password.password)[0]
            let border_color = 'border-white'
            if (strength < 70) {
                border_color = 'border-red-500'
            }

            passwordHtml += `
        <tr class="hover:bg-gray-50 duration-200">
                            <td class="border-l-2 px-2 ${border_color}">
                                <div>
                                    <span class="font-medium">${password.website}</span>
                                </div>
                                <div>
                                    <span class="text-sm text-gray-700">${password.username}</span>
                                </div>
                            </td>
                            <td class="text-center min-w-28">
                                <span id="pw_placeholder_${password.id}">********</span>
                            </td>
                            <td class="text-gray-500 text-right">
                                <div class="text-gray-500">
                                    <button onclick="togglePassword(${password.id},true)" id="eye_closed_${password.id}" class="hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             class="icon icon-tabler icon-tabler-eye-closed w-6 h-6"
                                             viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" fill="none"
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
                                             viewBox="0 0 24 24" stroke-width="1.75"
                                             stroke="currentColor" fill="none" stroke-linecap="round"
                                             stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/>
                                            <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/>
                                        </svg>
                                    </button>
                                    <button onclick="copyPassword(${password.id})" class="hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             class="icon icon-tabler icon-tabler-copy w-6 h-6"
                                             viewBox="0 0 24 24" stroke-width="1.75"
                                             stroke="currentColor" fill="none" stroke-linecap="round"
                                             stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/>
                                            <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>
                                        </svg>
                                    </button>
                                    <button onclick="openAddPasswordModal(${password.id})" class="hover:text-gray-600">
                                        <svg  xmlns="http://www.w3.org/2000/svg" 
                                              class="icon icon-tabler icon-tabler-edit h-6 w-6"
                                              viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1.75"  
                                              stroke-linecap="round"  stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                                              <path d="M16 5l3 3" />
                                        </svg>
                                    </button>
                                    <button onclick="openDeletePasswordModal(${password.id})" class="text-red-500 hover:text-red-600">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             class="icon icon-tabler icon-tabler-trash h-6 w-6"
                                             viewBox="0 0 24 24" stroke-width="1.75"
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

                            </td>
                        </tr>
        `
        })
    }

    passwordList.innerHTML = passwordHtml
}


function listenForSearch() {
    let searchInput = document.getElementById('searchInput')
    searchInput.addEventListener('input', function () {
        searchPasswords(this.value)
    })
}

function copyPassword(id) {
    let password = auth.passwords.find(p => p.id === id).password
    navigator.clipboard.writeText(password).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    });
}


function generatePassword(inputId) {
    let passwordInput = document.getElementById(inputId)

    // generate random password
    let password = ''
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let charactersLength = characters.length;
    for (let i = 0; i < 12; i++) {
        password += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    passwordInput.value = password
    passwordInput.type = 'text'
    measurePasswordStrength(password)
    passwordInput.focus()
}

function getPasswordsStrength(password) {
    let width = 10
    let strength = 'Weak'

    let lowerCase = /[a-z]+/
    let upperCase = /[A-Z]+/
    let numbers = /[0-9]+/
    let specialChars = /[^a-zA-Z0-9]+/

    if ((password.match(lowerCase) || password.match(upperCase)) && password.length > 6) {
        width += 20
        strength = 'Weak'
    }

    // if password has either lower or upper case and numbers
    if ((password.match(lowerCase) || password.match(upperCase)) && (password.match(numbers) || password.match(specialChars)) && password.length > 6) {
        width += 20
        strength = 'Medium'
    }

    // if password has lower, upper case, numbers and special characters
    if ((password.match(lowerCase) || password.match(upperCase)) && (password.match(numbers) || password.match(specialChars)) && password.length > 8) {
        width += 30
        strength = 'Strong'
    }

    // if password contains all above and special characters
    if (password.match(lowerCase) && password.match(upperCase) && password.match(numbers) && password.match(specialChars) && password.length > 8) {
        width += 20
        strength = 'Very Strong'
    }

    return [width, strength]

}

function measurePasswordStrength(password) {
    let [width, strength] = getPasswordsStrength(password)


    let passwordStrength = document.getElementById('password-strength')
    let passwordStrengthText = document.getElementById('password-strength-text')
    let passwordStrengthBar = document.getElementById('password-strength-bar')

    passwordStrength.style.width = width + '%'
    passwordStrengthText.innerHTML = strength


    if (width < 50) {
        passwordStrengthBar.classList.remove('bg-green-500')
        passwordStrengthBar.classList.remove('bg-yellow-500')
        passwordStrengthBar.classList.add('bg-red-500')
    } else if (width < 70) {
        passwordStrengthBar.classList.remove('bg-red-500')
        passwordStrengthBar.classList.remove('bg-green-500')
        passwordStrengthBar.classList.add('bg-yellow-500')
    } else {
        passwordStrengthBar.classList.remove('bg-red-500')
        passwordStrengthBar.classList.remove('bg-yellow-500')
        passwordStrengthBar.classList.add('bg-green-500')

    }
}


document.addEventListener("DOMContentLoaded", function () {
    // dashboard
    const page = window.location.hash.substring(1);
    if (page === 'dashboard') {
        setTimeout(
            function () {
                let a = document.getElementById('dashboard_user_welcome')
                a.innerHTML = 'Welcome, ' + auth.user.fullname
                showPasswordsInDashboard()
                listenForSearch()
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