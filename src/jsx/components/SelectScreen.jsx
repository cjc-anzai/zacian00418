import React from "react";
import { soundList } from "../../js/constants";

const SelectScreen = ({ battleStates, battleControllers, battleExecutors, }) => {

  //インポートする変数や関数の取得
  const { mySelectedOrder, myTeam, opTeam } = battleStates;
  const { handleBattleStartBtnClick } = battleControllers;
  const { selectMyPokeOrder } = battleExecutors;

  const getPokeImg = (pokeName) => {
    const url = `https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/pokeImg/${pokeName}.png`
    return url;
  }

  // const opPokesRomaName = ["erekiburu", "erureido", "rapurasu", "manmu", "guraion", "hapinasu"];
  // const opPokesKanaName = ["エレキブル", "エルレイド", "ラプラス", "マンムー", "グライオン", "ハピナス"];
  const opPokesKanaName = Object.values(opTeam).map(poke => poke.name);
  // const myPokesRomaName = ["gaburiasu", "goukazaru", "sanda", "genga", "mirokarosu", "jukain"];
  // const myPokesKanaName = ["ガブリアス", "ゴウカザル", "サンダー", "ゲンガー", "ミロカロス", "ジュカイン"];

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
          <img src={getPokeImg(opTeam[0].romaName)} alt={opTeam[0].name} />
          <p>{opTeam[0].name}</p>
        </div>
        <div className="op-poke">
          <img src={getPokeImg(opTeam[1].romaName)} alt={opTeam[1].name} />
          <p>{opTeam[1].name}</p>
        </div>
        <div className="op-poke">
          <img src={getPokeImg(opTeam[2].romaName)} alt={opTeam[2].name} />
          <p>{opTeam[2].name}</p>
        </div>
        <div className="op-poke">
          <img src={getPokeImg(opTeam[3].romaName)} alt={opTeam[3].name} />
          <p>{opTeam[3].name}</p>
        </div>
        <div className="op-poke">
          <img src={getPokeImg(opTeam[4].romaName)} alt={opTeam[4].name} />
          <p>{opTeam[4].name}</p>
        </div>
        <div className="op-poke">
          <img src={getPokeImg(opTeam[5].romaName)} alt={opTeam[5].name} />
          <p>{opTeam[5].name}</p>
        </div>
      </div>

      <p className="select-screen-text">自分のポケモンを3体選出</p>
      <div className="my-pokes-wrap">
        {myTeam.map((poke) => (
          <div
            key={poke.kanaName}
            className={`my-poke ${mySelectedOrder.includes(poke.kanaName) ? "selected" : ""}`}
            onClick={() => handleSelect(poke.kanaName)}
          >
            <img src={poke.img} alt={poke.kanaName} />
            <p>{poke.kanaName}</p>
            <p className="order-num">
              {mySelectedOrder.includes(poke.kanaName) && `${mySelectedOrder.indexOf(poke.kanaName) + 1}番目`}
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