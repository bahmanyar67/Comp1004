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

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let user = users.find(user => user.email === email && user.password === password);
    if (user) {
        console.log('Login Successful')
    } else {
        console.log('Invalid email or password!')
    }
}

// TODO: complete validate function.
//function validatePassword(password,password_confirmation){}

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

    if (password !== password_confirmation) {
        console.log("Password and Password Confirmation is not same!")
        return;
    }
    if (password.length < 6) {
        console.log("Password length should be at least 6 character")
        return;
    }

    const validateEmail = (email) => {
        return email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };


    if (!validateEmail(email)) {
        console.log("Please enter a valid email address")
        return;
    }

    let newUser = {
        id: new Date().getTime(), // use timestamp for user id
        fullname: fullName,
        email: email,
        password: password
    };


    if (isUserExists(email)) {
        console.log('You have already registered!');
        return;
    }


//JSON= convert user object to JSON, which is a data type  similar to string
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('User added successfully');


}





