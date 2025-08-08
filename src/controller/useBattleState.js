import { useState, useRef } from "react";

export function useBattleState() {

  //表示制御のState
  const [myAreaVisible, setMyAreaVisible] = useState({ poke: false });
  const [opAreaVisible, setOpAreaVisible] = useState({ poke: false });
  const [otherAreaVisible, setOtherAreaVisible] = useState({
    top: true, select: false, battle: false, textArea: false,
    actionCmd: false, weaponCmd: false, changeCmd: false, status: false, nextPokeCmd: false
  });

  //お互いのポケモンたちのState
  const defaultPokeState = {
    name: "", img: null, voice: null,
    type1: "", type2: "", terastal: "",
    hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0,
    aBuff: 0, bBuff: 0, cBuff: 0, dBuff: 0, sBuff: 0,
    weapon1: "", weapon2: "", weapon3: "", weapon4: "",
    weapon1Se: null, weapon2Se: null, weapon3Se: null, weapon4Se: null,
    poke1Name: "", poke2Name: "", poke3Name: "",
    poke1MaxHp: 0, poke2MaxHp: 0, poke3MaxHp: 0,
    poke1Hp: 0, poke2Hp: 0, poke3Hp: 0,
    poke1Condition: "", poke2Condition: "", poke3Condition: "",
    canTerastal: true, terastalPokeNum: null,
  };
  const [myPokeState, setMyPokeState] = useState({ ...defaultPokeState });
  const [opPokeState, setOpPokeState] = useState({ ...defaultPokeState });

  //Stateに同じ値を更新しうるStateのuseEffectを強制発火させるためのトリガー
  const [myPokeStateTrigger, setMyPokeStateTrigger] = useState({ hp: 0 });
  const [opPokeStateTrigger, setOpPokeStateTrigger] = useState({ hp: 0 });

  const [selectedOrder, setSelectedOrder] = useState([]);                  //自分が選出するポケモン3体
  const [isTerastalActive, setIsTerastalActive] = useState(false);         //テラスタルボタン

  //useRef
  const myTextRef = useRef({ kind: "", content: "" });                          //自分向けの一般のテキスト
  const opTextRef = useRef({ kind: "", content: "" });                          //相手向けの一般のテキスト
  const otherTextRef = useRef({ kind: "", content: "" });                       //イレギュラーなテキスト
  const textAreaRef = useRef("");                                               //テキストエリアに表示するテキスト
  const [myLife, opLife] = [useRef(3), useRef(3)];                              //手持ち3体のライフ
  const [mySelectedWeapon, opSelectedWeapon] = [useRef(null), useRef(null)];    //そのターンに選択した技
  const [myChangeTurn, opChangeTurn] = [useRef(false), useRef(false)];          //交代ターンフラグ
  const [myChangePokeName, opChangePokeName] = [useRef(null), useRef(null)];    //交代するポケモン
  const [myCantMoveFlg, opCantMoveFlg] = [useRef(false), useRef(false)];              //
  const [myDeathFlg, opDeathFlg] = [useRef(false), useRef(false)];              //定数ダメージによって死亡する場合のフラグ
  const opTerastalFlg = useRef(false);                                          //
  const iAmFirst = useRef(false);                                               //先攻後攻
  const isHeal = useRef(false);                                                 //回復の変化技or回復の攻撃技
  const isHealAtc = useRef(false);                                              //回復の攻撃技
  const healHp = useRef(false);                                                 //回復技によって回復するHP
  const burned = useRef(false);                                                 //火傷ダメージをセットしたフラグ
  const poisoned = useRef(false);                                               //毒ダメージをセットしたフラグ
  const [myPoisonedCnt, opPoisonedCnt] = [useRef(1), useRef(1)];                //猛毒状態のカウント
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
    defaultPokeState,
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
    myCantMoveFlg, opCantMoveFlg,
    myDeathFlg, opDeathFlg,
    resultText, turnCnt, loopAudioRef,
  };
}
