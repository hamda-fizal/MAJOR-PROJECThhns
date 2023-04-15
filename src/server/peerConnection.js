import dbRef from "./firebase";
import { store } from "..";
const participantRef = dbRef.child("participants");

export const createOffer = async (peerConnection, createdId, recieverId) => {
  const receiverRef = participantRef.child(recieverId);
  const offer = await peerConnection.createOffer();

  peerConnection.onicecandidate = (event) => {
    event.candidate &&
      receiverRef
        .child("offerCandidates")
        .push({ ...event.candidate.toJSON(), userId: createdId });
  };

  await peerConnection.setLocalDescription(offer);

  const offerPayload = {
    sdp: offer.sdp,
    type: offer.type,
    userId: createdId,
  };
  await receiverRef.child("offers").push().set({ offerPayload });
};

export const initializeListeners = (currentUserId) => {
  const receiverRef = participantRef.child(currentUserId);

  receiverRef.child("offers").on("child_added", async (snapshot) => {
    const data = snapshot.val();
    if (data?.offerPayload) {
      const creatorId = data?.offerPayload.userId;
      const peerConnection =
        store.getState().participants[creatorId].peerConnection;

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data?.offerPayload)
      );
      createAnswer(peerConnection, currentUserId, creatorId);
    }
  });

  receiverRef.child("offersCandidates").on("child_added", async (snapshot) => {
    const data = snapshot.val();
    if (data?.userId) {
      const peerConnection =
        store.getState().participants[data?.userId].peerConnection;
      peerConnection.addIceCandidate(new RTCIceCandidate(data));
    }
  });
  receiverRef.child("answers").on("child_added", async (snapshot) => {
    const data = snapshot.val();
    if (data?.answerPayload) {
      const creatorId = data?.answerPayload.userId;
      const peerConnection =
        store.getState().participants[creatorId].peerConnection;

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data?.answerPayload)
      );
    }
  });
  receiverRef.child("answerCandidates").on("child_added", async (snapshot) => {
    const data = snapshot.val();
    if (data?.userId) {
      const peerConnection =
        store.getState().participants[data?.userId].peerConnection;
      peerConnection.addIceCandidate(new RTCIceCandidate(data));
    }
  });
};

const createAnswer = async (peerConnection, currentUserId, recieverId) => {
  const receiverRef = participantRef.child(recieverId);
  const answer = await peerConnection.createAnswer();

  peerConnection.onicecandidate = (event) => {
    event.candidate &&
      receiverRef
        .child("answerCandidates")
        .push({ ...event.candidate.toJSON(), userId: currentUserId });
  };

  await peerConnection.setLocalDescription(answer);

  const answerPayload = {
    sdp: answer.sdp,
    type: answer.type,
    userId: currentUserId,
  };
  await receiverRef.child("answers").push().set({ answerPayload });
};
