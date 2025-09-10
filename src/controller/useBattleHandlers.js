import {
  soundList, compatiTexts,
  calcResistanceForAllOpPokes,
  selectBetterOpPokesLogic,
  getCompatiTextLogic,
  getOpChangePoke, checkIsFirst, calcMultiplier,
  getMostEffectiveWeaponLogic, predictMyActionLogic,
  choiseBetterWeapon, getDamageEffectElem,
  jumpEffect, attackEffectLogic, damageEffectLogic,
  adjustHpBarLogic,
  selectNextOpPokeLogic, delay,
  calcPureDamage, getCompati,
} from "../model/model";
// import { useToDoWhenFnc } from "./useToDoWhenFnc";

export function useBattleHandlers(battleState) {

  //インポートの取得===========================================================
  const {
    areaVisible, setAreaVisible,
    mySelectedOrder,
    isTerastalActive,
    myTextRef, opTextRef, otherTextRef, textAreaRef,
    myLife, opLife,
    opTerastalFlg,
    mySelectedWeaponInfo, opSelectedWeaponInfo,
    myDeathFlg, opDeathFlg, burned, poisoned,
    myPoisonedCnt, opPoisonedCnt,
    isHeal, isHealAtc, healHp,
    iAmFirst, myChangeTurn, opChangeTurn,
    resultText, turnCnt,
    loopAudioRef,
    myCantMoveFlg, opCantMoveFlg,
    myPokeStatics, opPokeStatics,
    myWeapons, opWeapons,
    myBattlePokeIndex, setMyBattlePokeIndex,
    opBattlePokeIndex, setOpBattlePokeIndex,
    myPokeDynamics, opPokeDynamics,
    setMyPokeDynamics, setOpPokeDynamics,
    damage, newHp,
    myTerastalState, opTerastalState,
    setMyTerastalState, setOpTerastalState,
    myChangePokeIndex, opChangePokeIndex,
    isIncident,
    myPokeBuff, opPokeBuff, setMyPokeBuff, setOpPokeBuff,
    moveFailed,
    atcPokeInfo, defPokeInfo,
    secondaryTextRef, newBuff,
    multiplierRef,
  } = battleState;

  //DBアクセス========================================================================================================================

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

  //相手の選出方法を選択して、相手の選出を返す
  const chooseHowToSelectOpPoke = async (myPokeNames, opPokeNames, how) => {
    let opSelectedOrder = [];
    if (how === "normal" || how === "hard") {
      //通常選出(相手は自分の６体に対して相性の良い３体を選ぶ)
      //ハードモード(相手は自分が選択した３体に対して相性の良い３体を選ぶ)
      const myPoke = how === "normal" ? myPokeNames : mySelectedOrder;
      const [myPokeInfos, opPokeInfos] = await Promise.all([
        Promise.all(myPoke.map(name => getPokeInfo(name))),
        Promise.all(opPokeNames.map(name => getPokeInfo(name)))
      ]);

      const resistanceMap = calcResistanceForAllOpPokes(myPokeInfos, opPokeInfos);
      opSelectedOrder = selectBetterOpPokesLogic(resistanceMap, myPokeInfos[0])
    }
    //テスト用で相手の選出を固定
    else {
      opSelectedOrder = ["グライオン", "マンムー", "ラプラス"];
    }
    return opSelectedOrder;
  }

  //お互いが選出したポケモン情報を取得して返す
  const getPokeInfos = async (opSelectedOrder) => {
    const [myPokeInfos, opPokeInfos] = await Promise.all([
      Promise.all(mySelectedOrder.map(getPokeInfo)),
      Promise.all(opSelectedOrder.map(getPokeInfo))
    ]);
    return { myPokeInfos, opPokeInfos };
  }

  //DBからお互いのポケモン３体の技情報を取得
  const getWeaponInfos = async (myPokeInfos, opPokeInfos) => {
    const myWeaponInfos = await Promise.all(
      myPokeInfos.map(poke =>
        Promise.all([
          getWeaponInfo(poke.weapon1),
          getWeaponInfo(poke.weapon2),
          getWeaponInfo(poke.weapon3),
          getWeaponInfo(poke.weapon4),
        ])
      )
    );
    const opWeaponInfos = await Promise.all(
      opPokeInfos.map(poke =>
        Promise.all([
          getWeaponInfo(poke.weapon1),
          getWeaponInfo(poke.weapon2),
          getWeaponInfo(poke.weapon3),
          getWeaponInfo(poke.weapon4),
        ])
      )
    );
    return { myWeaponInfos, opWeaponInfos };
  }


  //表示制御=====================================================================================

  //指定した時間、テキストエリアを表示する
  const displayTextArea = async (who, stopTime) => {
    let textRef;
    if (who === "other")
      textRef = otherTextRef;
    else
      textRef = getTextRef(who);

    await stopProcessing(100);
    setAreaVisible(prev => ({ ...prev, textArea: true }));
    delay(() => textAreaRef.current.textContent = textRef.current.content, 1);
    await stopProcessing(stopTime);
  };

  //ポケモン登場の表示制御
  const controllAreaVisibleForApp = async (isMe) => {
    await stopProcessing(100);
    const textRef = getTextRef(isMe);

    setAreaVisible(prev => ({ ...prev, textArea: true }));    //Goテキストの表示
    delay(() => textAreaRef.current.textContent = textRef.current.content, 1);
    delay(() => setAreaVisible(prev => ({ ...prev, [isMe ? "myPoke" : "opPoke"]: true })), 1000);       //ポケモンの表示
    delay(async () => await playPokeVoice(isMe), 1000);                     //鳴き声再生
    await stopProcessing(2000);
  };


  //text関係=============================================================
  const getTextRef = (isMe) => {
    const textRef = isMe ? myTextRef : opTextRef;
    return textRef;
  }

  const setTextRef = (isMe, kind, content) => {
    const textRef = getTextRef(isMe);
    textRef.current = { kind, content };
  }

  const setGoText = (isMe) => {
    const pokeName = getBattlePokeStatics(isMe).name;
    const goText = isMe ? `ゆけ！${pokeName}！` : `相手は${pokeName}をくりだした！`;
    setTextRef(isMe, "go", goText);
  }

  const setBackText = (isMe) => {
    const pokeName = getBattlePokeStatics(isMe).name;
    const backText = `戻れ！${pokeName}！`;
    setTextRef(isMe, "back", backText);
  }

  const setTerastalText = (isMe) => {
    const pokeName = getBattlePokeStatics(isMe).name;
    const terastalText = isMe ? `${pokeName}！かがやけ！テラスタル！` : `相手の${pokeName}はテラスタルした！`;
    setTextRef(isMe, "terastal", terastalText);
  }

  const setWeaponText = async (isMe) => {
    const pokeName = atcPokeInfo.current.name;
    const pokeCondition = atcPokeInfo.current.condition;
    let canMove = true;
    let cantMoveText = "";

    //麻痺チェック
    if (pokeCondition === "まひ") {
      canMove = Math.random() >= 0.25;
      // canMove = Math.random() >= 1;   //テスト用
      cantMoveText = canMove ? "" : `${pokeName}はしびれて動けない`;
    }
    //凍りチェック
    else if (pokeCondition === "こおり") {
      canMove = Math.random() >= 0.80;
      // canMove = Math.random() >= 0;   //テスト用
      cantMoveText = canMove ? "" : `${pokeName}は凍ってしまって動けない`;
    }

    if (canMove) {
      if (pokeCondition === "こおり") {
        setBattlePokeDynamics(isMe, "condition", "");
        otherTextRef.current = { kind: "general", content: `${pokeName}は氷が溶けた` };
        await displayTextArea("other", 1500);
      }
      const weaponName = atcPokeInfo.current.selectedWeapon.name;
      const weaponText = isMe ? `${pokeName}！${weaponName}！` : `相手の${pokeName}の${weaponName}`;
      setTextRef(isMe, "weapon", weaponText);
    }
    else {
      (isMe ? myCantMoveFlg : opCantMoveFlg).current = true;
      const conditionSe = pokeCondition === "まひ" ? "paralyzed"
        : pokeCondition === "こおり" ? "frozen" : null;
      soundList.general[conditionSe].play();
      otherTextRef.current = { kind: "cantMove", content: cantMoveText };
      // await displayTextArea("other", 1500);
      // await cantMoveFnc(isMe);
    }
  }

  //相性倍率を受け取って、相性テキストを返す
  const getCompatiText = (atcIsMe) => {
    let weaponType = atcPokeInfo.current.selectedWeapon.type;
    if (checkIsTerastal(atcIsMe) && atcPokeInfo.current.selectedWeapon.name === "テラバースト")
      weaponType = atcPokeInfo.current.terastal;

    const [defType1, defType2] = checkIsTerastal(!atcIsMe)
      ? [defPokeInfo.current.terastal, "なし"] : [defPokeInfo.current.type1, defPokeInfo.current.type2];
    const multiplier = calcMultiplier(weaponType, defType1, defType2);
    const compatiText = getCompatiTextLogic(multiplier);
    return compatiText;
  }

  const setCompatiText = (atcIsMe) => {
    const weaponKind = atcPokeInfo.current.selectedWeapon.kind;
    let compatiText = getCompatiText(atcIsMe);
    if (weaponKind === "変化")
      compatiText = compatiTexts.mukou ? compatiText : compatiTexts.toubai;
    setTextRef(!atcIsMe, "compati", compatiText)
  }

  const setDeadText = (isMe) => {
    const pokeName = defPokeInfo.current.name;
    const deadText = isMe ? `${pokeName}は倒れた` : `相手の${pokeName}は倒れた`;
    setTextRef(isMe, "dead", deadText);
  }

  const setHealText = (isMe) => {
    const pokeName = getBattlePokeStatics(isMe).name;
    const healText = healHp.current > 0 ? `${pokeName}の体力が回復した` : `${pokeName}の体力は満タンだ`
    otherTextRef.current = { kind: "heal", content: healText };
  }

  const setConstantDamageText = (isMe, kind) => {
    const pokeName = getBattlePokeStatics(isMe).name
    let damageText = "";
    const word = kind === "burned" ? "やけど" : "毒";
    damageText = `${pokeName}は${word}のダメージを受けた`;
    otherTextRef.current = { kind, content: damageText };
  }


  //他state・currentのゲッタセッタ============================================================

  const setPokeInfos = (myPokeInfos, opPokeInfos) => {
    myPokeInfos.forEach((poke, index) => {
      myPokeStatics.current[index].name = poke.name;
      myPokeStatics.current[index].img = poke.img;
      myPokeStatics.current[index].voice = preloadSound(poke.voice);
      myPokeStatics.current[index].type1 = poke.type1;
      myPokeStatics.current[index].type2 = poke.type2;
      myPokeStatics.current[index].terastal = poke.terastal;
      myPokeStatics.current[index].hp = poke.hp;
      myPokeStatics.current[index].a = poke.a;
      myPokeStatics.current[index].b = poke.b;
      myPokeStatics.current[index].c = poke.c;
      myPokeStatics.current[index].d = poke.d;
      myPokeStatics.current[index].s = poke.s;
      myPokeStatics.current[index].weapon1 = poke.weapon1;
      myPokeStatics.current[index].weapon2 = poke.weapon2;
      myPokeStatics.current[index].weapon3 = poke.weapon3;
      myPokeStatics.current[index].weapon4 = poke.weapon4;
    });
    setMyPokeDynamics(prev => prev.map((poke, index) => ({ ...poke, currentHp: myPokeInfos[index].hp })));

    opPokeInfos.forEach((poke, index) => {
      opPokeStatics.current[index].name = poke.name;
      opPokeStatics.current[index].img = poke.img;
      opPokeStatics.current[index].voice = preloadSound(poke.voice);
      opPokeStatics.current[index].type1 = poke.type1;
      opPokeStatics.current[index].type2 = poke.type2;
      opPokeStatics.current[index].terastal = poke.terastal;
      opPokeStatics.current[index].hp = poke.hp;
      opPokeStatics.current[index].a = poke.a;
      opPokeStatics.current[index].b = poke.b;
      opPokeStatics.current[index].c = poke.c;
      opPokeStatics.current[index].d = poke.d;
      opPokeStatics.current[index].s = poke.s;
      opPokeStatics.current[index].weapon1 = poke.weapon1;
      opPokeStatics.current[index].weapon2 = poke.weapon2;
      opPokeStatics.current[index].weapon3 = poke.weapon3;
      opPokeStatics.current[index].weapon4 = poke.weapon4;
    });
    setOpPokeDynamics(prev => prev.map((poke, index) => ({ ...poke, currentHp: opPokeInfos[index].hp })));
  };

  const setWeaponInfos = (myWeaponInfos, opWeaponInfos) => {
    myWeaponInfos.forEach((pokeWeapons, pokeIndex) => {
      pokeWeapons.forEach((weapon, weaponIndex) => {
        myWeapons.current[pokeIndex][weaponIndex].name = weapon.name;
        myWeapons.current[pokeIndex][weaponIndex].type = weapon.type;
        myWeapons.current[pokeIndex][weaponIndex].kind = weapon.kind;
        myWeapons.current[pokeIndex][weaponIndex].sound = preloadSound(weapon.sound);
        myWeapons.current[pokeIndex][weaponIndex].power = weapon.power;
        myWeapons.current[pokeIndex][weaponIndex].hitRate = weapon.hitrate;
        myWeapons.current[pokeIndex][weaponIndex].priority = weapon.priority;
        myWeapons.current[pokeIndex][weaponIndex].atcTarget = weapon.atctarget;
        myWeapons.current[pokeIndex][weaponIndex].effTarget = weapon.efftarget;
        myWeapons.current[pokeIndex][weaponIndex].incidenceRate = weapon.incidencerate;
        myWeapons.current[pokeIndex][weaponIndex].effectiveness = weapon.effectiveness;
      });
    });

    opWeaponInfos.forEach((pokeWeapons, pokeIndex) => {
      pokeWeapons.forEach((weapon, weaponIndex) => {
        opWeapons.current[pokeIndex][weaponIndex].name = weapon.name;
        opWeapons.current[pokeIndex][weaponIndex].type = weapon.type;
        opWeapons.current[pokeIndex][weaponIndex].kind = weapon.kind;
        opWeapons.current[pokeIndex][weaponIndex].sound = preloadSound(weapon.sound);
        opWeapons.current[pokeIndex][weaponIndex].power = weapon.power;
        opWeapons.current[pokeIndex][weaponIndex].hitRate = weapon.hitrate;
        opWeapons.current[pokeIndex][weaponIndex].priority = weapon.priority;
        opWeapons.current[pokeIndex][weaponIndex].atcTarget = weapon.atctarget;
        opWeapons.current[pokeIndex][weaponIndex].effTarget = weapon.efftarget;
        opWeapons.current[pokeIndex][weaponIndex].incidenceRate = weapon.incidencerate;
        opWeapons.current[pokeIndex][weaponIndex].effectiveness = weapon.effectiveness;
      });
    });
  };

  const getBattlePokeIndex = (isMe) => {
    const battlePokeIndex = isMe ? myBattlePokeIndex : opBattlePokeIndex;
    return battlePokeIndex;
  }

  const setBattlePokeIndex = (isMe, pokeIndex) => {
    const setBattlePokeIndex = isMe ? setMyBattlePokeIndex : setOpBattlePokeIndex;
    setBattlePokeIndex(pokeIndex);
  }

  const getPokeStatics = (isMe) => {
    const pokeStatics = isMe ? myPokeStatics : opPokeStatics;
    return pokeStatics;
  }

  const getPokeDynamics = (isMe) => {
    const pokeDynamics = isMe ? myPokeDynamics : opPokeDynamics;
    return pokeDynamics;
  }

  const setBattlePokeDynamics = (isMe, key, value) => {
    const battlePokeIndex = getBattlePokeIndex(isMe);
    const setBattlePokeDynamics = isMe ? setMyPokeDynamics : setOpPokeDynamics;
    setBattlePokeDynamics(prev => {
      const newArray = [...prev]; // 配列コピー
      newArray[battlePokeIndex] = {
        ...newArray[battlePokeIndex], // その要素をコピー
        [key]: value                  // 変更するプロパティだけ上書き
      };
      return newArray;
    });
  }

  const getBattlePokeStatics = (isMe) => {
    const pokeStatics = getPokeStatics(isMe);
    const battlePokeIndex = getBattlePokeIndex(isMe);
    const battlePokeStatics = pokeStatics.current[battlePokeIndex];
    return battlePokeStatics;
  }

  const getBattlePokeDynamics = (isMe) => {
    const pokeDynamics = getPokeDynamics(isMe);
    const battlePokeIndex = getBattlePokeIndex(isMe);
    const battlePokeDynamics = pokeDynamics[battlePokeIndex];
    return battlePokeDynamics;
  }

  const getSelectedWeaponInfo = (isMe) => {
    const selectedWeaponInfo = (isMe ? mySelectedWeaponInfo : opSelectedWeaponInfo).current;
    return selectedWeaponInfo;
  }

  const setMyTurn = () => {
    const [myPokeSpeed, opPokeSpeed] = [calcActualStatus(true, "s"), calcActualStatus(false, "s")];
    consoleSpeed(myPokeSpeed, opPokeSpeed);

    //どちらも交換しない場合、優先度と素早さを比較して先攻後攻を決める
    if (!myChangeTurn.current && !opChangeTurn.current)
      iAmFirst.current = checkIsFirst(myPokeSpeed, opPokeSpeed, mySelectedWeaponInfo.current.priority, opSelectedWeaponInfo.current.priority);
    //一方が交代する場合、交代する方が先攻
    else if (!!myChangeTurn.current !== !!opChangeTurn.current)
      iAmFirst.current = myChangeTurn.current;
    //どちらも交代する場合、速い方が先攻で先に交代する　同速の分岐はしない
    else
      iAmFirst.current = myPokeSpeed >= opPokeSpeed;
  }

  const setHpOnHeal = (isMe) => {
    adjustHpBar(isMe, "heal");
    isHealAtc.current = false;    //回復後のHPのuseEffectの分岐制御のため
    setBattlePokeDynamics(isMe, "currentHp", newHp.current);
  }

  //HPバーの幅や色の制御
  const adjustHpBar = (isMe, kind) => {
    const battlePokeStatics = getBattlePokeStatics(isMe);
    const battlePokeDynamics = getBattlePokeDynamics(isMe);
    if (kind === "appearance")
      newHp.current = Math.max(battlePokeDynamics.currentHp);
    else if (kind === "damage")
      newHp.current = Math.max(0, battlePokeDynamics.currentHp - damage.current);
    else if (kind === "heal")
      newHp.current = Math.min(battlePokeStatics.hp, battlePokeDynamics.currentHp + healHp.current);
    adjustHpBarLogic(isMe, newHp.current, battlePokeStatics.hp);
  }

  //定数ダメージ処理（火傷/毒）
  const setConstantDamage = async () => {
    for (const isMe of [true, false]) {
      const battlePokeDynamics = getBattlePokeDynamics(isMe);
      const currentHp = battlePokeDynamics.currentHp;
      const pokeCondition = battlePokeDynamics.condition;
      const kind = pokeCondition === "やけど" ? "burned"
        : pokeCondition?.includes("どく") ? "poisoned" : null;

      //火傷・毒チェック
      if ((pokeCondition === "やけど" || pokeCondition?.includes("どく")) && currentHp > 0) {
        (kind === "burned" ? burned : poisoned).current = true;
        damage.current = calcConstantDamage(isMe, kind);
        (isMe ? myDeathFlg : opDeathFlg).current = damage.current >= currentHp;
        soundList.general[kind].play();
        adjustHpBar(isMe, "damage");
        setBattlePokeDynamics(isMe, "currentHp", newHp.current);
        setConstantDamageText(isMe, kind);
        await displayTextArea("other", 1500);
        if (isMe)
          await stopProcessing(2500);
      }
    }
  }

  const setLife = (isMe) => {
    const life = isMe ? myLife : opLife;
    life.current--;
  }

  const setWinner = (isMe) => {
    stopBgm();
    resultText.current = isMe ? "WIN" : "LOSE";
    setAreaVisible(prev => ({ ...prev, battle: false }));
    soundList.general[resultText.current.toLowerCase()].play();
  };

  const getCantMoveFlg = (isMe) => {
    const flg = (isMe ? myCantMoveFlg : opCantMoveFlg).current;
    return flg;
  }


  //calc系=====================================================================================

  //バフ込みの実数値を取得する
  const calcActualStatus = (isMe, status) => {
    const battlePokeStatics = getBattlePokeStatics(isMe);

    const beforeStatus = battlePokeStatics[status];
    const pokeBuff = isMe ? myPokeBuff : opPokeBuff;
    const buff = pokeBuff[status];
    const buffMultiplier = buff > 0 ? buff * 0.5 + 1 : 2 / (2 - buff);
    let actualStatus = beforeStatus * buffMultiplier;

    const pokeCondition = getBattlePokeDynamics(isMe).condition;
    if (status === "s" && pokeCondition === "まひ")
      actualStatus = Math.floor(actualStatus * 0.5);
    return actualStatus;
  }

  //テラス前後の確定数を計算する(相手目線)
  const calcDefinitelyDefeatHits = async () => {
    //テラス前後の相手からの最大与ダメージ
    const { strongestWeaponDamage: maxDamage1 } = await getMostEffectiveWeapon();
    const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(false, true);
    const { strongestWeaponDamage: maxDamage2 } = getMostEffectiveWeaponLogic(weaponInfos, atcInfos, defInfos);
    //テラス前後の確定数
    const cnt1 = Math.floor(myPokeDynamics[myBattlePokeIndex].currentHp / maxDamage1) + 1;
    const cnt2 = Math.floor(myPokeDynamics[myBattlePokeIndex].currentHp / maxDamage2) + 1;

    return { cnt1, cnt2 };
  }

  //テラス前後の確定耐え数を計算する(相手目線)
  const calcDefinitelyEndureHits = async () => {
    //未テラス状態で自分からの最大打点の技名とダメージ数を取得
    const { myStrongestWeaponIndex, myMaxDamage: maxDamage1 } = await predictMyAction(1);
    //テラス状態で、未テラス状態時の最大打点の技を受けた際の被ダメージを計算する
    const { weaponInfo, atcInfo, defInfo } = getUseInCalcDamageInfo(true, myStrongestWeaponIndex, true);
    const { pureDamage: damage1 } = calcPureDamage(weaponInfo, atcInfo, defInfo);
    //テラス状態の相手への自分の最大打点のダメージを計算する。
    const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(true, true);
    const { myMaxDamage: damage2 } = predictMyActionLogic(weaponInfos, atcInfos, defInfos, 1);
    //テラス前後の確定耐え数
    const cnt1 = Math.floor(opPokeDynamics[opBattlePokeIndex].currentHp / maxDamage1);
    const cnt2 = opPokeDynamics[opBattlePokeIndex].currentHp - damage1 > 0
      ? Math.floor((opPokeDynamics[opBattlePokeIndex].currentHp - damage1) / damage2) + 1 : 0;

    return { cnt1, cnt2 };
  }

  //ダメージ計算　ダメージ数/命中判定/急所判定　を返す
  const calcTrueDamage = (weaponInfo, atcInfo, defInfo) => {
    let trueDamage = 0;
    let realDamage = 0;
    const isHit = weaponInfo.hitRate ? Math.random() * 100 < weaponInfo.hitRate : true;    //命中判定
    let isCritical = false;

    //命中時のみダメージ計算する
    if (weaponInfo.kind !== "変化") {
      if (isHit) {
        let { pureDamage, basicDamage, isSameTerastal, isSameType, multiplier, atcBuffMultiplier, defBuffMultiplier } = calcPureDamage(weaponInfo, atcInfo, defInfo);
        multiplierRef.current = multiplier;
        const randomMultiplier = Math.floor((Math.random() * 0.16 + 0.85) * 100) / 100;    //乱数 0.85~1.00
        isCritical = Math.random() < 0.0417 && multiplier !== 0;;   //急所フラグ 4.17%で急所にあたる
        // isCritical = true;   //テスト用

        //急所に当たった際には攻撃系のデバフと防御系のバフを無視する
        if (isCritical) {
          atcBuffMultiplier = atcBuffMultiplier >= 1 ? 1 : atcBuffMultiplier;
          defBuffMultiplier = defBuffMultiplier <= 1 ? 1 : defBuffMultiplier
          pureDamage = (pureDamage - 2) / atcBuffMultiplier * defBuffMultiplier + 2;
          atcInfo.isBurned = false;
        }

        trueDamage = Math.floor(pureDamage * randomMultiplier);    // 乱数
        trueDamage = Math.floor(trueDamage * (isCritical ? 1.5 : 1));   //急所
        trueDamage = weaponInfo.kind === "物理" && atcInfo.isBurned ? Math.floor(trueDamage * 0.5) : trueDamage;  //やけど補正
        realDamage = trueDamage > defInfo.currentHp ? defInfo.currentHp : trueDamage;
        damage.current = realDamage;

        console.log(`${defInfo.name}に${realDamage}ダメージ(${trueDamage})\n基礎ダメージ：${basicDamage}\n乱数：${randomMultiplier}\nタイプ一致：${isSameTerastal ? 2 : (isSameType ? 1.5 : 1)}\n相性：${multiplier}\n急所：${isCritical ? 1.5 : 1}\nやけど：${weaponInfo.kind === "物理" && atcInfo.isBurned ? 0.5 : 1}`);
      }
      else
        console.log(`${atcInfo.name}の攻撃は当たらなかった`);
    }
    return { isHit, isCritical };
  }

  //定数ダメージ計算(火傷・毒)
  const calcConstantDamage = (isMe, kind) => {
    const pokeCondition = getBattlePokeDynamics(isMe).condition;
    const maxHp = getBattlePokeStatics(isMe).hp;
    let constantDamage = 0;
    if (kind === "burned") {
      constantDamage = Math.floor(maxHp / 16);
    }
    else if (kind === "poisoned") {
      if (pokeCondition === "もうどく") {
        const cnt = isMe ? myPoisonedCnt : opPoisonedCnt;
        const ratio = Math.min(cnt.current, 15) / 16;
        constantDamage = Math.floor(maxHp * ratio);
        cnt.current++;
      }
      else
        constantDamage = Math.floor(maxHp / 8);
    }
    return constantDamage;
  }

  //他ゲッター==================================================================================================================

  //技の分類によって変わるAorCとBorDを返す
  const getAtcDefPower = (atcIsMe, weaponInfo) => {
    let [atcPower, defPower] = [0, 0];
    if (atcPokeInfo.current.a === null) {
      if (atcIsMe) {
        [atcPower, defPower] = weaponInfo.name !== "テラバースト"
          ? weaponInfo.kind === "物理" ? [myPokeStatics.current[myBattlePokeIndex].a, opPokeStatics.current[opBattlePokeIndex].b] : [myPokeStatics.current[myBattlePokeIndex].c, opPokeStatics.current[opBattlePokeIndex].d]
          : myPokeStatics.current[myBattlePokeIndex].a > myPokeStatics.current[myBattlePokeIndex].c ? [myPokeStatics.current[myBattlePokeIndex].a, opPokeStatics.current[opBattlePokeIndex].b] : [myPokeStatics.current[myBattlePokeIndex].c, opPokeStatics.current[opBattlePokeIndex].d];
      }
      else {
        [atcPower, defPower] = weaponInfo.name !== "テラバースト"
          ? weaponInfo.kind === "物理" ? [opPokeStatics.current[opBattlePokeIndex].a, myPokeStatics.current[myBattlePokeIndex].b] : [opPokeStatics.current[opBattlePokeIndex].c, myPokeStatics.current[myBattlePokeIndex].d]
          : opPokeStatics.current[opBattlePokeIndex].a > opPokeStatics.current[opBattlePokeIndex].c ? [opPokeStatics.current[opBattlePokeIndex].a, myPokeStatics.current[myBattlePokeIndex].b] : [opPokeStatics.current[opBattlePokeIndex].c, myPokeStatics.current[myBattlePokeIndex].d];
      }
    }
    else {
      [atcPower, defPower] = weaponInfo.name !== "テラバースト"
        ? weaponInfo.kind === "物理" ? [atcPokeInfo.current.a, defPokeInfo.current.b] : [atcPokeInfo.current.c, defPokeInfo.current.d]
        : atcPokeInfo.current.a > atcPokeInfo.current.c ? [atcPokeInfo.current.a, defPokeInfo.current.b] : [atcPokeInfo.current.c, defPokeInfo.current.d];
    }
    return { atcPower, defPower }
  }

  //技の分類にあったAorCとBorDのバフを取得する
  const getAtcDefBuff = (atcIsMe, weaponInfo) => {
    const atcBuff = weaponInfo.name !== "テラバースト"
      ? (weaponInfo.kind === "物理" ? atcPokeInfo.current.aBuff : atcPokeInfo.current.cBuff)
      : (atcPokeInfo.current.a > atcPokeInfo.current.c ? atcPokeInfo.current.aBuff : atcPokeInfo.current.cBuff);

    const defBuff = weaponInfo.name !== "テラバースト"
      ? (weaponInfo.kind === "物理" ? defPokeInfo.current.bBuff : defPokeInfo.current.dBuff)
      : (atcPokeInfo.current.a > atcPokeInfo.current.c ? defPokeInfo.current.bBuff : defPokeInfo.current.dBuff);

    return { atcBuff, defBuff };
  }

  //自分のポケモンが相手に対して打点が強い方のタイプと、もう一方のタイプを取得して返す
  const getMyStrongType = async () => {
    const myBattlePokeStatics = myPokeStatics.current[myBattlePokeIndex];
    //相手のテラス前タイプに対して自分の最大打点の技タイプ
    const { myMaxDamageWeaponType: strongestWeaponType } = await predictMyAction(1);

    //相手のポケモンに対して、自分のポケモンのタイプ一致技で強い方ともう一方のタイプを取得
    let [strongType, anotherType] = [null, null];
    if (strongestWeaponType === myBattlePokeStatics.type1 || strongestWeaponType === myBattlePokeStatics.type2) {
      const strongTypeNum = strongestWeaponType === myBattlePokeStatics.type1 ? 1 : 2;
      const otherTypeNum = strongTypeNum === 1 ? 2 : 1;
      strongType = myBattlePokeStatics[`type${strongTypeNum}`];
      anotherType = myBattlePokeStatics[`type${otherTypeNum}`];
    }
    return { strongType, anotherType };
  }

  //最も与えるダメージが大きい技・最も与えるダメージが大きい先制技・最も与えるダメージが大きい先制技の最低乱数ダメージ　を返す
  const getMostEffectiveWeapon = async () => {
    const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(false);
    const { opStrongestWeaponIndex, strongestWeaponDamage, strongestHighPriorityWeaponIndex, strongestHighPriorityWeaponDamage }
      = getMostEffectiveWeaponLogic(weaponInfos, atcInfos, defInfos);
    return { opStrongestWeaponIndex, strongestWeaponDamage, strongestHighPriorityWeaponIndex, strongestHighPriorityWeaponDamage }
  }

  //自分が相手に最大ダメージを与えらられる技の中乱数ダメージを返す
  const predictMyAction = async (randomMultiplier) => {
    const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(true);
    const { myStrongestWeaponIndex, myMaxDamageWeaponType, myMaxDamage } = predictMyActionLogic(weaponInfos, atcInfos, defInfos, randomMultiplier);
    return { myStrongestWeaponIndex, myMaxDamageWeaponType, myMaxDamage };
  }

  //相手が次のポケモンを選択するために、お互いのポケモンや技情報を取得する。
  const getUseInCalcDamageInfos = async (atcIsMe, terastalCheckFlg) => {
    const weaponKeys = [0, 1, 2, 3];
    const results = await Promise.all(
      weaponKeys.map(key => getUseInCalcDamageInfo(atcIsMe, key, terastalCheckFlg))
    );
    const weaponInfos = results.map(r => r.weaponInfo);
    const atcInfos = results.map(r => r.atcInfo);
    const defInfos = results.map(r => r.defInfo);
    return { weaponInfos, atcInfos, defInfos };
  }

  //指定した技番号のダメ計に必要な情報を取得して返す
  const getUseInCalcDamageInfo = (atcIsMe, weaponIndex, terastalCheckFlg) => {
    const atcBattlePokeIndex = getBattlePokeIndex(atcIsMe);
    const atcBattlePokeStatics = getBattlePokeStatics(atcIsMe);
    const defBattlePokeStatics = getBattlePokeStatics(!atcIsMe);
    const defBattlePokeDynamics = getBattlePokeDynamics(!atcIsMe);
    const weapons = (atcIsMe ? myWeapons : opWeapons).current;
    const selectedWeaponInfo = getSelectedWeaponInfo(atcIsMe);
    const weaponInfo = weaponIndex != null ? weapons[atcBattlePokeIndex][weaponIndex] : selectedWeaponInfo;
    const { atcPower, defPower } = getAtcDefPower(atcIsMe, weaponInfo);
    //テラスタルしているか
    let isTerastalAtc = checkIsTerastal(atcIsMe) || (!atcIsMe && opTerastalFlg.current);
    let isTerastalDef = checkIsTerastal(!atcIsMe);

    //火傷状態で物理技を選択したらフラグを立てる
    const pokeCondition = atcPokeInfo.current.condition;
    const isBurned = pokeCondition === "やけど" && atcPower === atcPokeInfo.current.a;

    //相手のテラス判断のための値変更
    if (atcIsMe && terastalCheckFlg)
      isTerastalDef = true;
    else if (!atcIsMe && terastalCheckFlg)
      isTerastalAtc = true;

    weaponInfo.type = weaponInfo.name !== "テラバースト"
      ? weaponInfo.type
      : isTerastalAtc ? atcBattlePokeStatics.terastal : weaponInfo.type;

    const { atcBuff, defBuff } = getAtcDefBuff(atcIsMe, weaponInfo);

    const atcInfo = { name: atcBattlePokeStatics.name, type1: atcBattlePokeStatics.type1, type2: atcBattlePokeStatics.type2, terastal: atcBattlePokeStatics.terastal, isTerastalAtc, power: atcPower, buff: atcBuff, isBurned };
    const defInfo = { name: defBattlePokeStatics.name, type1: defBattlePokeStatics.type1, type2: defBattlePokeStatics.type2, terastal: defBattlePokeStatics.terastal, isTerastalDef, power: defPower, buff: defBuff, currentHp: defBattlePokeDynamics.currentHp };
    return { weaponInfo, atcInfo, defInfo };
  }

  //相手は自分のポケモンとの相性を考慮した、最適なポケモンを選択して返す
  const selectNextOpPoke = () => {
    let nextOpPoke = -1;
    if (opLife.current === 2) {
      const myBattlePokeStatics = myPokeStatics.current[myBattlePokeIndex];
      const terastalType = checkIsTerastal(true) ? myBattlePokeStatics.terastal : null;
      const myPokeSpeed = calcActualStatus(true, "s");
      const myPokeInfo = { name: myBattlePokeStatics.name, type1: myBattlePokeStatics.type1, type2: myBattlePokeStatics.type2, terastalType, myPokeSpeed };
      const aliveOpBenchPokes = getAliveBenchPokes(false);
      const nextOpPokeName = selectNextOpPokeLogic(myPokeInfo, aliveOpBenchPokes);
      for (let i = 0; i < 3; i++) {
        if (opPokeStatics.current[i].name === nextOpPokeName)
          nextOpPoke = i;
      }
    }
    else {
      nextOpPoke = opPokeDynamics[0].currentHp ? 0
        : opPokeDynamics[1].currentHp ? 1
          : opPokeDynamics[2].currentHp ? 2
            : null;
    }
    return nextOpPoke;
  };

  //生存している控えポケモン情報を取得する
  const getAliveBenchPokes = (isMe) => {
    const pokeStatics = getPokeStatics(isMe);
    const pokeDynamics = getPokeDynamics(isMe);
    const battlePokeIndex = getBattlePokeIndex(isMe);
    let aliveBenchPokes = [];
    for (let i = 0; i < 3; i++) {
      if (i !== battlePokeIndex && pokeDynamics[i].currentHp > 0) {
        aliveBenchPokes.push(pokeStatics.current[i]);
      }
    }
    return aliveBenchPokes;
  }


  //boolean====================================================================================

  const checkIsTerastal = (isMe) => {
    const battlePokeIndex = getBattlePokeIndex(isMe);
    const terastalState = isMe ? myTerastalState : opTerastalState;
    const isTerastal = terastalState.terastalPokeNum === battlePokeIndex;
    return isTerastal;
  }

  //エフェクト系==============================================================

  //ジャンプと同時に鳴き声再生→攻撃モーションと同時に技SE再生
  const attackEffect = async (atcIsMe, isHit, atcTarget) => {
    jumpEffect(atcIsMe);
    await new Promise((resolve) => {
      playPokeVoice(atcIsMe, () => resolve());
    });

    //技が命中してて、相性が無効ではない場合に攻撃エフェクトを入れる
    if (isHit && multiplierRef.current && atcTarget === "相手" && !moveFailed.current)
      attackEffectLogic(atcIsMe);
    else if (isHit && atcTarget === "自分" && !moveFailed.current)
      jumpEffect(atcIsMe);

    if (isHit && multiplierRef.current && !moveFailed.current) {
      await new Promise((resolve) => {
        playWeaponSound(atcIsMe, () => resolve());
      });
    }
  };

  //ダメージエフェクト
  const damageEffect = async (isMe) => {
    damageEffectLogic(isMe);
    await new Promise((resolve) => {
      playDamageSound(multiplierRef.current, resolve);
    });
  };


  //BGM・SE関係==============================================================================

  const preloadSound = (url) => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.load();
    return audio;
  };

  const setBgm = (kind) => {
    if (loopAudioRef.current) stopBgm();
    const bgm = soundList.bgm[kind];
    bgm.volume = 0.25;
    bgm.loop = true;
    loopAudioRef.current = bgm;
  }

  const playBgm = () => {
    loopAudioRef.current.play();
  }

  const stopBgm = () => {
    loopAudioRef.current.pause();
    loopAudioRef.current.currentTime = 0;
  }

  //ポケモンの鳴き声再生
  const playPokeVoice = async (isMe, onEnded) => {
    const battlePokeStatics = getBattlePokeStatics(isMe);
    try {
      const pokeVoice = battlePokeStatics.voice; // すでに Audio オブジェクト
      pokeVoice.currentTime = 0;
      if (onEnded) pokeVoice.onended = onEnded;
      await pokeVoice.play();
    } catch (e) {
      console.error(`鳴き声の再生に失敗: ${battlePokeStatics.name}`, e);
      onEnded?.(); // エラー時もコールバック呼びたいならこれでOK
    }
  };

  //各技のSEを再生
  const playWeaponSound = async (isMe, onEnded) => {
    const weaponInfo = getSelectedWeaponInfo(isMe);
    try {
      weaponInfo.sound.currentTime = 0;
      if (onEnded)
        weaponInfo.sound.onended = onEnded;
      await weaponInfo.sound.play();
    } catch (e) {
      console.error(`技SEの再生に失敗: ${weaponInfo.name}`, e);
      onEnded?.(); // 再生失敗時に保険として呼ぶ
    }
  };

  //技相性にあったダメージSEを再生
  const playDamageSound = (multiplier, onEnded) => {
    let sound = null;
    if (multiplier >= 2)
      sound = soundList.damage.batsugun;
    else if (multiplier === 1)
      sound = soundList.damage.toubai;
    else if (multiplier <= 0.5)
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


  //ロジック==========================================================================

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
        await stopProcessing(1000)
        await atcFlowFnc(iAmFirst.current);
      }
    }
  }

  // 相手が、自分のタイプ一致技で抜群をとられるかの真偽と危険/安全タイプを返す
  const checkDangerous = () => {
    const myBattlePokeStatics = myPokeStatics.current[myBattlePokeIndex];
    const opBattlePokeStatics = opPokeStatics.current[opBattlePokeIndex];

    // 抜群を取られるかチェック
    const [myTerastalFlg, opTerastalFlg] = [checkIsTerastal(true), checkIsTerastal(false)];
    const [val11, val12] = opTerastalFlg
      ? getCompati(myBattlePokeStatics.type1, myBattlePokeStatics.type2, opBattlePokeStatics.terastal, "なし")
      : getCompati(myBattlePokeStatics.type1, myBattlePokeStatics.type2, opBattlePokeStatics.type1, opBattlePokeStatics.type2);
    const myTerastalType = myTerastalFlg ? myBattlePokeStatics.terastal : null;
    const val13 = myTerastalFlg
      ? calcMultiplier(myTerastalType, opBattlePokeStatics.type1, opBattlePokeStatics.type2) : null;

    // 自分のポケモンのタイプを相手目線で危険と安全に仕分け
    const [dangerousType, safeType] = [[], []];
    val11 >= 2 ? dangerousType.push(myBattlePokeStatics.type1) : safeType.push(myBattlePokeStatics.type1);
    val12 >= 2 ? dangerousType.push(myBattlePokeStatics.type2) : safeType.push(myBattlePokeStatics.type2);
    const IsDangerousTerastal = val13 >= 2;

    return { dangerousType, safeType, IsDangerousTerastal, myTerastalType };
  };

  //テラス判断　テラスする場合フラグを立てる
  const checkOpTerastal = async (isDangerous) => {
    const opBattlePokeStatics = opPokeStatics.current[opBattlePokeIndex];
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
      const [compati11, compati12] = getCompati(strongType, anotherType, opBattlePokeStatics.terastal, "なし");

      //テラスすることで確定数を減らせる場合 || 自分の最大打点の技を無効化できる場合　テラスタルフラグを立てる
      if ((cnt1 > cnt2) || (compati11 === 0 && compati12 <= 1)) {
        const aliveMyBenchPokes = await getAliveBenchPokes(true);
        if (aliveMyBenchPokes.length > 0) {
          //テラス後に自分の控えポケモンからの相性を取得
          const [compati21Teras, compati22Teras] = getCompati(aliveMyBenchPokes[0].type1, aliveMyBenchPokes[0].type2, opBattlePokeStatics.terastal, "なし");
          const [compati31Teras, compati32Teras] = aliveMyBenchPokes.length === 2
            ? getCompati(aliveMyBenchPokes[1].type1, aliveMyBenchPokes[1].type2, opBattlePokeStatics.terastal, "なし")
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
            const [compati21, compati22] = getCompati(aliveMyBenchPokes[0].type1, aliveMyBenchPokes[0].type2, opBattlePokeStatics.type1, opBattlePokeStatics.type2);
            const [compati31, compati32] = aliveMyBenchPokes.length === 2
              ? getCompati(aliveMyBenchPokes[1].type1, aliveMyBenchPokes[1].type2, opBattlePokeStatics.type1, opBattlePokeStatics.type2)
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

  //相手の行動を決める(交代/テラス/技選択)
  const decideOpAction = async () => {
    // 相手のポケモンが、自分のポケモンのタイプ一致技で抜群をとられるかチェックする
    const { dangerousType, safeType, IsDangerousTerastal, myTerastalType: terastalType } = checkDangerous();

    //交換すべき時はrefに交換ポケモンをセット
    if (dangerousType.length > 0 || IsDangerousTerastal)
      checkOpChanging(dangerousType, safeType, IsDangerousTerastal, terastalType);
    else
      console.log("相手は相性が悪くないので交代しない");

    //控えに交代できない(しない)場合、テラス判断と技選択
    if (!opChangeTurn.current) {
      if (opTerastalState.canTerastal) {
        await checkOpTerastal(dangerousType.length > 0 || IsDangerousTerastal, dangerousType, safeType);
      }
      //最も与えるダメージが大きい技・最も与えるダメージが大きい先制技・最も与えるダメージが大きい先制技の最低乱数ダメージ　を取得
      const { opStrongestWeaponIndex, strongestWeaponDamage, strongestHighPriorityWeaponIndex, strongestHighPriorityWeaponDamage } = await getMostEffectiveWeapon();
      //自分が相手に出せる技の最大ダメージを取得
      const myMaxDamage = await predictMyAction();

      //合理的は技を算出してセット
      const opWeaponIndex = choiseBetterWeapon(opStrongestWeaponIndex, strongestHighPriorityWeaponIndex, strongestHighPriorityWeaponDamage, myMaxDamage, myPokeStatics.current[myBattlePokeIndex].s, opPokeStatics.current[opBattlePokeIndex].s, myPokeDynamics[myBattlePokeIndex].currentHp, opPokeDynamics[opBattlePokeIndex].currentHp);
      opSelectedWeaponInfo.current = opWeapons.current[opBattlePokeIndex][opWeaponIndex];
    }
    else
      opSelectedWeaponInfo.current = null;
  }

  //相手はバトルポケモンを交換する場合、refにセットする
  const checkOpChanging = (dangerousType, safeType, IsDangerousTerastal, terastalType) => {
    //生存している相手の控えポケモン情報を取得する
    const aliveOpBenchPokes = getAliveBenchPokes(false);

    const opChangePokeName = aliveOpBenchPokes.length > 0
      ? getOpChangePoke(aliveOpBenchPokes, dangerousType, safeType, IsDangerousTerastal, terastalType) : null;
    if (opChangePokeName) {
      for (let i = 0; i < 3; i++) {
        if (opPokeStatics.current[i].name === opChangePokeName)
          opChangePokeIndex.current = i;
      }
    }
    opChangeTurn.current = opChangePokeIndex.current ? true : false;
    console.log(`相手は相性が悪い${opChangePokeIndex.current ? "ために交代する" : "が交代できるポケモンがいない"}`);
  }

  //追加効果を確認する
  const checkSecondaryEffect = (atcIsMe) => {
    const [isSelfEffect, isAtcWeapon] = [atcPokeInfo.current.selectedWeapon.effTarget === "自分", atcPokeInfo.current.selectedWeapon.kind !== "変化"];
    let effectiveness = isIncident.current ? atcPokeInfo.current.selectedWeapon.effectiveness : null;

    const isAlive = defPokeInfo.current.currentHp - damage.current > 0;
    const isGameSet = atcIsMe ?
      opLife.current === 1 && defPokeInfo.current.currentHp <= 0
      : myLife.current === 1 && defPokeInfo.current.currentHp <= 0;

    //相手のポケモンが全て倒されたとき、自分への追加効果は発動しない
    if (isSelfEffect)
      effectiveness = isGameSet ? null : effectiveness;
    //相手が死亡した際は、相手への追加効果は発動しない
    else if (!isSelfEffect)
      effectiveness = !isAlive ? null : effectiveness;

    if (effectiveness) {
      const myEffectiveness = atcIsMe && isSelfEffect || !atcIsMe && !isSelfEffect;
      const effTargetName = isSelfEffect ? atcPokeInfo.current.name : defPokeInfo.current.name;

      if (effectiveness.includes("buff")) {
        const pokeBuff = myEffectiveness ? myPokeBuff : opPokeBuff;
        const statusTextMap = { a: "攻撃", b: "防御", c: "特攻", d: "特防", s: "素早さ" };
        let newBuffState = { ...pokeBuff };
        let textArray = [`${effTargetName}の`];

        effectiveness = effectiveness.slice(5);
        for (let i = 0; i < effectiveness.length; i += 3) {
          const status = effectiveness[i];
          const buff = Number(effectiveness.slice(i + 1, i + 3));
          const currentBuff = pokeBuff[status] ?? 0;
          const clampedBuff = Math.max(-6, Math.min(6, currentBuff + buff));
          const actualChange = clampedBuff - currentBuff;

          let text1 = statusTextMap[status] || "不明";
          let text2 = "";

          // 実際に変化があった場合のみ state 更新
          if (actualChange !== 0) {
            newBuffState[status] = clampedBuff;

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
        secondaryTextRef.current = { kind: "buff", content: buffText };
        newBuff.current = newBuffState;
      }
      else if (effectiveness.includes("heal")) {
        effectiveness = effectiveness.slice(5);
        const target = effectiveness.slice(0, 1);   //h or d
        const ratio = effectiveness.slice(1);
        //hとdの場合の数値を取得
        const maxHp = atcPokeInfo.current.hp;
        const currentHp = atcPokeInfo.current.currentHp;
        const base = target === "h" ? maxHp : damage.current;
        //回復量を計算
        isHealAtc.current = isAtcWeapon;
        isHeal.current = true;
        healHp.current = Math.floor(base * ratio);
        healHp.current = currentHp + healHp.current < maxHp ? healHp.current : maxHp - currentHp;
        const healText = healHp.current ? `${atcPokeInfo.current.name}の体力が回復した` : `しかしうまく決まらなかった`;
        secondaryTextRef.current = { kind: "heal", content: healText };

        //自己再生時に体力が満タンなら技動作をしない
        if (target === "h" && healHp.current === 0)
          moveFailed.current = true;
        if (target === "d" && healHp.current === 0) {
          isIncident.current = false;
          isHeal.current = false;
        }
      }
      else if (effectiveness.includes("condition")) {
        const condition = effectiveness.slice(10);  //まひ
        let conditionText = "";
        let conditionFlg = true;

        //無効タイプなら状態異常にならない。
        if (!multiplierRef.current) {
          conditionText = `${effTargetName}には効果がないようだ`;
          conditionFlg = false;
        }
        //既に状態異常になっているなら他の状態異常にならない
        if (defPokeInfo.current.condition) {
          moveFailed.current = true;
          conditionText = isAtcWeapon ? "" : `しかしうまく決まらなかった`;
          conditionFlg = false;
        }

        if (condition === "まひ") {
          //電気タイプは麻痺しない
          if (defPokeInfo.current.type1 === "でんき" || defPokeInfo.current.type2 === "でんき" || defPokeInfo.current.type1 === "じめん" || defPokeInfo.current.type2 === "じめん") {
            conditionText = `${effTargetName}には効果がないようだ`;
            conditionFlg = false;
            moveFailed.current = true;
          }
          conditionText = conditionFlg ? `${defPokeInfo.current.name}はまひして技が出にくくなった` : conditionText;
        }
        else if (condition === "やけど") {
          //炎タイプは火傷しない
          if (defPokeInfo.current.type1 === "ほのお" || defPokeInfo.current.type2 === "ほのお") {
            conditionText = `${effTargetName}には効果がないようだ`;
            conditionFlg = false;
            moveFailed.current = true;
          }
          conditionText = conditionFlg ? `${effTargetName}はやけどを負った` : conditionText;
        }
        else if (condition.includes("どく")) {
          const isBadlyPoisoned = condition === "もうどく";
          //どくタイプは毒状態にならない
          if (defPokeInfo.current.type1 === "どく" || defPokeInfo.current.type2 === "どく" || defPokeInfo.current.type1 === "はがね" || defPokeInfo.current.type2 === "はがね") {
            conditionText = `${effTargetName}には効果がないようだ`;
            conditionFlg = false;
            moveFailed.current = true;
          }
          conditionText = conditionFlg ? `${effTargetName}は${isBadlyPoisoned ? "猛" : ""}毒状態になった` : conditionText;
        }
        else if (condition === "こおり") {
          //氷タイプは凍らない
          if (defPokeInfo.current.type1 === "こおり" || defPokeInfo.current.type2 === "こおり")
            conditionFlg = false;
          conditionText = conditionFlg ? `${effTargetName}は凍ってしまった` : conditionText;
        }
        secondaryTextRef.current = { kind: "condition", content: conditionText };
      }
      else if (effectiveness === "ひるみ") {
        //先攻の場合のみひるみの効果が発動する
        const isFlinch = atcIsMe === iAmFirst.current;
        if (isFlinch) {
          const flinchText = `${effTargetName}はひるんで動けない`;
          secondaryTextRef.current = { kind: "cantMove", content: flinchText };
        }
        else
          isIncident.current = false;
      }
    }
  }

  //追加効果を読み解いて発動する
  const doSecondaryEffect = async (atcIsMe) => {
    isIncident.current = false;
    if (secondaryTextRef.current.kind === "buff") {
      const setPokeBuff = atcIsMe === (atcPokeInfo.current.selectedWeapon.effTarget === "自分") ? setMyPokeBuff : setOpPokeBuff;

      otherTextRef.current = { kind: "buff", content: secondaryTextRef.current.content };
      if (secondaryTextRef.current.content.includes("上がった"))
        soundList.general.statusUp.play();
      if (secondaryTextRef.current.content.includes("下がった"))
        soundList.general.statusDown.play();

      await displayTextArea("other", 1500);
      setPokeBuff(newBuff.current);
    }
    else if (secondaryTextRef.current.kind === "heal") {
      if (!moveFailed.current)
        setHpOnHeal(atcIsMe);
      else {
        otherTextRef.current = { kind: "heal", content: secondaryTextRef.current.content };
        await displayTextArea("other", 1500);
        // await healFnc();
      }
    }
    else if (secondaryTextRef.current.kind === "condition") {
      if (!moveFailed.current) {
        //stateに状態異常をセット
        const condition = secondaryTextRef.current.content.includes("まひ") ? "まひ"
          : secondaryTextRef.current.content.includes("やけど") ? "やけど"
            : secondaryTextRef.current.content.includes("猛毒") ? "もうどく"
              : secondaryTextRef.current.content.includes("毒") ? "どく"
                : secondaryTextRef.current.content.includes("凍") ? "こおり"
                  : null;
        const myEffectiveness = secondaryTextRef.current.content.includes(myPokeStatics.current[myBattlePokeIndex].name);
        const conditionSe = condition === "まひ" ? "paralyzed"
          : condition === "やけど" ? "burned"
            : condition === "どく" || "もうどく" ? "poisoned"
              : condition === "こおり" ? "frozen"
                : null;
        soundList.general[conditionSe].play();
        otherTextRef.current = { kind: "condition", content: secondaryTextRef.current.content };
        setBattlePokeDynamics(myEffectiveness, "condition", condition);
      }
      else {
        otherTextRef.current = { kind: "condition", content: secondaryTextRef.current.content };
        await displayTextArea("other", 1500);
        await conditionFnc();
      }
    }
    else if (secondaryTextRef.current.content.includes("ひるんで")) {
      otherTextRef.current = { kind: "cantMove", content: secondaryTextRef.current.content };
      await displayTextArea("other", 1500);
      await toDoWhenTurnEnd();
    }
  }


  //コンソール====================================================================================

  const consolePokeHp = (isMe) => {
    const battlePokeStatics = getBattlePokeStatics(isMe);
    const battlePokeDynamics = getBattlePokeDynamics(isMe);
    console.log(`${battlePokeStatics.name}\n残HP：${battlePokeDynamics.currentHp}\n最大HP：${battlePokeStatics.hp}`);
  }

  const consoleSpeed = (myPokeSpeed, opPokeSpeed) => {
    const myPokeName = myPokeStatics.current[myBattlePokeIndex].name;
    const opPokeName = opPokeStatics.current[opBattlePokeIndex].name;
    console.log(`${myPokeName}の素早さ：${myPokeSpeed}\n${opPokeName}の素早さ：${opPokeSpeed}\n`);
  }


  //その他===============================================================================================

  const stopProcessing = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const toDoWhenTurnEnd = async () => {
    await stopProcessing(2000);
    await setConstantDamage();
    otherTextRef.current = { kind: "", content: "" };
    myCantMoveFlg.current = false;
    opCantMoveFlg.current = false;
    myChangeTurn.current = false;
    opChangeTurn.current = false;
    myChangePokeIndex.current = null;
    opChangePokeIndex.current = null;
    myDeathFlg.current = false;
    opDeathFlg.current = false;
    isHeal.current = false;
    turnCnt.current++;
    console.log(turnCnt.current + "ターン目================================================");

    //ターン終了時に定数ダメージを受けても生存する場合にコマンドを表示
    if (myPokeDynamics[myBattlePokeIndex].currentHp > 0 && opPokeDynamics[opBattlePokeIndex].currentHp > 0 && !myDeathFlg.current && !opDeathFlg.current)
      setAreaVisible(prev => ({ ...prev, textArea: false, actionCmd: true }));
  }


  const atcFlowFnc = async (atcIsMe) => {
    toDoWhenTurnStart(atcIsMe);
    await setWeaponText(atcIsMe);
    const cantMove = getCantMoveFlg(atcIsMe);
    if (!cantMove) {
      setCompatiText(atcIsMe);
      await compatiFnc1(atcIsMe);
    }
    else {
      await displayTextArea("other", 1500);
      await cantMoveFnc(atcIsMe);
    }
  }

  const changeFnc1 = async (isMe) => {
    const changePokeIndex = (isMe ? myChangePokeIndex : opChangePokeIndex).current;
    soundList.general.back.cloneNode().play();
    await displayTextArea(isMe, 1000);
    setAreaVisible(prev => ({ ...prev, [isMe ? "myPoke" : "opPoke"]: false }));
    await stopProcessing(1000);
    setBattlePokeIndex(isMe, changePokeIndex);
  }

  const terastalFnc1 = async (isMe) => {
    const battlePokeIndex = getBattlePokeIndex(isMe);
    const setTerastalState = isMe ? setMyTerastalState : setOpTerastalState;
    await displayTextArea(isMe, 1000);
    setTerastalState(prev => ({ ...prev, canTerastal: false, terastalPokeNum: battlePokeIndex }));
  }

  const compatiFnc1 = async (atcIsMe) => {
    const { weaponInfo, atcInfo, defInfo } = getUseInCalcDamageInfo(atcIsMe);
    const { isHit, isCritical } = calcTrueDamage(atcPokeInfo.current.selectedWeapon, atcInfo, defInfo);
    isIncident.current = atcPokeInfo.current.selectedWeapon.incidenceRate ? Math.random() * 100 < atcPokeInfo.current.selectedWeapon.incidenceRate : false;
    const defPokeName = defPokeInfo.current.name;

    checkSecondaryEffect(atcIsMe);

    await displayTextArea(atcIsMe, 0);    //技テキスト表示
    await attackEffect(atcIsMe, isHit, atcPokeInfo.current.selectedWeapon.atcTarget);   //ジャンプと同時に鳴き声再生→攻撃モーションと同時に技SE再生

    if (atcPokeInfo.current.selectedWeapon.kind !== "変化") {
      //無効ではない場合
      if (multiplierRef.current) {
        if (isHit) {
          if (multiplierRef.current !== 1)
            await displayTextArea(!atcIsMe, 0);   //相性テキスト表示
          if (isCritical)
            textAreaRef.current.textContent = `${textAreaRef.current.textContent}\n急所に当たった！`;

          adjustHpBar(!atcIsMe, "damage");
          await damageEffect(!atcIsMe);
          if (newHp.current !== defPokeInfo.current.currentHp)
            setBattlePokeDynamics(!atcIsMe, "currentHp", newHp.current);
        }
        else {
          textAreaRef.current.textContent = `${defPokeName}には当たらなかった`;
          await stopProcessing(2000);
        }
      }
      else
        await displayTextArea(!atcIsMe, 2000);   //相性テキスト表示
    }
    else if (atcPokeInfo.current.selectedWeapon.kind === "変化") {
      if (isHit) {
        await doSecondaryEffect(atcIsMe);
      }
      else {
        if (!moveFailed.current)
          textAreaRef.current.textContent = `${defPokeName}には当たらなかった`;
        else
          textAreaRef.current.textContent = `しかしうまく決まらなかった`;
        await stopProcessing(2000);
      }
    }

    //受け側のHPを更新しない場合は、次へ進む
    if (!multiplierRef.current || !isHit || isHeal.current && healHp.current === 0)
      if (atcIsMe !== iAmFirst.current)
        await toDoWhenTurnEnd();
      else
        await atcFlowFnc(!atcIsMe);
  }

  const deadFnc1 = async (isMe) => {
    const pokeIMGElm = getDamageEffectElem(isMe);

    setAreaVisible(prev => ({ ...prev, actionCmd: false }));
    await stopProcessing(1000);
    await displayTextArea(isMe, 0);
    await playPokeVoice(isMe);
    pokeIMGElm.classList.add("pokemon-dead");
    await stopProcessing(2000);
    setAreaVisible(prev => ({ ...prev, [isMe ? "myPoke" : "opPoke"]: false }));
    setLife(isMe);

    if ((isMe ? myLife : opLife).current > 0) {
      if (!isMe) {
        opChangePokeIndex.current = selectNextOpPoke();
        setBattlePokeIndex(isMe, opChangePokeIndex.current);
      }
    } else
      setWinner(!isMe);
  };


  const buffFnc = async () => {
    await displayTextArea("other", 1500);
    if ((iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeDynamics[opBattlePokeIndex].currentHp > 0
      || !iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeDynamics[myBattlePokeIndex].currentHp > 0)) {
      await atcFlowFnc(!iAmFirst.current);
    }
    else if (iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeDynamics[myBattlePokeIndex].currentHp > 0
      || !iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeDynamics[opBattlePokeIndex].currentHp > 0)
      await toDoWhenTurnEnd();
  }

  const healFnc = async () => {
    if ((iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeDynamics[opBattlePokeIndex].currentHp > 0 && isHeal.current
      || !iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeDynamics[myBattlePokeIndex].currentHp > 0 && !isHeal.current)) {
      await atcFlowFnc(!iAmFirst.current);
    }
    else if (iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeDynamics[myBattlePokeIndex].currentHp > 0
      || !iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeDynamics[opBattlePokeIndex].currentHp > 0)
      await toDoWhenTurnEnd();
  }

  const conditionFnc = async () => {
    if ((iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeDynamics[opBattlePokeIndex].currentHp > 0
      || !iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeDynamics[myBattlePokeIndex].currentHp > 0)) {
      await atcFlowFnc(!iAmFirst.current);
    }
    else if (iAmFirst.current && opTextRef.current.kind === "weapon" && myPokeDynamics[myBattlePokeIndex].currentHp > 0
      || !iAmFirst.current && myTextRef.current.kind === "weapon" && opPokeDynamics[opBattlePokeIndex].currentHp > 0)
      await toDoWhenTurnEnd();
  }

  const cantMoveFnc = async (isMe) => {
    (isMe ? myCantMoveFlg : opCantMoveFlg).current = true;
    if (iAmFirst.current === isMe) {
      //何のために初期化するか確認してコメント記載！！
      otherTextRef.current.content = "";
      await atcFlowFnc(!iAmFirst.current);
    }
    else if (iAmFirst.current !== isMe)
      await toDoWhenTurnEnd();
  }

  const toDoWhenTurnStart = (atcIsMe) => {
    const [atcPokeSt, atcPokeDy, atcPokeBuff] = atcIsMe ? [myPokeStatics.current[myBattlePokeIndex], myPokeDynamics[myBattlePokeIndex], myPokeBuff] : [opPokeStatics.current[opBattlePokeIndex], opPokeDynamics[opBattlePokeIndex], opPokeBuff];
    const [defPokeSt, defPokeDy, defPokeBuff] = atcIsMe ? [opPokeStatics.current[opBattlePokeIndex], opPokeDynamics[opBattlePokeIndex], opPokeBuff] : [myPokeStatics.current[myBattlePokeIndex], myPokeDynamics[myBattlePokeIndex], myPokeBuff];
    atcPokeInfo.current = {
      name: atcPokeSt.name, img: atcPokeSt.img, voice: atcPokeSt.voice,
      type1: atcPokeSt.type1, type2: atcPokeSt.type2, terastal: atcPokeSt.terastal,
      hp: atcPokeSt.hp, a: atcPokeSt.a, b: atcPokeSt.b, c: atcPokeSt.c, d: atcPokeSt.d, s: atcPokeSt.s,
      currentHp: atcPokeDy.currentHp, condition: atcPokeDy.condition,
      aBuff: atcPokeBuff.a, bBuff: atcPokeBuff.b, cBuff: atcPokeBuff.c, dBuff: atcPokeBuff.d, sBuff: atcPokeBuff.s,
      selectedWeapon: getSelectedWeaponInfo(atcIsMe),
    };
    defPokeInfo.current = {
      name: defPokeSt.name, img: defPokeSt.img, voice: defPokeSt.voice,
      type1: defPokeSt.type1, type2: defPokeSt.type2, terastal: defPokeSt.terastal,
      hp: defPokeSt.hp, a: defPokeSt.a, b: defPokeSt.b, c: defPokeSt.c, d: defPokeSt.d, s: defPokeSt.s,
      currentHp: defPokeDy.currentHp, condition: defPokeDy.condition,
      aBuff: defPokeBuff.a, bBuff: defPokeBuff.b, cBuff: defPokeBuff.c, dBuff: defPokeBuff.d, sBuff: defPokeBuff.s,
      selectedWeapon: getSelectedWeaponInfo(!atcIsMe),
    };

    multiplierRef.current = 1;
    moveFailed.current = false;
    secondaryTextRef.current = { kind: "", content: "" };
    isHealAtc.current = false;
    isHeal.current = false;
    healHp.current = 0;
  }


  return {
    setGoText,
    setBackText,
    setTerastalText,
    setWeaponText,
    setDeadText,
    setMyTurn,
    controllAreaVisibleForApp,
    setCompatiText,
    setLife,
    setWinner,
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
    displayTextArea,
    preloadSound,
    getCantMoveFlg,
    atcFlowFnc,
    getPokeInfo,
    getWeaponInfo,
    checkIsTerastal,
    changeFnc1,
    setBgm,
    playBgm,
    decideOpAction,
    setTextWhenClickWeaponBtn,
    toDoWhenTurnEnd,
    stopProcessing,
    setPokeInfos,
    setWeaponInfos,
    chooseHowToSelectOpPoke,
    getPokeInfos,
    getWeaponInfos,
    getPokeDynamics,
    getBattlePokeIndex,
    getBattlePokeStatics,
    getBattlePokeDynamics,
    setBattlePokeDynamics,
    setBattlePokeIndex,
    adjustHpBar,
    doSecondaryEffect,
    toDoWhenTurnStart,
  };
}
