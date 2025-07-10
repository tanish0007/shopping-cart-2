const loginTab = document.querySelector("#loginTab");
const signUpTab = document.querySelector("#signUpTab");
const tab = document.querySelector(".tab");

let users = JSON.parse(localStorage.getItem("users")) || [];
let items = JSON.parse(localStorage.getItem("items")) || [];

if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
    users = [];
}

if (!localStorage.getItem("items")) {
    localStorage.setItem("items", JSON.stringify([]));
    items = [];
}

function clearForm() {
    tab.innerHTML = '';
}

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

function showLoginForm() {
    clearForm();

    const mailLabel = document.createElement("label");
    mailLabel.setAttribute("for", "email");
    mailLabel.innerText = "Email*";
    tab.appendChild(mailLabel);
    
    const userEmail = document.createElement("input");
    userEmail.id = "email";
    userEmail.type = "email";
    userEmail.placeholder = "user123@gmail.com";
    userEmail.required = true;
    mailLabel.appendChild(userEmail);

    const passLabel = document.createElement("label");
    passLabel.setAttribute("for", "password");
    passLabel.innerText = "Password*";
    tab.appendChild(passLabel);
    
    const userPassword = document.createElement("input");
    userPassword.id = "password";
    userPassword.type = "password";
    userPassword.placeholder = "********";
    userPassword.required = true;
    passLabel.appendChild(userPassword);

    const errorText = document.createElement("span");
    errorText.id = "errorText";
    tab.appendChild(errorText);

    const loginBtn = document.createElement("button");
    loginBtn.className = "button button-primary";
    loginBtn.innerText = "Login";
    loginBtn.type = "button";
    tab.appendChild(loginBtn);

    loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        errorText.innerText = "";
        errorText.style.color = "red";

        if(!userEmail.value || !userPassword.value) {
            errorText.innerText = "Please enter all fields";
            return;
        }

        if (!validateEmail(userEmail.value)) {
            errorText.innerText = "Please enter a valid email address";
            return;
        }

        const existingUser = users.find(user => 
            user.email === userEmail.value && user.password === userPassword.value
        );

        if(existingUser) {
            localStorage.setItem("loggedInUser", JSON.stringify(existingUser));
            
            if(existingUser.isAdmin) {
                window.location.href = "admin.html";
            } else {
                window.location.href = "user.html";
            }
        } else {
            errorText.innerText = "Email or Password is incorrect";
        }
    });
}

function showSignUpForm() {
    clearForm();

    const nameLabel = document.createElement("label");
    nameLabel.setAttribute("for", "username");
    nameLabel.innerText = "Name*";
    tab.appendChild(nameLabel);
    
    const userName = document.createElement("input");
    userName.id = "username";
    userName.type = "text";
    userName.placeholder = "Dominic Toretto";
    userName.required = true;
    nameLabel.appendChild(userName);

    const mailLabel = document.createElement("label");
    mailLabel.setAttribute("for", "email");
    mailLabel.innerText = "Email*";
    tab.appendChild(mailLabel);
    
    const userEmail = document.createElement("input");
    userEmail.id = "email";
    userEmail.type = "email";
    userEmail.placeholder = "user123@gmail.com";
    userEmail.required = true;
    mailLabel.appendChild(userEmail);

    const passLabel = document.createElement("label");
    passLabel.setAttribute("for", "password");
    passLabel.innerText = "Password*";
    tab.appendChild(passLabel);
    
    const userPassword = document.createElement("input");
    userPassword.id = "password";
    userPassword.type = "password";
    userPassword.placeholder = "********";
    userPassword.required = true;
    passLabel.appendChild(userPassword);

    const adminLabel = document.createElement("label");
    adminLabel.setAttribute('for', 'chkAdmin');
    adminLabel.innerText = "Register as Admin? ";
    tab.appendChild(adminLabel);
    
    const isAdmin = document.createElement("input");
    isAdmin.type = "checkbox";
    isAdmin.id = "chkAdmin";
    adminLabel.appendChild(isAdmin);

    const errorText = document.createElement("span");
    errorText.id = "errorText";
    tab.appendChild(errorText);

    const signUpBtn = document.createElement("button");
    signUpBtn.className = "button button-primary";
    signUpBtn.innerText = "Register";
    signUpBtn.type = "button";
    tab.appendChild(signUpBtn);

    signUpBtn.addEventListener("click", (event) => {
        event.preventDefault();
        errorText.innerText = "";
        errorText.style.color = "red";

        if(!userName.value || !userEmail.value || !userPassword.value) {
            errorText.innerText = "Please enter all fields";
            return;
        }

        if (!validateEmail(userEmail.value)) {
            errorText.innerText = "Please enter a valid email address";
            return;
        }

        const userExists = users.some(user =>
            user.email.toLowerCase() === userEmail.value.toLowerCase()
        );

        if (userExists) {
            errorText.innerText = "User already exists with this email.";
            return;
        }

        let newUser = {
            id: Date.now(),
            name: userName.value,
            email: userEmail.value,
            password: userPassword.value,
            isAdmin: isAdmin.checked,
            cart: [],
            wishlist: []
        }

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        errorText.innerText = "Signup Successful! Redirecting to login page...";
        errorText.style.color = "green";
        
        setTimeout(() => {
            loginTab.checked = true;
            showLoginForm();
        }, 2000)
    });
}

loginTab.addEventListener("change", ()=> {
    if(loginTab.checked) showLoginForm();
});

signUpTab.addEventListener("change", () => {
    if(signUpTab.checked) showSignUpForm();
});

window.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    
    if (loggedInUser) {
        if (loggedInUser.isAdmin) {
            window.location.href = "admin.html";
        } else {
            window.location.href = "user.html";
        }
    } else {
        if (loginTab.checked) {
            showLoginForm();
        }
    }
});