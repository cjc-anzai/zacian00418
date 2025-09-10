import React from "react";
import { soundList } from "../model/model";

const TopScreen = ({ battleHandlers, setAreaVisible }) => {
  
  //インポートする変数や関数の取得
  const { setBgm, playBgm } = battleHandlers;

  const openSelectScreen = () => {
    soundList.general.decide.cloneNode().play();
    soundList.general.start.play();
    setBgm("selection");
    soundList.general.start.onended = () => {
      setAreaVisible(prev => ({ ...prev, top: false, select: true }));
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