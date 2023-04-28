import {
  createOffer,
  initializeListeners,
  updatePreference,
} from "../server/peerConnection";
import {
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
  SET_USER,
  SET_USERSTREAM,
  UPDATE_PARTICIPANT,
  UPDATE_USER,
} from "./actiontypes";

let initialState = {
  currentUser: null,
  participants: {},
  userStream: null,
};

const stunServers = {
  iceServers: [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
        "stun:stun.services.mozilla.com",
      ],
    },
  ],
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USERSTREAM: {
      let { payload } = action;
      state = { ...state, ...payload };
      return state;
    }

    case SET_USER: {
      let { payload } = action;
      state = { ...state, currentUser: { ...payload.currentUser } };
      initializeListeners(Object.keys(payload.currentUser)[0]);
      return state;
    }
    case ADD_PARTICIPANT: {
      let { payload } = action;
      const currentUserId = Object.keys(state.currentUser)[0];
      const participantId = Object.keys(payload.participant)[0];
      if (currentUserId === participantId) {
        payload.participant[participantId].currentUser = true;
      }
      if (state.userStream && !payload.participant[participantId].currentUser) {
        addConnection(state.currentUser, payload.participant, state.userStream);
      }

      payload.participant[participantId].avatarColor = `#${Math.floor(
        Math.random() * 16777215
      ).toString(16)}`;
      let participants = { ...state.participants, ...payload.participant };

      state = { ...state, participants };
      return state;
    }
    case REMOVE_PARTICIPANT: {
      let { payload } = action;
      let participants = { ...state.participants };
      delete participants[payload.participantKey];
      state = { ...state, participants };
      return state;
    }
    case UPDATE_USER: {
      let payload = action.payload;
      const userId = Object.keys(state.currentUser)[0];
      updatePreference(userId, payload.currentUser);
      state.currentUser[userId] = {
        ...state.currentUser[userId],
        ...payload.currentUser,
      };
      state = {
        ...state,
        currentUser: { ...state.currentUser },
      };
      return state;
    }
    case UPDATE_PARTICIPANT: {
      let payload = action.payload;
      const newUserId = Object.keys(payload.newUser)[0];

      payload.newUser[newUserId] = {
        ...state.participants[newUserId],
        ...payload.newUser[newUserId],
      };
      let participants = { ...state.participants, ...payload.newUser };
      state = { ...state, participants };
      return state;
    }
    default: {
      return state;
    }
  }
};
const addConnection = (currentUser, newUser, mediaStream) => {
  const peerConnection = new RTCPeerConnection(stunServers);
  mediaStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, mediaStream);
  });

  const currentUserKey = Object.keys(currentUser)[0];
  const newUserKey = Object.keys(newUser)[0];

  const sortedIDs = [currentUserKey, newUserKey].sort((a, b) =>
    a.localeCompare(b)
  );

  newUser[newUserKey].peerConnection = peerConnection;

  if (sortedIDs[1] === currentUserKey) {
    createOffer(peerConnection, sortedIDs[1], sortedIDs[0]);
  }
};
