import { useBattleHandlers } from "./useBattleHandlers";
import { soundList, delay } from "../model/model";

export function useToDoWhenFnc(battleState) {

  //インポートの取得===========================================================
  const {
    setAreaVisible,
    isTerastalActive, setIsTerastalActive,
    otherTextRef, textAreaRef,
    opTerastalFlg, burned, poisoned, isHeal, isHealAtc,
    myChangePokeIndex, opChangePokeIndex,
    iAmFirst, myChangeTurn, opChangeTurn,
    turnCnt,
    myBattlePokeIndex,
    opBattlePokeIndex,
    myTerastalState, opTerastalState,
    isIncident,
    healHp,
    myDeathFlg, opDeathFlg,
    myPokeBuff,
    setMyPokeBuff, setOpPokeBuff,
    myPoisonedCnt, opPoisonedCnt,
    secondaryTextRef
  } = battleState;

  const {
    setGoText,
    setBackText,
    setWeaponText,
    setDeadText,
    setTerastalText,
    setCompatiText,
    toDoWhenTurnEnd,
    setHpOnHeal,
    consolePokeHp,
    stopProcessing,
    setHealText,
    changeFnc1,
    terastalFnc1,
    compatiFnc1,
    deadFnc1,
    buffFnc,
    healFnc,
    conditionFnc,
    cantMoveFnc,
    displayTextArea,
    getCantMoveFlg,
    atcFlowFnc,
    getBattlePokeDynamics,
    controllAreaVisibleForApp,
    setBattlePokeIndex,
    adjustHpBar,
    doSecondaryEffect,
    toDoWhenTurnStart,
  } = useBattleHandlers(battleState);


  const toDoWhenSetBattlePokeIndex = async (isMe) => {
    const setPokeBuff = isMe ? setMyPokeBuff : setOpPokeBuff;
    const poisonedCnt = isMe ? myPoisonedCnt : opPoisonedCnt;
    setPokeBuff(prev => ({ ...prev, a: 0, b: 0, c: 0, d: 0, s: 0 }));
    poisonedCnt.current = 1;
    adjustHpBar(isMe, "appearance");
    setGoText(isMe);
    await controllAreaVisibleForApp(isMe);

    //バトル開始時の相手の登場前
    if (opBattlePokeIndex === -1) {
      setBattlePokeIndex(!isMe, 0);
    }
    //バトル開始時の相手の登場後
    else if (turnCnt.current === 0) {
      turnCnt.current = 1;
      setAreaVisible(prev => ({ ...prev, textArea: false, actionCmd: true }));
    }
    //ポケモン交代時
    else if (myChangeTurn.current || opChangeTurn.current) {
      //一方が交代したとき、もう一方のテラスタルか技テキストをセット
      if (myChangeTurn.current !== opChangeTurn.current) {
        iAmFirst.current ? myChangePokeIndex.current = null : opChangePokeIndex.current = null;
        if (isTerastalActive !== opTerastalFlg.current) {
          setTerastalText(!isMe);
          terastalFnc1(!isMe);
        }
        else {
          await stopProcessing(2000);
          await atcFlowFnc(!isMe);
        }
      }
      //どちらも交代するとき
      else if (myChangeTurn.current && opChangeTurn.current) {
        //1周目は後攻の交代テキストをセット
        if (myChangePokeIndex.current && opChangePokeIndex.current) {
          (isMe ? myChangePokeIndex : opChangePokeIndex).current = null;
          setBackText(!isMe);
          changeFnc1(!isMe);
        }
        else
          await toDoWhenTurnEnd();
      }
    }
    //死亡後の登場後
    else {
      (isMe ? myChangePokeIndex : opChangePokeIndex).current = null;
      setAreaVisible(prev => ({ ...prev, textArea: false, actionCmd: true }));
    }
  }


  const toDoWhenSetCurrentHp = async (isMe) => {
    const battlePokeDynamics = getBattlePokeDynamics(isMe);
    consolePokeHp(isMe);

    //生存の場合
    if (battlePokeDynamics.currentHp > 0) {
      if (isIncident.current) {
        await doSecondaryEffect(!isMe);
        isIncident.current = false;
        return;
      }

      if (isHeal.current && healHp.current) {
        otherTextRef.current = { kind: "heal", content: secondaryTextRef.current.content };
        await displayTextArea("other", 1500);
        if (!(isMe ? myDeathFlg : opDeathFlg).current)
          await healFnc();
      }
      else if (burned.current || poisoned.current) {
        burned.current = false;
        poisoned.current = false;
      }
      else if (isMe !== iAmFirst.current)
        await atcFlowFnc(isMe);
      else if (isMe === iAmFirst.current)
        await toDoWhenTurnEnd();
    }
    //死亡の場合、死亡テキストをセット
    else {
      (isMe ? myDeathFlg : opDeathFlg).current = true;
      if (isIncident.current) {
        await doSecondaryEffect(!isMe);
        isIncident.current = false;
        if (isHeal.current)
          stopProcessing(3000);
      }
      //火傷によるダメージ
      if (burned.current || poisoned.current) {
        burned.current = false;
        poisoned.current = false;
      }
      setDeadText(isMe);
      await deadFnc1(isMe);
      await toDoWhenTurnEnd();
      if (isMe)
        setAreaVisible(prev => ({ ...prev, textArea: false, nextPokeCmd: true }));
    };
  }


  //テラスタルしたら、もう一方もテラスするか否かでテラスタルテキストセットか、先攻の技テキストセット
  const toDoWhenSetTerastalPokeNum = async (isMe) => {
    soundList.general.terastal.play();
    await stopProcessing(1000);
    //一方のみテラスタルする場合、先攻の技テキストをセット
    if (isTerastalActive !== opTerastalFlg.current) {
      const atcIsMe = (iAmFirst.current || opChangeTurn.current) && !myChangeTurn.current;
      toDoWhenTurnStart(atcIsMe);
      await setWeaponText(atcIsMe);
      isTerastalActive ? setIsTerastalActive(false) : opTerastalFlg.current = false;
      const cantMove = getCantMoveFlg(isMe);
      if (!cantMove) {
        setCompatiText(atcIsMe);
        await compatiFnc1(atcIsMe);
      }
      else {
        await displayTextArea("other", 1500);
        await cantMoveFnc(isMe);
      }
    }
    else {
      //1周目は後攻のテラスタルテキストセット　2周目は先攻の技テキストをセット
      if (myTerastalState.terastalPokeNum === null || opTerastalState.terastalPokeNum === null) {
        setTerastalText(!isMe);
        terastalFnc1(!isMe);
      }
      else
        await atcFlowFnc(iAmFirst.current);

      setIsTerastalActive(false);
      opTerastalFlg.current = false;
    }
  }


  const toDoWhenSetPokeCondition = async (isMe) => {
    await displayTextArea("other", 1500);
    await conditionFnc();
  }

  const toDoWhenSetPokeBuff = async () => {
    await buffFnc();
  }

  return {
    toDoWhenSetCurrentHp,
    toDoWhenSetBattlePokeIndex,
    toDoWhenSetTerastalPokeNum,
    toDoWhenSetPokeCondition,
    toDoWhenSetPokeBuff
  };
}
