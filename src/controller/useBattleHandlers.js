import { defs, tr } from "framer-motion/client";
import {
  soundList,
  compatiTexts,
  calcResistanceForAllOpPokes,
  selectBetterOpPokesLogic,
  calcNewHp,
  getGoText, getWeaponText, getCompatiTextLogic, getDeadText,
  getOpChangePoke, checkIsFirst, calcMultiplier,
  getMostEffectiveWeaponLogic, predictMyActionLogic, choiseBetterWeapon,
  getDamageEffectElem,
  jumpEffect, attackEffectLogic, damageEffectLogic,
  calcTrueDamage, adjustHpBarLogic,
  selectNextOpPokeLogic, delay,
  getTerastalText,
  calcPureDamage,
  getCompati,
} from "../model/model";

export function useBattleHandlers(battleState) {

  //インポートの取得===========================================================
  const {
    defaultAreaVisible,
    myAreaVisible, opAreaVisible,
    setMyAreaVisible, setOpAreaVisible, setOtherAreaVisible,
    defaultPokeState, defaultPokeStateTrigger,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    setMyPokeStateTrigger,
    setOpPokeStateTrigger,
    otherText, setOtherText,
    setSelectedOrder,
    isTerastalActive,
    myLife, opLife,
    opTerastalFlag,
    mySelectedWeapon, opSelectedWeapon,
    myChangePokeName, opChangePokeName,
    isHeal, isHealAtc, healHp,
    iAmFirst, myChangeTurn, opChangeTurn,
    resultText, turnCnt,
    loopAudioRef,
  } = battleState;

  //useToDoWhenFnc()のパーツとなる関数=============================================================================================

  //DBから取得したポケモンのデータをstateにセットする(HP以外)
  const setPokeInfo = async (isMe) => {
    const [pokeState, setPokeState] = [getPokeState(isMe, true), getSetPokeState(isMe, true)];
    const pokeInfo = await getPokeInfo(pokeState.name);
    setPokeState(prev => ({
      ...prev,
      img: pokeInfo.img, voice: pokeInfo.voice, type1: pokeInfo.type1, type2: pokeInfo.type2, terastal: pokeInfo.terastal,
      a: pokeInfo.a, b: pokeInfo.b, c: pokeInfo.c, d: pokeInfo.d, s: pokeInfo.s,
      aBuff: 0, bBuff: 0, cBuff: 0, dBuff: 0, sBuff: 0,
      weapon1: pokeInfo.weapon1, weapon2: pokeInfo.weapon2, weapon3: pokeInfo.weapon3, weapon4: pokeInfo.weapon4,
    }));
  }

  //ポケモン名をセットする
  const setPokeName = (isMe, pokeName) => {
    const setPokeState = getSetPokeState(isMe, true);
    setPokeState(prev => ({ ...prev, name: pokeName }));
  }

  //相手が2,3体目に出すポケモンをセットする
  const setNextOpPokeName = async () => {
    const nextOpPoke = await selectNextOpPoke();
    setPokeName(false, nextOpPoke);
  }

  //ポケモン登場時のHPセット
  const setHpOnEntry = (isMe) => {
    const [pokeState, setPokeState, setPokeStateTrigger] =
      [getPokeState(isMe, true), getSetPokeState(isMe, true), getSetPokeStateTrigger(isMe, true)];

    //HPバーの制御
    const currentHp = getPokeNumHp(pokeState, pokeState.name);
    adjustHpBar(isMe, currentHp);
    //HPのセット
    pokeState.hp !== currentHp
      ? setPokeState(prev => ({ ...prev, hp: currentHp }))
      : setPokeStateTrigger(prev => ({ ...prev, hp: prev.hp + 1 }));
  }

  //攻撃を受けた後のHPセット
  const setHpOnDamage = (isMe, damage) => {
    const [pokeState, setPokeState, setPokeStateTrigger] =
      [getPokeState(isMe, true), getSetPokeState(isMe, true), getSetPokeStateTrigger(isMe, true)];

    //HPバーの制御
    const currentHp = getPokeNumHp(pokeState, pokeState.name);
    const newHp = calcNewHp(currentHp, damage);
    //HPのセット

    !checkIsSameHp(pokeState.hp, currentHp, newHp)
      ? setPokeState(prev => ({ ...prev, hp: newHp }))
      : setPokeStateTrigger(prev => ({ ...prev, hp: prev.hp + 1 }));
  }

  //poke1Hp等のHpをバトル場のポケモンのHpと同じ値に更新する
  const setPokeNumHp = (isMe) => {
    const [pokeState, setPokeState] = [getPokeState(isMe, true), getSetPokeState(isMe, true)];
    const pokeNum = getPokeNum(pokeState, pokeState.name);
    setPokeState(prev => ({ ...prev, [`poke${pokeNum}Hp`]: pokeState.hp, }));
  }

  //テラスタルするポケモンNoをセットする
  const setTerastalPokeNum = (isMe) => {
    const [pokeState, setPokeState] = [getPokeState(isMe, true), getSetPokeState(isMe, true)];
    delay(() => setPokeState(prev => ({ ...prev, canTerastal: false, terastalPokeNum: getPokeNum(pokeState, pokeState.name) })), 2000);
  }

  //Goテキストをセットする
  const setGoText = (isMe) => {
    const [pokeState, setPokeState] = [getPokeState(isMe, true), getSetPokeState(isMe, true)];
    const goText = getGoText(isMe, pokeState.name);
    setPokeState(prev => ({ ...prev, text: { kind: "go", content: goText } }));
  }

  //backテキストをセットする
  const setBackText = (isMe) => {
    const [pokeState, setPokeState] = [getPokeState(isMe, true), getSetPokeState(isMe, true)];
    const backText = `戻れ！${pokeState.name}！`;
    setPokeState(prev => ({ ...prev, text: { kind: "back", content: backText } }));
  }

  //テラスタルテキストをセットする
  const setTerastalText = (isMe) => {
    const [pokeState, setPokeState] = [getPokeState(isMe, true), getSetPokeState(isMe, true)];
    const terastalText = getTerastalText(isMe, pokeState.name);

    setPokeState(prev => ({ ...prev, text: { kind: "terastal", content: terastalText } }));
  }

  //Weaponテキストをセットする
  const setWeaponText = (isMe) => {
    const [pokeState, setPokeState, setPokeStateTrigger] =
      [getPokeState(isMe, true), getSetPokeState(isMe, true), getSetPokeStateTrigger(isMe, true)];

    let canMove = true;
    let cantMoveText = "";

    //麻痺チェック
    const pokeNum = getPokeNum(pokeState, pokeState.name);
    if (pokeState[`poke${pokeNum}Condition`] === "まひ") {
      canMove = Math.random() >= 0.25;
      // canMove = Math.random() >= 1;   //テスト用
      cantMoveText = canMove ? "" : `${pokeState.name}はしびれて動けない`;
    }

    if (canMove) {
      const weaponName = getWeaponName(isMe);
      const weaponText = getWeaponText(isMe, pokeState.name, weaponName);
      pokeState.text.content !== weaponText
        ? setPokeState(prev => ({ ...prev, text: { kind: "weapon", content: weaponText } }))
        : setPokeStateTrigger(prev => ({ ...prev, text: prev.text + 1 }));
    }
    else {
      soundList.general.paralyzed.play();
      setOtherText({ kind: "cantMove", content: cantMoveText });
    }
  }

  //相性テキストをセットする
  const setCompatiText = async (atcIsMe) => {
    const [pokeState, setPokeState, setPokeStateTrigger] =
      [getPokeState(atcIsMe, false), getSetPokeState(atcIsMe, false), getSetPokeStateTrigger(atcIsMe, false)];
    const weaponInfo = (atcIsMe ? mySelectedWeapon : opSelectedWeapon).current;

    let compatiText = await getCompatiText(atcIsMe);
    if (weaponInfo.kind === "変化")
      compatiText = compatiTexts.mukou ? compatiText : compatiTexts.toubai;
    pokeState.text.content !== compatiText ?
      setPokeState(prev => ({ ...prev, text: { kind: "compati", content: compatiText } })) :
      setPokeStateTrigger(prev => ({ ...prev, text: prev.text + 1 }));
  }

  //deadテキストをセットする
  const setDeadText = async (isMe) => {
    const [pokeState, setPokeState] = [getPokeState(isMe, true), getSetPokeState(isMe, true)];
    const deadText = getDeadText(isMe, pokeState.name);

    if (otherText.content) await stopProcessing(2000);
    setPokeState(prev => ({ ...prev, text: { kind: "dead", content: deadText } }));
  }


  //ライフを減らす
  const setLife = (isMe) => {
    const life = isMe ? myLife : opLife;
    life.current--;
  }

  //お互いの素早さと優先度を比較して、先攻後攻をセットする
  const setMyTurn = async () => {
    //素早さを取得する
    const [myPokeSpeed, opPokeSpeed] = [calcActualStatus(true, "s"), calcActualStatus(false, "s")];
    console.log(`${myPokeState.name}の素早さ：${myPokeSpeed}\n${opPokeState.name}の素早さ：${opPokeSpeed}\n`);

    //どちらも交換しない場合、優先度と素早さを比較して先攻後攻を決める
    if (!myChangeTurn.current && !opChangeTurn.current) {
      const { myWeaponPriority, opWeaponPriority } = await getWeaponsPriority();
      iAmFirst.current = checkIsFirst(myPokeSpeed, opPokeSpeed, myWeaponPriority, opWeaponPriority) ? true : false;
    }
    //一方が交代する場合、交代する方が先攻
    else if (!!myChangeTurn.current !== !!opChangeTurn.current)
      iAmFirst.current = myChangeTurn.current ? true : false;
    //どちらも交代する場合、速い方が先攻で先に交代する　同速の分岐はしない
    else
      iAmFirst.current = myPokeSpeed > opPokeSpeed ? true : false;
  }

  //ゲーム結果画面を表示
  const setWinner = (isMe) => {
    stopBgm();
    resultText.current = isMe ? "WIN" : "LOSE";
    setOtherAreaVisible(prev => ({ ...prev, battle: false }));
    soundList.general[resultText.current.toLowerCase()].play();
  };


  //goTextがセットされた時の表示制御
  const setAreaVisibleForApp = async (isMe) => {
    //バトル開始時の表示制御(バトル開始時はお互いにGoテキストがセットされるため、一方のみ処理を行うため、isMeを入れる)
    if (isMe && !myAreaVisible.poke && !opAreaVisible.poke) {
      await controllAreaVisibleForApp(isMe);
      await controllAreaVisibleForApp(!isMe);
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
    }
    //一方のポケモン登場時の表示制御
    else if (!!myAreaVisible.poke !== !!opAreaVisible.poke) {
      const changeTurn = (myAreaVisible.poke ? opChangeTurn : myChangeTurn).current;
      await controllAreaVisibleForApp(isMe);
      //死亡後の交代の場合はコマンドボタンを表示
      if (!changeTurn) {
        setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
        consoleWhenTurnEnd();
      }
    }
  }

  //ポケモン交換時の表示制御
  const setAreaVisibleForChange = (isMe) => {
    soundList.general.back.cloneNode().play();
    const setAreaVisible = getSetAreaVisible(isMe, true);
    setAreaVisible(prev => ({ ...prev, text: true }));    //backテキストを表示
    delay(() => setAreaVisible(p => ({ ...p, poke: false })), 1000);
  }

  //テラスタルテキスト表示の制御
  const setAreaVisibleForTerastal = (isMe) => {
    const setAreaVisible = getSetAreaVisible(isMe, true);
    setAreaVisible(prev => ({ ...prev, text: true }));
    delay(() => setAreaVisible(prev => ({ ...prev, text: false })), 2000);
  }

  //攻撃関連のアニメーションを再生し、ダメージを反映したHPをセット
  const playAttackingFlow = async (atcIsMe, isHit, isCritical, damage) => {
    const defState = getPokeState(atcIsMe, false);
    const [setAreaVisible, setOtherTextInvisible] =
      [getSetAreaVisible(atcIsMe, true), getSetAreaVisible(atcIsMe, false)];
    const weaponInfo = (atcIsMe ? mySelectedWeapon : opSelectedWeapon).current;

    setAreaVisible(prev => ({ ...prev, text: true }));     //技テキスト表示

    //ジャンプと同時に鳴き声再生→攻撃モーションと同時に技SE再生
    await attackEffect(atcIsMe, isHit, weaponInfo.atctarget);
    setAreaVisible(prev => ({ ...prev, text: false }));    //技テキストを非表示

    if (weaponInfo.kind !== "変化") {
      //無効ではない場合
      if (defState.text.content !== compatiTexts.mukou) {
        if (isHit) {
          if (defState.text.content !== compatiTexts.toubai)
            setOtherTextInvisible(prev => ({ ...prev, text: true }));  //相性テキスト表示
          if (isCritical)
            setOtherText({ kind: "general", content: "急所にあたった" });

          //HPバー調整とダメージエフェクト
          const currentHp = getPokeNumHp(defState, defState.name);
          const newHp = calcNewHp(currentHp, damage);
          adjustHpBar(!atcIsMe, newHp);
          await damageEffect(!atcIsMe);
        }
        else
          setOtherText({ kind: "general", content: `${defState.name}にはあたらなかった` });
      }
      else
        setOtherTextInvisible(prev => ({ ...prev, text: true }));  //相性テキスト表示

      await stopProcessing(2000);
      setOtherTextInvisible(prev => ({ ...prev, text: false }));  //相性テキスト非表示
      setOtherText({ kind: "", content: "" });
    }
    if (isHit)
      doSecondaryEffect(atcIsMe, weaponInfo, damage);   //追加効果があるなら発動(変化技も)
  }

  //倒れたポケモンに死亡エフェクトを入れる
  const playDeathEffect = (isMe) => {
    return new Promise(async (resolve) => {
      const [pokeState, setAreaVisible] = [getPokeState(isMe, true), getSetAreaVisible(isMe, true)];
      const pokeIMGElm = getDamageEffectElem(isMe);

      // 1秒後に死亡演出を開始
      setTimeout(async () => {
        setAreaVisible(prev => ({ ...prev, text: true }));
        await playPokeVoice(pokeState.name);
        pokeIMGElm.classList.add("pokemon-dead");
      }, 1000);

      // さらに2秒後に非表示 & resolve
      setTimeout(() => {
        setAreaVisible(prev => ({ ...prev, poke: false, text: false }));
        resolve();
      }, 3000 + 1);
    });
  };

  //攻撃技か否か返す
  const checkIsAttackWeapon = async (isMe) => {
    const weaponName = getWeaponName(isMe);
    const { kind: weaponKind } = await getWeaponInfo(weaponName);
    const isAttackWeapon = weaponKind === "物理" || weaponKind === "特殊";
    return isAttackWeapon;
  }

  //ダメ計に必要な情報を取得して、モデル側の関数に渡す
  const getDamage = async (atcIsMe) => {
    const weaponName = getWeaponName(atcIsMe);
    const { weaponInfo, atcInfo, defInfo } = await getUseInCalcDamageInfo(atcIsMe, weaponName);
    const { trueDamage, isHit, isCriticalHit } = calcTrueDamage(weaponInfo, atcInfo, defInfo);
    return { weaponInfo, damage: trueDamage, isHit, isCriticalHit };
  }

  //jsx, jsファイルから呼び出し=================================================================================================

  //DBのPokeInfoから指定したポケモンに紐づく全てのデータを返す
  const getPokeInfo = async (pokeName) => {
    try {
      const url = `https://1aazl41gyk.execute-api.ap-northeast-1.amazonaws.com/prod/getPokeInfo?id=${encodeURIComponent(pokeName)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const result = await res.json();

      const keys = ["Img", "Voice", "Type1", "Type2", "Terastal", "HP", "A", "B", "C", "D", "S", "Weapon1", "Weapon2", "Weapon3", "Weapon4"];
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

      const keys = ["Type", "Kind", "Power", "HitRate", "Priority", "Sound", "AtcTarget", "EffTarget", "IncidenceRate", "Effectiveness"];
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
  const getPokeNum = (pokeState, pokeName) => {
    const pokeNum = [pokeState.poke1Name, pokeState.poke2Name, pokeState.poke3Name]
      .findIndex(name => name === pokeName) + 1;
    return pokeNum;
  }

  //指定したポケモンの最大HPを取得する
  const getMaxHp = (pokeState, pokeName) => {
    const pokeNum = getPokeNum(pokeState, pokeName);
    const MaxHp = pokeState[`poke${pokeNum}MaxHp`];
    return MaxHp;
  }

  //交換関係のrefをresetする 
  const resetChangeTurn = () => {
    myChangeTurn.current = false;
    opChangeTurn.current = false;
    myChangePokeName.current = false;
    opChangePokeName.current = false;
  }

  //jsxファイルで呼び出し=================================================================================

  //BGM情報をセット
  const setBgm = (kind) => {
    if (loopAudioRef.current) stopBgm();
    const bgm = soundList.bgm[kind];
    bgm.volume = 0.25;
    bgm.loop = true;
    loopAudioRef.current = bgm;
  }

  //BGMを再生する
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
    const [myPokeInfos, opPokeInfos] = await Promise.all([
      getPokeInfos(mySelectedOrder),
      getPokeInfos(opPokesName)
    ]);

    const resistanceMap = calcResistanceForAllOpPokes(myPokeInfos, opPokeInfos);
    const betterOpPokes = selectBetterOpPokesLogic(resistanceMap, myPokeInfos[0])
    return betterOpPokes;
  }

  //バトル開始に必要なstateをセットする
  const setBattleInfo = (myPokeInfos, opPokeInfos) => {
    setMyPokeState(prev => ({
      ...prev,
      name: myPokeInfos[0].name, poke1Name: myPokeInfos[0].name, poke2Name: myPokeInfos[1].name, poke3Name: myPokeInfos[2].name,
      poke1MaxHp: myPokeInfos[0].hp, poke2MaxHp: myPokeInfos[1].hp, poke3MaxHp: myPokeInfos[2].hp,
      poke1Hp: myPokeInfos[0].hp, poke2Hp: myPokeInfos[1].hp, poke3Hp: myPokeInfos[2].hp,
    }));

    setOpPokeState(prev => ({
      ...prev,
      name: opPokeInfos[0].name, poke1Name: opPokeInfos[0].name, poke2Name: opPokeInfos[1].name, poke3Name: opPokeInfos[2].name,
      poke1MaxHp: opPokeInfos[0].hp, poke2MaxHp: opPokeInfos[1].hp, poke3MaxHp: opPokeInfos[2].hp,
      poke1Hp: opPokeInfos[0].hp, poke2Hp: opPokeInfos[1].hp, poke3Hp: opPokeInfos[2].hp,
    }));
  }

  //ターン数を更新してコンソールに表示する。（デバッグ用）
  const updateTurnCnt = () => {
    console.log(turnCnt.current + "ターン目================================================");
    turnCnt.current++;
  }

  //相手の行動を決める(交代/テラス/技選択)
  const decideOpAction = async () => {

    // 相手のポケモンが、自分のポケモンのタイプ一致技で抜群をとられるかチェックする
    const { dangerousType, safeType, IsDangerousTerastal, myTerastalType: terastalType } = checkDangerous();

    //交換すべき時はrefに交換ポケモンをセット
    if (dangerousType.length > 0 || IsDangerousTerastal)
      await setOpChangePoke(dangerousType, safeType, IsDangerousTerastal, terastalType);
    else
      console.log("相手は相性が悪くないので交代しない");

    //控えに交代できない(しない)場合、テラス判断と技選択
    if (!opChangeTurn.current) {
      if (opPokeState.canTerastal)
        await checkOpTerastal(dangerousType.length > 0 || IsDangerousTerastal, dangerousType, safeType);
      await setOpWeapon();
    }
  }

  //技ボタン押下時にセットするテキストを分岐する
  const setTextWhenClickWeaponBtn = () => {
    //相手が交代するなら、相手のbackテキストをセット
    if (opChangeTurn.current)
      setBackText(false);
    else {
      //どちらかがテラスタルする場合、先攻のテラスタルテキストセット
      if (isTerastalActive || opTerastalFlag.current) {
        const isMe = isTerastalActive && opTerastalFlag.current
          ? calcActualStatus(true, "s") >= calcActualStatus(false, "s")
          : isTerastalActive;
        setTerastalText(isMe);
      }
      //どちらもテラスタルしない場合、先攻の技テキストをセット
      else
        setWeaponText(iAmFirst.current);
    }
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
    myLife.current = 3;
    opLife.current = 3;
    mySelectedWeapon.current = null;
    opSelectedWeapon.current = null;
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
    if (text === compatiTexts.batsugun)
      sound = soundList.damage.batsugun;
    else if (text === compatiTexts.toubai)
      sound = soundList.damage.toubai;
    else if (text === compatiTexts.imahitotsu)
      sound = soundList.damage.imahitotsu;

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
  const getPokeInfos = async (pokeNames) => {
    const pokeInfos = await Promise.all(
      pokeNames.map(name => getPokeInfo(name))
    );
    return pokeInfos.filter(info => info !== null);
  };

  //poke1Hp等を取得する
  const getPokeNumHp = (pokeState, pokeName) => {
    const pokeNum = getPokeNum(pokeState, pokeName);
    const pokeNumHp = pokeState[`poke${pokeNum}Hp`];
    return pokeNumHp;
  }

  //テラス前後の確定数を計算する(相手目線)
  const calcDefinitelyDefeatHits = async () => {
    //テラス前後の相手からの最大与ダメージ
    const { strongestWeaponDamage: maxDamage1 } = await getMostEffectiveWeapon();
    const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(false, true);
    const { strongestWeaponDamage: maxDamage2 } = getMostEffectiveWeaponLogic(weaponInfos, atcInfos, defInfos);
    //テラス前後の確定数
    const cnt1 = Math.floor(myPokeState.hp / maxDamage1) + 1;
    const cnt2 = Math.floor(myPokeState.hp / maxDamage2) + 1;

    return { cnt1, cnt2 };
  }

  //テラス前後の確定耐え数を計算する(相手目線)
  const calcDefinitelyEndureHits = async () => {
    //未テラス状態で自分からの最大打点の技名とダメージ数を取得
    const { myStrongestWeapon, myMaxDamage: maxDamage1 } = await predictMyAction(1);
    //テラス状態で、未テラス状態時の最大打点の技を受けた際の被ダメージを計算する
    const { weaponInfo, atcInfo, defInfo } = await getUseInCalcDamageInfo(true, myStrongestWeapon, true);
    const { pureDamage: damage1 } = calcPureDamage(weaponInfo, atcInfo, defInfo);
    //テラス状態の相手への自分の最大打点のダメージを計算する。
    const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(true, true);
    const { myMaxDamage: damage2 } = predictMyActionLogic(weaponInfos, atcInfos, defInfos, 1);
    //テラス前後の確定耐え数
    const cnt1 = Math.floor(opPokeState.hp / maxDamage1);
    const cnt2 = opPokeState.hp - damage1 > 0
      ? Math.floor((opPokeState.hp - damage1) / damage2) + 1 : 0;

    return { cnt1, cnt2 };
  }

  //テラス判断　テラスする場合フラグを立てる
  const checkOpTerastal = async (isDangerous) => {
    let debugText = "";
    //抜群をとられて、控えも受けられない場合　テラスすることで確定耐え数を増やせる場合、テラスタルフラグを立てる
    if (isDangerous && !opChangeTurn.current) {
      const { cnt1, cnt2 } = await calcDefinitelyEndureHits();
      if (cnt1 < cnt2) {
        opTerastalFlag.current = true;
        debugText = "相手は耐性を強めるためにテラスタルする";
      }
    }
    //抜群を取られない場合
    else if (!isDangerous) {

      //テラス前後の確定数
      const { cnt1, cnt2 } = await calcDefinitelyDefeatHits();

      //相手がテラスタルしたときの、自分のポケモンのタイプ一致技を受けた時の相性を取得
      const { strongType, anotherType } = await getMyStrongType();
      const [compati11, compati12] = getCompati(strongType, anotherType, opPokeState.terastal, "なし");

      //テラスすることで確定数を減らせる場合 || 自分の最大打点の技を無効化できる場合　テラスタルフラグを立てる
      if ((cnt1 > cnt2) || (compati11 === 0 && compati12 <= 1)) {
        const aliveMyBenchPokes = await getAliveBenchPokes(true);
        if (aliveMyBenchPokes.length > 0) {
          //テラス後に自分の控えポケモンからの相性を取得
          const [compati21Teras, compati22Teras] = getCompati(aliveMyBenchPokes[0].type1, aliveMyBenchPokes[0].type2, opPokeState.terastal, "なし");
          const [compati31Teras, compati32Teras] = aliveMyBenchPokes.length === 2
            ? getCompati(aliveMyBenchPokes[1].type1, aliveMyBenchPokes[1].type2, opPokeState.terastal, "なし")
            : [null, null];

          //テラス前後の確定耐え数を取得
          const { cnt2: cnt4 } = await calcDefinitelyEndureHits();
          const cantWin = calcActualStatus(true, "s") > calcActualStatus(false, "s") && (cnt4 === 0 || cnt2 !== 1 && cnt4 <= 2);

          //テラスしても、自分の控えから抜群を取られない場合で、自分の攻撃の前に倒される場合以外、テラスタルフラグを立てる
          if (Math.max(compati21Teras, compati22Teras) <= 1 && (compati31Teras ? (Math.max(compati31Teras, compati32Teras) <= 1) : true) && !cantWin) {
            opTerastalFlag.current = true;
            debugText = (cnt1 > cnt2) ? "相手は攻撃力上昇のためにテラスタルする" : "相手は自分の攻撃を無効化するためにテラスタルする";
          }
          //テラスすると、自分の控えから抜群を取られる場合 && テラスせずとも抜群とられる場合、テラスタルフラグを立てる
          else {
            const [compati21, compati22] = getCompati(aliveMyBenchPokes[0].type1, aliveMyBenchPokes[0].type2, opPokeState.type1, opPokeState.type2);
            const [compati31, compati32] = aliveMyBenchPokes.length === 2
              ? getCompati(aliveMyBenchPokes[1].type1, aliveMyBenchPokes[1].type2, opPokeState.type1, opPokeState.type2)
              : [null, null];
            if (Math.max(compati21, compati22) >= 2 || (compati31 ? (Math.max(compati31, compati32) >= 2) : true)) {
              opTerastalFlag.current = true;
              debugText = (cnt1 > cnt2) ? "相手は攻撃力上昇のためにテラスタルする" : "相手は自分の攻撃を無効化するためにテラスタルする";
            }
          }
        }
        else {
          opTerastalFlag.current = true;
          debugText = (cnt1 > cnt2) ? "相手は攻撃力上昇のためにテラスタルする" : "相手は自分の攻撃を無効化するためにテラスタルする";
        }
      }
    }
    console.log(opTerastalFlag.current ? debugText : "相手はテラスタルしない");
  }

  //自分のポケモンが相手に対して打点が強い方のタイプと、もう一方のタイプを取得して返す
  const getMyStrongType = async () => {
    //相手のテラス前タイプに対して自分の最大打点の技タイプ
    const { myMaxDamageWeaponType: strongestWeaponType } = await predictMyAction(1);

    //相手のポケモンに対して、自分のポケモンのタイプ一致技で強い方ともう一方のタイプを取得
    let [strongType, anotherType] = [null, null];
    if (strongestWeaponType === myPokeState.type1 || strongestWeaponType === myPokeState.type2) {
      const strongTypeNum = strongestWeaponType === myPokeState.type1 ? 1 : 2;
      const otherTypeNum = strongTypeNum === 1 ? 2 : 1;
      strongType = myPokeState[`type${strongTypeNum}`];
      anotherType = myPokeState[`type${otherTypeNum}`];
    }
    return { strongType, anotherType };
  }

  // 相手が、自分のタイプ一致技で抜群をとられるかの真偽と危険/安全タイプを返す
  const checkDangerous = () => {

    // 抜群を取られるかチェック
    const [myTerastalFlg, opTerastalFlg] = [checkIsTerastal(true), checkIsTerastal(false)];
    const [val11, val12] = opTerastalFlg
      ? getCompati(myPokeState.type1, myPokeState.type2, opPokeState.terastal, "なし")
      : getCompati(myPokeState.type1, myPokeState.type2, opPokeState.type1, opPokeState.type2);
    const myTerastalType = myTerastalFlg ? myPokeState.terastal : null;
    const val13 = myTerastalFlg
      ? calcMultiplier(myTerastalType, opPokeState.type1, opPokeState.type2) : null;

    // 自分のポケモンのタイプを相手目線で危険と安全に仕分け
    const [dangerousType, safeType] = [[], []];
    val11 >= 2 ? dangerousType.push(myPokeState.type1) : safeType.push(myPokeState.type1);
    val12 >= 2 ? dangerousType.push(myPokeState.type2) : safeType.push(myPokeState.type2);
    const IsDangerousTerastal = val13 >= 2;

    return { dangerousType, safeType, IsDangerousTerastal, myTerastalType };
  };


  //最も与えるダメージが大きい技・最も与えるダメージが大きい先制技・最も与えるダメージが大きい先制技の最低乱数ダメージ　を返す
  const getMostEffectiveWeapon = async () => {
    const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(false);
    const { strongestWeapon, strongestWeaponDamage, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage }
      = getMostEffectiveWeaponLogic(weaponInfos, atcInfos, defInfos);
    return { strongestWeapon, strongestWeaponDamage, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage }
  }

  //自分が相手に最大ダメージを与えらられる技の中乱数ダメージを返す
  const predictMyAction = async (randomMultiplier) => {
    const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(true);
    const { myStrongestWeapon, myMaxDamageWeaponType, myMaxDamage } = predictMyActionLogic(weaponInfos, atcInfos, defInfos, randomMultiplier);
    return { myStrongestWeapon, myMaxDamageWeaponType, myMaxDamage };
  }

  //選択した技名を取得する
  const getWeaponName = (isMe) => {
    const weaponnName = (isMe ? mySelectedWeapon : opSelectedWeapon).current.name;
    return weaponnName;
  }

  //お互いが選択した技の優先度を取得する
  const getWeaponsPriority = async () => {
    const [{ priority: myWeaponPriority }, { priority: opWeaponPriority }] = ([
      mySelectedWeapon.current.priority,
      opSelectedWeapon.current.priority
    ]);
    return { myWeaponPriority, opWeaponPriority };
  }

  //相手が次のポケモンを選択するために、お互いのポケモンや技情報を取得する。
  const getUseInCalcDamageInfos = async (atcIsMe, terastalCheckFlg) => {
    const atcState = getPokeState(atcIsMe, true);
    const weaponKeys = ['weapon1', 'weapon2', 'weapon3', 'weapon4'];
    const results = await Promise.all(
      weaponKeys.map(key => getUseInCalcDamageInfo(atcIsMe, atcState[key], terastalCheckFlg))
    );
    const weaponInfos = results.map(r => r.weaponInfo);
    const atcInfos = results.map(r => r.atcInfo);
    const defInfos = results.map(r => r.defInfo);
    return { weaponInfos, atcInfos, defInfos };
  }

  //ダメ計に必要な情報を取得して返す
  const getUseInCalcDamageInfo = async (atcIsMe, weaponName, terastalCheckFlg) => {
    const weaponInfo = await getWeaponInfo(weaponName);
    const [atcState, defState] = [getPokeState(atcIsMe, true), getPokeState(atcIsMe, false)];
    const { atcPower, defPower } = getAtcDefPower(atcIsMe, weaponInfo);
    //テラスタルしているか
    let isTerastalAtc = checkIsTerastal(atcIsMe) || (!atcIsMe && opTerastalFlag.current);
    let isTerastalDef = checkIsTerastal(!atcIsMe);

    //相手のテラス判断のための値変更
    if (atcIsMe && terastalCheckFlg)
      isTerastalDef = true;
    else if (!atcIsMe && terastalCheckFlg)
      isTerastalAtc = true;

    weaponInfo.type = weaponInfo.name !== "テラバースト"
      ? weaponInfo.type
      : isTerastalAtc ? atcState.terastal : weaponInfo.type;

    const { atcBuff, defBuff } = getAtcDefBuff(atcIsMe, weaponInfo);

    const atcInfo = { name: atcState.name, type1: atcState.type1, type2: atcState.type2, terastal: atcState.terastal, isTerastalAtc, power: atcPower, buff: atcBuff };
    const defInfo = { name: defState.name, type1: defState.type1, type2: defState.type2, terastal: defState.terastal, isTerastalDef, power: defPower, buff: defBuff };
    return { weaponInfo, atcInfo, defInfo };
  }

  //HPバーの幅や色の制御をして現在HPを返す
  const adjustHpBar = (isMe, newHp) => {
    const pokeState = getPokeState(isMe, true);
    const MaxHp = getMaxHp(pokeState, pokeState.name);
    adjustHpBarLogic(isMe, newHp, MaxHp);
  }

  //stateのHpと新しくセットするHpが同じか確認する
  const checkIsSameHp = (stateHp, currentHp, newHp) => {
    const isSameHp = stateHp === currentHp && stateHp === newHp;
    return isSameHp;
  }

  //ポケモン登場の表示制御
  const controllAreaVisibleForApp = async (isMe) => {
    const [pokeState, setAreaVisible]
      = [getPokeState(isMe, true), getSetAreaVisible(isMe, true)];

    setAreaVisible(prev => ({ ...prev, text: true }));    //Goテキストの表示
    delay(() => setAreaVisible(prev => ({ ...prev, poke: true })), 1000);       //ポケモンの表示
    delay(async () => await playPokeVoice(pokeState.name), 1000);                     //鳴き声再生
    delay(() => setAreaVisible(prev => ({ ...prev, text: false })), 2000);    //Goテキストの非表示    
    await stopProcessing(2000);
  };

  //相性倍率を受け取って、相性テキストを返す
  const getCompatiText = async (atcIsMe) => {
    const [atcState, defState] = [getPokeState(atcIsMe, true), getPokeState(atcIsMe, false)];
    const weaponName = getWeaponName(atcIsMe);
    let { type: weaponType } = await getWeaponInfo(weaponName);
    if (checkIsTerastal(atcIsMe) && weaponName === "テラバースト") {
      weaponType = atcState.terastal;
    }

    const [defType1, defType2] = checkIsTerastal(!atcIsMe)
      ? [defState.terastal, "なし"] : [defState.type1, defState.type2];
    const multiplier = calcMultiplier(weaponType, defType1, defType2);
    const compatiText = getCompatiTextLogic(multiplier);
    return compatiText;
  }

  //ジャンプと同時に鳴き声再生→攻撃モーションと同時に技SE再生
  const attackEffect = async (atcIsMe, isHit, atcTarget) => {
    const [atcState, defState] = [getPokeState(atcIsMe, true), getPokeState(atcIsMe, false)];
    const weaponName = getWeaponName(atcIsMe);

    jumpEffect(atcIsMe);
    await new Promise((resolve) => {
      playPokeVoice(atcState.name, () => resolve());
    });

    //技が命中してて、相性が無効ではない場合に攻撃エフェクトを入れる
    if (isHit && defState.text.content !== compatiTexts.mukou && atcTarget === "相手") {
      attackEffectLogic(atcIsMe);
      await new Promise((resolve) => {
        playWeaponSound(weaponName, () => resolve());
      });
    }
    if (isHit && atcTarget === "自分") {
      jumpEffect(atcIsMe);
      await new Promise((resolve) => {
        playWeaponSound(weaponName, () => resolve());
      });
    }
  };

  //ダメージエフェクト
  const damageEffect = async (isMe) => {
    const defState = getPokeState(isMe, true);
    damageEffectLogic(isMe);
    await new Promise((resolve) => {
      playDamageSound(defState.text.content, resolve);
    });
  };

  //相手は自分のポケモンとの相性を考慮した、最適なポケモンを選択肢て返す
  const selectNextOpPoke = async () => {
    let nextOpPoke = "";
    if (opLife.current === 2) {
      const terastalType = checkIsTerastal(true) ? myPokeState.terastal : null;
      const myPokeInfo = { name: myPokeState.name, type1: myPokeState.type1, type2: myPokeState.type2, terastalType, s: calcActualStatus(true, "s") };
      const aliveOpBenchPokes = await getAliveBenchPokes(false);
      //相手の控えポケモンが、自分のポケモンから上からワンパンされないか
      // const [opPoke1Hp, opPoke2Hp] = [getPokeNumHp(opPokeState, aliveOpBenchPokes[0].name), getPokeNumHp(opPokeState, aliveOpBenchPokes[1].name)];
      // const { cnt1 } = await calcDefinitelyEndureHits(opPokeState);
      // const cantWin = myPokeState.s > opPokeState.s && (cnt4 === 0 || cnt2 !== 1 && cnt4 <= 2);
      nextOpPoke = selectNextOpPokeLogic(myPokeInfo, aliveOpBenchPokes);
    }
    else {
      nextOpPoke = opPokeState.poke1Hp
        ? opPokeState.poke1Name : opPokeState.poke2Hp
          ? opPokeState.poke2Name : opPokeState.poke3Hp
            ? opPokeState.poke3Name : null;
    }
    return nextOpPoke;
  };

  //指定した時間、処理を停止する
  const stopProcessing = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  //生存している控えポケモン情報を取得する
  const getAliveBenchPokes = async (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const pokeInfos = await Promise.all(
      [1, 2, 3].map(i => {
        const name = pokeState[`poke${i}Name`];
        const hp = pokeState[`poke${i}Hp`];
        return (pokeState.name !== name && hp !== 0) ? getPokeInfo(name) : null;
      })
    );
    const aliveBenchPokes = pokeInfos.filter(Boolean);

    return aliveBenchPokes;
  }

  //相手が自分のバトル場のポケモンに対して、相性の良い技をセットする
  const setOpWeapon = async () => {
    //最も与えるダメージが大きい技・最も与えるダメージが大きい先制技・最も与えるダメージが大きい先制技の最低乱数ダメージ　を取得
    const { strongestWeapon, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage } = await getMostEffectiveWeapon();
    //自分が相手に出せる技の最大ダメージを取得
    const myMaxDamage = await predictMyAction();

    //合理的は技を算出してセット
    const opWeapon = choiseBetterWeapon(strongestWeapon, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage, myMaxDamage, myPokeState.s, opPokeState.s, myPokeState.hp, opPokeState.hp);
    const opWeaponInfo = await getWeaponInfo(opWeapon);
    opSelectedWeapon.current = opWeaponInfo;
  }

  //相手はバトルポケモンを交換すべき時は、refにセットする
  const setOpChangePoke = async (dangerousType, safeType, IsDangerousTerastal, terastalType) => {

    //生存している相手の控えポケモン情報を取得する
    const aliveOpBenchPokes = await getAliveBenchPokes(false);

    opChangePokeName.current = aliveOpBenchPokes.length > 0
      ? getOpChangePoke(aliveOpBenchPokes, dangerousType, safeType, IsDangerousTerastal, terastalType) : null;
    opChangeTurn.current = opChangePokeName.current ? true : false;
    console.log(`相手は相性が悪い${opChangePokeName.current ? "ため" + opChangePokeName.current + "に交代する" : "が交代できるポケモンがいない"}`);
  }

  //ターン終了時に状況確認のためのデバッグ用コンソール
  const consoleWhenTurnEnd = () => {
    const myPokeNum = getPokeNum(myPokeState, myPokeState.name);
    const opPokeNum = getPokeNum(opPokeState, opPokeState.name);
    console.log(`${myPokeState.name}\n残HP：${myPokeState.hp}\n最大HP：${myPokeState[`poke${myPokeNum}MaxHp`]}`);
    console.log(`${opPokeState.name}\n残HP：${opPokeState.hp}\n最大HP：${opPokeState[`poke${opPokeNum}MaxHp`]}`);
    console.log(`自分 aBuff:${myPokeState.aBuff},bBuff:${myPokeState.bBuff},cBuff:${myPokeState.cBuff},dBuff:${myPokeState.dBuff},sBuff:${myPokeState.sBuff},`);
    console.log(`相手 aBuff:${opPokeState.aBuff},bBuff:${opPokeState.bBuff},cBuff:${opPokeState.cBuff},dBuff:${opPokeState.dBuff},sBuff:${opPokeState.sBuff},`);
  }

  const getPokeState = (isMe, simple) => {
    const pokeState = isMe === simple ? myPokeState : opPokeState;
    return pokeState;
  }

  const getSetPokeState = (isMe, simple) => {
    const setPokeState = isMe === simple ? setMyPokeState : setOpPokeState;
    return setPokeState;
  }

  const getSetPokeStateTrigger = (isMe, simple) => {
    const setPokeStateTrigger = isMe === simple ? setMyPokeStateTrigger : setOpPokeStateTrigger;
    return setPokeStateTrigger;
  }

  const getAreaVisible = (isMe) => {
    const areaVisible = isMe ? myAreaVisible : opAreaVisible;
    return areaVisible;
  }

  const getSetAreaVisible = (isMe, simple) => {
    const setAreaVisible = isMe === simple ? setMyAreaVisible : setOpAreaVisible;
    return setAreaVisible;
  }

  //追加効果を読み解いて発動する
  const doSecondaryEffect = (atcIsMe, weaponInfo, damage) => {
    const [effTarget, incidenceRate, isAtcWeapon]
      = [weaponInfo.efftarget, weaponInfo.incidencerate, weaponInfo.kind !== "変化"];
    const isIncident = incidenceRate ? (Math.random() * 100 < incidenceRate) : false;
    let effectiveness = isIncident ? weaponInfo.effectiveness : null;

    if (effectiveness) {
      const myEffectiveness = atcIsMe && effTarget === "自分" || !atcIsMe && effTarget === "相手";
      const [pokeState, setPokeState] = [getPokeState(myEffectiveness, true), getSetPokeState(myEffectiveness, true)];
      const [atcState, defState] = [getPokeState(atcIsMe, true), getPokeState(atcIsMe, false)];

      if (effectiveness.includes("buff")) {
        const statusTextMap = { a: "攻撃", b: "防御", c: "特攻", d: "特防", s: "素早さ" };
        let textArray = [`${pokeState.name}の`];

        effectiveness = effectiveness.slice(5);
        for (let i = 0; i < effectiveness.length; i += 3) {
          const status = effectiveness[i];
          const buff = Number(effectiveness.slice(i + 1, i + 3));
          const key = `${status}Buff`;
          const currentBuff = pokeState[key] ?? 0;
          const clampedBuff = Math.max(-6, Math.min(6, currentBuff + buff));
          const actualChange = clampedBuff - currentBuff;

          let text1 = statusTextMap[status] || "不明";
          let text2 = "";

          if (actualChange !== 0) {
            // 実際に変化があった場合のみ state 更新
            setPokeState(prev => ({ ...prev, [key]: clampedBuff }));

            text2 = actualChange > 0
              ? actualChange >= 2 ? "がぐーんと上がった" : "が上がった"
              : actualChange <= -2 ? "ががくっと下がった" : "が下がった"
          }
          // 変化しなかった場合（すでに限界値）
          else
            text2 = buff > 0 ? "はこれ以上上がらない" : "はこれ以上下がらない";

          textArray.push(`${text1}${text2}`);
        }

        const buffText = textArray.join("\n");
        setOtherText({ kind: "buff", content: buffText });

        if (buffText.includes("上がった"))
          soundList.general.statusUp.play();
        if (buffText.includes("下がった"))
          soundList.general.statusDown.play();
      }
      else if (effectiveness.includes("heal")) {
        effectiveness = effectiveness.slice(5);
        const target = effectiveness.slice(0, 1);   //h or d
        const ratio = effectiveness.slice(1);
        //hとdの場合の数値を取得
        const maxHp = getPokeNumMaxHp(atcState, atcState.name);
        const [atcCurrentHp, defCurrentHp] = [getPokeNumHp(atcState, atcState.name), getPokeNumHp(defState, defState.name)];
        const base = target === "h" ? maxHp
          : defCurrentHp < damage ? defCurrentHp : damage;
        //回復量を計算
        isHealAtc.current = isAtcWeapon ? true : false;
        isHeal.current = true;
        healHp.current = Math.floor(base * ratio);
        healHp.current = atcCurrentHp + healHp.current < maxHp ? healHp.current : maxHp - atcCurrentHp;
      }
      else if (effectiveness.includes("condition")) {
        const condition = effectiveness.slice(10);  //まひ
        const pokeNum = getPokeNum(pokeState, pokeState.name);

        let conditionText = `${defState.name}はまひして技が出にくくなった`
        let conditionFlg = true;
        //電気タイプは麻痺しない
        if (defState.type1 === "でんき" || defState.type2 === "でんき") {
          conditionText = `${defState.name}には効果がないようだ`;
          conditionFlg = false;
        }
        //無効タイプなら麻痺しない。
        if (defState.text.content === compatiTexts.mukou) {
          conditionText = `${defState.name}には効果がないようだ`;
          conditionFlg = false;
        }
        //既に状態異常になっているなら麻痺しない
        if (pokeState[`poke${pokeNum}Condition`] !== "") {
          conditionText = `しかしうまく決まらなかった`;
          conditionFlg = false;
        }

        //stateに状態異常をセット
        if (conditionFlg) {
          soundList.general.paralyzed.play();
          setPokeState(prev => ({ ...prev, [`poke${pokeNum}Condition`]: condition }));
        }
        //まひテキストをセット
        setOtherText({ kind: "condition", content: conditionText });
      }
    }
  }

  //バフ込みの実数値を取得する
  const calcActualStatus = (isMe, status) => {
    const pokeState = getPokeState(isMe, true);
    const beforeStatus = pokeState[status];
    const buff = pokeState[`${status}Buff`];
    const buffMultiplier = buff > 0 ? buff * 0.5 + 1 : 2 / (2 - buff);
    let actualStatus = beforeStatus * buffMultiplier;

    const pokeNum = getPokeNum(pokeState, pokeState.name);
    if (status === "s" && pokeState[`poke${pokeNum}Condition`] === "まひ")
      actualStatus = Math.floor(actualStatus * 0.5);
    return actualStatus;
  }

  //バトル場のポケモンがテラスタルしているか返す
  const checkIsTerastal = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const pokeNum = getPokeNum(pokeState, pokeState.name);
    const isTerastal = pokeState.terastalPokeNum === pokeNum;
    return isTerastal;
  }

  //技の分類によって変わるAorCとBorDを返す
  const getAtcDefPower = (atcIsMe, weaponInfo) => {
    const [atcState, defState] = [getPokeState(atcIsMe, true), getPokeState(atcIsMe, false)];
    const [atcPower, defPower] = weaponInfo.name !== "テラバースト"
      ? weaponInfo.kind === "物理" ? [atcState.a, defState.b] : [atcState.c, defState.d]
      : atcState.a > atcState.c ? [atcState.a, defState.b] : [atcState.c, defState.d];
    return { atcPower, defPower }
  }

  //技の分類にあったAorCとBorDのバフを取得する
  const getAtcDefBuff = (atcIsMe, weaponInfo) => {
    const [atcState, defState] = [getPokeState(atcIsMe, true), getPokeState(atcIsMe, false)];

    const atcBuff = weaponInfo.name !== "テラバースト"
      ? (weaponInfo.kind === "物理" ? atcState.aBuff : atcState.cBuff)
      : (atcState.a > atcState.c ? atcState.aBuff : atcState.cBuff);

    const defBuff = weaponInfo.name !== "テラバースト"
      ? (weaponInfo.kind === "物理" ? defState.bBuff : defState.dBuff)
      : (atcState.a > atcState.c ? defState.bBuff : defState.dBuff);

    return { atcBuff, defBuff };
  }

  //回復後のHPをセットする
  const setHpOnHeal = (isMe) => {
    const [pokeState, setPokeState, setPokeStateTrigger]
      = [getPokeState(isMe, true), getSetPokeState(isMe, true), getSetPokeStateTrigger(isMe, true)];
    const currentHp = getPokeNumHp(pokeState, pokeState.name);
    const newHp = currentHp + healHp.current;

    adjustHpBar(isMe, newHp);
    isHealAtc.current = false;
    pokeState.hp !== newHp
      ? setPokeState(prev => ({ ...prev, hp: newHp }))
      : setPokeStateTrigger(prev => ({ ...prev, hp: prev.hp + 1 }));
    console.log(`${pokeState.name}は${healHp.current}回復した`)
  }

  //指定したポケモンの最大HPを取得する
  const getPokeNumMaxHp = (pokeState, pokeName) => {
    const pokeNum = getPokeNum(pokeState, pokeName);
    const maxHp = pokeState[`poke${pokeNum}MaxHp`];
    return maxHp;
  }

  //回復テキストをセットする
  const setHealText = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const healText = healHp.current > 0
      ? `${pokeState.name}の体力が回復した`
      : `${pokeState.name}の体力は満タンだ`
    setOtherText({ kind: "heal", content: healText });
  }


  return {
    //toDoWhenFnc.jsで使用
    setPokeInfo,
    setHpOnEntry,
    setPokeNumHp,
    setTerastalPokeNum,
    setGoText,
    setBackText,
    setTerastalText,
    setWeaponText,
    setDeadText,
    setMyTurn,
    setAreaVisibleForApp,
    setAreaVisibleForChange,
    setAreaVisibleForTerastal,
    setPokeName,
    setCompatiText,
    getDamage,
    playAttackingFlow,
    setHpOnDamage,
    playDeathEffect,
    setLife,
    setNextOpPokeName,
    setWinner,
    checkIsAttackWeapon,

    setHpOnHeal,
    setHealText,

    //jsxや他jsで使用
    getPokeInfo,
    getWeaponInfo,
    getPokeNum,
    getMaxHp,
    resetChangeTurn,
    checkIsTerastal,

    //jsxで使用
    setBgm,
    playBgm,
    selectBetterOpPokes,
    setBattleInfo,
    updateTurnCnt,
    decideOpAction,
    setTextWhenClickWeaponBtn,
    initializeState,

    getPokeState,
    getAreaVisible,
    consoleWhenTurnEnd,

    stopProcessing
  };
}
