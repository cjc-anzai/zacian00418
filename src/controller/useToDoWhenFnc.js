import { useBattleHandlers } from "./useBattleHandlers";
import { soundList, delay } from "../model/model";

export function useToDoWhenFnc(battleState) {

  //インポートの取得===========================================================
  const {
    myAreaVisible, opAreaVisible,
    setOtherAreaVisible,
    myPokeState, opPokeState,
    isTerastalActive, setIsTerastalActive,
    otherText, setOtherText,
    myLife, opLife, opTerastalFlg,
    burned,
    isHeal, isHealAtc, healHp,
    myChangePokeName, opChangePokeName,
    iAmFirst, myChangeTurn, opChangeTurn,
  } = battleState;

  const {
    setPokeInfo,
    setHpOnEntry,
    setPokeNumHp,
    setGoText,
    setBackText,
    setTerastalPokeNum,
    setWeaponText,
    setDeadText,
    setAreaVisibleForApp,
    setAreaVisibleForChange,
    setAreaVisibleForTerastal,
    setPokeName,
    setTerastalText,
    setCompatiText,
    getDamage,
    playAttackingFlow,
    setHpOnDamage,
    playDeathEffect,
    resetChangeTurn,
    setLife,
    setNextOpPokeName,
    setWinner,
    toDoWhenTurnEnd,
    setHpOnHeal,

    consolePokeHp,
    stopProcessing,
    setHealText,
  } = useBattleHandlers(battleState);


  // ポケモン名がセットされたら、そのポケモンの情報(img他)をセット
  const toDoWhenSetPokeName = async (isMe) => {
    await setPokeInfo(isMe);
  };


  //imgがセットされたらHPバーの制御とHPをセット
  const toDoWhenSetImg = async (isMe) => {
    setHpOnEntry(isMe);
  }


  //HPがセットされたら、残HPやターン状況で処理を分岐
  const toDoWhenSetHp = async (isMe) => {
    const pokeState = isMe ? myPokeState : opPokeState;
    consolePokeHp(isMe);

    //state.hpの値をstate.poke1Hp等にセットする
    setPokeNumHp(isMe);

    const textKind = pokeState.text.kind;
    //バトル開始時OR交代時にgoTextをセット
    if (textKind === "" || textKind === "back" || textKind === "dead") {
      setGoText(isMe);
      return;
    }

    //生存の場合、ターン終了か、後攻の技テキストをセット
    if (pokeState.hp > 0) {
      if (isHeal.current) {
        if (isHealAtc.current)
          setHpOnHeal(!isMe)
        else
          setHealText(isMe);
      }
      //火傷によるダメージ
      else if (burned.current)
        burned.current = false;
      else if (isMe === iAmFirst.current && !otherText.content)
        await toDoWhenTurnEnd();
      else if (!otherText.content)
        await setWeaponText(isMe);
    }
    //死亡の場合、死亡テキストをセット
    else {
      if (isHeal.current) {
        if (isHealAtc.current)
          setHpOnHeal(!isMe)
        else
          setHealText(isMe);
      }
      //火傷によるダメージ
      if (burned.current)
        burned.current = false;

      await stopProcessing(1000);
      if (isHeal.current)
        await stopProcessing(1000);
      await setDeadText(isMe);
      await stopProcessing(3000);
      await toDoWhenTurnEnd();
    }
  };


  //テキストがセットされたら、テキストの種別によって処理を分岐する
  const toDoWhenSetText = async (isMe) => {
    const pokeState = isMe ? myPokeState : opPokeState;
    const textKind = pokeState.text.kind;

    //goTextがセットされたら表示制御
    if (textKind === "go") {
      await setAreaVisibleForApp(isMe);
      if (!myAreaVisible.poke && !opAreaVisible.poke)
        return;

      //一方が交代したとき、もう一方のテラスタルか技テキストをセット
      if (myChangeTurn.current !== opChangeTurn.current) {
        iAmFirst.current ? myChangePokeName.current = null : opChangePokeName.current = null;
        if (isTerastalActive !== opTerastalFlg.current)
          setTerastalText(!isMe);
        else {
          await stopProcessing(2000);
          await setWeaponText(!isMe);
        }
      }
      //どちらも交代するとき
      else if (myChangeTurn.current && opChangeTurn.current) {
        //1周目は後攻の交代テキストをセット
        if (myChangePokeName.current && opChangePokeName.current) {
          (isMe ? myChangePokeName : opChangePokeName).current = null;
          setBackText(!isMe);
        }
        //2周目はrefの制御
        else {
          iAmFirst.current ? opChangePokeName.current = null : myChangePokeName.current = null;
          // setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
          await toDoWhenTurnEnd();
        }
      }
    }
    //backTextがセットされたら表示制御して次のポケモン名をセット
    else if (textKind === "back") {
      const changePokeName = (isMe ? myChangePokeName : opChangePokeName).current;
      await setAreaVisibleForChange(isMe);
      await stopProcessing(1000);
      setPokeName(isMe, changePokeName);
    }
    //terastalTextがセットされたら、テキスト表示とstate制御して先攻の技テキストをセット
    else if (textKind === "terastal") {
      await setAreaVisibleForTerastal(isMe);
      await setTerastalPokeNum(isMe);
    }
    //weaponTextがセットされたら受けポケモンへの相性テキストをセット
    else if (textKind === "weapon")
      await setCompatiText(isMe);
    //compatiTextがセットされたら、攻撃関連のアニメーションを再生し、ダメージを反映したHPをセット
    else if (textKind === "compati") {
      const { weaponInfo, damage, isHit, isCriticalHit } = await getDamage(!isMe);
      await playAttackingFlow(!isMe, isHit, isCriticalHit, damage);
      if (weaponInfo.kind !== "変化" || !isHit)
        setHpOnDamage(isMe, damage);
      else if (isHeal.current)
        setHpOnHeal(!isMe);
    }
    //deadTextがセットされたら、死亡エフェクトを入れて、ゲーム続行ORゲームセット
    else if (textKind === "dead") {
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: false }));
      await playDeathEffect(isMe);
      resetChangeTurn();
      setLife(isMe);
      if ((isMe ? myLife : opLife).current > 0) {
        if (isMe)
          setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: true }));
        else
          await setNextOpPokeName();
      }
      else
        setWinner(!isMe)
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
    }
    else {
      //1周目は後攻のテラスタルテキストセット　2周目は先攻の技テキストをセット
      if (!myPokeState.terastalPokeNum || !opPokeState.terastalPokeNum)
        setTerastalText(!isMe);
      else
        await setWeaponText(iAmFirst.current);

      setIsTerastalActive(false);
      opTerastalFlg.current = false;
    }
  }


  //テキストセット後の処理
  const toDoWhenSetOtherText = async () => {
    await stopProcessing(2000);
    setOtherText({ kind: "", content: "" });
    if (otherText.kind === "buff") {
      if ((iAmFirst.current && myPokeState.text.kind === "weapon" && opPokeState.hp > 0 || !iAmFirst.current && opPokeState.text.kind === "weapon" && myPokeState.hp > 0))
        await setWeaponText(!iAmFirst.current);
      else if (iAmFirst.current && opPokeState.text.kind === "weapon" && myPokeState.hp > 0 || !iAmFirst.current && myPokeState.text.kind === "weapon" && opPokeState.hp > 0)
        await toDoWhenTurnEnd();
    }
    else if (otherText.kind === "heal") {
      if ((iAmFirst.current && myPokeState.text.kind === "weapon" && opPokeState.hp > 0 && isHeal.current || !iAmFirst.current && opPokeState.text.kind === "weapon" && myPokeState.hp > 0 && !isHeal.current))
        await setWeaponText(!iAmFirst.current);
      else if (iAmFirst.current && opPokeState.text.kind === "weapon" && myPokeState.hp > 0 || !iAmFirst.current && myPokeState.text.kind === "weapon" && opPokeState.hp > 0)
        await toDoWhenTurnEnd();
      isHealAtc.current = false;
      isHeal.current = false;
      healHp.current = 0;
    }
    else if (otherText.kind === "condition") {
      if ((iAmFirst.current && myPokeState.text.kind === "weapon" && opPokeState.hp > 0 || !iAmFirst.current && opPokeState.text.kind === "weapon" && myPokeState.hp > 0))
        await setWeaponText(!iAmFirst.current);
      else if (iAmFirst.current && opPokeState.text.kind === "weapon" && myPokeState.hp > 0 || !iAmFirst.current && myPokeState.text.kind === "weapon" && opPokeState.hp > 0)
        await toDoWhenTurnEnd();
    }
    else if (otherText.kind === "cantMove") {
      //動けないのはどちらか取得
      const cantMoveIsMe = otherText.content.includes(myPokeState.name);

      if ((iAmFirst.current === cantMoveIsMe))
        await setWeaponText(!iAmFirst.current);
      else if (iAmFirst.current !== cantMoveIsMe)
        await toDoWhenTurnEnd();
    }
  }

  return {
    toDoWhenSetPokeName,
    toDoWhenSetImg,
    toDoWhenSetHp,
    toDoWhenSetText,
    toDoWhenSetTerastalPokeNum,
    toDoWhenSetOtherText,
  };
}
