import MainScreen from "./components/MainScreen/MainScreen.component";
import firepadRef, { db, userName } from "./server/firebase";
import "./App.css";
import { useEffect } from "react";
import {
  addParticipant,
  setUser,
  removeParticipant,
} from "./store/actioncreator";
import { connect } from "react-redux";

function App(props) {
  const participantRef = firepadRef.child("participants");

  useEffect(async () => {
    const connectedRef = db.database().ref(".info/connected");

    connectedRef.on("value", (snap) => {
      if (snap.val()) {
        const defaultPreference = {
          audio: true,
        };
        const userStatusRef = participantRef.push({
          userName: userName,
          preferences: defaultPreference,
        });
        props.setUser({
          [userStatusRef.key]: { name: userName, ...defaultPreference },
        });
        userStatusRef.onDisconnect().remove();
      }
    });
  }, []);

  useEffect(() => {
    participantRef.on("child_added", (snap) => {
      const { userName: name, preferences = {} } = snap.val();
      props.addParticipant({
        [snap.key]: {
          name,
          ...preferences,
        },
      });
    });
    participantRef.on("child_removed", (snap) => {
      props.removeParticipant(snap.key);
    });
    // }
  }, [props.user]);
  return (
    <div className="App">
      <MainScreen />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.currentUser,
    participants: state.participants,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUser: (user) => dispatch(setUser(user)),
    addParticipant: (user) => dispatch(addParticipant(user)),
    removeParticipant: (userId) => dispatch(removeParticipant(userId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
