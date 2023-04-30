import React, { useEffect, useRef } from "react";
import MeetingFooter from "../MeetingFooter/MeetingFooter.component";
import Participants from "../Participants/Participants.component";
import "./MainScreen.css";
import { connect } from "react-redux";
import { setUserStream, updateUser } from "../../store/actioncreator";

const MainScreen = (props) => {
  const participantRef = useRef(props.participants);
  const onMicClick = (micEnabled) => {
    if (props.stream) {
      props.stream.getAudioTracks()[0].enabled = micEnabled;
      props.updateUser({ audio: micEnabled });
    }
  };

  useEffect(() => {
    participantRef.current = props.participants;
  }, [props.participants]);

  return (
    <div className="wrapper">
      <div className="main-screen">{<Participants />}</div>

      <div className="footer">
        <MeetingFooter onMicClick={onMicClick} />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    stream: state.userStream,
    participants: state.participants,
    currentUser: state.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUserStream: (stream) => dispatch(setUserStream(stream)),
    updateUser: (user) => dispatch(updateUser(user)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
