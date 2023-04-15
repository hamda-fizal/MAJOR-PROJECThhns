import React from "react";
import "./Participants.css";
import { connect, useSelector } from "react-redux";
import { Participant } from "./Participant/Participant.component";

//export const Participant=({participant})=>{
  //const videoRef=useRef(null);
  //const userStream= useSelector((state)=> state.mainStream);
  //const remoteStream=new MediaStream();
  //useEffect(() =>{
    //if(participant.peerConnection){
      //participant.peerConnection.ontrack=(event)=>{

      //}
    //}
  //}
//}

const Participants = (props) => {
  let participantKey = Object.keys(props.participants);

  let gridCol =
    participantKey.length === 1 ? 1 : participantKey.length <= 4 ? 2 : 4;
  const gridColSize = participantKey.length <= 4 ? 1 : 2;
  let gridRowSize =
    participantKey.length <= 4
      ? participantKey.length
      : Math.ceil(participantKey.length / 2);

  const participants = useSelector((state) => state.participants);

  return (
    <div
      style={{
        "--grid-size": gridCol,
        "--grid-col-size": gridColSize,
        "--grid-row-size": gridRowSize,
      }}
      className={`participants`}
    >
      {Object.keys(participants).map((participantKey) => {
        const currentParticipant = participants[participantKey];
        return (
          <Participant participant={currentParticipant} key={participantKey} />
        );
      })}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    participants: state.participants,
    currentUser: state.currentUser,
  };
};

export default connect(mapStateToProps)(Participants);
