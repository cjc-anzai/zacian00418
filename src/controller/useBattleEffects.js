import { useEffect } from 'react';
import { useToDoWhenFnc } from "./useToDoWhenFnc";

export function useBattleEffects(battleState) {

  const {
    myPokeState,
    opPokeState,
    myPokeStateTrigger,
    opPokeStateTrigger,
    myTurn,
    myTurnTrigger,
    skipTurn,
    resultText,
  } = battleState;

  const {
    toDoWhenSetPokeName,
    toDoWhenSetImg,
    toDoWhenSetSkipturn,
    toDoWhenSetWeapon,
    toDoWhenSetMyturn,
    toDoWhenSetText,
    toDoWhenSetHp,
    toDoWhenSetLife,
    toDoWhenSetResultText
  } = useToDoWhenFnc(battleState);

  //useEffect==============================================================================================================================

  // 自分のポケモン名称がセットされたら、そのポケモンの画像をセット。
  useEffect(() => {
    if (!myPokeState.name) return;
    toDoWhenSetPokeName("my");
  }, [myPokeState.name]);

  //相手のポケモン名称がセットされたら、そのポケモンの画像をセット。
  useEffect(() => {
    if (!opPokeState.name) return;
    toDoWhenSetPokeName("op");
  }, [opPokeState.name]);

  // 自分の画像がセットされたら、HPをセット
  useEffect(() => {
    if (!myPokeState.img) return;
    toDoWhenSetImg("my");
  }, [myPokeState.img]);

  // 相手の画像がセットされたら、表示制御
  useEffect(() => {
    if (!opPokeState.img) return;
    toDoWhenSetImg("op");
  }, [opPokeState.img]);

  //自分の技名がセットされたら、相手の技名をセット
  useEffect(() => {
    if (!myPokeState.weapon) return;
    toDoWhenSetWeapon("my");
  }, [myPokeState.weapon]);

  //相手の技名がセットされたら、先攻後攻をセット
  useEffect(() => {
    if (!opPokeState.weapon) return;
    toDoWhenSetWeapon("op");
  }, [opPokeState.weapon]);

  //myWeaponのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myPokeStateTrigger.weapon == 0) return;
    toDoWhenSetWeapon("my");
  }, [myPokeStateTrigger.weapon]);

  //opWeaponのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (opPokeStateTrigger.weapon == 0) return;
    toDoWhenSetWeapon("op");
  }, [opPokeStateTrigger.weapon]);

  //先攻後攻がセットされたら、先攻の技をセット
  useEffect(() => {
    if (!myTurn) return;
    toDoWhenSetMyturn();
  }, [myTurn]);

  //myTurnのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myTurnTrigger == 0) return;
    toDoWhenSetMyturn();
  }, [myTurnTrigger]);

  //交代を選択したら、交代用のテキストをセット
  useEffect(() => {
    if (!skipTurn) return;
    toDoWhenSetSkipturn();
  }, [skipTurn]);

  //自分のテキストがセットされたら、テキストの種別によって処理を分岐する
  useEffect(() => {
    if (!myPokeState.text) return;
    toDoWhenSetText("my");
  }, [myPokeState.text]);

  //相手のテキストがセットされたら、テキストの種別によって処理を分岐する
  useEffect(() => {
    if (!opPokeState.text) return;
    toDoWhenSetText("op");
  }, [opPokeState.text]);

  //myTextのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myPokeStateTrigger.text == 0) return;
    toDoWhenSetText("my");
  }, [myPokeStateTrigger.text]);

  //opTextのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (opPokeStateTrigger.text == 0) return;
    toDoWhenSetText("op");
  }, [opPokeStateTrigger.text]);

  //自分のHPがセットされたら、残HPやターン状況で処理を分岐する
  useEffect(() => {
    if (myPokeState.name === "") return;
    toDoWhenSetHp("my");
  }, [myPokeState.h]);

  //相手のHPがセットされたら、残HPやターン状況で処理を分岐する
  useEffect(() => {
    if (opPokeState.h == 1000) return;
    toDoWhenSetHp("op");
  }, [opPokeState.h]);

  //myHpのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myPokeStateTrigger.h == 0) return;
    toDoWhenSetHp("my");
  }, [myPokeStateTrigger.h]);

  //opHpのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (opPokeStateTrigger.h == 0) return;
    toDoWhenSetHp("op");
  }, [opPokeStateTrigger.h]);

  //自分のライフがセットされたら、残りライフによって処理分岐
  useEffect(() => {
    toDoWhenSetLife("my");
  }, [myPokeState.life]);

  //相手のライフがセットされたら、残りライフによって処理分岐
  useEffect(() => {
    toDoWhenSetLife("op");
  }, [opPokeState.life]);

  //勝敗がセットされたらスタイルを付与
  useEffect(() => {
    if(resultText === "") return;
    toDoWhenSetResultText();
  }, [resultText]);

  return {};
}