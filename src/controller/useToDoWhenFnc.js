import { useBattleHandlers } from "./useBattleHandlers";
import { soundList, delay } from "../model/model";

export function useToDoWhenFnc(battleState) {

  //インポートの取得===========================================================
  const {
    myAreaVisible, opAreaVisible,
    setOtherAreaVisible,
    myPokeState, opPokeState,
    isTerastalActive, setIsTerastalActive,
    myLife, opLife, opTerastalFlag,
    myChangePokeName, opChangePokeName,
    iAmFirst, myChangeTurn, opChangeTurn,
  } = battleState;

  const {
    checkIsMe,
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
  } = useBattleHandlers(battleState);
  //============================================================================


  // ポケモン名がセットされたら、そのポケモンの情報をセット
  const toDoWhenSetPokeName = async (pokeState) => {
    const isMe = checkIsMe(pokeState);
    await setPokeInfo(isMe, pokeState);
  };


  //imgがセットされたらHPバーの制御とHPをセット
  const toDoWhenSetImg = async (pokeState) => {
    const isMe = checkIsMe(pokeState);
    setHpOnEntry(isMe, pokeState, 0);
  }


  //HPがセットされたら、残HPやターン状況で処理を分岐
  const toDoWhenSetHp = (pokeState) => {
    const isMe = checkIsMe(pokeState);

    //state.hpの値をstate.poke1Hp等にセットする
    setPokeNumHp(isMe, pokeState);

    //バトル開始時OR交代時にgoTextをセット
    if (pokeState.text.content === "" || pokeState.text.kind === "back" || pokeState.text.kind === "dead") {
      setGoText(isMe, pokeState);
      return;
    }

    //生存の場合、ターン終了か、後攻の技テキストをセット
    if (pokeState.hp > 0) {
      if ((isMe && iAmFirst.current) || (!isMe && !iAmFirst.current))
        setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
      else setWeaponText(isMe, pokeState);
    }
    //死亡の場合、死亡テキストをセット
    else setDeadText(isMe, pokeState);
  };


  //テキストがセットされたら、テキストの種別によって処理を分岐する
  const toDoWhenSetText = async (pokeState) => {
    const isMe = checkIsMe(pokeState);
    const textKind = pokeState.text.kind;

    //goTextがセットされたら表示制御
    if (textKind === "go") {
      await setAreaVisibleForApp(isMe);
      if (!myAreaVisible.poke && !opAreaVisible.poke)
        return;

      //一方が交代したとき、もう一方のテラスタルか技テキストをセット
      if (myChangeTurn.current !== opChangeTurn.current) {
        iAmFirst.current ? myChangePokeName.current = null : opChangePokeName.current = null;
        if (isTerastalActive !== opTerastalFlag.current) {
          const pokeState = isTerastalActive ? myPokeState : opPokeState;
          setTerastalText(pokeState);
        }
        else {
          const atcState = iAmFirst.current ? opPokeState : myPokeState;
          delay(() => setWeaponText(!iAmFirst.current, atcState), 2000); 
        }
      }
      //どちらも交代するとき
      else {
        //1周目は後攻の交代テキストをセット
        if (myChangePokeName.current && opChangePokeName.current) {
          iAmFirst.current ? myChangePokeName.current = null : opChangePokeName.current = null;
          setBackText();
        }
        //2周目はrefの制御
        else {
          iAmFirst.current ? opChangePokeName.current = null : myChangePokeName.current = null;
          setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
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
    else if (textKind === "weapon")
      await setCompatiText(isMe);
    //compatiTextがセットされたら、攻撃関連のアニメーションを再生し、ダメージを反映したHPをセット
    else if (textKind === "compati") {
      const { damage, isHit, isCriticalHit } = await getDamage(!isMe);
      await playAttackingFlow(!isMe, pokeState, isHit, isCriticalHit, damage);
      setHpOnDamage(isMe, pokeState, damage);
    }
    //deadTextがセットされたら、死亡エフェクトを入れて、ゲーム続行ORゲームセット
    else if (textKind === "dead") {
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: false }));
      await playDeathEffect(isMe, pokeState);
      resetChangeTurn();
      setLife(isMe);
      const life = (isMe ? myLife : opLife).current;
      if (life > 0) {
        if (isMe) setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: true }));
        else await setNextOpPokeName(life);
      }
      else setWinner(!isMe)
    }
  };

  //テラスタルしたら、もう一方もテラスするか否かでテラスタルテキストセットか、先攻の技テキストセット
  const toDoWhenSetTerastalPokeNum = (pokeState) => {
    soundList.general.terastal.play();

    setTimeout(() => {
      //一方のみテラスタルする場合、先攻の技テキストをセット
      if (isTerastalActive !== opTerastalFlag.current) {
        const attackerIsMe = iAmFirst.current || opChangeTurn.current;
        const atcState = attackerIsMe ? myPokeState : opPokeState;
        setWeaponText(attackerIsMe, atcState);
        isTerastalActive ? setIsTerastalActive(false) : opTerastalFlag.current = false;
      }
      else {
        //1周目は後攻のテラスタルテキストセット　2周目は先攻の技テキストをセット
        if (!myPokeState.terastalPokeNum || !opPokeState.terastalPokeNum) {
          const afterPokeState = pokeState.name === myPokeState.name ? opPokeState : myPokeState;
          setTerastalText(afterPokeState);
        }
        else {
          const atcState = iAmFirst.current ? myPokeState : opPokeState;
          setWeaponText(iAmFirst.current, atcState);
        }
        setIsTerastalActive(false);
        opTerastalFlag.current = false;
      }
    }, 1000);
  }

  return {
    toDoWhenSetPokeName,
    toDoWhenSetImg,
    toDoWhenSetHp,
    toDoWhenSetText,
    toDoWhenSetTerastalPokeNum,
  };
}
