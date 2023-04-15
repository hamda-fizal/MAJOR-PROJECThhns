import React from "react";
import MeetingFooter from "../MeetingFooter/MeetingFooter.component";
import Participants from "../Participants/Participants.component";
import "./MainScreen.css";
import { connect } from "react-redux";

const MainScreen = () => {
  return (
    <div className="wrapper">
      <div className="main-screen">{<Participants />}</div>

      <div className="footer">
        <MeetingFooter />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    participants: state.participants,
    currentUser: state.currentUser,
  };
};

export default connect(mapStateToProps)(MainScreen);
