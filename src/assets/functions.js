// register
function storeNewUser() {

    let fullName = document.getElementById('fullname').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let password_confirmation = document.getElementById('password_confirmation').value;


    if (!fullName){
        console.log("Name is empty")
        return;
    }

    if (!email){
        console.log("Email address is empty")
        return;
    }

    if (!password){
        console.log("Password is empty")
        return;
    }
    if (!password_confirmation){
        console.log("Password Confirmation is empty")
        return;
    }

    if(password!==password_confirmation){
        console.log("Password and Password Confirmation is not same!")
        return;
    }

    let newUser = {
        fullname: fullName,
        email: email,
        password: password
    };


    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('User added successfully');


}

