// Navigation system
document.addEventListener("DOMContentLoaded", function() {
    const containerDiv = document.getElementById('container');

    function showPage(content) {
        containerDiv.innerHTML = content;
    }

    // add selected menu class (background and text color)
    function applyClass(pageName) {
        const links = document.querySelectorAll('.spa-link');
        links.forEach(link => {
            if (link.attributes.href.value === "#"+pageName){
                if (pageName === 'login'){
                    link.classList.add('text-white');
                }else{
                    link.classList.remove('text-gray-300');
                    link.classList.add('text-white');
                    link.classList.add('bg-gray-900');
                }

            }else{
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

        if (pageName === 'dashboard'){
            if (!isUserLoggedIn()){
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
    user:null
}

// check if user already logged in to the app
function isUserLoggedIn() {
    // if user exists in the auth
    if (auth.user !== null && auth.user !== undefined){

        return true
    }

    let user = JSON.parse(sessionStorage.getItem('auth_user')) || null;
    if (user){
        auth.user = user
        return true
    }

    return false
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
        password_error.innerHTML='Email and password are required.'

        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    // decode stored password and compare with submitted password.
    let user = users.find(user => user.email === email && user.password === password_encrypted);

    if (user) {
        setLoggedIn(user,password)
        window.location.hash = '#dashboard';
        window.location.reload()
    } else {
        password_error.innerHTML='Invalid email or password!'

    }
}

// set user as logged in
function setLoggedIn(user,pure_password) {
    user.pure_password = pure_password
    auth.user = user
    sessionStorage.setItem('auth_user', JSON.stringify(user));
}

// check if password is valid
function validatePassword(password, password_confirmation) {
    if (password.length < 6) {
        console.log('Password length should be at least 6 characters');
        return false;
    }

    if (password !== password_confirmation) {
        passwordConfirmation_error.innerHTML='Password and Password Confirmation do not match!'
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


    fullName_error.innerHTML=''
    if (!fullName) {
        fullName_error.innerHTML='Name is empty'
    }

    email_error.innerHTML=''
    if (!email) {
        email_error.innerHTML='Email address is empty!'
    }

    password_error.innerHTML=''
    if (!password) {
        password_error.innerHTML = 'Password is Empty!'
    }else{
        if (!checkPassword(password)){
            password_error.innerHTML ='password is not strong! (use upper,lower case character and number)'
        }
    }


    passwordConfirmation_error.innerHTML=''
    if (!password_confirmation) {
        passwordConfirmation_error.innerHTML='Password Confirmation is empty'
    }

    if (!validatePassword(password, password_confirmation)) {
        return;
    }

    userExists_error.innerHTML=''
    if (isUserExists(email)) {
        userExists_error.innerHTML='You have already registered!'
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
    userExists_error.innerHTML='You have successfully registered! you will be redirected to the login page!'

    setTimeout(function () {
        window.location.hash = '#login'
    },6000)

}

function checkPassword(str)
{
    //Comp1003 regular expression cheat sheet v2
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
}

function logout(){
    sessionStorage.removeItem('auth_user')
    window.location.reload()
}
 function togglePassword(status){
     let eye_closed=document.getElementById('eye_closed')
     let eye_open=document.getElementById('eye_open')
     let passwordHolder=document.getElementById('passwordHolder')

     if(status) {
         eye_closed.classList.add('hidden')
         eye_open.classList.remove('hidden')

         passwordHolder.innerHTML='++++++++++'
     }else {
         eye_open.classList.add('hidden')
         eye_closed.classList.remove('hidden')

         passwordHolder.innerHTML='*********'
     }

 }


document.addEventListener("DOMContentLoaded", function() {
    // dashboard
    const page = window.location.hash.substring(1);
    if (page === 'dashboard'){
        setTimeout(
            function () {
                let a = document.getElementById('dashboard_user_welcome')
                a.innerHTML = 'Hi, ' + auth.user.fullname
            },300
        )
    }

    // replace login with logout
    let login_button = document.getElementById('login_button')
    let logout_button =document.getElementById('logout_button')



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