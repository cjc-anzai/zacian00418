import React from "react";

const ResultScreen = ({ resultText, goTop }) => {
  return (
    <div className={`result-screen ${resultText === "WIN" ? "win" : "lose"}`}>
      <h1>{resultText}</h1>
      <button onClick={goTop}>トップへ</button>
    </div>
  );
};

export default ResultScreen;
