import { useEffect } from 'react';
import { useBattleControllers } from "./useBattleControllers";

export function useBattleEffects(battleState) {

  const {
    myBattlePokeIndex, opBattlePokeIndex,
    myPokeDynamics, opPokeDynamics,
    myTerastalState, opTerastalState,
    myTextRef, opTextRef,
    myPokeBuff, opPokeBuff,
    turnCnt,
  } = battleState;

  const {
    handleCurrentHpChange,
    handleBattlePokeIndexChange,
    handleTerastalPokeNumSet,
    handlePokeConditionChange,
    handlePokeBuffChange,
  } = useBattleControllers(battleState);

  //battlePokeIndex========================
useEffect(() => {
  if (myBattlePokeIndex === -1) return;
  const run = async () => {
    await handleBattlePokeIndexChange(true);
  };
  run();
}, [myBattlePokeIndex]);

  useEffect(() => {
    if (opBattlePokeIndex === -1) return;
    const run = async () => {
      await handleBattlePokeIndexChange(false);
    };
    run();
  }, [opBattlePokeIndex]);


  //currentHp===================================================================================
  useEffect(() => {
    if (myBattlePokeIndex === -1 || myTextRef.current.kind === "go") return;
    const run = async () => {
      await handleCurrentHpChange(true);
    };
    run();
  }, myPokeDynamics.map(p => p.currentHp));

  useEffect(() => {
    if (opBattlePokeIndex === -1 || opTextRef.current.kind === "go") return;
    const run = async () => {
      await handleCurrentHpChange(false);
    };
    run();
  }, opPokeDynamics.map(p => p.currentHp));


  //テラスタル=============================================================
  useEffect(() => {
    if (myTerastalState.terastalPokeNum === null) return;
    const run = async () => {
      await handleTerastalPokeNumSet(true);
    };
    run();
  }, [myTerastalState.terastalPokeNum]);

  useEffect(() => {
    if (opTerastalState.terastalPokeNum === null) return;
    const run = async () => {
      await handleTerastalPokeNumSet(false);
    };
    run();
  }, [opTerastalState.terastalPokeNum]);


  //condition　毒・火傷の１ターン目にダメージを入れるために必要===================================================
  useEffect(() => {
    if (!myPokeDynamics[0].condition && !myPokeDynamics[1].condition && !myPokeDynamics[2].condition) return;
    const run = async () => {
      await handlePokeConditionChange(true);
    };
    run();
  }, myPokeDynamics.map(p => p.condition));

  useEffect(() => {
    if (!opPokeDynamics[0].condition && !opPokeDynamics[1].condition && !opPokeDynamics[2].condition) return;
    const run = async () => {
      await handlePokeConditionChange(false);
    };
    run();
  }, opPokeDynamics.map(p => p.condition));


  //バフ======================================================================
  useEffect(() => {
    if (!turnCnt.current || myTextRef.current.kind === "go") return;
    const run = async () => {
      await handlePokeBuffChange(true);
    };
    run();
  }, [myPokeBuff]);

  useEffect(() => {
    if (!turnCnt.current || opTextRef.current.kind === "go") return;
    const run = async () => {
      await handlePokeBuffChange(false);
    };
    run();
  }, [opPokeBuff]);

  return {};
}