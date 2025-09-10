import React from "react";

const ResultScreen = ({ resultText }) => {

  return (
    <div className={`result-screen ${resultText.current === "WIN" ? "win" : "lose"}`}>
      <h1>{resultText.current}</h1>
      <button onClick={() => window.location.reload()}>トップへ</button>
    </div>
  );
};

export default ResultScreen;
