import MainScreen from "./components/MainScreen/MainScreen.component";
import firepadRef, { db, userName } from "./server/firebase";
import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  addParticipant,
  setUser,
  removeParticipant,
  setUserStream,
  updateParticipant,
} from "./store/actioncreator";
import { connect } from "react-redux";
// set initial state of application variables
let isRecording = false;
let socket;
let recorder;
// runs real-time transcription and handles global variables
const roomName = "test";

function App(props) {
  const [toxicUsers, setToxicUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const chatSocket = new WebSocket(
    "ws://127.0.0.1:8000/ws/chat/" + roomName + "/"
  );
  chatSocket.onopen = function (e) {
    console.log("chatsocket opened and ready to use");
  };
  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    if (!!data?.result?.success && !!data?.result?.toxic) {
      if (toxicUsers?.findIndex(userid => userid === data?.result?.user_id) < 0) {
        setToxicUsers((prevState) => [...prevState, data?.result?.user_id])
      }
    }
    console.log("chatSock.onmessage: ", data);
  };
  
  chatSocket.onclose = function (e) {
    console.error("Chat socket closed unexpectedly");
  };

  const connectedRef = db.database().ref(".info/connected");
  // console.log("db connected");

  const participantRef = firepadRef.child("participants");
  console.log("PARTICIPANT REF AT THE BEGINNING", participantRef);
  // console.log("app.js starts");

  const getUserStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    return stream;
  };
  useEffect(async () => {
    // console.log("inside app useeffect");

    const mediaStream = await getUserStream();
    props.setUserStream(mediaStream);

    async function getToken() {
      let token = "";

      try {
        let response = await axios.get("http://127.0.0.1:8000/token/");

        token = response?.data.token;

        // if (!token) console.log("not token");
        // else console.log(token);
      } catch (error) {
        console.log(error);
      }
      return token;
    }

    const token = await getToken();
    
    let userId = "";
    const run = async (stream, token) => {
      let RecordRTC = require("recordrtc");
      let StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
      if (isRecording) {
        // console.log("is recording : true");
        if (socket) {
          socket.send(JSON.stringify({ terminate_session: true }));
          socket.close();
          socket = null;
        }

        if (recorder) {
          recorder.pauseRecording();
          // console.log("paused recording");
          recorder = null;
        }
      } else {
        // establish wss with AssemblyAI (AAI) at 16000 sample rate
        socket = await new WebSocket(
          `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
        );
        // console.log("working");
        // handle incoming messages to display transcription to the DOM
        const texts = {};
        let prev_audio_start = 0;
        let prev_text = "";
        socket.onmessage = (message) => {
          // console.log("on message");
          let msg = "";
          const res = JSON.parse(message.data);
          texts[res.audio_start] = res.text;
          const keys = Object.keys(texts);
          keys.sort((a, b) => a - b);
          for (const key of keys) {
            if (texts[key]) {
              msg += ` ${texts[key]}`;
            }
          }
          console.log(msg);

          if (!!prev_text && res.audio_start !== prev_audio_start) {
            prev_audio_start = res.audio_start;
            chatSocket.send(JSON.stringify({ message: prev_text, user_id: userId, user_name: userName }));
            console.log("message sent by ", userName);
          }
          prev_text = res.text;
        };

        socket.onerror = (event) => {
          console.error(event);
          socket.close();
        };

        socket.onclose = (event) => {
          // console.log("close ayi");
          if (!!prev_text) {
            chatSocket.send(JSON.stringify({ message: prev_text, user_id: userId, user_name: userName }));
            // console.log("message sent via chatsock");
          }
          // console.log(event);
          socket = null;
        };

        socket.onopen = () => {
          // console.log("open ay");
          // once socket is open, begin recording
          // navigator.mediaDevices
          //   .getUserMedia({ audio: true })
          //   .then((stream) => {
          recorder = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
            recorderType: StereoAudioRecorder,
            timeSlice: 1000, // set 250 ms intervals of data that sends to AAI
            desiredSampRate: 16000,
            numberOfAudioChannels: 1, // real-time requires only one channel
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: (blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64data = reader.result;

                // audio data must be sent as a base64 encoded string
                if (socket) {
                  socket.send(
                    JSON.stringify({
                      audio_data: base64data.split("base64,")[1],
                    })
                  );
                }
              };
              reader.readAsDataURL(blob);
            },
          });
          // console.log("started recording stream");
          recorder.startRecording();
          // })
          // .catch((err) => console.error(err));
        };
      }

      isRecording = !isRecording;
    };
    await run(mediaStream, token);

    connectedRef.on("value", (snap) => {
      console.log("value of connectedref changed \n " + snap.numChildren());
      if (snap.val()) {
        const defaultPreference = {
          audio: true,
        };
        const userStatusRef = participantRef.push({
          userName: userName,
          preferences: defaultPreference,
        });
        userId = userStatusRef?.key;
        props.setUser({
          [userStatusRef.key]: { name: userName, ...defaultPreference },
        });
        userStatusRef.onDisconnect().remove();
      }
    });
  }, []);

  const isUserSet = !!props.user;
  const isStreamSet = !!props.stream;

  useEffect(() => {
    if (isStreamSet && isUserSet) {
      participantRef.on("child_added", (snap) => {
        const preferenceUpdateEvent = participantRef
          .child(snap.key)
          .child("preferences");
        preferenceUpdateEvent.on("child_changed", (preferenceSnap) => {
          props.updateParticipant({
            [snap.key]: {
              [preferenceSnap.key]: preferenceSnap.val(),
            },
          });
        });
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
    }
  }, [isStreamSet, isUserSet]);

  return (
    <div className="App">
      <MainScreen toxicUsers={toxicUsers} />
    </div>
  );
}

const mapStateToProps = (state) => {
  console.log(
    "mapping state to props : \n state.currentUser:" +
      JSON.stringify(state.currentUser) +
      "\nparticipants: " +
      JSON.stringify(state.participants)
  );
  return {
    stream: state.userStream,
    user: state.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  console.log("mapping dispatch to props \n" + JSON.stringify(dispatch));
  return {
    setUser: (user) => dispatch(setUser(user)),
    setUserStream: (stream) => dispatch(setUserStream(stream)),
    addParticipant: (user) => dispatch(addParticipant(user)),
    removeParticipant: (userId) => dispatch(removeParticipant(userId)),
    updateParticipant: (user) => dispatch(updateParticipant(user)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
