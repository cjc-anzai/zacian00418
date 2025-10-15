import { useBattleHandlers } from "./useBattleHandlers";
import { useBattleExecutors } from "./useBattleExecutors";
import { soundList } from "./constants";

export function useBattleControllers(battleStates) {

  //インポートの取得===========================================================
  const {
    setAreaVisible,
    myBattlePokeIndex, opBattlePokeIndex,
    mySelectedWeaponInfo,
    myTerastalState, opTerastalState,
    otherTextRef, secondaryTextRef,
    myChangeTurn, opChangeTurn,
    myChangePokeIndex, opChangePokeIndex,
    iAmFirst,
    isTerastalActive, opTerastalFlg,
    isIncident,
    healHp,
    turnCnt,
    myWeapons,
    burned, poisoned,
    opPokeDynamics, myPokeDynamics,
    atcPokeInfo, defPokeInfo,
    myPokeStatics, 
  } = battleStates;

  const {
    decideOpAction,
    handleTurnStartAction,
    processAttacking,
    executeSecondaryEffect,
    processDead,
  } = useBattleHandlers(battleStates);

  const {
    playBgm,
    setBattleStartData,
    setIAmFirst,
    setChangeTurn,
    processPokeChange,
    setBattlePokeIndex,
    initializePokeBuff,
    initializePoisonedCnt,
    adjustHpBar,
    processPokeAppearance,
    initializeChangePokeIndex,
    processTerastal,
    processTurnEnd,
    consolePokeHp,
    displayTextArea,
    processConstantDamageText,
    stopProcessing,
    getBattlePokeDynamics,
    initializeTurnEnd,
  } = useBattleExecutors(battleStates);


  //選出確定ボタン押下時
  const handleBattleStartBtnClick = async (myPokesKanaName, opPokesKanaName) => {
    soundList.general.decide.cloneNode().play();
    setAreaVisible(prev => ({ ...prev, select: false, battle: true }));
    playBgm("battle");
    await setBattleStartData(myPokesKanaName, opPokesKanaName);
  };

  //技名ボタン押下時
  const handleWeaponBtnClick = async (weaponIndex) => {
    soundList.general.decide.cloneNode().play();
    mySelectedWeaponInfo.current = myWeapons.current[myBattlePokeIndex][weaponIndex];
    setAreaVisible(prev => ({ ...prev, weaponCmd: false }));
    await decideOpAction();
    setIAmFirst();
    await handleTurnStartAction();
  }

  //交代ボタン押下時
  const handleChangePokeClick = async (changePokeIndex) => {
    soundList.general.decide.cloneNode().play();
    setAreaVisible(prev => ({ ...prev, changeCmd: false }));
    setChangeTurn(true, changePokeIndex);
    await decideOpAction();
    setIAmFirst();
    await processPokeChange(iAmFirst.current);
  }

  //倒れた後、次に出すポケモンボタン押下時
  const handleNextPokeBtnClick = (nextMyPokeIndex) => {
    soundList.general.decide.cloneNode().play();
    setAreaVisible(prev => ({ ...prev, nextPokeCmd: false }));
    setBattlePokeIndex(true, nextMyPokeIndex);
  }

  const handleBattlePokeIndexChange = async (isMe) => {
    initializePokeBuff(isMe);
    initializePoisonedCnt(isMe);
    adjustHpBar(isMe, "appearance");
    await processPokeAppearance(isMe);

    if (turnCnt.current === 0) {
      if (opBattlePokeIndex === -1) {
        setBattlePokeIndex(!isMe, 0);
      } else {
        turnCnt.current = 1;
        setAreaVisible(prev => ({ ...prev, textArea: false, actionCmd: true }));
      }
    } else if (myChangeTurn.current || opChangeTurn.current) {
      if (myChangeTurn.current !== opChangeTurn.current) {
        initializeChangePokeIndex(iAmFirst.current);
        if (isTerastalActive !== opTerastalFlg.current) {
          await processTerastal(!isMe);
        } else {
          await processAttacking(!isMe);
        }
      } else if (myChangeTurn.current && opChangeTurn.current) {
        if (myChangePokeIndex.current && opChangePokeIndex.current) {
          initializeChangePokeIndex(isMe);
          await processPokeChange(!isMe);
        } else {
          await processTurnEnd();
        }
      }
    } else {
      initializeChangePokeIndex(isMe);
      setAreaVisible(prev => ({ ...prev, textArea: false, actionCmd: true }));
    }
  }

  const handleCurrentHpChange = async (isMe) => {
    const battlePokeDynamics = getBattlePokeDynamics(isMe);
    consolePokeHp(isMe);

    if (isIncident.current) {
      await executeSecondaryEffect(!isMe);
      return;
    }
    if (battlePokeDynamics.currentHp > 0) {
      if (healHp.current) {
        otherTextRef.current = { kind: "heal", content: secondaryTextRef.current.content };
        await displayTextArea("other", 1500);
        const otherCurrentHp = getBattlePokeDynamics(!isMe).currentHp;
        if (otherCurrentHp) {
          if (isMe === iAmFirst.current) {
            await processAttacking(!isMe);
          } else {
            await processTurnEnd();
          }
        } else {
          await processDead(!isMe);
        }
      } else if (burned.current || poisoned.current) {
        await processConstantDamageText(isMe);
        initializeTurnEnd();
        if (myPokeDynamics[myBattlePokeIndex].currentHp <= 0) {
          setAreaVisible(prev => ({ ...prev, textArea: false, nextPokeCmd: true }));
        } else if (opPokeDynamics[opBattlePokeIndex].currentHp <= 0) {
          setNextOpPoke();
        } else {
          setAreaVisible(prev => ({ ...prev, textArea: false, actionCmd: true }));
        }
      } else if (isMe !== iAmFirst.current) {
        await processAttacking(isMe);
      } else {
        await processTurnEnd();
      }
    } else {
      if (burned.current || poisoned.current) {
        await processConstantDamageText(isMe);
        initializeTurnEnd();
      }
      await processDead(isMe);
    };
  }

  const handleTerastalPokeNumSet = async (isMe) => {
    soundList.general.terastal.play();
    await stopProcessing(1000);
    if (isTerastalActive !== opTerastalFlg.current) {
      const atcIsMe = (iAmFirst.current || opChangeTurn.current) && !myChangeTurn.current;
      await processAttacking(atcIsMe);
    } else {
      if (myTerastalState.terastalPokeNum === null || opTerastalState.terastalPokeNum === null) {
        await processTerastal(!isMe);
      } else {
        await processAttacking(iAmFirst.current);
      }
    }
  }

  const handlePokeConditionChange = async (isMe) => {
    const dynamics = isMe ? myPokeDynamics[myBattlePokeIndex] : opPokeDynamics[opBattlePokeIndex];
    const targetIsAlive = dynamics.currentHp > 0;
    const effTarget = atcPokeInfo.current.selectedWeapon.effTarget;
    const atcIsMe = atcPokeInfo.current.name === myPokeStatics.current[myBattlePokeIndex].name;
    const defPokeIsAlive = atcIsMe ? opPokeDynamics[opBattlePokeIndex].currentHp > 0 : myPokeDynamics[myBattlePokeIndex].currentHp > 0;
    if (!targetIsAlive) return;

    await displayTextArea("other", 1500);
    if (defPokeIsAlive) {
      if ((effTarget === "自分") === (isMe === iAmFirst.current)) {
        await processAttacking(!iAmFirst.current);
      } else {
        await processTurnEnd();
      }
    } else {
      await processDead(defPokeInfo.current.name === myPokeStatics.current[myBattlePokeIndex].name);
    }
  };


  const handlePokeBuffChange = async (isMe) => {
    await handlePokeConditionChange(isMe);
  }

  return {
    handleBattleStartBtnClick,
    handleWeaponBtnClick,
    handleChangePokeClick,
    handleNextPokeBtnClick,
    handleCurrentHpChange,
    handleBattlePokeIndexChange,
    handleTerastalPokeNumSet,
    handlePokeConditionChange,
    handlePokeBuffChange
  };
}
