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

  const [weaponInfoList, setWeaponInfoList] = useState(null);
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
    setIsTerastalActive(false);
    setAreaVisible(prev => ({ ...prev, actionCmd: true, weaponCmd: false, changeCmd: false, status: false }));
  }

  //技ボタンマウスオーバー時
  const handleMouseEnter = (weaponIndex) => {
    const { type, kind, power, hitrate, priority } = getWeaponInfoList(weaponIndex);
    const compatiText = getCompatiTextForWeaponInfoList(type, opPokeStatics.current[opBattlePokeIndex].type1, opPokeStatics.current[opBattlePokeIndex].type2);
    setWeaponInfoList({ type, kind, power, hitrate, priority, compatiText });
  }

  //マウスオーバー解除時
  const handleMouseLeave = () => {
    setWeaponInfoList(null);
  }

  //テラスタルボタン押下時
  const togglTerastal = () => {
    playTerastalBtnSound();
    setIsTerastalActive(prev => !prev);
  }


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
                <button
                  className="weapon-cmd-btn"
                  onClick={() => handleWeaponBtnClick(0)}
                  onMouseEnter={() => handleMouseEnter(0)}
                  onMouseLeave={handleMouseLeave}
                >
                  {myPokeStatics.current[myBattlePokeIndex].weapon1}
                </button>
                <button
                  className="weapon-cmd-btn"
                  onClick={() => handleWeaponBtnClick(1)}
                  onMouseEnter={() => handleMouseEnter(1)}
                  onMouseLeave={handleMouseLeave}
                >
                  {myPokeStatics.current[myBattlePokeIndex].weapon2}
                </button>
                <button
                  className="weapon-cmd-btn"
                  onClick={() => handleWeaponBtnClick(2)}
                  onMouseEnter={() => handleMouseEnter(2)}
                  onMouseLeave={handleMouseLeave}
                >
                  {myPokeStatics.current[myBattlePokeIndex].weapon3}
                </button>
                <button
                  className="weapon-cmd-btn"
                  onClick={() => handleWeaponBtnClick(3)}
                  onMouseEnter={() => handleMouseEnter(3)}
                  onMouseLeave={handleMouseLeave}
                >
                  {myPokeStatics.current[myBattlePokeIndex].weapon4}
                </button>
              </div>
              <div className="other-btns">
                <button
                  onClick={() => togglTerastal()}
                  disabled={!myTerastalState.canTerastal}
                  className={`terastal-cmd-btn ${isTerastalActive || isTerastal ? 'active' : ''}`}
                  style={isTerastalActive || isTerastal ? { backgroundColor: typeColors[myPokeStatics.current[myBattlePokeIndex].terastal] } : undefined}
                >
                  {isTerastalActive || isTerastal ? myPokeStatics.current[myBattlePokeIndex].terastal : "テラスタル"}
                </button>
                <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
              </div>

              {weaponInfoList && (
                <div className="tooltip">
                  <p>タイプ: {weaponInfoList.type}</p>
                  <p>種類: {weaponInfoList.kind}</p>
                  <p>威力: {weaponInfoList.power}</p>
                  <p>命中率: {weaponInfoList.hitrate}</p>
                  <p>優先度: {weaponInfoList.priority}</p>
                  <p>技相性: {weaponInfoList.compatiText}</p>
                </div>
              )}
            </div>
          )}
          {areaVisible.changeCmd && (
            <div className="change-cmd-area">
              {[0, 1, 2].map(i => {
                const name = myPokeStatics.current[i].name;
                const hp = myPokeDynamics[i].currentHp;

                return (
                  name !== myPokeStatics.current[myBattlePokeIndex].name && hp > 0 && (
                    <button key={name} className="change-cmd-btn" onClick={() => handleChangePokeClick(i)}>
                      {name}
                    </button>
                  )
                );
              })}
              <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
            </div>
          )}
          {areaVisible.nextPokeCmd && (
            <div className="next-poke-cmd-area">
              {[0, 1, 2].map(i => {
                const name = myPokeStatics.current[i].name;
                const hp = myPokeDynamics[i].currentHp;

                return (
                  name !== myPokeStatics.current[myBattlePokeIndex].name && hp > 0 && (
                    <button key={name} className="change-cmd-btn" onClick={() => handleNextPokeBtnClick(i)}>
                      {name}
                    </button>
                  )
                );
              })}
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
