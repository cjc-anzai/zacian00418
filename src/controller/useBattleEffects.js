import { useEffect } from 'react';
import { useToDoWhenFnc } from "./useToDoWhenFnc";
import { useBattleHandlers } from "./useBattleHandlers";

export function useBattleEffects(battleState) {

  const {
    myPokeState, opPokeState,
    myPokeStateTrigger, opPokeStateTrigger,
    otherText, setOtherText,
    iAmFirst,
    setOtherAreaVisible
  } = battleState;

  const {
    toDoWhenSetPokeName,
    toDoWhenSetImg,
    toDoWhenSetHp,
    toDoWhenSetText,
    toDoWhenSetTerastalPokeNum,
  } = useToDoWhenFnc(battleState);

  const {
    setWeaponText,
    stopProcessing
  } = useBattleHandlers(battleState);

  //name=============================================
  useEffect(() => {
    if (!myPokeState.name) return;
    const run = async () => {
      await toDoWhenSetPokeName(myPokeState);
    };
    run();
  }, [myPokeState.name]);

  useEffect(() => {
    if (!opPokeState.name) return;
    const run = async () => {
      await toDoWhenSetPokeName(opPokeState);
    };
    run();
  }, [opPokeState.name]);


  //img===============================================
  useEffect(() => {
    if (!myPokeState.img) return;
    toDoWhenSetImg(myPokeState);
  }, [myPokeState.img]);

  useEffect(() => {
    if (!opPokeState.img) return;
    toDoWhenSetImg(opPokeState);
  }, [opPokeState.img]);

  //hp=============================================
  useEffect(() => {
    if (!myPokeState.name) return;
    toDoWhenSetHp(myPokeState);
  }, [myPokeState.hp]);

  useEffect(() => {
    if (!opPokeState.name) return;
    toDoWhenSetHp(opPokeState);
  }, [opPokeState.hp]);

  //HpのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myPokeStateTrigger.hp == 0) return;
    toDoWhenSetHp(myPokeState);
  }, [myPokeStateTrigger.hp]);

  useEffect(() => {
    if (opPokeStateTrigger.hp == 0) return;
    toDoWhenSetHp(opPokeState);
  }, [opPokeStateTrigger.hp]);

  //text====================================================
  useEffect(() => {
    if (!myPokeState.text.content) return;
    const run = async () => {
      await toDoWhenSetText(myPokeState);
    };
    run();
  }, [myPokeState.text]);

  useEffect(() => {
    if (!opPokeState.text.content) return;
    const run = async () => {
      await toDoWhenSetText(opPokeState);
    };
    run();
  }, [opPokeState.text]);

  //TextのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myPokeStateTrigger.text == 0) return;
    const run = async () => {
      await toDoWhenSetText(myPokeState);
    };
    run();
  }, [myPokeStateTrigger.text]);

  useEffect(() => {
    if (opPokeStateTrigger.text == 0) return;
    const run = async () => {
      await toDoWhenSetText(opPokeState);
    };
    run();
  }, [opPokeStateTrigger.text]);

  //テラスタル======================================
  useEffect(() => {
    if (!myPokeState.terastalPokeNum) return;
    toDoWhenSetTerastalPokeNum(myPokeState);
  }, [myPokeState.terastalPokeNum]);

  useEffect(() => {
    if (!opPokeState.terastalPokeNum) return;
    toDoWhenSetTerastalPokeNum(opPokeState);
  }, [opPokeState.terastalPokeNum]);

  //===========================================
  useEffect(() => {
    if (!otherText.content) return;
    if (otherText.kind === "buffDebuff") {
      setTimeout(() => {
        setOtherText({ kind: "", content: "" });
        if (iAmFirst.current && myPokeState.text.kind === "weapon") {
          const atcState = iAmFirst.current ? opPokeState : myPokeState;
          setWeaponText(!iAmFirst.current, atcState);
        }
        else if (!iAmFirst.current && opPokeState.text.kind === "weapon") {
          setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
        }
      }, 2000);
    }
  }, [otherText]);

  return {};
}