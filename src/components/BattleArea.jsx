import React, { useState } from "react";
import MyHpBar from './MyHpBar';
import { motion, AnimatePresence } from "framer-motion";
import { pokeInfo, typeColors } from "../model/model";

const BattleArea = ({
  opPokeState,
  myPokeState,
  opAreaVisible,
  myAreaVisible,
}) => {

  const [myHp, setMyHp] = useState(myPokeState.h); // 初期値はmyPokeState.h
  // HPを更新するための関数
  const handleStateChange = (type, newHp) => {
    if (type === 'myHp') {
      setMyHp(newHp); // 自分のHPを更新
    }
  };

  return (
    <div className="battle-area" style={{ display: "flex" }}>
      {/* 相手のポケモンエリア */}
      <div className="op-poke-area-wrap">
        <div className="op-poke-area">
          <div className="poke-ground"></div>
          <AnimatePresence>
            {opAreaVisible.name && (
              <motion.img
                key="opPokeImg"
                src={opPokeState.img}
                alt="相手のポケモン"
                className="op-poke-img"
                initial={{ clipPath: "circle(0% at 50% 50%)" }}
                animate={{ clipPath: "circle(75% at 50% 50%)", }}
                exit={{ clipPath: "circle(0% at 50% 50%)" }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </div>
        <div className="status-box" style={{ display: opAreaVisible.name ? "block" : "none" }}>
          <div className="status-header">
            <h1 className="op-poke">
              <span>{opPokeState.name}</span>
              {pokeInfo[opPokeState.name] && (
                <span className="type-wrapper">
                  <span
                    className="type-box"
                    style={{ backgroundColor: typeColors[pokeInfo[opPokeState.name].type1], borderColor: typeColors[pokeInfo[opPokeState.name].type1] }}
                  >
                    {pokeInfo[opPokeState.name].type1}
                  </span>
                  {pokeInfo[opPokeState.name].type2 !== "なし" && (
                    <span
                      className="type-box"
                      style={{ backgroundColor: typeColors[pokeInfo[opPokeState.name].type2], borderColor: typeColors[pokeInfo[opPokeState.name].type2] }}
                    >
                      {pokeInfo[opPokeState.name].type2}
                    </span>
                  )}
                </span>
              )}
            </h1>
            <div className="poke-indicators">
              {[0, 1, 2].map((index) => {
                const hp = opPokeState[`poke${index + 1}H`];
                const fullHp = opPokeState[`poke${index + 1}FullH`];
                let color = "gray";
                if (hp === fullHp) {
                  color = "green";
                } else if (hp > 0) {
                  color = "yellow";
                }
                return <div key={index} className={`poke-circle ${color}`}></div>;
              })}
            </div>
          </div>
          <div className="op-hp-container">
            <div className="op-hp-bar"></div> {/* 色や幅はJSで操作 */}
          </div>
        </div>
      </div>

      {/* 自分のポケモンエリア */}
      <div className="my-poke-area-wrap">
        <div className="my-poke-area">
          <div className="poke-ground"></div>
          <AnimatePresence>
            {myAreaVisible.name && (
              <motion.img
                key="myPokeImg"
                src={myPokeState.img}
                alt="自分のポケモン"
                className={`my-poke-img`}
                initial={{ clipPath: "circle(0% at 50% 50%)" }}
                animate={{ clipPath: "circle(75% at 50% 50%)", }}
                exit={{ clipPath: "circle(0% at 50% 50%)" }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </div>
        <div className="status-box" style={{ display: myAreaVisible.name ? "block" : "none" }}>
          <div className="status-header">
            <h1 className="my-poke">
              <span>{myPokeState.name}</span>
              {pokeInfo[myPokeState.name] && (
                <span className="type-wrapper">
                  <span
                    className="type-box"
                    style={{ backgroundColor: typeColors[pokeInfo[myPokeState.name].type1], borderColor: typeColors[pokeInfo[myPokeState.name].type1] }}
                  >
                    {pokeInfo[myPokeState.name].type1}
                  </span>
                  {pokeInfo[myPokeState.name].type2 !== "なし" && (
                    <span
                      className="type-box"
                      style={{ backgroundColor: typeColors[pokeInfo[myPokeState.name].type2], borderColor: typeColors[pokeInfo[myPokeState.name].type2] }}
                    >
                      {pokeInfo[myPokeState.name].type2}
                    </span>
                  )}
                </span>
              )}
            </h1>
            <div className="poke-indicators">
              {[0, 1, 2].map((index) => {
                const hp = myPokeState[`poke${index + 1}H`];
                const fullHp = myPokeState[`poke${index + 1}FullH`];
                let color = "gray";
                if (hp === fullHp) {
                  color = "green";
                } else if (hp > 0) {
                  color = "yellow";
                }
                return <div key={index} className={`poke-circle ${color}`}></div>;
              })}
            </div>
          </div>
          <MyHpBar
            myPokeState={myPokeState} // 必要な状態を渡す
            pokeInfo={pokeInfo}       // ポケモンの情報を渡す
            updateHp={(newHp) => handleStateChange('myHp', newHp)} // HP更新関数を渡す
          />
        </div>
      </div>
    </div>
  );
};

export default BattleArea;
