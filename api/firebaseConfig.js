import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: "AIzaSyDy7rqk8Wy7oBDlSeDizZq1nSmfEMl3taU",
  authDomain: "projectiiotca2-default-rtdb.firebaseapp.com",
  databaseURL: "https://projectiiotca2-default-rtdb.firebaseio.com/",
  projectId: "projectiiotca2",
  storageBucket: "projectiiotca2-default-rtdb.appspot.com/",
  messagingSenderId: "your-messaging-sender-id",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

export { firebase, database };
