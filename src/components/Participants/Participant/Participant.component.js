import React from "react";
import Card from "../../Shared/Card/Card.component";
import "./Participant.css";

export const Participant = ({ participant }) => {
  return (
    <div className={`participant `}>
      <Card className="card">
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
