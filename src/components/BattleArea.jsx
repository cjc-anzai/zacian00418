import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const BattleArea = ({
  opPokeState,
  myPokeState,
  opAreaVisible,
  myAreaVisible,
}) => {
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
                animate={{clipPath: "circle(75% at 50% 50%)",}}
                exit={{ clipPath: "circle(0% at 50% 50%)" }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </div>
        {opAreaVisible.name && (
          <div className="status-box">
            <div className="status-header">
              <h1 className="op-poke">{opPokeState.name}</h1>
              <div className="poke-indicators">
                {[opPokeState.poke1Hp, opPokeState.poke2Hp, opPokeState.poke3Hp].map((hp, index) => {
                  let color = "gray";
                  if (hp === 100) color = "green";
                  else if (hp > 0) color = "yellow";
                  return <div key={index} className={`poke-circle ${color}`}></div>;
                })}
              </div>
            </div>
            <div className="op-hp-container">
              <div
                className={`op-hp-bar ${opPokeState.hp <= 25 ? "low" : opPokeState.hp <= 50 ? "mid" : ""}`}
                style={{ width: `${opPokeState.hp}%` }}
              ></div>
            </div>
          </div>
        )}
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
                animate={{ clipPath: "circle(75% at 50% 50%)",}}
                exit={{ clipPath: "circle(0% at 50% 50%)" }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </div>
        {myAreaVisible.name && (
          <div className="status-box">
            <div className="status-header">
              <h1 className="my-poke">{myPokeState.name}</h1>
              <div className="poke-indicators">
                {[myPokeState.poke1Hp, myPokeState.poke2Hp, myPokeState.poke3Hp].map((hp, index) => {
                  let color = "gray";
                  if (hp === 100) color = "green";
                  else if (hp > 0) color = "yellow";
                  return <div key={index} className={`poke-circle ${color}`}></div>;
                })}
              </div>
            </div>
            <div className="my-hp-container">
              <div
                className={`my-hp-bar ${myPokeState.hp <= 25 ? "low" : myPokeState.hp <= 50 ? "mid" : ""}`}
                style={{ width: `${myPokeState.hp}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleArea;
