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
    myLife, opLife, opTerastalFlag,
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
    checkIsAttackWeapon,
    setCompatiText,
    getDamage,
    playAttackingFlow,
    setHpOnDamage,
    playDeathEffect,
    resetChangeTurn,
    setLife,
    setNextOpPokeName,
    setWinner,
    getEffectiveness,
    consoleWhenTurnEnd,
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
      if ((isMe && iAmFirst.current) || (!isMe && !iAmFirst.current)) {
        setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
        consoleWhenTurnEnd();
      }
      else if(!otherText.content)
        setWeaponText(isMe);
    }
    //死亡の場合、死亡テキストをセット
    else
      await setDeadText(isMe);
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
        if (isTerastalActive !== opTerastalFlag.current)
          setTerastalText(!isMe);
        else
          delay(() => setWeaponText(!isMe), 2000);
      }
      //どちらも交代するとき
      else {
        //1周目は後攻の交代テキストをセット
        if (myChangePokeName.current && opChangePokeName.current) {
          (isMe ? myChangePokeName : opChangePokeName).current = null;
          // iAmFirst.current ? myChangePokeName.current = null : opChangePokeName.current = null;
          setBackText(!isMe);
        }
        //2周目はrefの制御
        else {
          iAmFirst.current ? opChangePokeName.current = null : myChangePokeName.current = null;
          setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
          consoleWhenTurnEnd();
        }
      }
    }
    //backTextがセットされたら表示制御して次のポケモン名をセット
    else if (textKind === "back") {
      setAreaVisibleForChange(isMe);
      const changePokeName = (isMe ? myChangePokeName : opChangePokeName).current;
      delay(() => setPokeName(isMe, changePokeName), 1000);
    }
    //terastalTextがセットされたら、テキスト表示とstate制御して先攻の技テキストをセット
    else if (textKind === "terastal") {
      setAreaVisibleForTerastal(isMe);
      setTerastalPokeNum(isMe);
    }
    //weaponTextがセットされたら受けポケモンへの相性テキストをセット
    else if (textKind === "weapon") {
      //技が攻撃技か変化技か取得
      const isAttackWeapon = await checkIsAttackWeapon(isMe);
      if (isAttackWeapon)
        await setCompatiText(isMe);
      else {
        const { isHit, atcTarget, effTarget, effectiveness } = await getEffectiveness(isMe);
        await playAttackingFlow(isMe, isHit, false, 0, isAttackWeapon, atcTarget, effTarget, effectiveness);
      }
    }
    //compatiTextがセットされたら、攻撃関連のアニメーションを再生し、ダメージを反映したHPをセット
    else if (textKind === "compati") {
      const { damage, isHit, isCriticalHit, atcTarget, effTarget, effectiveness } = await getDamage(!isMe);
      await playAttackingFlow(!isMe, isHit, isCriticalHit, damage, true, atcTarget, effTarget, effectiveness);
      setHpOnDamage(isMe, damage);
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
  const toDoWhenSetTerastalPokeNum = (isMe) => {
    soundList.general.terastal.play();

    setTimeout(() => {
      //一方のみテラスタルする場合、先攻の技テキストをセット
      if (isTerastalActive !== opTerastalFlag.current) {
        const atcIsMe = (iAmFirst.current || opChangeTurn.current) && !myChangeTurn.current;
        setWeaponText(atcIsMe);
        isTerastalActive ? setIsTerastalActive(false) : opTerastalFlag.current = false;
      }
      else {
        //1周目は後攻のテラスタルテキストセット　2周目は先攻の技テキストをセット
        if (!myPokeState.terastalPokeNum || !opPokeState.terastalPokeNum)
          setTerastalText(!isMe);
        else
          setWeaponText(iAmFirst.current);

        setIsTerastalActive(false);
        opTerastalFlag.current = false;
      }
    }, 1000);
  }


  //バフテキストセット後の処理
  const toDoWhenSetOtherText = () => {
    if (otherText.kind === "buff") {
      setTimeout(() => {
        setOtherText({ kind: "", content: "" });

        //先攻で自分の技効果の場合と、後攻で相手の技効果の場合は後攻の技テキストセット
        if (iAmFirst.current && myPokeState.text.kind === "weapon" && opPokeState.hp > 0 || !iAmFirst.current && opPokeState.text.kind === "weapon" && myPokeState.hp > 0)
          setWeaponText(!iAmFirst.current);
        //先攻で相手の技効果の場合と、後攻で自分の技効果の場合はターン終了
        else if (iAmFirst.current && opPokeState.text.kind === "weapon" || !iAmFirst.current && myPokeState.text.kind === "weapon") {
          setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
          consoleWhenTurnEnd();
        }
      }, 2000);
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
