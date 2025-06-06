const urlBase = "http://cop4331group5.xyz/LAMPAPI";
const extension = "php";
let currentPage = 1;
const contactsPerPage = 8;
let allContacts = [];

function doSignup() {
  let firstName = document.getElementById("firstName").value;
  let lastName = document.getElementById("lastName").value;
  let username = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;

  document.getElementById("signupResult").innerHTML = "";

  let tmp = {
    firstName: firstName,
    lastName: lastName,
    login: username,
    password: password,
  };

  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/Register." + extension;

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
      window.userId = jsonObject.id;
      window.firstName = jsonObject.firstName;
      window.lastName = jsonObject.lastName;

      document.getElementById("signupResult").innerHTML = "User added";
      saveCookie();
    };

    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("signupResult").innerHTML = err.message;
  }
}

function doLogin() {
  window.userId = 0;
  window.firstName = "";
  window.lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;
  document.getElementById("loginResult").innerHTML = "";

  let payload = JSON.stringify({ login: login, password: password });
  let url = `${urlBase}/Login.${extension}`;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let json = JSON.parse(xhr.responseText);
        window.userId = json.id;

        if (window.userId < 1) {
          document.getElementById("loginResult").innerHTML =
            "User/Password combination incorrect";
          return;
        }

        window.firstName = json.firstName;
        window.lastName = json.lastName;
        saveCookie();
        window.location.href = "contact.html";
      } else {
        document.getElementById("loginResult").innerHTML =
          "Server error or incorrect login.";
      }
    }
  };
  xhr.send(payload);
}

function saveCookie() {
  let minutes = 20;
  let date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  const cookieValue = encodeURIComponent(
    JSON.stringify({
      firstName: window.firstName,
      lastName: window.lastName,
      userId: window.userId,
    })
  );
  document.cookie = `userInfo=${cookieValue};expires=${date.toUTCString()};path=/`;
}

function readCookie() {
  const nameEQ = "userInfo=";
  const ca = document.cookie.split(";");
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) {
      try {
        const userInfo = JSON.parse(
          decodeURIComponent(c.substring(nameEQ.length))
        );
        window.userId = userInfo.userId || 0;
        window.firstName = userInfo.firstName || "";
        window.lastName = userInfo.lastName || "";
      } catch {
        window.userId = 0;
        window.firstName = "";
        window.lastName = "";
      }
      return;
    }
  }
  window.userId = 0;
  window.firstName = "";
  window.lastName = "";
}

function doLogout() {
  window.userId = 0;
  window.firstName = "";
  window.lastName = "";
  document.cookie = "userInfo=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  window.location.href = "index.html";
}

function addContact() {
  let fn = document.getElementById("firstName").value;
  let ln = document.getElementById("lastName").value;
  let phone = document.getElementById("phoneNumber").value;
  let email = document.getElementById("emailAddress").value;
  document.getElementById("contactAddResult").innerHTML = "";

  if (!fn || !phone) {
    document.getElementById("contactAddResult").innerHTML =
      "First name and phone number are required.";
    return;
  }

  let tmp = {
    firstName: fn,
    lastName: ln,
    phoneNumber: phone,
    emailAddress: email,
    userId: window.userId,
  };

  let jsonPayload = JSON.stringify(tmp);
  let url = `${urlBase}/AddContacts.${extension}`;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          let json = JSON.parse(xhr.responseText);
          if (json.error && json.error !== "") {
            document.getElementById("contactAddResult").innerHTML = json.error;
          } else {
            document.getElementById("contactAddResult").innerHTML =
              "Contact added successfully!";
            clearContactInputs();
            searchContacts();
          }
        } catch (e) {
          document.getElementById("contactAddResult").innerHTML =
            "Error parsing server response.";
        }
      } else {
        document.getElementById("contactAddResult").innerHTML =
          "Error adding contact. Status: " + xhr.status;
      }
    }
  };
  xhr.send(jsonPayload);
}

function clearContactInputs() {
  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("phoneNumber").value = "";
  document.getElementById("emailAddress").value = "";
}

function searchContacts() {
  const searchText = document.getElementById("searchText").value.trim();
  document.getElementById("contactSearchResult").innerText = "";

  const payload = {
    userId: window.userId,
    search: searchText,
  };

  fetch(`${urlBase}/SearchContacts.${extension}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data.error && data.error !== "") {
        document.getElementById("contactSearchResult").innerText = data.error;
        updateContactTable([]);
      } else {
        allContacts = data.results || [];
        currentPage = 1;
        displayContactsPage(currentPage);
      }
    })
    .catch((err) => {
      console.error("Search Error:", err);
      document.getElementById("contactSearchResult").innerText =
        "Search failed or server error.";
      updateContactTable([]);
    });
}

function displayContactsPage(page) {
  const start = (page - 1) * contactsPerPage;
  const end = start + contactsPerPage;
  const paginatedContacts = allContacts.slice(start, end);
  updateContactTable(paginatedContacts);
  renderPaginationControls();
}

function renderPaginationControls() {
  const paginationDiv = document.getElementById("paginationControls");
  paginationDiv.innerHTML = "";

  const totalPages = Math.ceil(allContacts.length / contactsPerPage);

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "pagination-button";
    if (i === currentPage) btn.disabled = true;
    btn.addEventListener("click", () => {
      currentPage = i;
      displayContactsPage(currentPage);
    });
    paginationDiv.appendChild(btn);
  }
}

function updateContactTable(contacts) {
  const table = document.getElementById("contactList");
  table.innerHTML = ""; // Clear existing rows

  contacts.forEach((contact) => {
    const row = table.insertRow();

    row.innerHTML = `
      <td><span>${contact.FirstName}</span><input type="text" value="${
      contact.FirstName
    }" style="display:none;"></td>
      <td><span>${contact.LastName}</span><input type="text" value="${
      contact.LastName
    }" style="display:none;"></td>
      <td><span>${contact.PhoneNumber}</span><input type="text" value="${
      contact.PhoneNumber
    }" style="display:none;"></td>
      <td><span>${
        contact.EmailAddress || ""
      }</span><input type="email" value="${
      contact.EmailAddress || ""
    }" style="display:none;"></td>
      <td>
        <button onclick="enableInlineEdit(this)">Edit</button>
        <button style="display:none;" onclick="saveInlineEdit(this, ${
          contact.ID
        })">Save</button>
        <button style="display:none;" onclick="cancelInlineEdit(this)">Cancel</button>
        <button onclick='deleteContact(${contact.ID}, "${
      contact.FirstName
    }", "${contact.LastName}")'>Delete</button>
      </td>
    `;
  });
}

function enableInlineEdit(button) {
  const row = button.closest("tr");
  const spans = row.querySelectorAll("td span");
  const inputs = row.querySelectorAll("td input");

  spans.forEach((span) => (span.style.display = "none"));
  inputs.forEach((input) => (input.style.display = "inline-block"));

  // Toggle buttons
  button.style.display = "none"; // Hide Edit
  row.querySelector("button[onclick^='saveInlineEdit']").style.display =
    "inline-block";
  row.querySelector("button[onclick^='cancelInlineEdit']").style.display =
    "inline-block";
  row.querySelector("button[onclick^='deleteContact']").style.display =
    "inline-block";
}

function cancelInlineEdit(button) {
  const row = button.closest("tr");
  const spans = row.querySelectorAll("td span");
  const inputs = row.querySelectorAll("td input");

  // Reset inputs to original span values
  inputs.forEach((input, i) => {
    input.value = spans[i].textContent;
    input.style.display = "none";
  });

  spans.forEach((span) => (span.style.display = "inline"));

  // Toggle buttons
  row.querySelector("button[onclick^='enableInlineEdit']").style.display =
    "inline-block";
  row.querySelector("button[onclick^='saveInlineEdit']").style.display = "none";
  button.style.display = "none"; // Cancel button
}

function saveInlineEdit(button, contactId) {
  const row = button.closest("tr");
  const inputs = row.querySelectorAll("td input");

  const updatedContact = {
    ID: contactId,
    FirstName: inputs[0].value.trim(),
    LastName: inputs[1].value.trim(),
    PhoneNumber: inputs[2].value.trim(),
    EmailAddress: inputs[3].value.trim(),
  };

  if (!updatedContact.FirstName || !updatedContact.PhoneNumber) {
    alert("First Name and Phone Number are required.");
    return;
  }

  const payload = {
    contactId: updatedContact.ID,
    firstName: updatedContact.FirstName,
    lastName: updatedContact.LastName,
    phoneNumber: updatedContact.PhoneNumber,
    emailAddress: updatedContact.EmailAddress,
    userId: window.userId,
  };

  fetch(`${urlBase}/EditContacts.${extension}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data.error && data.error !== "") {
        alert("Update failed here: " + data.error);
      } else {
        // Update spans and toggle back to view mode
        const spans = row.querySelectorAll("td span");
        inputs.forEach((input, i) => {
          spans[i].textContent = input.value;
          input.style.display = "none";
        });
        spans.forEach((span) => (span.style.display = "inline"));

        // Toggle buttons
        row.querySelector("button[onclick^='enableInlineEdit']").style.display =
          "inline-block";
        row.querySelector("button[onclick^='saveInlineEdit']").style.display =
          "none";
        row.querySelector("button[onclick^='cancelInlineEdit']").style.display =
          "none";
      }
    })
    .catch((err) => {
      alert("Update failed: " + err.message);
    });
}

function deleteContact(id, fn, ln) {
  if (!confirm(`Delete contact: ${fn} ${ln}?`)) {
    return;
  }

  const payload = { id: id, userId: window.userId };

  fetch(`${urlBase}/DeleteContacts.${extension}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data.error && data.error !== "") {
        alert("Delete failed: " + data.error);
      } else {
        searchContacts();
      }
    })
    .catch((err) => {
      alert("Delete failed: " + err.message);
    });
}

window.onload = () => {
  readCookie();
};
