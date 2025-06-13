import React, { useState } from "react";
import {
  typeColors,
} from "../../../model/model";

const PokeStatus = ({
  isMe,
  battleState
}) => {

  //インポートする変数や関数の取得
  const {
    opPokeState, myPokeState,
  } = battleState;

  const pokeState = isMe ? myPokeState : opPokeState;


  //ステータス状況をUIに反映させる
  const renderBuffShapes = (value) => {
    const max = 6;
    const up = Math.max(0, value);
    const down = Math.max(0, -value);
    const neutral = max - up - down;

    const shapes = [];

    for (let i = 0; i < up; i++) {
      shapes.push(<span className="shape up" key={`up-${i}`}></span>);
    }
    for (let i = 0; i < down; i++) {
      shapes.push(<span className="shape down" key={`down-${i}`}></span>);
    }
    for (let i = 0; i < neutral; i++) {
      shapes.push(<span className="shape neutral" key={`neutral-${i}`}></span>);
    }

    return shapes;
  };

  const StatusRow = ({ label, value }) => (
    <div className="status-row">
      <span className="label">{label}</span>
      <span className="colon">：</span>
      <div className="buff-row">
        {renderBuffShapes(value)}
      </div>
    </div>
  );


  return (
    <div className="poke-status">
      <span className="type-wrapper">
        <p>{pokeState.name}</p>
        <span
          className="type-box"
          style={{ backgroundColor: typeColors[pokeState.type1], borderColor: typeColors[pokeState.type1] }}
        >
          {pokeState.type1}
        </span>
        {pokeState.type2 !== "なし" && (
          <span
            className="type-box"
            style={{ backgroundColor: typeColors[pokeState.type2], borderColor: typeColors[pokeState.type2] }}
          >
            {pokeState.type2}
          </span>
        )}
      </span>
      <StatusRow label="攻撃" value={pokeState.aBuff} />
      <StatusRow label="防御" value={pokeState.bBuff} />
      <StatusRow label="特攻" value={pokeState.cBuff} />
      <StatusRow label="特防" value={pokeState.dBuff} />
      <StatusRow label="素早さ" value={pokeState.sBuff} />
    </div>
  );
};

export default PokeStatus;
