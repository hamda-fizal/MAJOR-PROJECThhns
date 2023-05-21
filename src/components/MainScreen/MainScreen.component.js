import React, { useEffect, useRef, useState } from "react";
import MeetingFooter from "../MeetingFooter/MeetingFooter.component";
import Participants from "../Participants/Participants.component";
import "./MainScreen.css";
import { connect } from "react-redux";
import { setUserStream, updateUser } from "../../store/actioncreator";
import { useSelector } from "react-redux";

const MainScreen = (props) => {
  const {toxicUsers} = props;
  const [isToxic, setIsToxic] = useState(false);
  const userState = useSelector(state => state?.currentUser);
  const participantRef = useRef(props.participants);
  const onMicClick = (micEnabled) => {
    if (micEnabled && isToxic) {
      return
    }
    if (props.stream) {
      props.stream.getAudioTracks()[0].enabled = micEnabled;
      props.updateUser({ audio: micEnabled });
    }
  };

  useEffect(() => {
    participantRef.current = props.participants;
  }, [props.participants]);

  useEffect(() => {
    const toxic = toxicUsers.findIndex((userId) => userId === Object.keys(userState)[0]) >= 0;
    setIsToxic(toxic);
    onMicClick(false);
  }, [toxicUsers])

  return (
    <div className="wrapper">
      <div className="main-screen">{<Participants />}</div>

      <div className="footer">
        <MeetingFooter isToxic={isToxic} onMicClick={onMicClick} />
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
