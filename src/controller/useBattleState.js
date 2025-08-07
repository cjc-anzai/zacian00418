import { useState, useRef } from "react";

export function useBattleState() {

  //表示制御のState
  // const defaultAreaVisible = { poke: false, text: false };
  const defaultAreaVisible = { poke: false };
  const [myAreaVisible, setMyAreaVisible] = useState({ ...defaultAreaVisible });
  const [opAreaVisible, setOpAreaVisible] = useState({ ...defaultAreaVisible });
  const [otherAreaVisible, setOtherAreaVisible] = useState({
    top: true, select: false, battle: false, textArea: false,
    actionCmd: false, status: false, weaponCmd: false, changeCmd: false, nextPokeCmd: false
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
    poke1Condition: "", poke2Condition: "", poke3Condition: "",
    canTerastal: true, terastalPokeNum: null,
    // text: { kind: "", content: "" }
  };
  const [myPokeState, setMyPokeState] = useState({ ...defaultPokeState });
  const [opPokeState, setOpPokeState] = useState({ ...defaultPokeState });

  //Stateに同じ値を更新しうるStateのuseEffectを強制発火させるためのトリガー
  const defaultPokeStateTrigger = { hp: 0, text: 0 };
  const [myPokeStateTrigger, setMyPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });
  const [opPokeStateTrigger, setOpPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });

  const [selectedOrder, setSelectedOrder] = useState([]);                  //自分が選出するポケモン3体
  const [isTerastalActive, setIsTerastalActive] = useState(false);         //テラスタルボタン
  const [otherText, setOtherText] = useState({ kind: "", content: "" });   //イレギュラーなテキスト

  //useRef
  const myTextRef = useRef({ kind: "", content: "" });
  const opTextRef = useRef({ kind: "", content: "" });
  const otherTextRef = useRef({ kind: "", content: "" });
  const textAreaRef = useRef("");
  const [myLife, opLife] = [useRef(3), useRef(3)];                              //
  const [mySelectedWeapon, opSelectedWeapon] = [useRef(null), useRef(null)];    //
  const [myChangeTurn, opChangeTurn] = [useRef(false), useRef(false)];          //交代したターンか否か
  const [myChangePokeName, opChangePokeName] = [useRef(null), useRef(null)];    //交代するポケモン
  const [myDeathFlg, opDeathFlg] = [useRef(false), useRef(false)];              //定数ダメージによって死亡する場合のフラグ
  const opTerastalFlg = useRef(false);                                          //
  const iAmFirst = useRef(false);                                               //先攻後攻
  const isHeal = useRef(false);                                                 //回復の変化技or回復の攻撃技
  const isHealAtc = useRef(false);                                              //回復の攻撃技
  const healHp = useRef(false);                                                 //回復技によって回復するHP
  const burned = useRef(false);                                                 //火傷ダメージをセットしたフラグ
  const poisoned = useRef(false);                                               //毒ダメージをセットしたフラグ
  const [myPoisonedCnt, opPoisonedCnt] = [useRef(1), useRef(1)];
  const resultText = useRef("");                                                //勝敗
  const turnCnt = useRef(1);                                                    //デバッグ用ターンカウント    
  const loopAudioRef = useRef(null);                                            //再生中のBGM

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
    opTerastalFlg,
    myTextRef, opTextRef, otherTextRef, textAreaRef,
    myLife, opLife,
    mySelectedWeapon, opSelectedWeapon,
    burned, poisoned,
    myPoisonedCnt, opPoisonedCnt,
    isHeal, isHealAtc, healHp,
    iAmFirst, myChangeTurn, opChangeTurn,
    myChangePokeName, opChangePokeName,
    myDeathFlg, opDeathFlg,
    resultText, turnCnt,
    loopAudioRef,
  };
}
