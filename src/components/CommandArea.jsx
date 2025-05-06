import React, { useState } from "react";
import { typeChart } from "../model/model";

const CommandArea = ({
  battleHandlers,
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

  const handleMouseEnter = async (weapon) => {
    const opPokeType1 = opPokeState.type1;
    const opPokeType2 = opPokeState.type2;

    //技の情報を取得
    const [weaponType, weaponKind, weaponPower, hitRate, priority] = await Promise.all([
      battleHandlers.getWeaponInfo(weapon, "Type"),    //技タイプ
      battleHandlers.getWeaponInfo(weapon, "Kind"),    //物理or特殊
      battleHandlers.getWeaponInfo(weapon, "Power"),   //技威力
      battleHandlers.getWeaponInfo(weapon, "HitRate"),
      battleHandlers.getWeaponInfo(weapon, "Priority"),      
    ]);

    // 技相性を計算
    const typeEffectiveness = calculateEffectiveness(weaponType, opPokeType1, opPokeType2);

    setWeaponInfoTooltip({
      type: weaponType,
      kind: weaponKind,
      power: weaponPower,
      hitRate: hitRate,
      priority: priority,
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
          {opAreaVisible.text && !otherAreaVisible.notHit && <p>{getTrueText(opPokeState.text)}</p>}
          {myAreaVisible.text && !otherAreaVisible.notHit && <p>{getTrueText(myPokeState.text)}</p>}
          {otherAreaVisible.notHit && <p>{myPokeState.text.includes(myPokeState.name) ? opPokeState.name : myPokeState.name}には当たらなかった</p>}
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
            onClick={() => battle(myPokeState.weapon1)}
            onMouseEnter={() => handleMouseEnter(myPokeState.weapon1)}
            onMouseLeave={handleMouseLeave}
          >
            {myPokeState.weapon1}
          </button>

          <button
            className="weapon-cmd-btn"
            onClick={() => battle(myPokeState.weapon2)}
            onMouseEnter={() => handleMouseEnter(myPokeState.weapon2)}
            onMouseLeave={handleMouseLeave}
          >
            {myPokeState.weapon2}
          </button>

          {myPokeState.weapon3 !== "なし" && (
            <button
              className="weapon-cmd-btn"
              onClick={() => battle(myPokeState.weapon3)}
              onMouseEnter={() => handleMouseEnter(myPokeState.weapon3)}
              onMouseLeave={handleMouseLeave}
            >
              {myPokeState.weapon3}
            </button>
          )}

          {myPokeState.weapon4 !== "なし" && (
            <button
              className="weapon-cmd-btn"
              onClick={() => battle(myPokeState.weapon4)}
              onMouseEnter={() => handleMouseEnter(myPokeState.weapon4)}
              onMouseLeave={handleMouseLeave}
            >
              {myPokeState.weapon4}
            </button>
          )}

          {weaponInfoTooltip && (
            <div className="tooltip">
              <p>タイプ: {weaponInfoTooltip.type}</p>
              <p>種類: {weaponInfoTooltip.kind}</p>
              <p>威力: {weaponInfoTooltip.power}</p>
              <p>命中率: {weaponInfoTooltip.hitRate}</p>
              <p>優先度: {weaponInfoTooltip.priority}</p>
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
