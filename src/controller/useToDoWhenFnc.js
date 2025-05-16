import { useBattleHandlers } from "./useBattleHandlers";
import { delay } from "../model/model";

export function useToDoWhenFnc(battleState) {

  //インポートの取得===========================================================
  const {
    setOtherAreaVisible,
    myLife, opLife,
    changePokeName,
    myTurn, changeTurn,
  } = battleState;

  const {
    checkIsMe,
    setPokeInfo,
    setHpOnEntry,
    setPokeNumH,
    setGoText,
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

    setTimeout(() => {
      //バトル開始時OR交代時にgoTextをセット
      if (pokeState.text.content === "" || pokeState.text.kind === "back" || pokeState.text.kind === "dead") {
        setGoText(isMe, pokeState);
        return;
      }

      setTimeout(() => {
        setOtherAreaVisible(prev => ({ ...prev, text: false, notHit: false, critical: false }));
        if (pokeState.hp > 0) {
          //先攻か交代後に攻撃を受けた時 || 後攻で自分の攻撃が終了したらターン終了
          if ((isMe && (myTurn.current === "first" || changeTurn.current)) || (!isMe && myTurn.current === "after")) {
            setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
            changeTurn.current = false;   //非交代時は無意味だが害はなし
          } else {
            //先攻の攻撃が終わったら、後攻の技テキストをセット
            setWeaponText(isMe, pokeState);
          }
        } else {
          setDeadText(isMe, pokeState);
        }
      }, 1000);
    }, 1000);
  };


  //テキストがセットされたら、テキストの種別によって処理を分岐する
  const toDoWhenSetText = async (pokeState) => {
    const isMe = checkIsMe(pokeState);
    const textKind = pokeState.text.kind;

    //goTextがセットされたら表示制御
    if (textKind === "go") {
      setAreaVisibleForApp(isMe);
      //交代時は先攻の技をセット
      if (changeTurn.current) {
        setTimeout(async () => {
          await setMyTurn();
          setWeaponText(myTurn.current === "first", pokeState);
        }, 2000);
      }
    }
    //backTextがセットされたら表示制御して次のポケモン名をセット
    else if (textKind === "back" && isMe) {
      setAreaVisibleForChange();
      delay(() => setPokeName(isMe, changePokeName.current), 1000);
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
    }
    //死亡エフェクトを入れて、ゲーム続行ORゲームセット
    else if (textKind === "dead") {
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: false }));
      changeTurn.current = false;
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
