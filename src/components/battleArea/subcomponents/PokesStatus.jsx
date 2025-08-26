import React, { useState } from "react";
import {
  typeColors,
} from "../../../model/model";

const PokesStatus = ({
  isMe,
  battleState,
  battleHandlers
}) => {

  //インポートする変数や関数の取得
  const { } = battleState;
  const { getBattlePokeStatics, getBattlePokeDynamics, } = battleHandlers;

  const battlePokeStatics = getBattlePokeStatics(isMe);
  const battlePokeDynamics = getBattlePokeDynamics(isMe);

  //ステータス状況をUIに反映させる
  const renderBuffShapes = (value) => {
    const max = 6;
    const up = Math.max(0, value);
    const down = Math.max(0, -value);
    const neutral = max - up - down;
    const shapes = [];
    for (let i = 0; i < up; i++) 
      shapes.push(<span className="shape up" key={`up-${i}`}></span>);
    for (let i = 0; i < down; i++) 
      shapes.push(<span className="shape down" key={`down-${i}`}></span>);
    for (let i = 0; i < neutral; i++) 
      shapes.push(<span className="shape neutral" key={`neutral-${i}`}></span>);
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
        <p>{battlePokeStatics.name}</p>
        <span
          className="type-box"
          style={{ backgroundColor: typeColors[battlePokeStatics.type1], borderColor: typeColors[battlePokeStatics.type1] }}
        >
          {battlePokeStatics.type1}
        </span>
        {battlePokeStatics.type2 !== "なし" && (
          <span
            className="type-box"
            style={{ backgroundColor: typeColors[battlePokeStatics.type2], borderColor: typeColors[battlePokeStatics.type2] }}
          >
            {battlePokeStatics.type2}
          </span>
        )}
      </span>
      <StatusRow label="攻撃" value={battlePokeDynamics.aBuff} />
      <StatusRow label="防御" value={battlePokeDynamics.bBuff} />
      <StatusRow label="特攻" value={battlePokeDynamics.cBuff} />
      <StatusRow label="特防" value={battlePokeDynamics.dBuff} />
      <StatusRow label="素早さ" value={battlePokeDynamics.sBuff} />
    </div>
  );
};

export default PokesStatus;
