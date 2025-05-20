import { useBattleHandlers } from "./useBattleHandlers";
import { delay } from "../model/model";

export function useToDoWhenFnc(battleState) {

  //インポートの取得===========================================================
  const {
    setOtherAreaVisible,
    myPokeState, opPokeState,
    myLife, opLife,
    myChangePokeName, opChangePokeName,
    myTurn, myChangeTurn, opChangeTurn,
  } = battleState;

  const {
    checkIsMe,
    setPokeInfo,
    setHpOnEntry,
    setPokeNumH,
    setGoText,
    setBackText,
    setWeaponText,
    setDeadText,
    setMyTurn,
    setAreaVisibleForApp,
    setAreaVisibleForChange,
    setPokeName,
    setCompatiText,
    getDamage,
    playAttackingFlow,
    setHpOnDamage,
    playDeathEffect,
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

    //state.hpの値をstate.poke1H等にセットする
    setPokeNumH(isMe, pokeState);

    //バトル開始時OR交代時にgoTextをセット
    if (pokeState.text.content === "" || pokeState.text.kind === "back" || pokeState.text.kind === "dead") {
      setGoText(isMe, pokeState);
      return;
    }

    if (pokeState.hp > 0) {
      //先攻か交代後に攻撃を受けた時 || 後攻で自分の攻撃が終了したらターン終了
      if ((isMe && (myTurn.current === "first" || myChangeTurn.current)) || (!isMe && (myTurn.current === "after" || opChangeTurn.current))) {
        setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
      }
      //先攻の攻撃が終わったら、後攻の技テキストをセット
      else if (!opChangeTurn.current) {
        setWeaponText(isMe, pokeState);
      }
    } else {
      setDeadText(isMe, pokeState);
    }
  };


  //テキストがセットされたら、テキストの種別によって処理を分岐する
  const toDoWhenSetText = async (pokeState) => {
    const isMe = checkIsMe(pokeState);
    const textKind = pokeState.text.kind;

    //goTextがセットされたら表示制御
    if (textKind === "go") {
      await setAreaVisibleForApp(isMe);

      const isFirst = myTurn.current === "first";
      //両者とも交代してないとき
      if (!myChangeTurn.current && !opChangeTurn.current) {
      }
      //一方が交代したとき、先攻の技テキストをセット
      else if (myChangeTurn.current !== opChangeTurn.current) {
        isFirst ? opChangePokeName.current = null : myChangePokeName.current = null;
        const atcState = isFirst ? myPokeState : opPokeState;
        setTimeout(async () => {
          setWeaponText(isFirst, atcState);
        }, 2000);
      }
      //どちらも交代するとき
      else {
        //1周目は後攻の交代テキストをセット
        if (myChangePokeName.current && opChangePokeName.current) {
          isFirst ? myChangePokeName.current = null : opChangePokeName.current = null;
          setBackText();
        }
        //2周目はrefの制御
        else {
          isFirst ? opChangePokeName.current = null : myChangePokeName.current = null;
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
    //weaponTextがセットされたら受けポケモンへの相性テキストをセット
    else if (textKind === "weapon") {
      await setCompatiText(isMe);
    }
    //compatiTextがセットされたら、攻撃関連のアニメーションを再生し、ダメージを反映したHPをセット
    else if (textKind === "compati") {
      const { damage, isHit, isCriticalHit } = await getDamage(!isMe);
      await playAttackingFlow(!isMe, pokeState, isHit, isCriticalHit, damage);
      setHpOnDamage(isMe, pokeState, damage);//HPの更新
      setOtherAreaVisible(prev => ({ ...prev, text: false, notHit: false, critical: false }));
    }
    //死亡エフェクトを入れて、ゲーム続行ORゲームセット
    else if (textKind === "dead") {
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: false }));
      await playDeathEffect(isMe, pokeState);

      //ライフを減らし、残りライフがあれば次のポケモンをセットする。なければゲーム終了。
      setLife(isMe);
      const life = (isMe ? myLife : opLife).current;
      if (life > 0) {
        if (isMe) setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: true }));
        else await setNextOpPokeName(life);
      } else {
        setWinner(!isMe)
      }
    }
  };

  return {
    toDoWhenSetPokeName,
    toDoWhenSetImg,
    toDoWhenSetHp,
    toDoWhenSetText,
  };
}
