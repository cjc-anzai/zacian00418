import React from "react";
import { soundList, delay } from "../model/model";

const SelectScreen = ({ battleState, battleHandlers, }) => {

  //インポートする変数や関数の取得
  const { setOtherAreaVisible, selectedOrder, setSelectedOrder } = battleState;
  const { setBgm, playBgm, getPokeInfo, setBattleInfo, selectBetterOpPokes } = battleHandlers;

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
    setSelectedOrder((prev) => {
      if (prev.includes(pokeName))
        return prev.filter((name) => name !== pokeName); // クリックで解除
      if (prev.length < 3)
        return [...prev, pokeName]; // 3体まで選択OK
      return prev; // 3体以上は無視
    });
  };

  //選出確定ボタン
  const confirmSelection = async () => {
    soundList.general.decide.cloneNode().play();
    setOtherAreaVisible(prev => ({ ...prev, select: false, battle: true }));
    setBgm("battle");
    delay(() => playBgm(), 50);

    //お互いの選出する３体をまとめる
    const mySelectedOrder = selectedOrder;

    //通常選出(相手は自分の６体に対して相性の良い３体を選ぶ)
    // const opSelectedOrder = await selectBetterOpPokes(myPokesKanaName, opPokesKanaName);
    
    //ハードモード(相手は自分が選択した３体に対して相性の良い３体を選ぶ)
    const opSelectedOrder = await selectBetterOpPokes(mySelectedOrder, opPokesKanaName);
    
    //テスト用で相手の選出を固定
    // const opSelectedOrder = ["ラプラス", "エルレイド", "グライオン"];

    //DBから6体のポケモンの最大HPを取得
    const [myPokeInfos, opPokeInfos] = await Promise.all([
      Promise.all(mySelectedOrder.map(getPokeInfo)),
      Promise.all(opSelectedOrder.map(getPokeInfo))
    ]);

    setBattleInfo(myPokeInfos, opPokeInfos);
  };

  return (
    <div className="select-area">
      <div className="content">
        <h2>相手のポケモン</h2>
        <div className="op-poke-select">
          <div className="poke-preview">
            <img src={getPokeImg(opPokesRomaName[0])} alt={opPokesKanaName[0]} />
            <p>{opPokesKanaName[0]}</p>
          </div>
          <div className="poke-preview">
            <img src={getPokeImg(opPokesRomaName[1])} alt={opPokesKanaName[1]} />
            <p>{opPokesKanaName[1]}</p>
          </div>
          <div className="poke-preview">
            <img src={getPokeImg(opPokesRomaName[2])} alt={opPokesKanaName[2]} />
            <p>{opPokesKanaName[2]}</p>
          </div>
          <div className="poke-preview">
            <img src={getPokeImg(opPokesRomaName[3])} alt={opPokesKanaName[3]} />
            <p>{opPokesKanaName[3]}</p>
          </div>
          <div className="poke-preview">
            <img src={getPokeImg(opPokesRomaName[4])} alt={opPokesKanaName[4]} />
            <p>{opPokesKanaName[4]}</p>
          </div>
          <div className="poke-preview">
            <img src={getPokeImg(opPokesRomaName[5])} alt={opPokesKanaName[5]} />
            <p>{opPokesKanaName[5]}</p>
          </div>
        </div>

        <h2>自分のポケモンを選出</h2>
        <div className="my-poke-select">
          {[{ name: myPokesKanaName[0], img: getPokeImg(myPokesRomaName[0]) }, { name: myPokesKanaName[1], img: getPokeImg(myPokesRomaName[1]) },
          { name: myPokesKanaName[2], img: getPokeImg(myPokesRomaName[2]) }, { name: myPokesKanaName[3], img: getPokeImg(myPokesRomaName[3]) },
          { name: myPokesKanaName[4], img: getPokeImg(myPokesRomaName[4]) }, { name: myPokesKanaName[5], img: getPokeImg(myPokesRomaName[5]) },].map((poke) => (
            <div
              key={poke.name}
              className={`poke-option ${selectedOrder.includes(poke.name) ? "selected" : ""}`}
              onClick={() => handleSelect(poke.name)}
            >
              <img src={poke.img} alt={poke.name} />
              <p>{poke.name}</p>
              <p className="order-num">
                {selectedOrder.includes(poke.name) && <span>{selectedOrder.indexOf(poke.name) + 1}番目</span>}
              </p>
            </div>
          ))}
        </div>

        <div className="select-actions">
          <button
            className={selectedOrder.length === 3 ? "active" : "inactive"}
            onClick={confirmSelection}
            disabled={selectedOrder.length !== 3}
          >
            バトル開始！
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectScreen;