import { compatiTexts, typeChart } from "../model/model";

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

    if (kind === "gameResult") {
      kind = resultText === "WIN" ? "win"
        : resultText === "LOSE" ? "lose"
          : null;
    }

    const se = new Audio(`https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/${kind}Se.mp3`);

    if (kind === "start") {
      // onended 仕込みたい音は元のインスタンスで
      se.play().catch(e => console.error('効果音の再生に失敗:', e));
    } else {
      // その他は clone で連続再生対応
      se.cloneNode().play().catch(e => console.error('効果音の再生に失敗:', e));
    }
    return se;
  };


  //ポケモンの鳴き声再生
  const playPokeVoice = async (pokeName, onEnded) => {
    const voice = new Audio(await getPokeInfo(pokeName, "Voice"));
    voice.currentTime = 0;
    voice.onended = onEnded || null;
    voice.play().catch(e => {
      console.error('効果音の再生に失敗:', e);
      onEnded?.();
    });
  };

  //各技のSEを再生
  const playWeaponSound = async (weaponName, onEnded) => {
    const sound = new Audio(await getWeaponInfo(weaponName, "Sound"));
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
      text.includes(compatiTexts.batsugun) ? new Audio(`https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/damage/batsugun.mp3`) :
        text.includes(compatiTexts.toubai) ? new Audio(`https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/damage/toubai.mp3`) :
          text.includes(compatiTexts.imahitotsu) ? new Audio(`https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/damage/imahitotsu.mp3`) :
            null;

    sound?.play().catch(e => console.error('効果音の再生に失敗:', e));
  };

  //BGM情報をセット
  const setBgm = (kind) => {
    const bgm = new Audio(`https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/bgm/${kind}Bgm.wav`);
    bgm.volume = 0.25;
    bgm.loop = true;
    loopAudioRef.current = bgm;
    return bgm;
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
  const calcDamage = async (attacker, defender, weaponName) => {

    let damage = 0;
    let isCriticalHit = false;   //急所フラグ
    const hitRate = await getWeaponInfo(weaponName, "HitRate");   //技の命中率を取得
    const isHit = Math.random() * 100 < hitRate;    //命中判定

    //命中時のみダメージ計算する
    if (isHit) {
      const [weaponPower, weaponKind, weaponType] = await Promise.all([
        getWeaponInfo(weaponName, "Power"),   //技威力
        getWeaponInfo(weaponName, "Kind"),    //物理or特殊
        getWeaponInfo(weaponName, "Type"),    //技タイプ
      ]);

      const isMy = attacker === myPokeState.name;
      const [atcState, defState] = isMy ? [myPokeState, opPokeState] : [opPokeState, myPokeState];
      const [atcType1, atcType2] = [atcState.type1, atcState.type2];
      const [defType1, defType2] = [defState.type1, defState.type2];


      const attackPower = await getPokeInfo(attacker, weaponKind === "物理" ? "A" : "C");    //攻撃数値or特攻数値
      const defensePower = await getPokeInfo(defender, weaponKind === "物理" ? "B" : "D");   //防御数値or特防数値
      const randomMultiplier = Math.floor((Math.random() * 0.16 + 0.85) * 100) / 100;    //乱数 0.85~1.00
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
  const choiseOpWeapon = async () => {

    const myPokeName = skipTurn ? beforePokeName.current : myPokeState.name;

    const compareDamage = async (attacker, defender, weaponName,) => {
      const [weaponPower, weaponKind, weaponType] = await Promise.all([
        getWeaponInfo(weaponName, "Power"),   //技威力
        getWeaponInfo(weaponName, "Kind"),    //物理or特殊
        getWeaponInfo(weaponName, "Type"),    //技タイプ
      ]);

      const [atcType1, atcType2] = [opPokeState.type1, opPokeState.type2];
      const [defType1, defType2] = await Promise.all([
        getPokeInfo(myPokeName, "Type1"),
        getPokeInfo(myPokeName, "Type2"),
      ]);

      const attackPower = await getPokeInfo(attacker, weaponKind === "物理" ? "A" : "C");    //攻撃数値or特攻数値
      const defensePower = await getPokeInfo(defender, weaponKind === "物理" ? "B" : "D");   //防御数値or特防数値

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

    // 非同期でダメージを全部まとめて取得
    const [w1Damage, w2Damage, w3Damage] = await Promise.all([
      compareDamage(opPokeState.name, myPokeName, opPokeState.weapon1),
      compareDamage(opPokeState.name, myPokeName, opPokeState.weapon2),
      compareDamage(opPokeState.name, myPokeName, opPokeState.weapon3),
    ]);

    const [w1Priority, w2Priority, w3Priority] = await Promise.all([
      getWeaponInfo(opPokeState.weapon1, "Priority"),   //技威力
      getWeaponInfo(opPokeState.weapon2, "Priority"),    //物理or特殊
      getWeaponInfo(opPokeState.weapon3, "Priority"),    //技タイプ
    ]);

    // 技とダメージ・優先度をまとめる
    const opWeapons = [
      { name: opPokeState.weapon1, damage: w1Damage, priority: w1Priority },
      { name: opPokeState.weapon2, damage: w2Damage, priority: w2Priority },
      { name: opPokeState.weapon3, damage: w3Damage, priority: w3Priority },
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

    const [myPokeSpeed, opPokeSpeed, myWeapon1, myWeapon2, weapon3Raw] = await Promise.all([
      getPokeInfo(myPokeState.name, "S"),
      getPokeInfo(opPokeState.name, "S"),
      getPokeInfo(myPokeState.name, "Weapon1"),
      getPokeInfo(myPokeState.name, "Weapon2"),
      getPokeInfo(myPokeState.name, "Weapon3"),
    ]);

    const myWeapon3 = weapon3Raw === "なし"
      ? myWeapon1
      : weapon3Raw;

    //相手(自分)が出すであろう技とそのダメージを求める
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
      else {
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

  //DB操作=============================================================================
  const getPokeInfo = async (pokeName, column) => {
    try {
      const res = await fetch(
        `https://1aazl41gyk.execute-api.ap-northeast-1.amazonaws.com/prod/getPokeInfo?id=${encodeURIComponent(pokeName)}`
      );
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const result = await res.json();
      return result.data?.[column] ?? null;
    } catch (err) {
      console.error("エラー発生:", err.message);
      return null;
    }
  };

  const getWeaponInfo = async (weaponName, column) => {
    try {
      const res = await fetch(
        `https://1aazl41gyk.execute-api.ap-northeast-1.amazonaws.com/prod/getWeaponInfo?id=${encodeURIComponent(weaponName)}`
      );
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const result = await res.json();
      return result.data?.[column] ?? null;
    } catch (err) {
      console.error("エラー発生:", err.message);
      return null;
    }
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
    getPokeInfo, getWeaponInfo
  };
}
