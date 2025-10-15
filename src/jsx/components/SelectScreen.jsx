import React from "react";
import { soundList } from "../../js/constants";

const SelectScreen = ({ battleStates, battleControllers, battleExecutors, }) => {

  //インポートする変数や関数の取得
  const { mySelectedOrder } = battleStates;
  const { handleBattleStartBtnClick } = battleControllers;
  const { selectMyPokeOrder } = battleExecutors;

  const getPokeImg = (pokeName) => {
    const url = `https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/pokeImg/${pokeName}.png`
    return url;
  }

  const opPokesRomaName = ["erekiburu", "erureido", "rapurasu", "manmu", "guraion", "hapinasu"];
  const opPokesKanaName = ["エレキブル", "エルレイド", "ラプラス", "マンムー", "グライオン", "ハピナス"];
  const myPokesRomaName = ["gaburiasu", "goukazaru", "sanda", "genga", "mirokarosu", "jukain"];
  const myPokesKanaName = ["ガブリアス", "ゴウカザル", "サンダー", "ゲンガー", "ミロカロス", "ジュカイン"];

  //選出画面のポケモン押下時
  const handleSelect = (pokeName) => {
    soundList.general.select.cloneNode().play();
    selectMyPokeOrder(pokeName);
  };

  return (
    <div className="select-area">
      <p className="select-screen-text">相手のポケモン</p>
      <div className="op-pokes-wrap">
        <div className="op-poke">
          <img src={getPokeImg(opPokesRomaName[0])} alt={opPokesKanaName[0]} />
          <p>{opPokesKanaName[0]}</p>
        </div>
        <div className="op-poke">
          <img src={getPokeImg(opPokesRomaName[1])} alt={opPokesKanaName[1]} />
          <p>{opPokesKanaName[1]}</p>
        </div>
        <div className="op-poke">
          <img src={getPokeImg(opPokesRomaName[2])} alt={opPokesKanaName[2]} />
          <p>{opPokesKanaName[2]}</p>
        </div>
        <div className="op-poke">
          <img src={getPokeImg(opPokesRomaName[3])} alt={opPokesKanaName[3]} />
          <p>{opPokesKanaName[3]}</p>
        </div>
        <div className="op-poke">
          <img src={getPokeImg(opPokesRomaName[4])} alt={opPokesKanaName[4]} />
          <p>{opPokesKanaName[4]}</p>
        </div>
        <div className="op-poke">
          <img src={getPokeImg(opPokesRomaName[5])} alt={opPokesKanaName[5]} />
          <p>{opPokesKanaName[5]}</p>
        </div>
      </div>

      <p className="select-screen-text">自分のポケモンを3体選出</p>
      <div className="my-pokes-wrap">
        {[{ name: myPokesKanaName[0], img: getPokeImg(myPokesRomaName[0]) }, { name: myPokesKanaName[1], img: getPokeImg(myPokesRomaName[1]) },
        { name: myPokesKanaName[2], img: getPokeImg(myPokesRomaName[2]) }, { name: myPokesKanaName[3], img: getPokeImg(myPokesRomaName[3]) },
        { name: myPokesKanaName[4], img: getPokeImg(myPokesRomaName[4]) }, { name: myPokesKanaName[5], img: getPokeImg(myPokesRomaName[5]) },].map((poke) => (
          <div
            key={poke.name}
            className={`my-poke ${mySelectedOrder.includes(poke.name) ? "selected" : ""}`}
            onClick={() => handleSelect(poke.name)}
          >
            <img src={poke.img} alt={poke.name} />
            <p>{poke.name}</p>
            <p className="order-num">
              {mySelectedOrder.includes(poke.name) && `${mySelectedOrder.indexOf(poke.name) + 1}番目`}
            </p>
          </div>
        ))}
      </div>

      <button
        className={mySelectedOrder.length === 3 ? "active" : "inactive"}
        onClick={() => handleBattleStartBtnClick(opPokesKanaName)}
        disabled={mySelectedOrder.length !== 3}
      >
        バトル開始！
      </button>
    </div>
  );
};

export default SelectScreen;