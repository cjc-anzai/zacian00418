import {
  compatiTexts,
  calcResistanceForAllOpPokes,
  selectBetterOpPokesLogic,
  calcNewHp,
  getGoText, getWeaponText, getCompatiTextLogic, getDeadText,
  calcMultiplier,
  getMostEffectiveWeaponLogic, predictMyActionLogic, choiseBetterWeaponLogic,
  getAttackEffectElem, getDamageEffectElem,
  jumpEffect, attackEffectLogic, damageEffectLogic,
  calcTrueDamage, adjustHpBarLogic,
  selectNextOpPokeLogic, delay,
} from "../model/model";

export function useBattleHandlers(battleState) {

  //インポートの取得===========================================================
  const {
    defaultAreaVisible,
    myAreaVisible, opAreaVisible,
    setMyAreaVisible, setOpAreaVisible,
    setOtherAreaVisible,
    defaultPokeState, defaultPokeStateTrigger,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    setMyPokeStateTrigger,
    setOpPokeStateTrigger,
    setSelectedOrder,
    myLife, opLife,
    mySelectedWeapon, opSelectedWeapon,
    changePokeName,
    myTurn, changeTurn,
    resultText, turnCnt,
    loopAudioRef,
  } = battleState;

  //useToDoWhenFnc()のパーツとなる関数=============================================================================================

  //引数のstateがmyPokeStateか評価し真偽を返す
  const checkIsMe = (pokeState) => {
    const isMe = pokeState.name === myPokeState.name;
    return isMe;
  }

  //DBから取得したポケモンのデータをstateにセットする(HP以外)
  const setPokeInfo = async (isMe, pokeState) => {
    const pokeInfo = await getPokeInfo(pokeState.name);
    const setPokeState = isMe ? setMyPokeState : setOpPokeState;
    setPokeState(prev => ({
      ...prev,
      img: pokeInfo.img, voice: pokeInfo.voice, type1: pokeInfo.type1, type2: pokeInfo.type2,
      a: pokeInfo.a, b: pokeInfo.b, c: pokeInfo.c, d: pokeInfo.d, s: pokeInfo.s,
      weapon1: pokeInfo.weapon1, weapon2: pokeInfo.weapon2, weapon3: pokeInfo.weapon3, weapon4: pokeInfo.weapon4,
    }));
  }

  //ポケモン登場時のHPセット
  const setHpOnEntry = (isMe, pokeState) => {
    //HPバーの制御
    const currentHp = getPokeNumH(pokeState);
    adjustHpBar(isMe, pokeState, currentHp);
    //HPのセット
    const setPokeState = isMe ? setMyPokeState : setOpPokeState;
    const setPokeStateTrigger = isMe ? setMyPokeStateTrigger : setOpPokeStateTrigger;
    pokeState.h === currentHp ?
      setPokeStateTrigger(prev => ({ ...prev, hp: prev.hp + 1 })) :
      setPokeState(prev => ({ ...prev, hp: currentHp }));
  }

  //poke1H等のHpをバトル場のポケモンのHpと同じ値に更新する
  const setPokeNumH = (isMe, pokeState) => {
    const setPokeState = isMe ? setMyPokeState : setOpPokeState;
    const pokeNum = getPokeNum(pokeState);
    setPokeState(prev => ({ ...prev, [`poke${pokeNum}H`]: pokeState.hp, }));
  }

  //Goテキストをセットする
  const setGoText = (isMe, pokeState) => {
    const goText = getGoText(isMe, pokeState.name);
    const setPokeState = isMe ? setMyPokeState : setOpPokeState;
    setPokeState(prev => ({ ...prev, text: { content: goText, kind: "go" } }));
  }

  //Weaponテキストをセットする
  const setWeaponText = (attackerIsMe, pokeState) => {
    const weaponName = getWeaponName(attackerIsMe);
    const weaponText = getWeaponText(attackerIsMe, pokeState.name, weaponName);

    const setPokeState = attackerIsMe ? setMyPokeState : setOpPokeState;
    const setPokeStateTrigger = attackerIsMe ? setMyPokeStateTrigger : setOpPokeStateTrigger;
    pokeState.text.content === weaponText ?
      setPokeStateTrigger(prev => ({ ...prev, text: prev.text + 1 })) :
      setPokeState(prev => ({ ...prev, text: { content: weaponText, kind: "weapon" } }));
  }

  //deadテキストをセットする
  const setDeadText = (isMe, pokeState) => {
    const deadText = getDeadText(isMe, pokeState.name);
    const setPokeState = isMe ? setMyPokeState : setOpPokeState;
    setPokeState(prev => ({ ...prev, text: { content: deadText, kind: "dead" } }));
  }

  //お互いの素早さと優先度を比較して、先攻後攻をセットする
  const setMyTurn = async () => {
    if (!changeTurn.current) {
      //優先度と素早さを取得する
      const { myWeaponPriority, opWeaponPriority } = await getWeaponsPriority();
      const [myPokeSpeed, opPokeSpeed] = [myPokeState.s, opPokeState.s];

      //優先度が同じ場合、素早さが速い方が先攻
      if (myWeaponPriority === opWeaponPriority) {
        if (myPokeSpeed !== opPokeSpeed) {
          myTurn.current = myPokeSpeed > opPokeSpeed ? "first" : "after";
          console.log(`${myPokeState.name}の素早さ：${myPokeSpeed}\n${opPokeState.name}の素早さ：${opPokeSpeed}\n`);
        }
        // 同速の場合ランダムで先攻を決める
        else if (myPokeSpeed === opPokeSpeed) {
          const isMyTurnFirst = Math.random() < 0.5;
          myTurn.current = isMyTurnFirst ? "first" : "after";
          console.log(isMyTurnFirst ? "同速のためランダムで先攻になった" : "同速のためランダムで後攻になった");
        }
      }
      //優先度が異なる場合、優先度が高い方が先攻
      else {
        const iAmPriority = myWeaponPriority > opWeaponPriority;
        myTurn.current = iAmPriority ? "first" : "after";
        console.log(`技の優先度差で${iAmPriority ? "先攻" : "後攻"}`);
      }
    }
    //交代ターンは後攻 
    else {
      myTurn.current = "after"
      console.log("交代ターンのため後攻");
    }
  }

  //goTextがセットされた時の表示制御
  const setAreaVisibleForApp = (isMe) => {
    //バトル開始時の表示制御(バトル開始時はお互いにGoテキストがセットされるため、一方のみ処理を行うため、isMeを入れる)
    if (isMe && !myAreaVisible.poke && !opAreaVisible.poke) {
      controllAreaVisibleForApp(setMyAreaVisible, myPokeState.name, 0);
      controllAreaVisibleForApp(setOpAreaVisible, opPokeState.name, 3000);
      delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 5000);
    }
    //自分のポケモン交換時の表示制御
    else if (!myAreaVisible.poke && opAreaVisible.poke) {
      controllAreaVisibleForApp(setMyAreaVisible, myPokeState.name, 0);
      if (!changeTurn.current) {
        delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 2000);
      }
    }
    //相手のポケモン交換時の表示制御
    else if (myAreaVisible.poke && !opAreaVisible.poke) {
      controllAreaVisibleForApp(setOpAreaVisible, opPokeState.name, 0);
      delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 3000);
    }
  }

  //ポケモン交換時の表示制御
  const setAreaVisibleForChange = () => {
    playSe("back");
    setOtherAreaVisible(p => ({ ...p, text: true }));
    setMyAreaVisible(p => ({ ...p, text: true }));
    delay(() => setMyAreaVisible(p => ({ ...p, poke: false })), 1000);
  }

  //ポケモン名をセットする
  const setPokeName = (isMe, pokeName) => {
    const setPokeState = isMe ? setMyPokeState : setOpPokeState;
    setPokeState(prev => ({ ...prev, name: pokeName }));
  }

  //相性テキストをセットする
  const setCompatiText = async (attackerIsMe) => {
    const defState = attackerIsMe ? opPokeState : myPokeState;
    const [setPokeState, setPokeStateTrigger] = attackerIsMe ?
      [setOpPokeState, setOpPokeStateTrigger] : [setMyPokeState, setMyPokeStateTrigger];

    const conpatiText = await getCompatiText(attackerIsMe, defState);
    defState.text.content === conpatiText ?
      setPokeStateTrigger(prev => ({ ...prev, text: prev.text + 1 })) :
      setPokeState(prev => ({ ...prev, text: { content: conpatiText, kind: "compati" } }));
  }

  //ダメ計に必要な情報を取得して、モデル側の関数に渡す
  const getDamage = async (attackerIsMe) => {
    const weaponName = getWeaponName(attackerIsMe);
    const { weaponInfo, attackerInfo, defenderInfo } = await getUseInCalcDamageInfo(attackerIsMe, weaponName);
    const { trueDamage, isHit, isCriticalHit } = calcTrueDamage(weaponInfo, attackerInfo, defenderInfo);
    return { damage: trueDamage, isHit, isCriticalHit };
  }

  //攻撃関連のアニメーションを再生し、ダメージを反映したHPをセット
  const playAttackingFlow = async (attackerIsMe, defState, isHit, isCriticalHit, damage) => {
    const [setAreaVisible, setOtherTextInvisible] = attackerIsMe ? [setMyAreaVisible, setOpAreaVisible] : [setOpAreaVisible, setMyAreaVisible];
    setOtherAreaVisible(prev => ({ ...prev, text: true }));
    setAreaVisible(prev => ({ ...prev, text: true }));    //技テキスト表示

    //ジャンプと同時に鳴き声再生→攻撃モーションと同時に技SE再生
    await attackEffect(attackerIsMe, defState, isHit);
    setAreaVisible(prev => ({ ...prev, text: false }));    //技テキストを非表示

    if (isHit) {
      setOtherTextInvisible(prev => ({ ...prev, text: true }));  //相性テキスト表示

      //急所テキストの表示
      if (isCriticalHit) setOtherAreaVisible(prev => ({ ...prev, critical: true }));
      // 急所ではなく、相性が等倍の場合はテキストエリアは表示しない
      else if (defState.text.content === compatiTexts.toubai) setOtherAreaVisible(prev => ({ ...prev, text: false }));

      //無効の場合以外はダメージエフェクトを入れる
      if (defState.text.content !== compatiTexts.mukou) {
        const currentHp = getPokeNumH(defState);
        const newHp = calcNewHp(currentHp, damage);
        adjustHpBar(!attackerIsMe, defState, newHp);
        await damageEffect(attackerIsMe, defState);
      }
    } else {
      //当たらなかったテキストを表示
      setOtherAreaVisible(prev => ({ ...prev, notHit: true }));
    }
  }

  //攻撃を受けた後のHPセット
  const setHpOnDamage = (isMe, pokeState, damage) => {
    //HPバーの制御
    const currentHp = getPokeNumH(pokeState);
    const newHp = calcNewHp(currentHp, damage);
    //HPのセット
    const setPokeState = isMe ? setMyPokeState : setOpPokeState;
    const setPokeStateTrigger = isMe ? setMyPokeStateTrigger : setOpPokeStateTrigger;
    checkIsSameHp(pokeState.hp, currentHp, newHp) ?
      setPokeStateTrigger(prev => ({ ...prev, hp: prev.hp + 1 })) :
      setPokeState(prev => ({ ...prev, hp: newHp }));
  }

  //倒れたポケモンに死亡エフェクトを入れる
  const playDeathEffect = (isMe, pokeState) => {
    return new Promise(async (resolve) => {
      const setAreaVisible = isMe ? setMyAreaVisible : setOpAreaVisible;
      const pokeIMGElm = getDamageEffectElem(!isMe);

      // 1秒後に死亡演出を開始
      setTimeout(async () => {
        setOtherAreaVisible(prev => ({ ...prev, text: true }));
        setAreaVisible(prev => ({ ...prev, text: true }));
        await playPokeVoice(pokeState.name);
        pokeIMGElm.classList.add("pokemon-dead");
      }, 1000);

      // さらに2秒後に非表示 & resolve
      setTimeout(() => {
        setOtherAreaVisible(prev => ({ ...prev, text: false }));
        setAreaVisible(prev => ({ ...prev, poke: false, text: false }));
        resolve(); // ←これが重要！
      }, 3000 + 1); // 最初の1000ms + 次の2000ms
    });
  };

  const setLife = (isMe) => {
    const life = isMe ? myLife : opLife;
    life.current--;
  }

  //相手が2,3体目に出すポケモンをセットする
  const setNextOpPokeName = async (life) => {
    const nextOpPoke = await selectNextOpPoke(life);
    setPokeName(false, nextOpPoke);
  }

  //ゲーム結果画面を表示
  const setWinner = (winnerIsMe) => {
    stopBgm();
    resultText.current = winnerIsMe ? "WIN" : "LOSE";
    setOtherAreaVisible(prev => ({ ...prev, battle: false }));
    playSe(resultText.current.toLowerCase());
  };


  //jsx, jsファイルから呼び出し=================================================================================================

  //DBのPokeInfoから指定したポケモンに紐づく全てのデータを返す
  const getPokeInfo = async (pokeName) => {
    try {
      const url = `https://1aazl41gyk.execute-api.ap-northeast-1.amazonaws.com/prod/getPokeInfo?id=${encodeURIComponent(pokeName)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const result = await res.json();

      const keys = ["Img", "Voice", "Type1", "Type2", "HP", "A", "B", "C", "D", "S", "Weapon1", "Weapon2", "Weapon3", "Weapon4"];
      const pokeInfo = { name: pokeName };
      keys.forEach(k => {
        pokeInfo[k.toLowerCase()] = result.data?.[k] ?? null;
      });

      return pokeInfo;
    } catch (err) {
      console.error(`エラー発生: ${pokeName}`, err);
      return null;
    }
  };

  //DBのWeaponInfoから指定した技に紐づく全てのデータを返す
  const getWeaponInfo = async (weaponName) => {
    try {
      const url = `https://1aazl41gyk.execute-api.ap-northeast-1.amazonaws.com/prod/getWeaponInfo?id=${encodeURIComponent(weaponName)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const result = await res.json();

      const keys = ["Type", "Kind", "Power", "HitRate", "Priority", "Sound"];
      const weaponInfo = { name: weaponName };
      keys.forEach(k => {
        weaponInfo[k.toLowerCase()] = result.data?.[k] ?? null;
      });

      return weaponInfo;
    } catch (err) {
      console.error(`エラー発生: ${weaponName}`, err);
      return null;
    }
  };

  //現在のstateのポケモンが何番目のポケモンかを取得して返す。
  const getPokeNum = (pokeState) => {
    const pokeNum = [pokeState.poke1Name, pokeState.poke2Name, pokeState.poke3Name].findIndex(name => name === pokeState.name) + 1;
    return pokeNum;
  }

  //指定したポケモンの最大HPを取得する
  const getFullHp = (pokeState) => {
    const pokeNum = getPokeNum(pokeState);
    const fullHp = pokeState[`poke${pokeNum}FullH`];
    return fullHp;
  }

  //指定したSEを再生
  const playSe = (kind) => {
    const se = new Audio(`https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/${kind}Se.mp3`);

    // onended 仕込みたい音は元のインスタンスで
    if (kind === "start") {
      se.play().catch(e => console.error(`効果音の再生に失敗:${kind}`, e));
    }
    // その他は clone で連続再生対応
    else {
      se.cloneNode().play().catch(e => console.error(`効果音の再生に失敗:${kind}`, e));
    }
    return se;
  };

  //jsxファイルで呼び出し=================================================================================

  //BGM情報をセット
  const setBgm = (kind) => {
    if (loopAudioRef.current) stopBgm();
    const bgm = new Audio(`https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/bgm/${kind}Bgm.wav`);
    bgm.volume = 0.25;
    bgm.loop = true;
    loopAudioRef.current = bgm;
  }

  const playBgm = () => {
    loopAudioRef.current.play();
  }

  // BGMを止める
  const stopBgm = () => {
    loopAudioRef.current.pause();
    loopAudioRef.current.currentTime = 0;
  }

  //相手は自分のポケモン６体に対して相性がより良い３体を選出する
  const selectBetterOpPokes = async (mySelectedOrder, opPokesName) => {
    //お互いの６体のポケモンの情報を取得する。
    const { myPokesInfo, opPokesInfo } = await getAllPokeInfos(mySelectedOrder, opPokesName);
    //相手のポケモン全ての受け/攻め相性と素早さを取得する
    const resistanceMap = calcResistanceForAllOpPokes(myPokesInfo, opPokesInfo);
     //まとめた情報をもとに選出する３体を選ぶ(耐性等を考慮して３体選び、その中から自分の１体目に相性が良いポケモンを１体目にする)
    const betterOpPokes = selectBetterOpPokesLogic(resistanceMap, myPokesInfo[0])

    return betterOpPokes;
  }

  //バトル開始に必要なstateをセットする
  const setBattleInfo = (myPokeInfos, opPokeInfos) => {
    setMyPokeState(prev => ({
      ...prev,
      name: myPokeInfos[0].name, poke1Name: myPokeInfos[0].name, poke2Name: myPokeInfos[1].name, poke3Name: myPokeInfos[2].name,
      poke1FullH: myPokeInfos[0].hp, poke2FullH: myPokeInfos[1].hp, poke3FullH: myPokeInfos[2].hp,
      poke1H: myPokeInfos[0].hp, poke2H: myPokeInfos[1].hp, poke3H: myPokeInfos[2].hp,
    }));

    setOpPokeState(prev => ({
      ...prev,
      name: opPokeInfos[0].name, poke1Name: opPokeInfos[0].name, poke2Name: opPokeInfos[1].name, poke3Name: opPokeInfos[2].name,
      poke1FullH: opPokeInfos[0].hp, poke2FullH: opPokeInfos[1].hp, poke3FullH: opPokeInfos[2].hp,
      poke1H: opPokeInfos[0].hp, poke2H: opPokeInfos[1].hp, poke3H: opPokeInfos[2].hp,
    }));
  }

  //ターン数を更新してコンソールに表示する。（デバッグ用）
  const updateTurnCnt = () => {
    console.log(turnCnt.current + "ターン目================================================");
    turnCnt.current++;
  }

  //相手が自分のバトル場のポケモンに対して、相性の良い技をセットする
  const setOpWeapon = async () => {
    //最も与えるダメージが大きい技・最も与えるダメージが大きい先制技・最も与えるダメージが大きい先制技の最低乱数ダメージ　を取得
    const { strongestWeapon, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage } = await getMostEffectiveWeapon();
    //自分が相手に出せる技の最大ダメージを取得
    const myMaxDamage = await predictMyAction();

    //合理的は技を算出してセット
    const opWeapon = choiseBetterWeapon(strongestWeapon, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage, myMaxDamage);
    opSelectedWeapon.current = opWeapon;
  }

  //backテキストをセットする
  const setBackText = (pokeName) => {
    const backText = `戻れ！${pokeName}`;
    setMyPokeState(prev => ({ ...prev, text: { content: backText, kind: "back" } }));
  }

  //全てのstateを初期化する
  const initializeState = () => {
    // ポケモン表示制御
    setMyAreaVisible({ ...defaultAreaVisible });
    setOpAreaVisible({ ...defaultAreaVisible });

    // その他表示制御
    setOtherAreaVisible({
      top: true,
      select: false,
      battle: false,
      text: false,
      actionCmd: false,
      weaponCmd: false,
      changeCmd: false,
      nextPokeCmd: false
    });

    // ポケモンのステータス
    setMyPokeState({ ...defaultPokeState });
    setOpPokeState({ ...defaultPokeState });

    // 強制トリガー
    setMyPokeStateTrigger({ ...defaultPokeStateTrigger });
    setOpPokeStateTrigger({ ...defaultPokeStateTrigger });

    // その他state, ref
    setSelectedOrder([]);
    myLife.current = 0;
    opLife.current = 0;
    mySelectedWeapon.current = "";
    opSelectedWeapon.current = "";
    myTurn.current = "first";
    changeTurn.current = false;
    changePokeName.current = "";
    resultText.current = "";
    turnCnt.current = 1;
    loopAudioRef.current = null;
  }

  //ハンドラー内関数のパーツ===============================================================================

  //ポケモンの鳴き声再生
  const playPokeVoice = async (pokeName, onEnded) => {
    try {
      const { voice: pokeVoice } = await getPokeInfo(pokeName);
      const sound = new Audio(pokeVoice);
      sound.currentTime = 0;
      if (onEnded) sound.onended = onEnded;
      await sound.play();
    } catch (e) {
      console.error(`鳴き声の再生に失敗: ${pokeName}`, e);
      onEnded?.(); // 失敗したときだけ呼びたいならOK
    }
  };

  //各技のSEを再生
  const playWeaponSound = async (weaponName, onEnded) => {
    try {
      const { sound: soundUrl } = await getWeaponInfo(weaponName);
      const sound = new Audio(soundUrl);
      sound.currentTime = 0;
      if (onEnded) sound.onended = onEnded;
      await sound.play();
    } catch (e) {
      console.error(`技SEの再生に失敗: ${weaponName}`, e);
      onEnded?.(); // 再生失敗時に保険として呼ぶ
    }
  };

  //技相性にあったダメージSEを再生
  const playDamageSound = (text, onEnded) => {
    let sound = null;
    if (text === compatiTexts.batsugun) {
      sound = new Audio("https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/damage/batsugun.mp3");
    } else if (text === compatiTexts.toubai) {
      sound = new Audio("https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/damage/toubai.mp3");
    } else if (text === compatiTexts.imahitotsu) {
      sound = new Audio("https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/damage/imahitotsu.mp3");
    }

    if (sound) {
      sound.play().catch(e => console.error("効果音エラー", e));
      sound.addEventListener("ended", () => {
        if (onEnded) onEnded();
      });
    } else {
      if (onEnded) onEnded(); // 音がない場合でも次に進む
    }
  };

  //お互いの６体のポケモンの情報を取得する。
  const getAllPokeInfos = async (myPokesName, opPokesName) => {
    const mypokesInfo = await Promise.all(
      myPokesName.map(name => getPokeInfo(name))
    );
    const opPokesInfo = await Promise.all(
      opPokesName.map(name => getPokeInfo(name))
    );

    // null を除外（fetch失敗を除外）
    return {
      myPokesInfo: mypokesInfo.filter(info => info !== null),
      opPokesInfo: opPokesInfo.filter(info => info !== null)
    };
  };

  //poke1H等を取得する state名を文字列で返す
  const getPokeNumH = (pokeState) => {
    const pokeNum = getPokeNum(pokeState);
    const pokeNumH = pokeState[`poke${pokeNum}H`];
    return pokeNumH;
  }

  //相手目線で合理的な技を選択して返す
  const choiseBetterWeapon = (strongestWeapon, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage, myMaxDamage) => {
    const betterWeapon =
      choiseBetterWeaponLogic(strongestWeapon, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage, myMaxDamage, myPokeState.s, opPokeState.s, myPokeState.hp, opPokeState.hp);
    return betterWeapon;
  }

  //最も与えるダメージが大きい技・最も与えるダメージが大きい先制技・最も与えるダメージが大きい先制技の最低乱数ダメージ　を返す
  const getMostEffectiveWeapon = async () => {
    const { weaponsInfo, atcInfos, defInfos } = await getUseInCalcDamageInfos(opPokeState);
    const { strongestWeapon, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage } = getMostEffectiveWeaponLogic(weaponsInfo, atcInfos, defInfos);
    return { strongestWeapon, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage }
  }

  //自分が相手に最大ダメージを与えらられる技の中乱数ダメージを返す
  const predictMyAction = async () => {
    const { weaponsInfo, atcInfos, defInfos } = await getUseInCalcDamageInfos(myPokeState);
    const myMaxDamage = predictMyActionLogic(weaponsInfo, atcInfos, defInfos);
    return myMaxDamage;
  }

  //選択した技名を取得する
  const getWeaponName = (isMe) => {
    const weaponnName = (isMe ? mySelectedWeapon : opSelectedWeapon).current;
    return weaponnName;
  }

  //お互いが選択した技の優先度を取得する
  const getWeaponsPriority = async () => {
    const [{ priority: myWeaponPriority }, { priority: opWeaponPriority }] = await Promise.all([
      getWeaponInfo(mySelectedWeapon.current),
      getWeaponInfo(opSelectedWeapon.current)
    ]);
    return { myWeaponPriority, opWeaponPriority };
  }

  //相手が次のポケモンを選択するために、お互いのポケモンや技情報を取得する。
  const getUseInCalcDamageInfos = async (atcState) => {
    const weaponKeys = ['weapon1', 'weapon2', 'weapon3'];
    const results = await Promise.all(
      weaponKeys.map(key => getUseInCalcDamageInfo(true, atcState[key]))
    );
    const weaponsInfo = results.map(r => r.weaponInfo);
    const atcInfos = results.map(r => r.attackerInfo);
    const defInfos = results.map(r => r.defenderInfo);
    return { weaponsInfo, atcInfos, defInfos };
  }

  //ダメ計に必要な情報を取得して返す
  const getUseInCalcDamageInfo = async (attackerIsMe, weaponName) => {
    const weaponInfo = await getWeaponInfo(weaponName);
    const [atcState, defState] = attackerIsMe ? [myPokeState, opPokeState] : [opPokeState, myPokeState];
    const atcPower = weaponInfo.kind === "物理" ? atcState.a : atcState.c;
    const defPower = weaponInfo.kind === "物理" ? defState.b : defState.d;
    const attackerInfo = { name: atcState.name, type1: atcState.type1, type2: atcState.type2, power: atcPower };
    const defenderInfo = { name: defState.name, type1: defState.type1, type2: defState.type2, power: defPower };
    return { weaponInfo, attackerInfo, defenderInfo };
  }

  //HPバーの幅や色の制御をして現在HPを返す
  const adjustHpBar = (isMe, pokeState, currentHp) => {
    const fullHp = getFullHp(pokeState);
    adjustHpBarLogic(isMe, currentHp, fullHp);
    console.log(`${pokeState.name}\n最大HP：${fullHp}\n残HP：${currentHp}`);
  }

  //stateのHpと新しくセットするHpが同じか確認する
  const checkIsSameHp = (stateHp, currentHp, newHp) => {
    const isSameHp = stateHp === currentHp && stateHp === newHp;
    return isSameHp;
  }

  //ポケモン登場の表示制御
  const controllAreaVisibleForApp = (setAreaVisible, pokeName, delayBase) => {
    delay(() => setOtherAreaVisible(prev => ({ ...prev, text: true })), delayBase);         //テキストエリアの表示
    delay(() => setAreaVisible(prev => ({ ...prev, text: true })), delayBase);              //Goテキストの表示
    delay(() => setAreaVisible(prev => ({ ...prev, poke: true })), delayBase + 1000);       //ポケモンの表示
    delay(async () => await playPokeVoice(pokeName), delayBase + 1000);                     //鳴き声再生
    delay(() => setOtherAreaVisible(prev => ({ ...prev, text: false })), delayBase + 2000); //テキストエリアの非表示
    delay(() => setAreaVisible(prev => ({ ...prev, text: false })), delayBase + 2000);      //Goテキストテキストの非表示
  };

  //相性倍率を受け取って、相性テキストを返す
  const getCompatiText = async (attackerIsMe, defState) => {
    const weaponName = getWeaponName(attackerIsMe);
    const { type: weaponType } = await getWeaponInfo(weaponName);
    const multiplier = calcMultiplier(weaponType, defState.type1, defState.type2);
    const compatiText = getCompatiTextLogic(multiplier);
    return compatiText;
  }

  //ジャンプと同時に鳴き声再生→攻撃モーションと同時に技SE再生
  const attackEffect = async (attackerIsMe, defState, isHit) => {
    const atcImgElem = getAttackEffectElem(attackerIsMe);
    const atcName = attackerIsMe ? myPokeState.name : opPokeState.name;
    jumpEffect(atcImgElem);
    await new Promise((resolve) => {
      playPokeVoice(atcName, () => resolve());
    });

    //技が命中してて、相性が無効ではない場合に攻撃エフェクトを入れる
    if (isHit && defState.text.content !== compatiTexts.mukou) {
      attackEffectLogic(attackerIsMe, atcImgElem);
      const weaponName = getWeaponName(attackerIsMe);
      await new Promise((resolve) => {
        playWeaponSound(weaponName, () => resolve());
      });
    }
  };

  //ダメージエフェクト
  const damageEffect = async (attackerIsMe, defState) => {
    const defImgElem = getDamageEffectElem(attackerIsMe);
    damageEffectLogic(defImgElem);
    await new Promise((resolve) => {
      playDamageSound(defState.text.content, resolve);
    });
  };

  //相手は自分のポケモンとの相性を考慮した、最適なポケモンを選択肢て返す
  const selectNextOpPoke = async (life) => {
    let nextOpPoke = "";
    if (life === 2) {
      const myPokeInfo = { name: myPokeState.name, type1: myPokeState.type1, type2: myPokeState.type2, s: myPokeState.s };
      const opPokesInfo = [
        await getPokeInfo(opPokeState.poke2Name),
        await getPokeInfo(opPokeState.poke3Name)
      ];
      nextOpPoke = selectNextOpPokeLogic(myPokeInfo, opPokesInfo);
    }
    else {
      nextOpPoke = opPokeState.poke2H === 0 ? opPokeState.poke3Name : opPokeState.poke2Name;
    }
    return nextOpPoke;
  };

  return {
    //toDoWhenFnc.jsで使用
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

    //jsxや他jsで使用
    getPokeInfo,
    getWeaponInfo,
    getPokeNum,
    getFullHp,
    playSe,

    //jsxで使用
    setBgm,
    playBgm,
    selectBetterOpPokes,
    setBattleInfo,
    updateTurnCnt,
    setOpWeapon,
    setBackText,
    initializeState,
  };
}
