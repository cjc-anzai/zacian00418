import React from "react";
import "../../css/PokemonDetailModal.css";

const PokemonDetailModal = ({ pokeInfo, onClose }) => {
  if (!pokeInfo) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{pokeInfo.name}の詳細</h2>

        {/* ここに詳細内容を記述してください */}
        <div className="detail-body">
          <img src={pokeInfo.img} alt={pokeInfo.name} style={{ width: "150px" }} />
          <p>タイプ : {pokeInfo.type1} / {pokeInfo.type2}</p>
          <p>テラスタル : {pokeInfo.terastal}</p>
          <p>HP:{pokeInfo.h} 攻撃:{pokeInfo.a} 防御:{pokeInfo.b} 特攻:{pokeInfo.c} 特防:{pokeInfo.d} 素早さ:{pokeInfo.s}</p>
          <p>技構成 : {pokeInfo.weapon1} / {pokeInfo.weapon2} / {pokeInfo.weapon3} / {pokeInfo.weapon4}</p>
        </div>

        <div className="modal-footer">
          <button className="close-btn" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetailModal;