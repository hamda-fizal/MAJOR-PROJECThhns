import React, { useEffect, useRef } from "react";
import Card from "../../Shared/Card/Card.component";
import "./Participant.css";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";

export const Participant = ({ participant }) => {
  const audioRef = useRef(null);
  const remoteStream = new MediaStream();
  const userStream = useSelector((state) => state.mainStream);

  useEffect(() => {
    if (participant.peerConnection) {
      participant.peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        audioRef.current.srcObject = remoteStream;
      };
    }
  }, [participant.peerConnection]);

  useEffect(() => {
    if (userStream && participant.currentUser) {
      audioRef.current.srcObject = userStream;
      audioRef.current.muted = true;
    }
  }, [participant.currentUser, userStream]);

  return (
    <div className={`participant `}>
      <Card className="card">
        <audio ref={audioRef} autoPlay playsInline>
          {" "}
        </audio>
        <div style={{ background: participant.avatarColor }} className="avatar">
          {participant.name[0]}
        </div>
        <div className="name">
          {" "}
          {participant.name}
          {participant.currentUser ? "(You)" : ""}
        </div>
      </Card>
    </div>
  );
};
