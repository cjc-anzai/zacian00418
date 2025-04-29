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
    kind.volume = 0.25;
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

    let damage = 0;
    let isCriticalHit = false;   //急所フラグ
    const hitRate = weaponInfo[weaponName].hitRate;   //技の命中率を取得
    const isHit = Math.random() * 100 < hitRate;    //命中判定

    //命中時のみダメージ計算する
    if (isHit) {
      const { power: weaponPower, kind: weaponKind } = weaponInfo[weaponName];    //技威力と物理or特殊
      const attackPower = pokeInfo[attacker][weaponKind === "physical" ? "a" : "c"];    //攻撃数値or特攻数値
      const defensePower = pokeInfo[defender][weaponKind === "physical" ? "b" : "d"];   //防御数値or特防数値
      const randomMultiplier = Math.floor((Math.random() * 0.16 + 0.85) * 100) / 100;    //乱数 0.85~1.00
      const weaponType = weaponInfo[weaponName].type;
      const [atcType1, atcType2] = [pokeInfo[attacker].type1, pokeInfo[attacker].type2];
      const [defType1, defType2] = [pokeInfo[defender].type1, pokeInfo[defender].type2];
      const isSameType = (weaponType === atcType1) || (weaponType === atcType2);    //タイプ一致フラグ
      const multiplier = (typeChart[weaponType][defType1] ?? 1) * (typeChart[weaponType][defType2] ?? 1);   //相性
      isCriticalHit = Math.random() < 0.0417 && multiplier !== 0;;   //急所フラグ


      //ダメージ計算　22 * 技威力 * (AorC / BorD) / 50 + 2 * ダメージ補正(* 乱数　* タイプ一致 * 相性 * 急所)
      damage = Math.floor(22 * weaponPower * (attackPower / defensePower));
      damage = Math.floor(damage / 50 + 2);   //基礎ダメージ
      const basicDamage = damage;   //デバッグ用
      damage = Math.floor(damage * randomMultiplier);    // 乱数
      damage = Math.floor(damage * (isSameType ? 1.5 : 1));    // タイプ一致補正
      damage = Math.floor(damage * multiplier);   //相性補正
      damage = Math.floor(damage * (isCriticalHit ? 1.5 : 1));   //急所

      console.log(`${attacker}\n${weaponName}\n威力：${weaponPower}\n攻撃力：${attackPower}\n防御力：${defensePower}`);
      console.log(`${defender}に${damage}ダメージ\n基礎ダメージ：${basicDamage}\n乱数：${randomMultiplier}\nタイプ一致：${isSameType ? 1.5 : 1}\n相性：${multiplier}\n急所：${isCriticalHit ? 1.5 : 1}`);
    }
    else {
      console.log(`${attacker}の攻撃は当たらなかった`);
    }

    return { damage, isCriticalHit, isHit };
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
      let damage = 0;
      damage = Math.floor(22 * weaponPower * (attackPower / defensePower));
      damage = Math.floor(damage / 50 + 2);   //基礎ダメージ
      damage = Math.floor(damage * (isSameType ? 1.5 : 1));    // タイプ一致補正
      damage = Math.floor(damage * multiplier);   //相性補正

      return damage;
    }

    const opWeapon1 = pokeInfo[opPokeState.name].weapon1;
    const opWeapon2 = pokeInfo[opPokeState.name].weapon2;
    const opWeapon3 = pokeInfo[opPokeState.name].weapon3;

    // 技とダメージ・優先度をまとめる
    const opWeapons = [
      { name: opWeapon1, damage: compareDamage(opPokeState.name, myPokeName, opWeapon1), priority: weaponInfo[opWeapon1].priority },
      { name: opWeapon2, damage: compareDamage(opPokeState.name, myPokeName, opWeapon2), priority: weaponInfo[opWeapon2].priority },
      { name: opWeapon3, damage: compareDamage(opPokeState.name, myPokeName, opWeapon3), priority: weaponInfo[opWeapon3].priority },
    ];

    console.log(`${opWeapons[0].name}の最大火力：${opWeapons[0].damage}\n${opWeapons[1].name}の最大火力：${opWeapons[1].damage}\n${opWeapons[2].name}の最大火力：${opWeapons[2].damage}`);

    // 最もダメージが大きい技のインデックスを取得
    const opWtrongestWeaponIndex = opWeapons
      .map((w, i) => ({ ...w, index: i }))
      .reduce((max, w) => w.damage > max.damage ? w : max)
      .index;

    // 優先度1以上の技の中で最もダメージが大きい技のインデックス（なければ null）
    const highPriorityWeapons = opWeapons
      .map((w, i) => ({ ...w, index: i }))
      .filter(w => w.priority >= 1);

    const strongestHighPriorityWeaponIndex =
      highPriorityWeapons.length > 0
        ? highPriorityWeapons.reduce((max, w) => w.damage > max.damage ? w : max).index
        : null;


    const strongestWeapon = opWeapons[opWtrongestWeaponIndex].name;   //最も与えるダメージが大きい技
    const strongestHighPriorityWeapon = opWeapons[strongestHighPriorityWeaponIndex].name;   //最も与えるダメージが大きい先制技
    const strongestHighPriorityWeaponDamage = opWeapons[strongestHighPriorityWeaponIndex].damage * 0.85;   //最も与えるダメージが大きい先制技(最低乱数)
    const myPokeSpeed = pokeInfo[myPokeState.name].s;
    const opPokeSpeed = pokeInfo[opPokeState.name].s;
    //相手(自分)が出すであろう技とそのダメージを求める
    const myWeapon1 = pokeInfo[myPokeState.name].weapon1;
    const myWeapon2 = pokeInfo[myPokeState.name].weapon2;
    const myWeapon3 = pokeInfo[myPokeState.name].weapon3 === "なし" ? pokeInfo[myPokeState.name].weapon1 : pokeInfo[myPokeState.name].weapon3;
    const myWeapon1Damage = compareDamage(myPokeState.name, opPokeState.name, myWeapon1);
    const myWeapon2Damage = compareDamage(myPokeState.name, opPokeState.name, myWeapon2);
    const myWeapon3Damage = compareDamage(myPokeState.name, opPokeState.name, myWeapon3);
    const myMaxDamage = Math.max(myWeapon1Damage, myWeapon2Damage, myWeapon3Damage) * 0.93;   //中間乱数のダメージ

    //先制技を持っていているとき
    if (strongestHighPriorityWeaponIndex) {
      //相手が後攻であり、自分の最大火力の攻撃の乱数50％で、相手が倒れる時は先制技を選択する
      if (myPokeSpeed > opPokeSpeed && opPokeState.h < myMaxDamage) {
        handleStateChange("opWeapon", strongestHighPriorityWeapon);
      }
      //先制技(最低乱数)で相手(自分)を倒せる場合は先制技を選択する
      else{
        const selectedWeapon = strongestHighPriorityWeaponDamage > myPokeState.h ? strongestHighPriorityWeapon : strongestWeapon;
        handleStateChange("opWeapon", selectedWeapon);
      }
    }
    else {
      handleStateChange("opWeapon", strongestWeapon);
    }
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
