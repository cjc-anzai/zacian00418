import React from "react";

const SelectScreen = ({ selectedOrder, handleSelect, confirmSelection }) => {

    const getPokeImg = (pokeName) => {
      const url = `https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/pokeImg/${pokeName}.png`
      return url;
    }

    return (
      <div className="select-area">
        <div className="content">
          <h2>相手のポケモン</h2>
          <div className="op-poke-select">
            <div className="poke-preview">
              <img src={getPokeImg("diaruga")} alt="ディアルガ" />
              <p>ディアルガ</p>
            </div>
            <div className="poke-preview">
              <img src={getPokeImg("genga")} alt="ゲンガー" />
              <p>ゲンガー</p>
            </div>
            <div className="poke-preview">
              <img src={getPokeImg("rizadon")} alt="リザードン" />
              <p>リザードン</p>
            </div>
            <div className="poke-preview">
              <img src={getPokeImg("raguraji")} alt="ラグラージ" />
              <p>ラグラージ</p>
            </div>
            <div className="poke-preview">
              <img src={getPokeImg("kairiki")} alt="カイリキー" />
              <p>カイリキー</p>
            </div>
            <div className="poke-preview">
              <img src={getPokeImg("sanaito")} alt="サーナイト" />
              <p>サーナイト</p>
            </div>
          </div>
  
          <h2>自分のポケモンを選出</h2>
          <div className="my-poke-select">
            {[{ name: "パルキア", img: getPokeImg("parukia") }, { name: "ルカリオ", img: getPokeImg("rukario") },
              { name: "ピカチュウ", img: getPokeImg("pikachu") }, { name: "マニューラ", img: getPokeImg("manyura") },
              { name: "ドダイトス", img: getPokeImg("dodaitosu") }, { name: "メガヤンマ", img: getPokeImg("megayanma") },].map((poke) => (
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