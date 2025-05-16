import React from "react";

const TopScreen = ({ battleHandlers, setOtherAreaVisible }) => {
  
  //インポートする変数や関数の取得
  const { playSe, setBgm, playBgm } = battleHandlers;

  const openSelectScreen = () => {
    playSe("decide");
    const startSe = playSe("start");
    setBgm("selection");

    startSe.onended = () => {
      setOtherAreaVisible(prev => ({ ...prev, top: false, select: true }));
      playBgm();
    };
  }
  
  return (
    <div className="top-screen">
      <h1>ポケモンバトル</h1>
      <button onClick={openSelectScreen}>スタート</button>
    </div>
  );
};

export default TopScreen;