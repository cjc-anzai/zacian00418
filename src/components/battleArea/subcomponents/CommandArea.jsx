import React, { useState } from "react";
import {
  soundList,
  typeColors,
  getCompatiTextForWeaponInfoList,
  delay,
} from "../../../model/model";

const CommandArea = ({
  battleState,
  battleHandlers,
}) => {

  //インポートする変数や関数の取得
  const {
    opPokeState, myPokeState,
    setMyPokeState,
    opAreaVisible, myAreaVisible,
    otherAreaVisible, setOtherAreaVisible,
    otherText,
    mySelectedWeapon,
    isTerastalActive, setIsTerastalActive,
    myChangePokeName,
    myChangeTurn,
  } = battleState;

  const {
    resetChangeTurn,
    updateTurnCnt,
    setMyTurn,
    setBackText,
    getWeaponInfo,
    getPokeNum,
    decideOpAction,
    setTextWhenClickWeaponBtn,
  } = battleHandlers;

  const [weaponInfoList, setWeaponInfoList] = useState(null);

  const isTerastal = myPokeState.terastalPokeNum === getPokeNum(myPokeState);

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

  // 戻るボタン押下時、コマンド表示を切り替える
  const backCmd = () => {
    soundList.general.cancel.cloneNode().play();
    setIsTerastalActive(false);
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true, weaponCmd: false, changeCmd: false }));
  };

  //技ボタンマウスオーバー時に技情報をセットする
  const handleMouseEnter = async (weaponName) => {
    //技の情報を取得
    const { type, kind, power, hitrate, priority } = await getWeaponInfo(weaponName);
    // 技相性を計算
    const compatiText = getCompatiTextForWeaponInfoList(type, opPokeState.type1, opPokeState.type2);

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
  const setWeapons = async (weaponName) => {
    soundList.general.decide.cloneNode().play();
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: false }));
    resetChangeTurn();
    updateTurnCnt();

    mySelectedWeapon.current = weaponName;
    await decideOpAction();   //相手の行動を決める(交代/テラス/技選択)
    await setMyTurn();
    setTextWhenClickWeaponBtn();
  };

  //〇〇に交代ボタン押下時、交代するポケモン名を保存し、交代フラグを立てる
  const changeMyPoke = async (changePoke) => {
    soundList.general.decide.cloneNode().play();
    setOtherAreaVisible(prev => ({ ...prev, changeCmd: false }));
    resetChangeTurn();
    updateTurnCnt();

    myChangeTurn.current = true;    //交代フラグ
    myChangePokeName.current = changePoke;    //交代するポケモンをrefに保存
    await decideOpAction();   //相手の行動を決める(交代/テラス/技選択)
    await setMyTurn();
    setBackText();    //先攻のbackテキストをセット
    console.log(`${changePoke}に交代を選択`);
  }

  //倒れた後、次に出すポケモンボタン押下時、次のポケモン名を保存し、HPをセット
  const setNextMyPoke = (nextMyPoke) => {
    soundList.general.decide.cloneNode().play();
    setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: false }));
    myChangePokeName.current = nextMyPoke;
    delay(() => setMyPokeState(p => ({ ...p, name: nextMyPoke })), 1000);
  }

  return (
    <div className="cmd-text-area">
      {(opAreaVisible.text || myAreaVisible.text || otherText.content) && (
        <div className="text-area">
          {opAreaVisible.text && <p>{opPokeState.text.content}</p>}
          {myAreaVisible.text && <p>{myPokeState.text.content}</p>}
          {otherText.content && <p>{otherText.content}</p>}
        </div>
      )}

      {otherAreaVisible.actionCmd && (
        <div className="cmd-area">
          <button className="weapon-cmd-btn" onClick={openBattleCmdArea}>たたかう</button>
          {(myPokeState.poke1Hp !== 0 || myPokeState.poke2Hp !== 0 || myPokeState.poke3Hp !== 0) && (
            <button className="change-cmd-btn" onClick={openChangeCmdArea}>交代</button>
          )}
        </div>
      )}

      {otherAreaVisible.weaponCmd && (
        <div className="cmd-area weapon-cmd-area">
          <button
            className="weapon-cmd-btn"
            onClick={async () => await setWeapons(myPokeState.weapon1)}
            onMouseEnter={() => handleMouseEnter(myPokeState.weapon1)}
            onMouseLeave={handleMouseLeave}
          >
            {myPokeState.weapon1}
          </button>

          <button
            className="weapon-cmd-btn"
            onClick={async () => await setWeapons(myPokeState.weapon2)}
            onMouseEnter={() => handleMouseEnter(myPokeState.weapon2)}
            onMouseLeave={handleMouseLeave}
          >
            {myPokeState.weapon2}
          </button>

          <button
            onClick={() => togglTerastal()}
            disabled={!myPokeState.canTerastal}
            className={`terastal-cmd-btn ${isTerastalActive || isTerastal ? 'active' : ''}`}
            style={isTerastalActive || isTerastal ? { backgroundColor: typeColors[myPokeState.terastal] } : undefined}
          >
            {isTerastalActive || isTerastal ? myPokeState.terastal : "テラスタル"}
          </button>

          <button
            className="weapon-cmd-btn"
            onClick={async () => await setWeapons(myPokeState.weapon3)}
            onMouseEnter={() => handleMouseEnter(myPokeState.weapon3)}
            onMouseLeave={handleMouseLeave}
          >
            {myPokeState.weapon3}
          </button>

          <button
            className="weapon-cmd-btn"
            onClick={async () => await setWeapons(myPokeState.weapon4)}
            onMouseEnter={() => handleMouseEnter(myPokeState.weapon4)}
            onMouseLeave={handleMouseLeave}
          >
            {myPokeState.weapon4}
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
      )
      }

      {
        otherAreaVisible.changeCmd && (
          <div className="cmd-area">
            {myPokeState.name !== myPokeState.poke1Name && myPokeState.poke1Hp > 0 && (
              <button className="change-cmd-btn" onClick={async () => await changeMyPoke(myPokeState.poke1Name)}>
                {myPokeState.poke1Name}
              </button>
            )}
            {myPokeState.name !== myPokeState.poke2Name && myPokeState.poke2Hp > 0 && (
              <button className="change-cmd-btn" onClick={async () => await changeMyPoke(myPokeState.poke2Name)}>
                {myPokeState.poke2Name}
              </button>
            )}
            {myPokeState.name !== myPokeState.poke3Name && myPokeState.poke3Hp > 0 && (
              <button className="change-cmd-btn" onClick={async () => await changeMyPoke(myPokeState.poke3Name)}>
                {myPokeState.poke3Name}
              </button>
            )}
            <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
          </div>
        )
      }

      {
        otherAreaVisible.nextPokeCmd && (
          <div className="cmd-area">
            {myPokeState.name !== myPokeState.poke1Name && myPokeState.poke1Hp > 0 && (
              <button className="change-cmd-btn" onClick={() => setNextMyPoke(myPokeState.poke1Name)}>
                {myPokeState.poke1Name}
              </button>
            )}
            {myPokeState.name !== myPokeState.poke2Name && myPokeState.poke2Hp > 0 && (
              <button className="change-cmd-btn" onClick={() => setNextMyPoke(myPokeState.poke2Name)}>
                {myPokeState.poke2Name}
              </button>
            )}
            {myPokeState.name !== myPokeState.poke3Name && myPokeState.poke3Hp > 0 && (
              <button className="change-cmd-btn" onClick={() => setNextMyPoke(myPokeState.poke3Name)}>
                {myPokeState.poke3Name}
              </button>
            )}
          </div>
        )
      }
    </div >
  );
};

export default CommandArea;
