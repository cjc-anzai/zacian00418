import React from "react";

const ResultScreen = ({ otherTextRef }) => {
  return (
    <div className={`result-screen ${otherTextRef.current.content === "WIN" ? "win" : "lose"}`}>
      <h1>{otherTextRef.current.content}</h1>
      <button onClick={() => window.location.reload()}>トップへ</button>
    </div>
  );
};

export default ResultScreen;
