import { useBattleExecutors } from "./useBattleExecutors";
import { soundList } from "./constants";

export function useBattleHandlers(battleStates) {

  //インポートの取得===========================================================
  const {
    setAreaVisible,
    isTerastalActive,
    otherTextRef, textAreaRef,
    myLife, opLife,
    opTerastalFlg,
    newHp, healHp,
    iAmFirst, opChangeTurn,
    cantMoveFlg,
    myPokeStatics,
    myBattlePokeIndex, opTerastalState,
    isIncident, setMyPokeBuff, setOpPokeBuff,
    moveFailed,
    atcPokeInfo, defPokeInfo,
    secondaryTextRef, newBuff,
    multiplierRef,
    burned, poisoned,
    mySleepCnt, opSleepCnt,
  } = battleStates;

  const {
    processPokeChange,
    processTerastal,
    processTurnEnd,
    displayTextArea,
    stopProcessing,
    checkDangerous,
    checkOpChanging,
    checkOpTerastal,
    setOpBetterWeapon,
    calcActualStatus,
    processTurnStart,
    setTextRef,
    playConditionSe,
    calcTrueDamage,
    checkSecondaryEffect,
    jumpEffect,
    attackEffectLogic,
    damageEffect,
    setNextOpPoke,
    stopBgm,
    setBattlePokeDynamics,
    getEffectElem,
    playPokeVoice,
    playWeaponSound,
    getUseInCalcDamageInfo,
    adjustHpBar,
    getTextRef,
  } = useBattleExecutors(battleStates);

  //相手の行動を決める(交代/テラス/技選択)
  const decideOpAction = async () => {
    const { dangerousType, safeType, terastalType, IsDangerousTerastal } = checkDangerous();

    if (dangerousType.length > 0 || IsDangerousTerastal) {
      checkOpChanging(dangerousType, safeType, IsDangerousTerastal, terastalType);
    }
    if (!opChangeTurn.current) {
      if (opTerastalState.canTerastal) {
        await checkOpTerastal(dangerousType.length > 0 || IsDangerousTerastal);
      }
      await setOpBetterWeapon();
    }
  }

  const processAttacking = async (atcIsMe) => {
    await processTurnStart(atcIsMe);
    await handleAttackerText(atcIsMe);
    if (!cantMoveFlg.current) {
      setTextRef(!atcIsMe, "compati");
      await handleAttacking(atcIsMe);
    } else {
      playConditionSe(atcPokeInfo.current.condition);
      await displayTextArea("other", 1500);
      if (iAmFirst.current === atcIsMe) {
        await processAttacking(!iAmFirst.current);
      } else {
        await processTurnEnd();
      }
    }
  }

  //技ボタン押下時にセットするテキストを分岐する
  const handleTurnStartAction = async () => {
    await stopProcessing(1000)
    if (opChangeTurn.current) {
      await processPokeChange(false);
    } else {
      if (isTerastalActive || opTerastalFlg.current) {
        const isMe = isTerastalActive && opTerastalFlg.current
          ? calcActualStatus(true, "s") >= calcActualStatus(false, "s")
          : isTerastalActive;
        await processTerastal(isMe);
      } else {
        await processAttacking(iAmFirst.current);
      }
    }
  }

  //追加効果を読み解いて発動する
  const executeSecondaryEffect = async (atcIsMe) => {
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
      if (!moveFailed.current) {
        adjustHpBar(atcIsMe, "heal");
        setBattlePokeDynamics(atcIsMe, "currentHp", newHp.current);
      } else {
        otherTextRef.current = { kind: "heal", content: secondaryTextRef.current.content };
        await displayTextArea("other", 1500);
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
                  : secondaryTextRef.current.content.includes("眠") ? "ねむり"
                    : null;
        const myEffectiveness = secondaryTextRef.current.content.includes(myPokeStatics.current[myBattlePokeIndex].name);
        const conditionSe = condition === "まひ" ? "paralyzed"
          : condition === "やけど" ? "burned"
            : condition === "どく" || condition === "もうどく" ? "poisoned"
              : condition === "こおり" ? "frozen"
                : condition === "ねむり" ? "slept"
                  : null;
        soundList.general[conditionSe].play();
        otherTextRef.current = { kind: "condition", content: secondaryTextRef.current.content };
        setBattlePokeDynamics(myEffectiveness, "condition", condition);
      }
      else {
        otherTextRef.current = { kind: "condition", content: secondaryTextRef.current.content };
        await displayTextArea("other", 1500);
      }
    }
    else if (secondaryTextRef.current.content.includes("ひるんで")) {
      otherTextRef.current = { kind: "cantMove", content: secondaryTextRef.current.content };
      await displayTextArea("other", 1500);
      await processTurnEnd();
    }
    isIncident.current = false;
  }

  const processDead = async (isMe) => {
    const pokeIMGElm = getEffectElem(isMe);
    const life = isMe ? myLife : opLife;
    setAreaVisible(prev => ({ ...prev, actionCmd: false }));
    setTextRef(isMe, "dead");
    await stopProcessing(2000);
    await displayTextArea(isMe, 0);
    await playPokeVoice(isMe);
    pokeIMGElm.classList.add("pokemon-dead");
    await stopProcessing(2000);
    setAreaVisible(prev => ({ ...prev, [isMe ? "myPoke" : "opPoke"]: false }));
    life.current--;

    if (life.current > 0) {
      await processTurnEnd();
      if (burned.current || poisoned.current) {
        await stopProcessing(2000);
      } else {
        if (isMe) {
          setAreaVisible(prev => ({ ...prev, textArea: false, nextPokeCmd: true }));
        } else {
          setNextOpPoke();
        }
      }
    } else {
      stopBgm();
      otherTextRef.current = { kind: "result", content: !isMe ? "WIN" : "LOSE" };
      setAreaVisible(prev => ({ ...prev, battle: false }));
      soundList.general[otherTextRef.current.content.toLowerCase()].play();
    }
  };

  //当ファイル内でのみ使用=============================================================

  //攻撃側が行動可能を見てテキストをセット
  const handleAttackerText = async (isMe) => {
    const pokeName = atcPokeInfo.current.name;
    const pokeCondition = atcPokeInfo.current.condition;
    let cantMoveText = "";

    if (pokeCondition === "まひ") {
      cantMoveFlg.current = Math.random() <= 0.25;
      // cantMoveFlg.current = Math.random() <= 1;   //テスト用
      cantMoveText = cantMoveFlg.current ? `${pokeName}はしびれて動けない` : "";
    } else if (pokeCondition === "こおり") {
      cantMoveFlg.current = Math.random() <= 0.80;
      // cantMoveFlg.current = Math.random() <= 0;   //テスト用
      cantMoveText = cantMoveFlg.current ? `${pokeName}は凍ってしまって動けない` : "";
    } else if (pokeCondition === "ねむり") {
      const sleepCnt = isMe ? mySleepCnt : opSleepCnt;
      sleepCnt.current--;
      // sleepCnt.current = sleepCnt.current -4;  //テスト用
      cantMoveFlg.current = sleepCnt.current > 0;
      cantMoveText = cantMoveFlg.current ? `${pokeName}はぐうぐう眠っている` : "";
    }

    if (!cantMoveFlg.current) {
      if (pokeCondition === "こおり" || pokeCondition === "ねむり") {
        setBattlePokeDynamics(isMe, "condition", "");
        const text = pokeCondition === "こおり" ? "氷が溶けた" : "目を覚ました";
        otherTextRef.current = { kind: "general", content: `${pokeName}は${text}` };
        await displayTextArea("other", 1500);
      }
      setTextRef(isMe, "weapon");
    } else {
      otherTextRef.current = { kind: "cantMove", content: cantMoveText };
    }
  }

  const handleAttacking = async (atcIsMe) => {
    const { weaponInfo, atcInfo, defInfo } = getUseInCalcDamageInfo(atcIsMe);
    const { isHit, isCritical } = calcTrueDamage(atcPokeInfo.current.selectedWeapon, atcInfo, defInfo);
    isIncident.current = atcPokeInfo.current.selectedWeapon.incidenceRate ? Math.random() * 100 < atcPokeInfo.current.selectedWeapon.incidenceRate : false;
    const defPokeName = defPokeInfo.current.name;

    checkSecondaryEffect(atcIsMe);
    await displayTextArea(atcIsMe, 0);
    await attackEffect(atcIsMe, isHit);

    if (atcPokeInfo.current.selectedWeapon.kind !== "変化") {
      if (multiplierRef.current) {
        if (isHit) {
          if (isCritical) {
            const textRef = getTextRef(!atcIsMe);
            textRef.current.content = `${textRef.current.content}\n急所に当たった！`;
          }
          if (multiplierRef.current !== 1 || isCritical) {
            await displayTextArea(!atcIsMe, 0);   //相性テキスト表示
          }
          await damageEffect(!atcIsMe);
          setBattlePokeDynamics(!atcIsMe, "currentHp", newHp.current);
        } else {
          textAreaRef.current.textContent = `${defPokeName}には当たらなかった`;
          await stopProcessing(2000);
        }
      } else {
        await displayTextArea(!atcIsMe, 2000);   //相性テキスト表示
      }
    } else {
      if (isHit) {
        await executeSecondaryEffect(atcIsMe);
      } else {
        if (!moveFailed.current) {
          textAreaRef.current.textContent = `${defPokeName}には当たらなかった`;
        } else {
          textAreaRef.current.textContent = `しかしうまく決まらなかった`;
        }
        await stopProcessing(2000);
      }
    }

    //受け側のHPを更新しない場合は、次へ進む
    if (!multiplierRef.current || !isHit || moveFailed.current || (atcPokeInfo.current.selectedWeapon.effectiveness === "heal" && healHp.current === 0)) {
      if (atcIsMe !== iAmFirst.current) {
        await processTurnEnd();
      } else {
        await processAttacking(!atcIsMe);
      }
    }
  }

  //ジャンプと同時に鳴き声再生→攻撃モーションと同時に技SE再生
  const attackEffect = async (atcIsMe, isHit) => {
    jumpEffect(atcIsMe);
    await new Promise((resolve) => {
      playPokeVoice(atcIsMe, () => resolve());
    });

    //技が命中してて、相性が無効ではない場合に攻撃エフェクトを入れる
    if (isHit && multiplierRef.current && atcPokeInfo.current.selectedWeapon.atcTarget === "相手" && !moveFailed.current) {
      attackEffectLogic(atcIsMe);
    } else if (isHit && atcPokeInfo.current.selectedWeapon.atcTarget === "自分" && !moveFailed.current) {
      jumpEffect(atcIsMe);
    }

    if (isHit && multiplierRef.current && !moveFailed.current) {
      await new Promise((resolve) => {
        playWeaponSound(atcIsMe, () => resolve());
      });
    }
  }

  return {
    decideOpAction,
    handleTurnStartAction,
    processAttacking,
    executeSecondaryEffect,
    processDead,
  };
}
