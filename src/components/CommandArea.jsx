import React, { useState } from "react";
import { pokeInfo, weaponInfo, typeChart } from "../model/model";

const CommandArea = ({
  otherAreaVisible,
  opAreaVisible,
  myAreaVisible,
  opPokeState,
  myPokeState,
  getTrueText,
  openBattleCmdArea,
  openChangeCmdArea,
  backCmd,
  battle,
  changeMyPoke,
  nextMyPoke,
}) => {

  const [weaponInfoTooltip, setWeaponInfoTooltip] = useState(null);

  const handleMouseEnter = (weapon) => {
    const weaponType = weaponInfo[weapon].type;
    const opPokeType1 = pokeInfo[opPokeState.name].type1;
    const opPokeType2 = pokeInfo[opPokeState.name].type2;

    // 技相性を計算
    const typeEffectiveness = calculateEffectiveness(weaponType, opPokeType1, opPokeType2);

    setWeaponInfoTooltip({
      type: weaponType,
      kind: weaponInfo[weapon].kind === "physical" ? "物理" : "特殊",
      power: weaponInfo[weapon].power,
      effectiveness: typeEffectiveness,
    });
  };

  const handleMouseLeave = () => {
    setWeaponInfoTooltip(null);
  };

  // 相性計算
  const calculateEffectiveness = (weaponType, opPokeType1, opPokeType2) => {
    const effectiveness = (typeChart[weaponType][opPokeType1] ?? 1) * (typeChart[weaponType][opPokeType2] ?? 1); // 技タイプと相手タイプから相性を取得

    if (effectiveness >= 2) {
      return "効果ばつぐん";
    } else if (effectiveness === 1) {
      return "効果あり";
    } else if (effectiveness < 1 && effectiveness > 0) {
      return "いまひとつ";
    } else {
      return "効果なし";
    }
  };

  return (
    <div className="cmd-text-area">
      {otherAreaVisible.text && (
        <div className="text-area">
          {opAreaVisible.text && <p>{getTrueText(opPokeState.text)}</p>}
          {myAreaVisible.text && <p>{getTrueText(myPokeState.text)}</p>}
          {otherAreaVisible.critical && <p>急所に当たった</p>}
        </div>
      )}

      {otherAreaVisible.actionCmd && (
        <div className="cmd-area">
          <button className="weapon-cmd-btn" onClick={openBattleCmdArea}>たたかう</button>
          {myPokeState.life !== 1 && (
            <button className="change-cmd-btn" onClick={openChangeCmdArea}>交代</button>
          )}
        </div>
      )}

      {otherAreaVisible.weaponCmd && (
        <div className="cmd-area">
          <button
            className="weapon-cmd-btn"
            onClick={() => battle(pokeInfo[myPokeState.name].weapon1)}
            onMouseEnter={() => handleMouseEnter(pokeInfo[myPokeState.name].weapon1)}
            onMouseLeave={handleMouseLeave}
          >
            {pokeInfo[myPokeState.name].weapon1}
          </button>

          <button
            className="weapon-cmd-btn"
            onClick={() => battle(pokeInfo[myPokeState.name].weapon2)}
            onMouseEnter={() => handleMouseEnter(pokeInfo[myPokeState.name].weapon2)}
            onMouseLeave={handleMouseLeave}
          >
            {pokeInfo[myPokeState.name].weapon2}
          </button>

          {weaponInfoTooltip && (
            <div className="tooltip">
              <p>タイプ: {weaponInfoTooltip.type}</p>
              <p>種類: {weaponInfoTooltip.kind}</p>
              <p>威力: {weaponInfoTooltip.power}</p>
              <p>技相性: {weaponInfoTooltip.effectiveness}</p> {/* 相性表示 */}
            </div>
          )}
          <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
        </div>
      )}

      {otherAreaVisible.changeCmd && (
        <div className="cmd-area">
          {myPokeState.name !== myPokeState.poke1Name && myPokeState.poke1H > 0 && (
            <button className="change-cmd-btn" onClick={() => changeMyPoke(myPokeState.poke1Name)}>
              {myPokeState.poke1Name}
            </button>
          )}
          {myPokeState.name !== myPokeState.poke2Name && myPokeState.poke2H > 0 && (
            <button className="change-cmd-btn" onClick={() => changeMyPoke(myPokeState.poke2Name)}>
              {myPokeState.poke2Name}
            </button>
          )}
          {myPokeState.name !== myPokeState.poke3Name && myPokeState.poke3H > 0 && (
            <button className="change-cmd-btn" onClick={() => changeMyPoke(myPokeState.poke3Name)}>
              {myPokeState.poke3Name}
            </button>
          )}
          <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
        </div>
      )}

      {otherAreaVisible.nextPokeCmd && (
        <div className="cmd-area">
          {myPokeState.name !== myPokeState.poke1Name && myPokeState.poke1H > 0 && (
            <button className="change-cmd-btn" onClick={() => nextMyPoke(myPokeState.poke1Name)}>
              {myPokeState.poke1Name}
            </button>
          )}
          {myPokeState.name !== myPokeState.poke2Name && myPokeState.poke2H > 0 && (
            <button className="change-cmd-btn" onClick={() => nextMyPoke(myPokeState.poke2Name)}>
              {myPokeState.poke2Name}
            </button>
          )}
          {myPokeState.name !== myPokeState.poke3Name && myPokeState.poke3H > 0 && (
            <button className="change-cmd-btn" onClick={() => nextMyPoke(myPokeState.poke3Name)}>
              {myPokeState.poke3Name}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommandArea;
