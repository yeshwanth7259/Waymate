const apiKey = "AIzaSyAqGHvazq9-iq_gPXCBKcBPoHYB8aVRjWY";
const email = "yesh5yash@gmail.com";
const password = "password123";

fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    password,
    returnSecureToken: true
  })
})
.then(res => res.json())
.then(data => {
  if (data.error) {
    console.error("Failed to create user:", data.error.message);
  } else {
    console.log("SUCCESS! User created. UID:", data.localId);
  }
})
.catch(err => console.error(err));
