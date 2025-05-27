const urlBase = "http://134.209.173.72/LAMPAPI";
const extension = "php";

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;

  document.getElementById("loginResult").innerHTML = "";

  let tmp = {
    login: login,
    password: password,
  };

  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/Login." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) return;

      if (this.status !== 200) {
        document.getElementById("loginResult").innerHTML =
          "Login failed. Please try again.";
        return;
      }

      let jsonObject = JSON.parse(xhr.responseText);
      userId = jsonObject.id;

      if (userId < 1) {
        document.getElementById("loginResult").innerHTML =
          "User/Password combination incorrect";
        return;
      }

      firstName = jsonObject.firstName;
      lastName = jsonObject.lastName;

      saveCookie();
      window.location.href = "contacts.html";
    };

    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("loginResult").innerHTML = err.message;
  }
}

function doSignup() {
  firstName = document.getElementById("firstName").value;
  lastName = document.getElementById("lastName").value;
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (!validSignUpForm(firstName, lastName, username, password)) {
    document.getElementById("signupResult").innerHTML = "Invalid signup";
    return;
  }

  document.getElementById("signupResult").innerHTML = "";

  let tmp = {
    firstName: firstName,
    lastName: lastName,
    login: username,
    password: password,
  };

  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/SignUp." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) return;

      if (this.status === 409) {
        document.getElementById("signupResult").innerHTML =
          "User already exists";
        return;
      }

      if (this.status !== 200) {
        document.getElementById("signupResult").innerHTML =
          "Signup failed. Please try again.";
        return;
      }

      let jsonObject = JSON.parse(xhr.responseText);
      userId = jsonObject.id;
      firstName = jsonObject.firstName;
      lastName = jsonObject.lastName;

      document.getElementById("signupResult").innerHTML = "User added";
      saveCookie();
    };

    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("signupResult").innerHTML = err.message;
  }
}
