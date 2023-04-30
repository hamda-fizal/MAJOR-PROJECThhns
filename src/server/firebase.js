import firebase from "firebase";

var firebaseConfig = {
  apiKey: "AIzaSyBgUF8GEUXOnD_MDGgaNaenZm3A6n5-gLM", // Add API Key
  databaseURL:
    "https://test-meet-clone-default-rtdb.asia-southeast1.firebasedatabase.app/", // Add databaseURL
};

firebase.initializeApp(firebaseConfig);

export const db = firebase;

var firepadRef = firebase.database().ref();

export let connectedRef = firebase.database().ref(".info/connected");

export const userName = prompt("What's your name?");
const urlparams = new URLSearchParams(window.location.search);
const roomId = urlparams.get("id");
console.log("checking roomid");
if (roomId) {
  console.log("room id exists");
  firepadRef = firepadRef.child(roomId);
} else {
  console.log("new room id created");
  firepadRef = firepadRef.push();
  window.history.replaceState(null, "Meet", "?id=" + firepadRef.key);
}

export default firepadRef;
