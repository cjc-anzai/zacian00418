import { useEffect } from 'react';
import { useToDoWhenFnc } from "./useToDoWhenFnc";

export function useBattleEffects(battleState) {

  const {
    myPokeState, opPokeState,
    myPokeStateTrigger, opPokeStateTrigger,
    otherText,
  } = battleState;

  const {
    toDoWhenSetPokeName,
    toDoWhenSetImg,
    toDoWhenSetHp,
    toDoWhenSetText,
    toDoWhenSetTerastalPokeNum,
    toDoWhenSetOtherText,
  } = useToDoWhenFnc(battleState);

  //name=============================================
  useEffect(() => {
    if (!myPokeState.name) return;
    const run = async () => {
      await toDoWhenSetPokeName(true);
    };
    run();
  }, [myPokeState.name]);

  useEffect(() => {
    if (!opPokeState.name) return;
    const run = async () => {
      await toDoWhenSetPokeName(false);
    };
    run();
  }, [opPokeState.name]);


  //img===============================================
  useEffect(() => {
    if (!myPokeState.img) return;
    toDoWhenSetImg(true);
  }, [myPokeState.img]);

  useEffect(() => {
    if (!opPokeState.img) return;
    toDoWhenSetImg(false);
  }, [opPokeState.img]);

  //hp=============================================
  useEffect(() => {
    if (!myPokeState.name) return;
    const run = async () => {
      await toDoWhenSetHp(true);
    };
    run();
  }, [myPokeState.hp]);

  useEffect(() => {
    if (!opPokeState.name) return;
    const run = async () => {
      await toDoWhenSetHp(false);
    };
    run();
  }, [opPokeState.hp]);

  //HpのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myPokeStateTrigger.hp == 0) return;
    const run = async () => {
      await toDoWhenSetHp(true);
    };
    run();
  }, [myPokeStateTrigger.hp]);

  useEffect(() => {
    if (opPokeStateTrigger.hp == 0) return;
    const run = async () => {
      await toDoWhenSetHp(false);
    };
    run();
  }, [opPokeStateTrigger.hp]);

  //text====================================================
  useEffect(() => {
    if (!myPokeState.text.content) return;
    const run = async () => {
      await toDoWhenSetText(true);
    };
    run();
  }, [myPokeState.text]);

  useEffect(() => {
    if (!opPokeState.text.content) return;
    const run = async () => {
      await toDoWhenSetText(false);
    };
    run();
  }, [opPokeState.text]);

  //TextのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myPokeStateTrigger.text == 0) return;
    const run = async () => {
      await toDoWhenSetText(true);
    };
    run();
  }, [myPokeStateTrigger.text]);

  useEffect(() => {
    if (opPokeStateTrigger.text == 0) return;
    const run = async () => {
      await toDoWhenSetText(false);
    };
    run();
  }, [opPokeStateTrigger.text]);

  //テラスタル======================================
  useEffect(() => {
    if (!myPokeState.terastalPokeNum) return;
    toDoWhenSetTerastalPokeNum(true);
  }, [myPokeState.terastalPokeNum]);

  useEffect(() => {
    if (!opPokeState.terastalPokeNum) return;
    toDoWhenSetTerastalPokeNum(false);
  }, [opPokeState.terastalPokeNum]);

  //===========================================
  useEffect(() => {
    if (!otherText.content) return;
    toDoWhenSetOtherText();
  }, [otherText]);

  return {};
}