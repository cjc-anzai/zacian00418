import React from "react";
import { soundList } from "../../js/constants";

const TopScreen = ({ battleExecutors, setAreaVisible }) => {

  //インポートする変数や関数の取得
  const { playBgm } = battleExecutors;

  const openSelectScreen = () => {
    soundList.general.decide.cloneNode().play();
    setAreaVisible(prev => ({ ...prev, top: false, select: true }));
    playBgm("selection");
  }

  return (
    <div className="top-screen">
      <h1>ポケモンバトル</h1>
      <button onClick={openSelectScreen}>スタート</button>
    </div>
  );
};

export default TopScreen;