import { sounds, pokeInfo, weaponInfo, compatiTexts, typeChart } from "../model/model";

export function useBattleHandlers(battleState) {

  if (!battleState) {
    console.error('useBattleHandlers: battleStateがundefinedです');
    return {}; // 空オブジェクトを返してとりあえず壊さない
  }

  //インポートの取得===========================================================
  const {
    setOtherAreaVisible,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    setMyPokeStateTrigger,
    setOpPokeStateTrigger,
    setMyTurn,
    setMyTurnTrigger,
    skipTurn,
    resultText,
    loopAudioRef, turnCnt, beforePokeName,
  } = battleState;

  //サウンド関係============================================================================================

  //指定したSEを再生
  const playSe = (kind) => {
    const seMap = {
      start: sounds.general.start,
      select: sounds.general.select,
      decide: sounds.general.decide,
      cancel: sounds.general.cancel,
      back: sounds.general.back,
      gameResult:
        resultText === "WIN" ? sounds.general.win
          : resultText === "LOSE" ? sounds.general.lose
            : null,
    };

    const se = seMap[kind];
    if (!se) return;

    if (kind === "start") {
      // onended 仕込みたい音は元のインスタンスで
      se.play().catch(e => console.error('効果音の再生に失敗:', e));
    } else {
      // その他は clone で連続再生対応
      se.cloneNode().play().catch(e => console.error('効果音の再生に失敗:', e));
    }
  };


  //ポケモンの鳴き声再生
  const playPokeVoice = (pokeName, onEnded) => {
    const voice = pokeInfo[pokeName].voice;
    voice.currentTime = 0;
    voice.onended = onEnded || null;
    voice.play().catch(e => {
      console.error('効果音の再生に失敗:', e);
      onEnded?.();
    });
  };

  //各技のSEを再生
  const playWeaponSound = (weaponName, onEnded) => {
    const sound = weaponInfo[weaponName].sound;
    sound.currentTime = 0;
    sound.onended = onEnded || null;
    sound.play().catch(e => {
      console.error('効果音の再生に失敗:', e);
      onEnded?.();
    });
  };

  //技相性にあったダメージSEを再生
  const playDamageSound = (who) => {
    const text = who === "my" ? myPokeState.text : opPokeState.text;
    const sound =
      text.includes(compatiTexts.batsugun) ? sounds.damage.batsugun :
        text.includes(compatiTexts.toubai) ? sounds.damage.toubai :
          text.includes(compatiTexts.imahitotsu) ? sounds.damage.imahitotsu :
            null;

    sound?.play().catch(e => console.error('効果音の再生に失敗:', e));
  };

  //BGM情報をセット
  const setBgm = (kind) => {
    kind.volume = 0.15;
    kind.loop = true;
    loopAudioRef.current = kind;
  }

  // BGMを止める
  const stopBgm = () => {
    if (loopAudioRef.current) {
      loopAudioRef.current.pause();
      loopAudioRef.current.currentTime = 0;
    }
  }

  //複数の呼び出し先がある関数=================================================================================

  //Stateに同じ値がセットされたときにトリガーを更新して、強制的にuseEffectを発火させる
  const handleStateChange = (stateName, newState) => {
    const updateState = (setter, triggerSetter, key) => {
      setter(prev => {
        if (prev[key] === newState) {
          console.log(`トリガー更新：${stateName}は変わらず「${newState}」`);
          triggerSetter(prev => ({ ...prev, [key]: prev[key] + 1 }));
          return prev;
        } else {
          console.log(`${stateName}を「${newState}」に更新する`);
          return { ...prev, [key]: newState };
        }
      });
    };

    const cases = {
      myWeapon: () => updateState(setMyPokeState, setMyPokeStateTrigger, "weapon"),
      myText: () => updateState(setMyPokeState, setMyPokeStateTrigger, "text"),
      myHp: () => updateState(setMyPokeState, setMyPokeStateTrigger, "h"),
      myTurn: () => {
        setMyTurn(prev => {
          if (prev === newState) {
            console.log(`トリガー更新：${stateName}は変わらず「${newState}」`);
            setMyTurnTrigger(t => t + 1);
            return prev;
          } else {
            console.log(`${stateName}を「${newState}」に更新する`);
            return newState;
          }
        });
      },
      opWeapon: () => updateState(setOpPokeState, setOpPokeStateTrigger, "weapon"),
      opText: () => updateState(setOpPokeState, setOpPokeStateTrigger, "text"),
      opHp: () => updateState(setOpPokeState, setOpPokeStateTrigger, "h"),
    };

    cases[stateName]?.();
  };

  //toDoWhenSetImg()の共通部品
  const showGoSequence = (areaSetters, name, delayBase) => {
    const [setTextVisible, setMainVisible, playVoice] = areaSetters;
    delay(() => setOtherAreaVisible(prev => ({ ...prev, text: true })), delayBase);
    delay(() => setTextVisible(prev => ({ ...prev, text: true })), delayBase);
    delay(() => setMainVisible(prev => ({ ...prev, name: true })), delayBase + 1000);
    delay(() => playPokeVoice(name), delayBase + 1000);
    delay(() => setOtherAreaVisible(prev => ({ ...prev, text: false })), delayBase + 2000);
    delay(() => setTextVisible(prev => ({ ...prev, text: false })), delayBase + 2000);
  };

  //ダメージ計算
  const calcDamage = (attacker, defender, weaponName) => {
    const { power: weaponPower, kind: weaponKind } = weaponInfo[weaponName];    //技威力と物理or特殊
    const attackPower = pokeInfo[attacker][weaponKind === "physical" ? "a" : "c"];    //攻撃数値or特攻数値 
    const defensePower = pokeInfo[defender][weaponKind === "physical" ? "b" : "d"];   //防御数値or特防数値 
    const randomMultiplier = Math.floor((Math.random() * 0.16 + 0.85) * 100) / 100;    //乱数 0.85~1.00
    const weaponType = weaponInfo[weaponName].type;
    const [atcType1, atcType2] = [pokeInfo[attacker].type1, pokeInfo[attacker].type2];
    const [defType1, defType2] = [pokeInfo[defender].type1, pokeInfo[defender].type2];
    const isSameType = (weaponType === atcType1) || (weaponType === atcType2);    //タイプ一致フラグ
    const multiplier = (typeChart[weaponType][defType1] ?? 1) * (typeChart[weaponType][defType2] ?? 1);   //相性
    const isCriticalHit = Math.random() < 0.0417;   //急所フラグ
    // const isCriticalHit = Math.random() < 1 && multiplier !== 0;   //急所フラグ

    //ダメージ計算　22 * 技威力 * (AorC / BorD) / 50 + 2 * ダメージ補正(* 乱数　* タイプ一致 * 相性 * 急所)
    const damage1 = Math.floor(22 * weaponPower * (attackPower / defensePower));
    const damage2 = Math.floor(damage1 / 50 + 2);   //基礎ダメージ
    const damage3 = Math.floor(damage2 * randomMultiplier);    // 乱数
    const damage4 = Math.floor(damage3 * (isSameType ? 1.5 : 1));    // タイプ一致補正
    const damage5 = Math.floor(damage4 * multiplier);   //相性補正
    const damage6 = Math.floor(damage5 * (isCriticalHit ? 1.5 : 1));   //急所
    
    console.log(`${attacker}\n${weaponName}\n威力：${weaponPower}\n攻撃力：${attackPower}\n防御力：${defensePower}`);
    console.log(`${defender}に${damage6}ダメージ\n基礎ダメージ：${damage2}\n乱数：${randomMultiplier}\nタイプ一致：${isSameType ? 1.5 : 1}\n相性：${multiplier}\n急所：${isCriticalHit ? 1.5 : 1}`);

    return {damage: damage6, isCriticalHit};
  }


  //相手が自分のバトル場のポケモンに対して、相性の良い技をセットする
  const choiseOpWeapon = () => {
    const myPokeName = skipTurn ? beforePokeName.current : myPokeState.name;

    const compareDamage = (attacker, defender, weaponName) => {
      const { power: weaponPower, kind: weaponKind } = weaponInfo[weaponName];    //技威力と物理or特殊
      const attackPower = pokeInfo[attacker][weaponKind === "physical" ? "a" : "c"];    //攻撃数値or特攻数値 
      const defensePower = pokeInfo[defender][weaponKind === "physical" ? "b" : "d"];   //防御数値or特防数値 
      const weaponType = weaponInfo[weaponName].type;
      const [atcType1, atcType2] = [pokeInfo[attacker].type1, pokeInfo[attacker].type2];
      const [defType1, defType2] = [pokeInfo[defender].type1, pokeInfo[defender].type2];
      const isSameType = (weaponType === atcType1) || (weaponType === atcType2);    //タイプ一致フラグ
      const multiplier = (typeChart[weaponType][defType1] ?? 1) * (typeChart[weaponType][defType2] ?? 1);   //相性
  
      //ダメージ計算　22 * 技威力 * (AorC / BorD) / 50 + 2 * ダメージ補正(* 乱数　* タイプ一致 * 相性 * 急所)
      const damage1 = Math.floor(22 * weaponPower * (attackPower / defensePower));
      const damage2 = Math.floor(damage1 / 50 + 2);   //基礎ダメージ
      const damage3 = Math.floor(damage2 * (isSameType ? 1.5 : 1));    // タイプ一致補正
      const damage4 = Math.floor(damage3 * multiplier);   //相性補正
      
      return damage4;
    }

    //2つの技で与えるダメージを比較する
    const weapon1 = pokeInfo[opPokeState.name].weapon1;
    const weapon2 = pokeInfo[opPokeState.name].weapon2;
    const weapon1Damage = compareDamage(opPokeState.name, myPokeName, weapon1);
    const weapon2Damage = compareDamage(opPokeState.name, myPokeName, weapon2);

    console.log(`${weapon1}の最大火力：${weapon1Damage}\n${weapon2}の最大火力：${weapon2Damage}\n`);

    //与えるダメージが大きい技をセットする　どちらも同じ場合は技１をセットする
    const weapon = weapon1Damage >= weapon2Damage ? weapon1 : weapon2;
    handleStateChange("opWeapon", weapon);
  }

  //残りHPを保存
  const saveHp = (who) => {
    const state = who === "my" ? myPokeState : opPokeState;
    const hpKey = ["poke1Name", "poke2Name", "poke3Name"]
      .find(key => state[key] === state.name)
      ?.replace("Name", "H");

    if (hpKey) state[hpKey] = state.h;
  };

  //setTimeout()の簡略化
  const delay = (fn, ms) => setTimeout(fn, ms);

  //ターン数を更新してコンソールに表示する。（デバッグ用）
  const updateTurnCnt = () => {
    console.log(turnCnt.current + "ターン目================================================");
    turnCnt.current++;
  }

  //textから余計な文字を取り除く（UI表示用）
  const getTrueText = (text) => {
    const tags = ["goText", "backText", "weaponText", "compatiText", "deadText"];
    const index = tags.find(tag => text.includes(tag));
    let trueText = index ? text.slice(0, text.indexOf(index)) : text;
    return trueText === compatiTexts.toubai ? "" : trueText;
  };

  return {
    playSe,
    playPokeVoice,
    playWeaponSound,
    playDamageSound,
    setBgm,
    stopBgm,
    handleStateChange,
    getTrueText,
    updateTurnCnt,
    saveHp,
    choiseOpWeapon,
    showGoSequence,
    calcDamage,
    delay,
  };
}
