import { useState, useRef } from "react";

export function useBattleState() {

  //表示制御のState
  const defaultAreaVisible = { poke: false, text: false };
  const [myAreaVisible, setMyAreaVisible] = useState({ ...defaultAreaVisible });
  const [opAreaVisible, setOpAreaVisible] = useState({ ...defaultAreaVisible });
  const [otherAreaVisible, setOtherAreaVisible] = useState({
    top: true, select: false, battle: false,
    actionCmd: false, weaponCmd: false, changeCmd: false, nextPokeCmd: false
  });

  //お互いのポケモンたちのState
  const defaultPokeState = {
    name: "", img: null, voice: null,
    type1: "", type2: "", terastal: "",
    hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0,
    aBuff: 0, bBuff: 0, cBuff: 0, dBuff: 0, sBuff: 0,
    weapon1: "", weapon2: "", weapon3: "", weapon4: "",
    poke1Name: "", poke2Name: "", poke3Name: "",
    poke1MaxHp: 0, poke2MaxHp: 0, poke3MaxHp: 0,
    poke1Hp: 0, poke2Hp: 0, poke3Hp: 0,
    canTerastal: true, terastalPokeNum: null,
    text: { kind: "", content: "" }
  };
  const [myPokeState, setMyPokeState] = useState({ ...defaultPokeState });
  const [opPokeState, setOpPokeState] = useState({ ...defaultPokeState });

  //Stateに同じ値を更新しうるStateのuseEffectを強制発火させるためのトリガー
  const defaultPokeStateTrigger = { hp: 0, text: 0 };
  const [myPokeStateTrigger, setMyPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });
  const [opPokeStateTrigger, setOpPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });

  const [selectedOrder, setSelectedOrder] = useState([]);   //自分が選出するポケモン3体
  const [isTerastalActive, setIsTerastalActive] = useState(false);    //テラスタルボタン
  const [otherText, setOtherText] = useState({ kind: "", content: "" });   //イレギュラーなテキスト

  //useRef
  const [myLife, opLife] = [useRef(3), useRef(3)];
  const [mySelectedWeapon, opSelectedWeapon] = [useRef(""), useRef("")];
  const [myChangeTurn, opChangeTurn] = [useRef(false), useRef(false)];       //交代したターンか否か
  const [myChangePokeName, opChangePokeName] = [useRef(null), useRef(null)];    //交代するポケモン
  const opTerastalFlag = useRef(false);
  const iAmFirst = useRef(false);
  const resultText = useRef("");        //勝敗
  const turnCnt = useRef(1);            
  const loopAudioRef = useRef(null);    //再生中のBGM

  return {
    myAreaVisible, setMyAreaVisible,
    opAreaVisible, setOpAreaVisible,
    otherAreaVisible, setOtherAreaVisible,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    myPokeStateTrigger, setMyPokeStateTrigger,
    opPokeStateTrigger, setOpPokeStateTrigger,
    defaultPokeState, defaultPokeStateTrigger,
    otherText, setOtherText,
    selectedOrder, setSelectedOrder,
    isTerastalActive, setIsTerastalActive,
    opTerastalFlag,
    myLife, opLife,
    mySelectedWeapon, opSelectedWeapon,
    iAmFirst, myChangeTurn, opChangeTurn,
    myChangePokeName, opChangePokeName,
    resultText, turnCnt,
    loopAudioRef,
  };
}
