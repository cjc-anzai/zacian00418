import React, { useState } from "react";
import { soundList, typeColors } from "../../../../js/constants";
import StatusArea from "./StatusArea";

const CommandTextArea = ({ battleStates, battleControllers, battleExecutors, }) => {
  //インポートする変数や関数の取得
  const {
    areaVisible, setAreaVisible,
    textAreaRef,
    isTerastalActive, setIsTerastalActive,
    myPokeStatics, opPokeStatics,
    myPokeDynamics,
    myBattlePokeIndex, opBattlePokeIndex,
    myTerastalState,
    selectedWeaponIndex, setSelectedWeaponIndex,
    selectedPokeIndex, setSelectedPokeIndex,
  } = battleStates;

  const {
    handleWeaponBtnClick,
    handleChangePokeClick,
    handleNextPokeBtnClick,
  } = battleControllers;

  const {
    checkIsTerastal,
    getWeaponInfoList,
    playTerastalBtnSound,
    getCompatiTextForWeaponInfoList,
  } = battleExecutors;

  const isTerastal = checkIsTerastal(true);

  //たたかうボタン押下時
  const openBattleCmdArea = () => {
    soundList.general.decide.cloneNode().play();
    setAreaVisible(prev => ({ ...prev, actionCmd: false, weaponCmd: true }));
  }

  //交代ボタン押下時
  const openChangeCmdArea = () => {
    soundList.general.decide.cloneNode().play();
    setAreaVisible(prev => ({ ...prev, actionCmd: false, changeCmd: true }));
  }

  //ステータスボタン押下時
  const openStatusArea = () => {
    soundList.general.decide.cloneNode().play();
    setAreaVisible(prev => ({ ...prev, actionCmd: false, status: true }));
  }

  // 戻るボタン押下時
  const backCmd = () => {
    soundList.general.cancel.cloneNode().play();
    setSelectedWeaponIndex(null);
    setSelectedPokeIndex(null);
    setIsTerastalActive(false);
    setAreaVisible(prev => ({ ...prev, actionCmd: true, weaponCmd: false, changeCmd: false, status: false }));
  }

  // 技詳細ボタン/閉じるボタン押下時
  const toggleWeaponDetail = (weaponIndex) => {
    if (selectedWeaponIndex === weaponIndex) {
      // 同じボタンがクリックされたら詳細を閉じる
      soundList.general.cancel.cloneNode().play();
      setSelectedWeaponIndex(null);
    } else {
      // 別の詳細ボタンがクリックされたら詳細を開く
      soundList.general.decide.cloneNode().play();
      setSelectedWeaponIndex(weaponIndex);
    }
  }

  // ポケモン詳細ボタン/閉じるボタン押下時
  const togglePokeDetail = (pokeIndex) => {
    if (selectedPokeIndex === pokeIndex) {
      // 同じボタンがクリックされたら詳細を閉じる
      soundList.general.cancel.cloneNode().play();
      setSelectedPokeIndex(null);
    } else {
      // 別の詳細ボタンがクリックされたら詳細を開く
      soundList.general.decide.cloneNode().play();
      setSelectedPokeIndex(pokeIndex);
    }
  }

  //テラスタルボタン押下時
  const togglTerastal = () => {
    playTerastalBtnSound();
    setIsTerastalActive(prev => !prev);
  }

  const getWeaponInfo = (weaponIndex) => {
    const { type, kind, power, hitRate, priority, explanation } = getWeaponInfoList(weaponIndex);
    const compatiText = getCompatiTextForWeaponInfoList(type, opPokeStatics.current[opBattlePokeIndex].type1, opPokeStatics.current[opBattlePokeIndex].type2);
    return { type, kind, power, hitRate, priority, compatiText, explanation };
  }

  const getPokeInfoForDetail = (pokeIndex) => {
    const statics = myPokeStatics.current[pokeIndex];
    const dynamics = myPokeDynamics[pokeIndex];
    const terastalType = checkIsTerastal(true, pokeIndex) ? statics.terastal : null;
    return { ...statics, ...dynamics, terastalType };
  }

  // ポケモン詳細ツールチップコンポーネント
  const PokeDetailTooltip = () => {
    if (selectedPokeIndex === null) {
      return null;
    }

    const pokeInfo = getPokeInfoForDetail(selectedPokeIndex);
    return (
      <div className="tooltip">
        <p>{pokeInfo.name}</p>
        <p>タイプ:{pokeInfo.type1}{pokeInfo.type2 !== "なし" && `・${pokeInfo.type2}`}</p>
        <p>テラスタイプ：{pokeInfo.terastal}</p>
        <p>HP: {pokeInfo.currentHp} / {pokeInfo.hp}</p>
        <p>状態異常: {pokeInfo.condition || "なし"}</p>
        <p>{pokeInfo.weapon1} | {pokeInfo.weapon2}</p>
        <p>{pokeInfo.weapon3} | {pokeInfo.weapon4}</p>
      </div>
    );
  };




  return (
    <div className="cmd-text-area">
      {areaVisible.textArea && (
        <div ref={textAreaRef} className="text-area"></div>
      )}

      {!areaVisible.textArea && (areaVisible.actionCmd || areaVisible.weaponCmd || areaVisible.changeCmd || areaVisible.nextPokeCmd) && (
        <div className="cmd-area" style={{ height: areaVisible.weaponCmd ? '80%' : '40%' }}>
          {areaVisible.actionCmd && (
            <div className="action-cmd-area">
              <button className="green" onClick={openBattleCmdArea}>たたかう</button>
              <button className="light-blue" onClick={openChangeCmdArea}>交代</button>
              <button className="white" onClick={openStatusArea}>ステータス</button>
            </div>
          )}
          {areaVisible.weaponCmd && (
            <div className="weapon-cmd-area">
              <div className="weapon-cmd-btns">
                <div className="weapon-btn-wrap">
                  <button
                    className="weapon-cmd-btn"
                    onClick={() => handleWeaponBtnClick(0)}
                  >
                    {myPokeStatics.current[myBattlePokeIndex].weapon1}
                  </button>
                  <button className="weapon-detail-btn" onClick={() => toggleWeaponDetail(0)}>{selectedWeaponIndex === 0 ? "閉じる" : "詳細"}</button>
                </div>
                <div className="weapon-btn-wrap">
                  <button
                    className="weapon-cmd-btn"
                    onClick={() => handleWeaponBtnClick(1)}
                  >
                    {myPokeStatics.current[myBattlePokeIndex].weapon2}
                  </button>
                  <button className="weapon-detail-btn" onClick={() => toggleWeaponDetail(1)}>{selectedWeaponIndex === 1 ? "閉じる" : "詳細"}</button>
                </div>
                <div className="weapon-btn-wrap">
                  <button
                    className="weapon-cmd-btn"
                    onClick={() => handleWeaponBtnClick(2)}
                  >
                    {myPokeStatics.current[myBattlePokeIndex].weapon3}
                  </button>
                  <button className="weapon-detail-btn" onClick={() => toggleWeaponDetail(2)}>{selectedWeaponIndex === 2 ? "閉じる" : "詳細"}</button>
                </div>
                <div className="weapon-btn-wrap">
                  <button
                    className="weapon-cmd-btn"
                    onClick={() => handleWeaponBtnClick(3)}
                  >
                    {myPokeStatics.current[myBattlePokeIndex].weapon4}
                  </button>
                  <button className="weapon-detail-btn" onClick={() => toggleWeaponDetail(3)}>{selectedWeaponIndex === 3 ? "閉じる" : "詳細"}</button>
                </div>
              </div>
              <div className="other-btns">
                <button
                  onClick={togglTerastal}
                  disabled={!myTerastalState.canTerastal}
                  className={`terastal-cmd-btn ${isTerastalActive || isTerastal ? 'active' : ''}`}
                  style={isTerastalActive || isTerastal ? { backgroundColor: typeColors[myPokeStatics.current[myBattlePokeIndex].terastal] } : undefined}
                >
                  {isTerastalActive || isTerastal ? myPokeStatics.current[myBattlePokeIndex].terastal : "テラスタル"}
                </button>
                <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
              </div>

              {selectedWeaponIndex !== null && (() => {
                const weaponInfo = getWeaponInfo(selectedWeaponIndex);
                return (
                  <div className="tooltip">
                    <p>タイプ: {weaponInfo.type}</p>
                    <p>種類: {weaponInfo.kind}</p>
                    <p>威力: {weaponInfo.power}</p>
                    <p>命中率: {weaponInfo.hitRate}</p>
                    <p>優先度: {weaponInfo.priority}</p>
                    <p>技相性: {weaponInfo.compatiText}</p>
                    <p>説明: {weaponInfo.explanation}</p>
                  </div>
                );
              })()}
            </div>
          )}
          {areaVisible.changeCmd && (
            <div className="change-cmd-area">
              {[0, 1, 2].map(i => {
                const name = myPokeStatics.current[i].name;
                const hp = myPokeDynamics[i].currentHp;

                return (
                  (name !== myPokeStatics.current[myBattlePokeIndex].name && hp > 0) &&
                  <div key={name} className="poke-btn-wrap">
                    <button className="change-cmd-btn" onClick={() => handleChangePokeClick(i)}>
                      {name}
                    </button>
                    <button className="poke-detail-btn" onClick={() => togglePokeDetail(i)}>
                      {selectedPokeIndex === i ? "閉じる" : "詳細"}
                    </button>
                  </div>
                );
              })}
              <PokeDetailTooltip />
              <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
            </div>
          )}
          {areaVisible.nextPokeCmd && (
            <div className="next-poke-cmd-area">
              {[0, 1, 2].map(i => {
                const name = myPokeStatics.current[i].name;
                const hp = myPokeDynamics[i].currentHp;

                return (
                  (name !== myPokeStatics.current[myBattlePokeIndex].name && hp > 0) &&
                  <div key={name} className="poke-btn-wrap">
                    <button className="change-cmd-btn" onClick={() => handleNextPokeBtnClick(i)}>
                      {name}
                    </button>
                    <button className="poke-detail-btn" onClick={() => togglePokeDetail(i)}>
                      {selectedPokeIndex === i ? "閉じる" : "詳細"}
                    </button>
                  </div>
                );
              })}
              <PokeDetailTooltip />
            </div>
          )}
        </div>
      )}

      {areaVisible.status && (
        <div className="status-area-wrap">
          <div className="status-area">
            <StatusArea isMe={false} battleStates={battleStates} battleExecutors={battleExecutors} />
            <StatusArea isMe={true} battleStates={battleStates} battleExecutors={battleExecutors} />
          </div>
          <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
        </div>
      )}
    </div >
  );
};

export default CommandTextArea;
