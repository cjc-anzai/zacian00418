import { useBattleHandlers } from "./useBattleHandlers";
import { soundList, delay } from "../model/model";

export function useToDoWhenFnc(battleState) {

  //インポートの取得===========================================================
  const {
    myAreaVisible, opAreaVisible,
    setOtherAreaVisible,
    myPokeState, opPokeState,
    isTerastalActive, setIsTerastalActive,
    otherTextRef, textAreaRef,
    opTerastalFlg, burned, isHeal, isHealAtc,
    myChangePokeName, opChangePokeName,
    iAmFirst, myChangeTurn, opChangeTurn,
    mySelectedWeapon, opSelectedWeapon,
  } = battleState;

  const {
    setPokeInfo,
    setHpOnEntry,
    setPokeNumHp,
    setGoText,
    setBackText,
    setWeaponText,
    setDeadText,
    setAreaVisibleForApp,
    setTerastalText,
    setCompatiText,
    toDoWhenTurnEnd,
    setHpOnHeal,
    getTextRef,
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
    displayOtherText,
    checkIsAttackWeapon,
  } = useBattleHandlers(battleState);


  // ポケモン名がセットされたら、そのポケモンの情報(img他)をセット
  const toDoWhenSetPokeName = async (isMe) => {
    await setPokeInfo(isMe);
  };


  //imgがセットされたらHPバーの制御とHPをセット
  const toDoWhenSetImg = async (isMe) => {
    await stopProcessing(4000);
    if (!isMe) await stopProcessing(100);
    setHpOnEntry(isMe);
  }


  //HPがセットされたら、残HPやターン状況で処理を分岐
  const toDoWhenSetHp = async (isMe) => {
    const pokeState = isMe ? myPokeState : opPokeState;
    consolePokeHp(isMe);

    //state.hpの値をstate.poke1Hp等にセットする
    setPokeNumHp(isMe);

    const textRef = getTextRef(isMe);
    const textKind = textRef.current.kind;
    //バトル開始時OR交代時にgoTextをセット
    if (textKind === "" || textKind === "back" || textKind === "dead") {
      setGoText(isMe);
      await setAreaVisibleForApp(isMe);
      if (!myAreaVisible.poke && !opAreaVisible.poke)
        return;

      //一方が交代したとき、もう一方のテラスタルか技テキストをセット
      if (myChangeTurn.current !== opChangeTurn.current) {
        iAmFirst.current ? myChangePokeName.current = null : opChangePokeName.current = null;
        if (isTerastalActive !== opTerastalFlg.current) {
          setTerastalText(!isMe);
          terastalFnc1(!isMe);
        }
        else {
          await stopProcessing(2000);
          await setWeaponText(!isMe);
          await setCompatiText(!isMe);
          await compatiFnc1(isMe);
        }
      }
      //どちらも交代するとき
      else if (myChangeTurn.current && opChangeTurn.current) {
        //1周目は後攻の交代テキストをセット
        if (myChangePokeName.current && opChangePokeName.current) {
          (isMe ? myChangePokeName : opChangePokeName).current = null;
          setBackText(!isMe);
          changeFnc1(!isMe);
        }
        //2周目はrefの制御
        else {
          iAmFirst.current ? opChangePokeName.current = null : myChangePokeName.current = null;
          await toDoWhenTurnEnd();
        }
      }
      return;
    }

    //生存の場合、ターン終了か、後攻の技テキストをセット
    if (pokeState.hp > 0) {
      if (isHeal.current) {
        if (isHealAtc.current)
          setHpOnHeal(!isMe)
        else {
          setHealText(isMe);
          await displayOtherText();
          await healFnc();
        }
      }
      else if (burned.current)
        burned.current = false;
      else if (isMe === iAmFirst.current && !otherTextRef.current.content)
        await toDoWhenTurnEnd();
      else if (!otherTextRef.current.content) {
        await setWeaponText(isMe);
        await setCompatiText(isMe);
        await compatiFnc1(!isMe);
      }
      else if (otherTextRef.current.content) {
        const kind = otherTextRef.current.kind;
        if (kind === "buff")  //攻撃技の追加効果用
          await buffFnc();
        else if (kind === "heal")   //攻撃回復技用
          await healFnc();
        else if (kind === "condition")  //攻撃技の追加効果用
          await conditionFnc();
        else if (kind === "cantMove") // ひるみ用
          await cantMoveFnc();
      }
      otherTextRef.current.content = "";
    }
    //死亡の場合、死亡テキストをセット
    else {
      if (isHeal.current) {
        if (isHealAtc.current)
          setHpOnHeal(!isMe)
        else {
          setHealText(isMe);
          await displayOtherText();
          await healFnc();
        }
      }
      //火傷によるダメージ
      if (burned.current)
        burned.current = false;

      await stopProcessing(1000);
      if (isHeal.current)
        await stopProcessing(1000);
      await setDeadText(isMe);
      await deadFnc1(isMe);
      await stopProcessing(3000);
      await toDoWhenTurnEnd();
      if (isMe)
        setOtherAreaVisible(prev => ({ ...prev, textArea: false, nextPokeCmd: true }));
    }
  };


  //テラスタルしたら、もう一方もテラスするか否かでテラスタルテキストセットか、先攻の技テキストセット
  const toDoWhenSetTerastalPokeNum = async (isMe) => {
    soundList.general.terastal.play();
    await stopProcessing(1000);
    //一方のみテラスタルする場合、先攻の技テキストをセット
    if (isTerastalActive !== opTerastalFlg.current) {
      const atcIsMe = (iAmFirst.current || opChangeTurn.current) && !myChangeTurn.current;
      await setWeaponText(atcIsMe);
      isTerastalActive ? setIsTerastalActive(false) : opTerastalFlg.current = false;
      await setCompatiText(atcIsMe);
      await compatiFnc1(!atcIsMe);
    }
    else {
      //1周目は後攻のテラスタルテキストセット　2周目は先攻の技テキストをセット
      if (!myPokeState.terastalPokeNum || !opPokeState.terastalPokeNum) {
        setTerastalText(!isMe);
        terastalFnc1(!isMe);
      }
      else {
        await setWeaponText(iAmFirst.current);
        await setCompatiText(iAmFirst.current);
        await compatiFnc1(!iAmFirst.current);
      }

      setIsTerastalActive(false);
      opTerastalFlg.current = false;
    }
  }

  const toDoWhenSetPokeCondition = async (isMe) => {
    const isAtcWeapon = await checkIsAttackWeapon(!isMe);
    //状態異常テキストをセット
    setOtherAreaVisible(prev => ({ ...prev, textArea: true }));
    delay(() => textAreaRef.current.textContent = otherTextRef.current.content, 1);
    await stopProcessing(2000);
    if (!isAtcWeapon)
      await conditionFnc();
  }

  return {
    toDoWhenSetPokeName,
    toDoWhenSetImg,
    toDoWhenSetHp,
    toDoWhenSetTerastalPokeNum,
    toDoWhenSetPokeCondition
  };
}
