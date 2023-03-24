import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faPhone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";
import "./MeetingFooter.css";
const MeetingFooter = (props) => {
  const micClick = () => {};

  return (
    <div className="meeting-footer">
      <div
        className={"meeting-icons "}
        data-tip={"Mute Audio"}
        onClick={micClick}
      >
        <FontAwesomeIcon icon={faMicrophone} title="Mute" />
      </div>
      <div className={"meeting-icons active"} data-tip={"EndCall"}>
        <FontAwesomeIcon icon={faPhone} />
      </div>
      <ReactTooltip />
    </div>
  );
};

export default MeetingFooter;
