import React from "react";

const ResultScreen = ({ resultText, initializeState }) => {

  //トップへ戻るボタン押下時、すべてのステータスを初期化
  const goTop = () => {
    initializeState();
  }

  return (
    <div className={`result-screen ${resultText.current === "WIN" ? "win" : "lose"}`}>
      <h1>{resultText.current}</h1>
      <button onClick={goTop}>トップへ</button>
    </div>
  );
};

export default ResultScreen;
