import { useEffect } from 'react';
import { useToDoWhenFnc } from "./useToDoWhenFnc";

export function useBattleEffects(battleState) {

  const {
    myBattlePokeIndex, opBattlePokeIndex,
    myPokeDynamics, opPokeDynamics,
    myTerastalState, opTerastalState,
    myTextRef, opTextRef,
    myChangeTurn, opChangeTurn, turnCnt,
    myPokeBuff, opPokeBuff,
    areaVisible,
    myChangePokeIndex, opChangePokeIndex,
  } = battleState;

  const {
    toDoWhenSetCurrentHp,
    toDoWhenSetBattlePokeIndex,
    toDoWhenSetTerastalPokeNum,
    toDoWhenSetPokeCondition,
    toDoWhenSetPokeBuff,
  } = useToDoWhenFnc(battleState);

  // useEffect(() => {
  //   const setVh = () => {
  //     document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  //   };
  //   setVh();
  //   window.addEventListener("resize", setVh);
  //   return () => window.removeEventListener("resize", setVh);
  // }, []);

  //battlePokeIndex=============================================
  useEffect(() => {
    if (myBattlePokeIndex === -1) return;
    (async () => {
      await toDoWhenSetBattlePokeIndex(true);
    })();
  }, [myBattlePokeIndex]);

  useEffect(() => {
    if (opBattlePokeIndex === -1) return;
    (async () => {
      await toDoWhenSetBattlePokeIndex(false);
    })();
  }, [opBattlePokeIndex]);


  //currentHp=============================================
  useEffect(() => {
    if (myBattlePokeIndex === -1 || myTextRef.current.kind === "go") return;
    (async () => {
      await toDoWhenSetCurrentHp(true);
    })();
  }, [myPokeDynamics[0].currentHp, myPokeDynamics[1].currentHp, myPokeDynamics[2].currentHp]);

  useEffect(() => {
    if (opBattlePokeIndex === -1 || opTextRef.current.kind === "go") return;
    (async () => {
      await toDoWhenSetCurrentHp(false);
    })();
  }, [opPokeDynamics[0].currentHp, opPokeDynamics[1].currentHp, opPokeDynamics[2].currentHp]);


  //テラスタル======================================
  useEffect(() => {
    if (myTerastalState.terastalPokeNum === null) return;
    (async () => {
      await toDoWhenSetTerastalPokeNum(true);
    })();
  }, [myTerastalState.terastalPokeNum]);

  useEffect(() => {
    if (opTerastalState.terastalPokeNum === null) return;
    (async () => {
      await toDoWhenSetTerastalPokeNum(false);
    })();
  }, [opTerastalState.terastalPokeNum]);


  //condition　毒・火傷の１ターン目にダメージを入れるために必要================
  useEffect(() => {
    if (!myPokeDynamics[0].condition && !myPokeDynamics[1].condition && !myPokeDynamics[2].condition) return;
    (async () => {
      toDoWhenSetPokeCondition(true);
    })();
  }, [myPokeDynamics[0].condition, myPokeDynamics[1].condition, myPokeDynamics[2].condition]);

  useEffect(() => {
    if (!opPokeDynamics[0].condition && !opPokeDynamics[1].condition && !opPokeDynamics[2].condition) return;
    (async () => {
      await toDoWhenSetPokeCondition(false);
    })();
  }, [opPokeDynamics[0].condition, opPokeDynamics[1].condition, opPokeDynamics[2].condition]);


  //バフ
  useEffect(() => {
    if(turnCnt.current === 0 || myChangePokeIndex.current !== null) return;
    (async () => {
      await toDoWhenSetPokeBuff();
    })();
  }, [myPokeBuff]);

  useEffect(() => {
    if(turnCnt.current === 0 || opChangePokeIndex.current !== null) return;
    (async () => {
      await toDoWhenSetPokeBuff();
    })();
  }, [opPokeBuff]);


  return {};
}