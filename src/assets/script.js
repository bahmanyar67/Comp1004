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

    if (!email || !password) {
        console.log('Email and password are required.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    // decode stored password and compare with submitted password.
    let user = users.find(user => user.email === email && decodeURIComponent(window.atob(user.password)) === password);

    if (user) {
        window.location.hash = '#dashboard';
        console.log('Login Successful');
    } else {
        console.log('Invalid email or password!');
    }
}

// check if password is valid
function validatePassword(password, password_confirmation) {
    if (password.length < 6) {
        console.log('Password length should be at least 6 characters');
        return false;
    }

    if (password !== password_confirmation) {
        console.log('Password and Password Confirmation do not match!');
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


    if (!fullName) {
        console.log("Name is empty")
        return;
    }

    if (!email) {
        console.log("Email address is empty")
        return;
    }

    if (!password) {
        console.log("Password is empty")
        return;
    }
    if (!password_confirmation) {
        console.log("Password Confirmation is empty")
        return;
    }

    if (!validatePassword(password, password_confirmation)) {
        return;
    }


    if (isUserExists(email)) {
        console.log('You have already registered!');
        return;
    }

    // encode user password before saving it. (with this password can easily be found instead use Sha256)
    let encrypted_password = CryptoJS.SHA256(encodeURIComponent(password));
    let newUser = {
        id: new Date().getTime(),
        fullname: fullName,
        email: email,
        password: encrypted_password.toString()
    };

//Convert user object to JSON(which is a data type  similar to string)
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('User added successfully');
}
