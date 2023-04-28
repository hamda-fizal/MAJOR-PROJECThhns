import {
  ADD_PARTICIPANT,
  SET_USER,
  REMOVE_PARTICIPANT,
  SET_USERSTREAM,
  UPDATE_USER,
  UPDATE_PARTICIPANT,
} from "./actiontypes";

export const setUserStream = (stream) => {
  return {
    type: SET_USERSTREAM,
    payload: {
      userStream: stream,
    },
  };
};

export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: {
      currentUser: user,
    },
  };
};

export const addParticipant = (participant) => {
  return {
    type: ADD_PARTICIPANT,
    payload: {
      participant,
    },
  };
};

export const removeParticipant = (participantKey) => {
  return {
    type: REMOVE_PARTICIPANT,
    payload: {
      participantKey,
    },
  };
};

export const updateUser = (user) => {
  return {
    type: UPDATE_USER,
    payload: {
      currentUser: user,
    },
  };
};

export const updateParticipant = (user) => {
  return {
    type: UPDATE_PARTICIPANT,
    payload: {
      newUser: user,
    },
  };
};
