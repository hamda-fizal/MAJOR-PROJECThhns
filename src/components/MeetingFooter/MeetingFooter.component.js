import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faPhone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";
import "./MeetingFooter.css";
const MeetingFooter = ({ isToxic = false, ...props }) => {
  const [streamState, setStreamState] = useState({ mic: true });
  const micClick = () => {
    setStreamState((currentState) => {
      return {
        ...currentState,
        mic: !currentState.mic,
      };
    });
  };

  const endCallClick = () => {
    try {
      let tracks = this.setStreamState.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  useEffect(() => {
    props.onMicClick(streamState.mic);
  }, [streamState.mic]);

  return (
    <div className="meeting-footer">
      <div
        className={
          "meeting-icons " + (!streamState.mic || isToxic ? "active" : "")
        }
        data-tip={streamState.mic ? "Mute Audio" : "Unmute Audio"}
        onClick={!isToxic ? micClick : () => {}}
      >
        {isToxic ? (
          <FontAwesomeIcon
            icon={faMicrophoneSlash}
            title="Muted due to toxicity"
          />
        ) : (
          <FontAwesomeIcon
            icon={!streamState.mic ? faMicrophoneSlash : faMicrophone}
            title="Mute"
          />
        )}
      </div>
      <div
        className={"meeting-icons active"}
        data-tip={"EndCall"}
        onClick={endCallClick}
      >
        <FontAwesomeIcon icon={faPhone} />
      </div>
      <ReactTooltip />
    </div>
  );
};

export default MeetingFooter;
