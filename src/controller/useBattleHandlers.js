import {
  soundList, compatiTexts,
  calcResistanceForAllOpPokes,
  selectBetterOpPokesLogic, calcNewHp,
  getGoText, getWeaponText, getCompatiTextLogic, getDeadText,
  getOpChangePoke, checkIsFirst, calcMultiplier,
  getMostEffectiveWeaponLogic, predictMyActionLogic,
  choiseBetterWeapon, getDamageEffectElem,
  jumpEffect, attackEffectLogic, damageEffectLogic,
  calcTrueDamage, adjustHpBarLogic,
  selectNextOpPokeLogic, delay,
  getTerastalText, calcPureDamage, getCompati,
} from "../model/model";

export function useBattleHandlers(battleState) {

  //インポートの取得===========================================================
  const {
    defaultAreaVisible,
    myAreaVisible, opAreaVisible, otherAreaVisible,
    setMyAreaVisible, setOpAreaVisible, setOtherAreaVisible,
    defaultPokeState, defaultPokeStateTrigger,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    setMyPokeStateTrigger,
    setOpPokeStateTrigger,
    setSelectedOrder,
    isTerastalActive,
    myTextRef, opTextRef, otherTextRef, textAreaRef,
    myLife, opLife,
    opTerastalFlg,
    mySelectedWeapon, opSelectedWeapon,
    myChangePokeName, opChangePokeName,
    myDeathFlg, opDeathFlg, burned, poisoned,
    myPoisonedCnt, opPoisonedCnt,
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
    const [weapon1Se, weapon2Se, weapon3Se, weapon4Se] = await Promise.all([
      getWeaponInfo(pokeInfo.weapon1),
      getWeaponInfo(pokeInfo.weapon2),
      getWeaponInfo(pokeInfo.weapon3),
      getWeaponInfo(pokeInfo.weapon4),
    ]).then(results => results.map(r => r.sound));

    setPokeState(prev => ({
      ...prev,
      img: pokeInfo.img, voice: preloadSound(pokeInfo.voice), type1: pokeInfo.type1, type2: pokeInfo.type2, terastal: pokeInfo.terastal,
      a: pokeInfo.a, b: pokeInfo.b, c: pokeInfo.c, d: pokeInfo.d, s: pokeInfo.s,
      aBuff: 0, bBuff: 0, cBuff: 0, dBuff: 0, sBuff: 0,
      weapon1: pokeInfo.weapon1, weapon2: pokeInfo.weapon2, weapon3: pokeInfo.weapon3, weapon4: pokeInfo.weapon4,
      weapon1Se: preloadSound(weapon1Se), weapon2Se: preloadSound(weapon2Se), weapon3Se: preloadSound(weapon3Se), weapon4Se: preloadSound(weapon4Se),
    }));
    //猛毒の初期化
    const poisonedCnt = isMe ? myPoisonedCnt : opPoisonedCnt;
    poisonedCnt.current = 1;
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

    const currentHp = getPokeNumHp(pokeState, pokeState.name);
    const newHp = calcNewHp(currentHp, damage);
    //HPバーの制御はplayAttackingFlow()内で行う
    //HPのセット
    !checkIsSameHp(pokeState.hp, currentHp, newHp)
      ? setPokeState(prev => ({ ...prev, hp: newHp }))
      : setPokeStateTrigger(prev => ({ ...prev, hp: prev.hp + 1 }));
  }

  //攻撃を受けた後のHPセット
  const setHpOnOtherDamage = (isMe, damage) => {
    const [pokeState, setPokeState] =
      [getPokeState(isMe, true), getSetPokeState(isMe, true)];

    const newHp = calcNewHp(pokeState.hp, damage);
    adjustHpBar(isMe, newHp);
    setPokeState(prev => ({ ...prev, hp: newHp }));
  }

  //poke1Hp等のHpをバトル場のポケモンのHpと同じ値に更新する
  const setPokeNumHp = (isMe) => {
    const [pokeState, setPokeState] = [getPokeState(isMe, true), getSetPokeState(isMe, true)];
    const pokeNum = getPokeNum(pokeState, pokeState.name);
    setPokeState(prev => ({ ...prev, [`poke${pokeNum}Hp`]: pokeState.hp, }));
  }

  //テラスタルするポケモンNoをセットする
  const setTerastalPokeNum = async (isMe) => {
    await stopProcessing(2000);
    const [pokeState, setPokeState] = [getPokeState(isMe, true), getSetPokeState(isMe, true)];
    setPokeState(prev => ({ ...prev, canTerastal: false, terastalPokeNum: getPokeNum(pokeState, pokeState.name) }));
  }

  //Goテキストをセットする
  const setGoText = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const goText = getGoText(isMe, pokeState.name);
    const textRef = getTextRef(isMe);
    textRef.current = { kind: "go", content: goText };
  }

  //backテキストをセットする
  const setBackText = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const backText = `戻れ！${pokeState.name}！`;
    const textRef = getTextRef(isMe);
    textRef.current = { kind: "back", content: backText };
  }

  //テラスタルテキストをセットする
  const setTerastalText = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const terastalText = getTerastalText(isMe, pokeState.name);
    const textRef = getTextRef(isMe);
    textRef.current = { kind: "terastal", content: terastalText };
  }

  //Weaponテキストをセットする
  const setWeaponText = async (isMe) => {
    const pokeState = getPokeState(isMe, true);

    let canMove = true;
    let cantMoveText = "";

    //麻痺チェック
    const pokeCondition = getPokeCondition(isMe);
    if (pokeCondition === "まひ") {
      canMove = Math.random() >= 0.25;
      // canMove = Math.random() >= 1;   //テスト用
      cantMoveText = canMove ? "" : `${pokeState.name}はしびれて動けない`;
    }
    //凍りチェック
    else if (pokeCondition === "こおり") {
      canMove = Math.random() >= 0.80;
      // canMove = Math.random() >= 0.1;   //テスト用
      cantMoveText = canMove ? "" : `${pokeState.name}は凍ってしまって動けない`;
    }

    if (canMove) {
      if (pokeCondition === "こおり") {
        otherTextRef.current = { kind: "general", content: `${pokeState.name}は氷が溶けた` };
        await displayOtherText();
      }
      const weaponName = getWeaponName(isMe);
      const weaponText = getWeaponText(isMe, pokeState.name, weaponName);
      const textRef = getTextRef(isMe);
      textRef.current = { kind: "weapon", content: weaponText };
    }
    else {
      const conditionSe = pokeCondition === "まひ" ? "paralyzed"
        : pokeCondition === "こおり" ? "frozen" : null;
      soundList.general[conditionSe].play();
      otherTextRef.current = { kind: "cantMove", content: cantMoveText };
      await displayOtherText();
      await cantMoveFnc();
    }
  }

  //相性テキストをセットする
  const setCompatiText = async (atcIsMe) => {
    const weaponInfo = (atcIsMe ? mySelectedWeapon : opSelectedWeapon).current;
    let compatiText = await getCompatiText(atcIsMe);
    if (weaponInfo.kind === "変化")
      compatiText = compatiTexts.mukou ? compatiText : compatiTexts.toubai;
    const textRef = getTextRef(!atcIsMe);
    textRef.current = { kind: "compati", content: compatiText };
  }

  //deadテキストをセットする
  const setDeadText = async (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const deadText = getDeadText(isMe, pokeState.name);

    if (otherAreaVisible.textArea)
      await stopProcessing(2000);
    const textRef = getTextRef(isMe);
    textRef.current = { kind: "dead", content: deadText };
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
      setGoText(!isMe);
      await controllAreaVisibleForApp(!isMe);
      setOtherAreaVisible(prev => ({ ...prev, textArea: false, actionCmd: true }));
    }
    //一方のポケモン登場時の表示制御
    else if (!!myAreaVisible.poke !== !!opAreaVisible.poke) {
      const changeTurn = (myAreaVisible.poke ? opChangeTurn : myChangeTurn).current;
      await controllAreaVisibleForApp(isMe);
      //死亡後の交代の場合はコマンドボタンを表示
      if (!changeTurn) {
        setOtherAreaVisible(prev => ({ ...prev, textArea: false, actionCmd: true }));
      }
    }
  }

  //ポケモン交換時の表示制御
  const setAreaVisibleForChange = async (isMe) => {
    const textRef = getTextRef(isMe);
    soundList.general.back.cloneNode().play();
    const setAreaVisible = getSetAreaVisible(isMe, true);
    // setAreaVisible(prev => ({ ...prev, text: true }));    //backテキストを表示
    setOtherAreaVisible(prev => ({ ...prev, textArea: true }));    //backテキストを表示
    delay(() => textAreaRef.current.textContent = textRef.current.content, 1);
    await stopProcessing(1000);
    setAreaVisible(prev => ({ ...prev, poke: false }));
  }

  //テラスタルテキスト表示の制御
  const setAreaVisibleForTerastal = async (isMe) => {
    const textRef = getTextRef(isMe);
    setOtherAreaVisible(prev => ({ ...prev, textArea: true }));
    delay(() => textAreaRef.current.textContent = textRef.current.content, 1);
    await stopProcessing(1000);
  }

  //攻撃関連のアニメーションを再生し、ダメージを反映したHPをセット
  const playAttackingFlow = async (atcIsMe, isHit, isCritical, damage) => {
    const defState = getPokeState(atcIsMe, false);
    const weaponInfo = (atcIsMe ? mySelectedWeapon : opSelectedWeapon).current;
    const [atcTextRef, defTextRef] = [getTextRef(atcIsMe), getTextRef(!atcIsMe)];

    setOtherAreaVisible(prev => ({ ...prev, textArea: true }));
    delay(() => textAreaRef.current.textContent = atcTextRef.current.content, 1);  //技テキスト表示

    //ジャンプと同時に鳴き声再生→攻撃モーションと同時に技SE再生
    await attackEffect(atcIsMe, isHit, weaponInfo.atctarget);

    if (weaponInfo.kind !== "変化") {
      //無効ではない場合
      if (defTextRef.current.content !== compatiTexts.mukou) {
        if (isHit) {
          if (defTextRef.current.content !== compatiTexts.toubai)
            textAreaRef.current.textContent = defTextRef.current.content;   //相性テキスト表示
          if (isCritical)
            textAreaRef.current.textContent = `${textAreaRef.current.textContent}\n急所に当たった！`;

          //HPバー調整とダメージエフェクト
          const currentHp = getPokeNumHp(defState, defState.name);
          const newHp = calcNewHp(currentHp, damage);
          adjustHpBar(!atcIsMe, newHp);
          await damageEffect(!atcIsMe);
        }
        else
          textAreaRef.current.textContent = `${defState.name}にはあたらなかった`;
      }
      else
        textAreaRef.current.textContent = defTextRef.current.content;   //相性テキスト表示

      await stopProcessing(2000);
    }
    else if (!isHit) {
      textAreaRef.current.textContent = `${defState.name}にはあたらなかった`;
      await stopProcessing(2000);
    }

    //追加効果があるなら発動(変化技も)
    if (isHit)
      await doSecondaryEffect(atcIsMe, weaponInfo, damage);
  }

  //倒れたポケモンに死亡エフェクトを入れる
  const playDeathEffect = (isMe) => {
    return new Promise(async (resolve) => {
      const [pokeState, setAreaVisible] = [getPokeState(isMe, true), getSetAreaVisible(isMe, true)];
      const pokeIMGElm = getDamageEffectElem(isMe);
      const textRef = getTextRef(isMe);

      // 1秒後に死亡演出を開始
      await stopProcessing(1000);
      setOtherAreaVisible(prev => ({ ...prev, textArea: true }));    //deadテキストの表示
      delay(() => textAreaRef.current.textContent = textRef.current.content, 1);
      await playPokeVoice(pokeState.name);
      pokeIMGElm.classList.add("pokemon-dead");

      // さらに2秒後に非表示 & resolve
      await stopProcessing(3001)
      setAreaVisible(prev => ({ ...prev, poke: false }));
      resolve();
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
  const setTextWhenClickWeaponBtn = async () => {
    //相手が交代するなら、相手のbackテキストをセット
    if (opChangeTurn.current) {
      setBackText(false);
      changeFnc1(false);
    }
    else {
      //どちらかがテラスタルする場合、先攻のテラスタルテキストセット
      if (isTerastalActive || opTerastalFlg.current) {
        const isMe = isTerastalActive && opTerastalFlg.current
          ? calcActualStatus(true, "s") >= calcActualStatus(false, "s")
          : isTerastalActive;
        setTerastalText(isMe);
        terastalFnc1(isMe);
      }
      //どちらもテラスタルしない場合、先攻の技テキストをセット
      else {
        await setWeaponText(iAmFirst.current);
        await setCompatiText(iAmFirst.current);
        await compatiFnc1(!iAmFirst.current);
      }
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
  const playPokeVoice = async (isMe, onEnded) => {
    const pokeState = getPokeState(isMe, true);
    try {
      const sound = pokeState.voice; // すでに Audio オブジェクト
      sound.currentTime = 0;
      if (onEnded) sound.onended = onEnded;
      await sound.play();
    } catch (e) {
      console.error(`鳴き声の再生に失敗: ${pokeState.name}`, e);
      onEnded?.(); // エラー時もコールバック呼びたいならこれでOK
    }
  };


  //各技のSEを再生
  const playWeaponSound = async (isMe, weaponName, onEnded) => {
    try {
      const pokeState = getPokeState(isMe, true);
      const weaponNum = getWeaponNum(isMe, weaponName);   //技番号を取得
      const sound = pokeState[`weapon${weaponNum}Se`];
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
        opTerastalFlg.current = true;
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
            opTerastalFlg.current = true;
            debugText = (cnt1 > cnt2) ? "相手は攻撃力上昇のためにテラスタルする" : "相手は自分の攻撃を無効化するためにテラスタルする";
          }
          //テラスすると、自分の控えから抜群を取られる場合 && テラスせずとも抜群とられる場合、テラスタルフラグを立てる
          else {
            const [compati21, compati22] = getCompati(aliveMyBenchPokes[0].type1, aliveMyBenchPokes[0].type2, opPokeState.type1, opPokeState.type2);
            const [compati31, compati32] = aliveMyBenchPokes.length === 2
              ? getCompati(aliveMyBenchPokes[1].type1, aliveMyBenchPokes[1].type2, opPokeState.type1, opPokeState.type2)
              : [null, null];
            if (Math.max(compati21, compati22) >= 2 || (compati31 ? (Math.max(compati31, compati32) >= 2) : true)) {
              opTerastalFlg.current = true;
              debugText = (cnt1 > cnt2) ? "相手は攻撃力上昇のためにテラスタルする" : "相手は自分の攻撃を無効化するためにテラスタルする";
            }
          }
        }
        else {
          opTerastalFlg.current = true;
          debugText = (cnt1 > cnt2) ? "相手は攻撃力上昇のためにテラスタルする" : "相手は自分の攻撃を無効化するためにテラスタルする";
        }
      }
    }
    console.log(opTerastalFlg.current ? debugText : "相手はテラスタルしない");
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
    const [myWeaponPriority, opWeaponPriority] = ([
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
    let isTerastalAtc = checkIsTerastal(atcIsMe) || (!atcIsMe && opTerastalFlg.current);
    let isTerastalDef = checkIsTerastal(!atcIsMe);

    //火傷状態で物理技を選択したらフラグを立てる
    const pokeCondition = getPokeCondition(atcIsMe);
    const isBurned = pokeCondition === "やけど" && atcPower === atcState.a;

    //相手のテラス判断のための値変更
    if (atcIsMe && terastalCheckFlg)
      isTerastalDef = true;
    else if (!atcIsMe && terastalCheckFlg)
      isTerastalAtc = true;

    weaponInfo.type = weaponInfo.name !== "テラバースト"
      ? weaponInfo.type
      : isTerastalAtc ? atcState.terastal : weaponInfo.type;

    const { atcBuff, defBuff } = getAtcDefBuff(atcIsMe, weaponInfo);

    const atcInfo = { name: atcState.name, type1: atcState.type1, type2: atcState.type2, terastal: atcState.terastal, isTerastalAtc, power: atcPower, buff: atcBuff, isBurned };
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
    const setAreaVisible = getSetAreaVisible(isMe, true);
    const textRef = getTextRef(isMe);

    setOtherAreaVisible(prev => ({ ...prev, textArea: true }));    //Goテキストの表示
    delay(() => textAreaRef.current.textContent = textRef.current.content, 1);
    delay(() => setAreaVisible(prev => ({ ...prev, poke: true })), 1000);       //ポケモンの表示
    delay(async () => await playPokeVoice(isMe), 1000);                     //鳴き声再生
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
    const weaponName = getWeaponName(atcIsMe);
    const defTextRef = getTextRef(!atcIsMe);

    jumpEffect(atcIsMe);
    await new Promise((resolve) => {
      playPokeVoice(atcIsMe, () => resolve());
    });

    //技が命中してて、相性が無効ではない場合に攻撃エフェクトを入れる
    if (isHit && defTextRef.current.content !== compatiTexts.mukou && atcTarget === "相手") {
      attackEffectLogic(atcIsMe);
      await new Promise((resolve) => {
        playWeaponSound(atcIsMe, weaponName, () => resolve());
      });
    }
    if (isHit && atcTarget === "自分") {
      jumpEffect(atcIsMe);
      await new Promise((resolve) => {
        playWeaponSound(atcIsMe, weaponName, () => resolve());
      });
    }
  };

  //ダメージエフェクト
  const damageEffect = async (isMe) => {
    const defTextRef = getTextRef(isMe);
    damageEffectLogic(isMe);
    await new Promise((resolve) => {
      playDamageSound(defTextRef.current.content, resolve);
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

  //ターン終了時にやること
  const toDoWhenTurnEnd = async () => {
    await stopProcessing(2000);
    await processBurnedDamage(true);  //火傷ダメージの処理
    await processBurnedDamage(false);
    await processPoisonedDamage(true);  //毒ダメージの処理
    await processPoisonedDamage(false);
    otherTextRef.current.content = "";

    //ターン終了時に定数ダメージを受けても生存する場合にコマンドを表示
    if (myPokeState.hp > 0 && opPokeState.hp > 0 && !myDeathFlg.current && !opDeathFlg.current)
      setOtherAreaVisible(prev => ({ ...prev, textArea: false, actionCmd: true }));
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
  const doSecondaryEffect = async (atcIsMe, weaponInfo, damage) => {
    const [effTarget, incidenceRate, isAtcWeapon]
      = [weaponInfo.efftarget, weaponInfo.incidencerate, weaponInfo.kind !== "変化"];
    const isIncident = incidenceRate ? (Math.random() * 100 < incidenceRate) : false;
    let effectiveness = isIncident ? weaponInfo.effectiveness : null;

    const [atcState, defState] = [getPokeState(atcIsMe, true), getPokeState(atcIsMe, false)];
    const defTextRef = getTextRef(!atcIsMe);

    //相手が死亡した際は、相手への追加効果は発動しない
    const isAlive = damage < defState.hp;
    effectiveness = effTarget === "相手" && !isAlive ? null : effectiveness;

    if (effectiveness) {
      const myEffectiveness = atcIsMe && effTarget === "自分" || !atcIsMe && effTarget === "相手";
      const [pokeState, setPokeState] = [getPokeState(myEffectiveness, true), getSetPokeState(myEffectiveness, true)];

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
        // setOtherText({ kind: "buff", content: buffText });
        otherTextRef.current = { kind: "buff", content: buffText };

        if (buffText.includes("上がった"))
          soundList.general.statusUp.play();
        if (buffText.includes("下がった"))
          soundList.general.statusDown.play();

        await displayOtherText();
        if (!isAtcWeapon)
          await buffFnc();
      }
      else if (effectiveness.includes("heal")) {
        effectiveness = effectiveness.slice(5);
        const target = effectiveness.slice(0, 1);   //h or d
        const ratio = effectiveness.slice(1);
        //hとdの場合の数値を取得
        const maxHp = getPokeNumMaxHp(atcState, atcState.name);
        // const [atcCurrentHp, defCurrentHp] = [getPokeNumHp(atcState, atcState.name), getPokeNumHp(defState, defState.name)];
        const [atcCurrentHp, defCurrentHp] = [atcState.hp, defState.hp];
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
        let conditionText = "";
        let conditionFlg = true;

        //無効タイプなら状態異常にならない。
        if (defTextRef.current.content === compatiTexts.mukou) {
          conditionText = `${defState.name}には効果がないようだ`;
          conditionFlg = false;
        }
        //既に状態異常になっているなら他の状態異常にならない
        const defPokeCondition = getPokeCondition(!atcIsMe);
        if (defPokeCondition !== "") {
          conditionText = isAtcWeapon ? "" : `しかしうまく決まらなかった`;
          conditionFlg = false;
        }

        if (condition === "まひ") {
          //電気タイプは麻痺しない
          if (defState.type1 === "でんき" || defState.type2 === "でんき") {
            conditionText = `${defState.name}には効果がないようだ`;
            conditionFlg = false;
          }
          conditionText = conditionFlg ? `${defState.name}はまひして技が出にくくなった` : conditionText;
        }
        else if (condition === "やけど") {
          //炎タイプは火傷しない
          if (defState.type1 === "ほのお" || defState.type2 === "ほのお") {
            conditionText = `${defState.name}には効果がないようだ`;
            conditionFlg = false;
          }
          conditionText = conditionFlg ? `${defState.name}はやけどを負った` : conditionText;
        }
        else if (condition.includes("どく")) {
          const isBadlyPoisoned = condition === "もうどく";
          //どくタイプは毒状態にならない
          if (defState.type1 === "どく" || defState.type2 === "どく") {
            conditionText = `${defState.name}には効果がないようだ`;
            conditionFlg = false;
          }
          conditionText = conditionFlg ? `${defState.name}は${isBadlyPoisoned ? "猛" : ""}毒状態になった` : conditionText;
        }
        else if (condition === "こおり") {
          //氷タイプは凍らない
          if (defState.type1 === "こおり" || defState.type2 === "こおり")
            conditionFlg = false;
          conditionText = conditionFlg ? `${defState.name}は凍ってしまった` : conditionText;
        }

        //stateに状態異常をセット
        if (conditionFlg) {
          const conditionSe = condition === "まひ" ? "paralyzed"
            : condition === "やけど" ? "burned"
              : condition.includes("どく") ? "poisoned"
                : condition === "こおり" ? "frozen"
                  : null;
          soundList.general[conditionSe].play();
          setPokeState(prev => ({ ...prev, [`poke${pokeNum}Condition`]: condition }));
        }
        //状態異常テキストをセット
        otherTextRef.current = { kind: "condition", content: conditionText };
      }
      else if (effectiveness === "ひるみ") {
        //先攻の場合のみひるみの効果が発動する
        const isFlinch = atcIsMe === iAmFirst.current;
        if (isFlinch) {
          const flinchText = `${defState.name}はひるんで動けない`;
          otherTextRef.current = { kind: "cantMove", content: flinchText };
          await displayOtherText();
        }
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

    const pokeCondition = getPokeCondition(isMe);
    if (status === "s" && pokeCondition === "まひ")
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
    const newHp = pokeState.hp + healHp.current;

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
    // setOtherText({ kind: "heal", content: healText });
    otherTextRef.current = { kind: "heal", content: healText };
  }

  //火傷チェック
  const checkIsBurned = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const pokeCondition = getPokeCondition(isMe);
    const isBurned = pokeCondition === "やけど" && pokeState.hp > 0;
    return isBurned;
  }

  //火傷ダメージ計算
  const calcBurnedDamage = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const maxHp = getMaxHp(pokeState, pokeState.name);
    const burnedDamage = Math.floor(maxHp / 16);
    return burnedDamage;
  }

  //火傷テキストのセット
  const setBurnedText = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const burnedText = `${pokeState.name}はやけどのダメージを受けた`;
    // setOtherText({ kind: "burned", content: burnedText });
    otherTextRef.current = { kind: "burned", content: burnedText };
  }

  //火傷のダメージ処理
  const processBurnedDamage = async (isMe) => {
    if (checkIsBurned(isMe)) {
      burned.current = true;
      const burnedDamage = calcBurnedDamage(isMe);

      const deathFlg = isMe ? myDeathFlg : opDeathFlg;
      const pokeState = getPokeState(isMe, true);
      deathFlg.current = burnedDamage >= pokeState.hp ? true : false;

      soundList.general.burned.play();
      setHpOnOtherDamage(isMe, burnedDamage);
      setBurnedText(isMe);
      await displayOtherText();
      if (isMe)
        await stopProcessing(2500);
    }
  }

  //毒チェック
  const checkIsPoisoned = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const pokeCondition = getPokeCondition(isMe);
    const isPoisoned = pokeCondition.includes("どく") && pokeState.hp > 0;
    return isPoisoned;
  }

  //毒ダメージ計算
  const calcPoisonedDamage = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const pokeCondition = getPokeCondition(isMe);
    const maxHp = getMaxHp(pokeState, pokeState.name);
    let poisonedDamage = 0;
    if (pokeCondition === "もうどく") {
      const cnt = isMe ? myPoisonedCnt : opPoisonedCnt;
      const ratio = Math.min(cnt.current, 15) / 16;
      poisonedDamage = Math.floor(maxHp * ratio);
      cnt.current++;
    } else
      poisonedDamage = Math.floor(maxHp / 8);
    return poisonedDamage;
  }

  //毒テキストのセット
  const setPoisonedText = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const poisonedText = `${pokeState.name}は毒のダメージを受けた`;
    otherTextRef.current = { kind: "poisonsed", content: poisonedText };
  }

  //毒のダメージ処理
  const processPoisonedDamage = async (isMe) => {
    if (checkIsPoisoned(isMe)) {
      poisoned.current = true;
      const poisonedDamage = calcPoisonedDamage(isMe);

      const deathFlg = isMe ? myDeathFlg : opDeathFlg;
      const pokeState = getPokeState(isMe, true);
      deathFlg.current = poisonedDamage >= pokeState.hp ? true : false;

      soundList.general.poisoned.play();
      setHpOnOtherDamage(isMe, poisonedDamage);
      setPoisonedText(isMe);
      await displayOtherText();
      if (isMe)
        await stopProcessing(2500);
    }
  }

  //ポケモンの現在HPと最大HPをコンソールする
  const consolePokeHp = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const maxHp = getPokeNumMaxHp(pokeState, pokeState.name);
    console.log(`${pokeState.name}\n残HP：${pokeState.hp}\n最大HP：${maxHp}`);
  }

  //バトル場のポケモンの状態異常を取得する
  const getPokeCondition = (isMe) => {
    const pokeState = getPokeState(isMe, true);
    const pokeNum = getPokeNum(pokeState, pokeState.name);
    const pokeCondition = pokeState[`poke${pokeNum}Condition`];
    return pokeCondition;
  }

  //textRef
  const getTextRef = (isMe) => {
    const textRef = isMe ? myTextRef : opTextRef;
    return textRef;
  }

  const changeFnc1 = async (isMe) => {
    const changePokeName = (isMe ? myChangePokeName : opChangePokeName).current;
    await setAreaVisibleForChange(isMe);
    await stopProcessing(1000);
    setPokeName(isMe, changePokeName);
  }

  const terastalFnc1 = async (isMe) => {
    await setAreaVisibleForTerastal(isMe);
    await setTerastalPokeNum(isMe);
  }

  const compatiFnc1 = async (isMe) => {
    const { weaponInfo, damage, isHit, isCriticalHit } = await getDamage(!isMe);
    await playAttackingFlow(!isMe, isHit, isCriticalHit, damage);
    if (weaponInfo.kind !== "変化" || !isHit)
      setHpOnDamage(isMe, damage);
    else if (isHeal.current)
      setHpOnHeal(!isMe);
  }

  const deadFnc1 = async (isMe) => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false }));
    await playDeathEffect(isMe);
    resetChangeTurn();
    setLife(isMe);
    if ((isMe ? myLife : opLife).current > 0) {
      if (!isMe)
        await setNextOpPokeName();
    }
    else
      setWinner(!isMe)
  }

  const buffFnc = async () => {
    if ((iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeState.hp > 0 || !iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeState.hp > 0)) {
      await setWeaponText(!iAmFirst.current);
      await setCompatiText(!iAmFirst.current);
      await compatiFnc1(iAmFirst.current);
    }
    else if (iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeState.hp > 0 || !iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeState.hp > 0)
      await toDoWhenTurnEnd();
  }

  const healFnc = async () => {
    if ((iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeState.hp > 0 && isHeal.current || !iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeState.hp > 0 && !isHeal.current)) {
      await setWeaponText(!iAmFirst.current);
      await setCompatiText(!iAmFirst.current);
      await compatiFnc1(iAmFirst.current);
    }
    else if (iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeState.hp > 0 || !iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeState.hp > 0)
      await toDoWhenTurnEnd();
    isHealAtc.current = false;
    isHeal.current = false;
    healHp.current = 0;
  }

  const conditionFnc = async () => {
    if ((iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeState.hp > 0 || !iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeState.hp > 0)) {
      await setWeaponText(!iAmFirst.current);
      await setCompatiText(!iAmFirst.current);
      await compatiFnc1(iAmFirst.current);
    }
    else if (iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeState.hp > 0 || !iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeState.hp > 0)
      await toDoWhenTurnEnd();
  }

  const cantMoveFnc = async () => {
    //動けないのはどちらか取得
    const cantMoveIsMe = otherTextRef.current.content.includes(myPokeState.name);

    if ((iAmFirst.current === cantMoveIsMe)) {
      await setWeaponText(!iAmFirst.current);
      await setCompatiText(!iAmFirst.current);
      await compatiFnc1(iAmFirst.current);
    }
    else if (iAmFirst.current !== cantMoveIsMe)
      await toDoWhenTurnEnd();
  }

  const displayOtherText = async () => {
    setOtherAreaVisible(prev => ({ ...prev, textArea: true }));
    textAreaRef.current.textContent = otherTextRef.current.content;
    await stopProcessing(2000);
  }

  const preloadSound = (url) => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.load();
    return audio;
  };

  const getWeaponNum = (isMe, weaponName) => {
    const pokeState = getPokeState(isMe, true);
    for (let i = 1; i <= 4; i++) {
      if (pokeState[`weapon${i}`] === weaponName) return i;
    }
    return 0;
  };


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
    consolePokeHp,
    getTextRef,
    terastalFnc1,
    compatiFnc1,
    deadFnc1,
    buffFnc,
    healFnc,
    conditionFnc,
    cantMoveFnc,
    displayOtherText,
    preloadSound,

    //jsxや他jsで使用
    getPokeInfo,
    getWeaponInfo,
    getPokeNum,
    getMaxHp,
    resetChangeTurn,
    checkIsTerastal,
    changeFnc1,

    //jsxで使用
    setBgm,
    playBgm,
    selectBetterOpPokes,
    setBattleInfo,
    updateTurnCnt,
    decideOpAction,
    setTextWhenClickWeaponBtn,
    initializeState,
    getPokeCondition,

    getPokeState,
    getAreaVisible,
    toDoWhenTurnEnd,

    stopProcessing
  };
}
