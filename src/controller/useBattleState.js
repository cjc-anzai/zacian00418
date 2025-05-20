import { useState, useRef } from "react";

export function useBattleState() {

  //表示制御のState
  const defaultAreaVisible = { poke: false, text: false };
  const [myAreaVisible, setMyAreaVisible] = useState({ ...defaultAreaVisible });
  const [opAreaVisible, setOpAreaVisible] = useState({ ...defaultAreaVisible });
  const [otherAreaVisible, setOtherAreaVisible] = useState({
    top: true, select: false, battle: false, text: false, notHit: false, critical: false,
    actionCmd: false, weaponCmd: false, changeCmd: false, nextPokeCmd: false
  });

  //お互いのポケモンたちのState
  const defaultPokeState = {
    name: "", img: null, voice: null, 
    type1: "", type2: "", 
    hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0,  
    weapon1: "", weapon2: "", weapon3: "", weapon4: "",
    poke1Name: "", poke2Name: "", poke3Name: "",
    poke1FullH: 0, poke2FullH: 0, poke3FullH: 0,
    poke1H: 0, poke2H: 0, poke3H: 0,
    text: { content: "", kind: "" }
  };
  const [myPokeState, setMyPokeState] = useState({ ...defaultPokeState });
  const [opPokeState, setOpPokeState] = useState({ ...defaultPokeState });

  //Stateに同じ値を更新しうるStateのuseEffectを強制発火させるためのトリガー
  const defaultPokeStateTrigger = { hp: 0, text: 0 };
  const [myPokeStateTrigger, setMyPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });
  const [opPokeStateTrigger, setOpPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });

  //自分が選出するポケモン3体
  const [selectedOrder, setSelectedOrder] = useState([]);   

  //useRef
  const myLife = useRef(3);
  const opLife = useRef(3);
  const mySelectedWeapon = useRef("");
  const opSelectedWeapon = useRef("");
  const myTurn = useRef("first");       //先攻後攻
  const myChangeTurn = useRef(false);       //交代したターンか否か
  const opChangeTurn = useRef(false);
  const myChangePokeName = useRef(null);    //交代するポケモン
  const opChangePokeName = useRef(null);
  const resultText = useRef("");        //勝敗
  const turnCnt = useRef(1);            //現在のターン数(デバッグ用)
  const loopAudioRef = useRef(null);    //再生中のBGM
  
  return {
    myAreaVisible, setMyAreaVisible,
    opAreaVisible, setOpAreaVisible,
    otherAreaVisible, setOtherAreaVisible,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    myPokeStateTrigger, setMyPokeStateTrigger,
    opPokeStateTrigger, setOpPokeStateTrigger,
    defaultPokeState,defaultPokeStateTrigger,
    selectedOrder, setSelectedOrder,
    myLife, opLife,
    mySelectedWeapon, opSelectedWeapon,
    myTurn, myChangeTurn, opChangeTurn,
    myChangePokeName, opChangePokeName,
    resultText, turnCnt,
    loopAudioRef, 
  };
}
