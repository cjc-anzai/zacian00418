import React, { useState } from "react";
import {soundList, typeColors, getCompatiTextForWeaponInfoList, delay,} from "../../../model/model";
import PokesStatus from "./PokesStatus";

const CommandArea = ({ battleState, battleHandlers,}) => {
  //インポートする変数や関数の取得
  const {
    otherAreaVisible, setOtherAreaVisible,
    mySelectedWeaponInfo,
    isTerastalActive, setIsTerastalActive,
    textAreaRef,
    iAmFirst,
    myChangePokeIndex,
    myChangeTurn,
    myPokeStatics, opPokeStatics,
    myPokeDynamics,
    myBattlePokeIndex, opBattlePokeIndex,
    myWeapons,
    myTerastalState, 
  } = battleState;

  const {
    setMyTurn,
    setBackText,
    decideOpAction,
    setTextWhenClickWeaponBtn,
    checkIsTerastal,
    changeFnc1,
    setBattlePokeIndex,
  } = battleHandlers;

  const [weaponInfoList, setWeaponInfoList] = useState(null);

  const isTerastal = checkIsTerastal(true);

  //たたかうボタン押下時、コマンド表示を切り替える
  const openBattleCmdArea = () => {
    soundList.general.decide.cloneNode().play();
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, weaponCmd: true }));
  };

  //交代ボタン押下時、コマンド表示を切り替える
  const openChangeCmdArea = () => {
    soundList.general.decide.cloneNode().play();
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, changeCmd: true }));
  };

  //ステータスボタン押下時、コマンド表示を切り替える
  const openStatusArea = () => {
    soundList.general.decide.cloneNode().play();
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, status: true }));
  };

  // 戻るボタン押下時、コマンド表示を切り替える
  const backCmd = () => {
    soundList.general.cancel.cloneNode().play();
    setIsTerastalActive(false);
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true, weaponCmd: false, changeCmd: false, status: false }));
  };

  //技ボタンマウスオーバー時に技情報をセットする
  const handleMouseEnter = async (weaponIndex) => {
    //技の情報を取得
    const [type, kind, power, hitrate, priority] = [
      myWeapons.current[myBattlePokeIndex][weaponIndex].type,
      myWeapons.current[myBattlePokeIndex][weaponIndex].kind,
      myWeapons.current[myBattlePokeIndex][weaponIndex].power,
      myWeapons.current[myBattlePokeIndex][weaponIndex].hitrate,
      myWeapons.current[myBattlePokeIndex][weaponIndex].priority,
    ]
    const compatiText = getCompatiTextForWeaponInfoList(type, opPokeStatics.current[opBattlePokeIndex].type1, opPokeStatics.current[opBattlePokeIndex].type2);
    //表示する技情報としてセットする
    setWeaponInfoList({ type, kind, power, hitrate, priority, compatiText });
  };

  //マウスオーバー解除時にセットした情報を消去する
  const handleMouseLeave = () => {
    setWeaponInfoList(null);
  };

  //テラスタルボタン押下時、状態を切り替える
  const togglTerastal = () => {
    isTerastalActive
      ? soundList.general.cancel.cloneNode().play()
      : soundList.general.terastal.cloneNode().play();
    setIsTerastalActive(prev => !prev);
  }

  //技名ボタン押下時
  const setWeapons = async (weaponIndex) => {
    soundList.general.decide.cloneNode().play();
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: false }));
    mySelectedWeaponInfo.current = myWeapons.current[myBattlePokeIndex][weaponIndex];
    await decideOpAction();   //相手の行動を決める(交代/テラス/技選択)
    await setMyTurn();
    await setTextWhenClickWeaponBtn();
  };

  //〇〇に交代ボタン押下時、交代するポケモン名を保存し、交代フラグを立てる
  const changeMyPoke = async (changePokeIndex) => {
    soundList.general.decide.cloneNode().play();
    setOtherAreaVisible(prev => ({ ...prev, changeCmd: false }));
    mySelectedWeaponInfo.current = null;
    myChangeTurn.current = true;    //交代フラグ
    myChangePokeIndex.current = changePokeIndex;    //交代するポケモンをrefに保存
    await decideOpAction();   //相手の行動を決める(交代/テラス/技選択)
    await setMyTurn();
    setBackText(iAmFirst.current);    //先攻のbackテキストをセット
    changeFnc1(iAmFirst.current);
  }

  //倒れた後、次に出すポケモンボタン押下時、次のポケモン名を保存し、HPをセット
  const setNextMyPoke = (nextMyPokeIndex) => {
    soundList.general.decide.cloneNode().play();
    setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: false }));
    delay(() => setBattlePokeIndex(true, nextMyPokeIndex), 1000);
  }


  return (
    <div className="cmd-text-area">
      {otherAreaVisible.textArea && (
        <div ref={textAreaRef} className="text-area"></div>
      )}

      {otherAreaVisible.actionCmd && !otherAreaVisible.textArea && (
        <div className="cmd-area">
          <button className="weapon-cmd-btn" onClick={openBattleCmdArea}>たたかう</button>
          {(myPokeDynamics[0].currentHp !== 0 || myPokeDynamics[1].currentHp !== 0 || myPokeDynamics[2].currentHp !== 0) && (
            <button className="change-cmd-btn" onClick={openChangeCmdArea}>交代</button>
          )}
          <button className="weapon-cmd-btn" onClick={openStatusArea}>ステータス</button>
        </div>
      )}

      {otherAreaVisible.weaponCmd && (
        <div className="cmd-area weapon-cmd-area">
          <button
            className="weapon-cmd-btn"
            onClick={async () => await setWeapons(0)}
            onMouseEnter={() => handleMouseEnter(0)}
            onMouseLeave={handleMouseLeave}
          >
            {myPokeStatics.current[myBattlePokeIndex].weapon1}
          </button>

          <button
            className="weapon-cmd-btn"
            onClick={async () => await setWeapons(1)}
            onMouseEnter={() => handleMouseEnter(1)}
            onMouseLeave={handleMouseLeave}
          >
            {myPokeStatics.current[myBattlePokeIndex].weapon2}
          </button>

          <button
            onClick={() => togglTerastal()}
            disabled={!myTerastalState.canTerastal}
            className={`terastal-cmd-btn ${isTerastalActive || isTerastal ? 'active' : ''}`}
            style={isTerastalActive || isTerastal ? { backgroundColor: typeColors[myPokeStatics.current[myBattlePokeIndex].terastal] } : undefined}
          >
            {isTerastalActive || isTerastal ? myPokeStatics.current[myBattlePokeIndex].terastal : "テラスタル"}
          </button>

          <button
            className="weapon-cmd-btn"
            onClick={async () => await setWeapons(2)}
            onMouseEnter={() => handleMouseEnter(2)}
            onMouseLeave={handleMouseLeave}
          >
            {myPokeStatics.current[myBattlePokeIndex].weapon3}
          </button>

          <button
            className="weapon-cmd-btn"
            onClick={async () => await setWeapons(3)}
            onMouseEnter={() => handleMouseEnter(3)}
            onMouseLeave={handleMouseLeave}
          >
            {myPokeStatics.current[myBattlePokeIndex].weapon4}
          </button>

          <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>

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

      {otherAreaVisible.changeCmd && (
        <div className="cmd-area">
          {[0, 1, 2].map(i => {
            const name = myPokeStatics.current[i].name;
            const hp = myPokeDynamics[i].currentHp;

            return (
              name !== myPokeStatics.current[myBattlePokeIndex].name && hp > 0 && (
                <button key={name} className="change-cmd-btn" onClick={async () => await changeMyPoke(i)}>
                  {name}
                </button>
              )
            );
          })}

          <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
        </div>
      )}

      {otherAreaVisible.status && (
        <div className="status-area-wrapper" style={{ display: "flex" }}>
          <div className="status-area">
            <PokesStatus isMe={false} battleState={battleState} battleHandlers={battleHandlers} />
            <PokesStatus isMe={true} battleState={battleState} battleHandlers={battleHandlers} />
          </div>
          <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
        </div>
      )}

      {otherAreaVisible.nextPokeCmd && !otherAreaVisible.textArea && (
        <div className="cmd-area">
          {[0, 1, 2].map(i => {
            const name = myPokeStatics.current[i].name;
            const hp = myPokeDynamics[i].currentHp;

            return (
              name !== myPokeStatics.current[myBattlePokeIndex].name && hp > 0 && (
                <button key={name} className="change-cmd-btn" onClick={() => setNextMyPoke(i)}>
                  {name}
                </button>
              )
            );
          })}
        </div>
      )}
    </div >
  );
};

export default CommandArea;
