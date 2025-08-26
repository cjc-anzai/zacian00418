import { useState, useRef } from "react";

export function useBattleState() {

  //表示制御のState
  const [myAreaVisible, setMyAreaVisible] = useState({ poke: false });
  const [opAreaVisible, setOpAreaVisible] = useState({ poke: false });
  const [otherAreaVisible, setOtherAreaVisible] = useState({
    top: true, select: false, battle: false, textArea: false,
    actionCmd: false, weaponCmd: false, changeCmd: false, status: false, nextPokeCmd: false
  });

  //バトル場のポケモンNo
  const [myBattlePokeIndex, setMyBattlePokeIndex] = useState(-1);
  const [opBattlePokeIndex, setOpBattlePokeIndex] = useState(-1);

  // 変わらない情報（種族値・画像など）
  const defaultPokeStatic = {
    name: null, img: null, voice: null,
    type1: null, type2: null, terastal: null,
    hp: null, a: null, b: null, c: null, d: null, s: null,
    weapon1: null, weapon2: null, weapon3: null, weapon4: null,
  };
  const myPokeStatics = useRef([
    { ...defaultPokeStatic },
    { ...defaultPokeStatic },
    { ...defaultPokeStatic },
  ]);
  const opPokeStatics = useRef([
    { ...defaultPokeStatic },
    { ...defaultPokeStatic },
    { ...defaultPokeStatic },
  ]);

  // 変わる情報（HP・状態異常・バフ）
  const defaultPokeDynamic = {    //値が確実に入る要素以外はnullにしない
    currentHp: null, condition: "",
    aBuff: 0, bBuff: 0, cBuff: 0, dBuff: 0, sBuff: 0,
  };
  const [myPokeDynamics, setMyPokeDynamics] = useState([
    { ...defaultPokeDynamic },
    { ...defaultPokeDynamic },
    { ...defaultPokeDynamic },
  ]);
  const [opPokeDynamics, setOpPokeDynamics] = useState([
    { ...defaultPokeDynamic },
    { ...defaultPokeDynamic },
    { ...defaultPokeDynamic },
  ]);

  //ポケモンの技１～４のstate
  const defaultWeapons = {
    name: null, type: null, kind: null, sound: null,
    power: null, hitRate: null, priority: null,
    atcTarget: null, effTarget: null,
    incidenceRate: null, effectiveness: null,
  };
  const myWeapons = useRef([
    [{ ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }],
    [{ ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }],
    [{ ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }],
  ]);
  const opWeapons = useRef([
    [{ ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }],
    [{ ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }],
    [{ ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }, { ...defaultWeapons }],
  ]);
  const [mySelectedWeaponInfo, opSelectedWeaponInfo] = [useRef(null), useRef(null)];    //そのターンに選択した技

  //テラスタル用state
  const defaultTerastalState = {
    canTerastal: true, terastalPokeNum: null,                              //canTerastalはテラスタルボタンを押下にするために必要
  };                                                                       //相手のはrefでもいいがまとめて管理 
  const [myTerastalState, setMyTerastalState] = useState({ ...defaultTerastalState });
  const [opTerastalState, setOpTerastalState] = useState({ ...defaultTerastalState });
  const [isTerastalActive, setIsTerastalActive] = useState(false);         //テラスタルボタン
  const opTerastalFlg = useRef(false);

  const [mySelectedOrder, setMySelectedOrder] = useState([]);                  //自分が選出するポケモン3体

  //useRef
  const myTextRef = useRef({ kind: "", content: "" });                          //自分向けの一般のテキスト
  const opTextRef = useRef({ kind: "", content: "" });                          //相手向けの一般のテキスト
  const otherTextRef = useRef({ kind: "", content: "" });                       //イレギュラーなテキスト
  const textAreaRef = useRef("");                                               //テキストエリアに表示するテキスト
  const [myLife, opLife] = [useRef(3), useRef(3)];                              //手持ち3体のライフ
  const [myChangeTurn, opChangeTurn] = [useRef(false), useRef(false)];          //交代ターンフラグ
  const [myChangePokeIndex, opChangePokeIndex] = [useRef(null), useRef(null)];    //交代するポケモン
  const [myCantMoveFlg, opCantMoveFlg] = [useRef(false), useRef(false)];              //
  const [myDeathFlg, opDeathFlg] = [useRef(false), useRef(false)];              //定数ダメージによって死亡する場合のフラグ
  const iAmFirst = useRef(false);                                               //先攻後攻
  const newHp = useRef(0);
  const damage = useRef(0);
  const isIncident = useRef(false);
  const isHeal = useRef(false);                                                 //回復の変化技or回復の攻撃技
  const isHealAtc = useRef(false);                                              //回復の攻撃技
  const healHp = useRef(0);                                                 //回復技によって回復するHP
  const burned = useRef(false);                                                 //火傷ダメージをセットしたフラグ
  const poisoned = useRef(false);                                               //毒ダメージをセットしたフラグ
  const [myPoisonedCnt, opPoisonedCnt] = [useRef(1), useRef(1)];                //猛毒状態のカウント
  const resultText = useRef(null);                                              //勝敗
  const turnCnt = useRef(1);                                                    //デバッグ用ターンカウント    
  const loopAudioRef = useRef(null);                                            //再生中のBGM

  return {
    myAreaVisible, setMyAreaVisible,
    opAreaVisible, setOpAreaVisible,
    otherAreaVisible, setOtherAreaVisible,
    myTerastalState, setMyTerastalState,
    opTerastalState, setOpTerastalState,
    isTerastalActive, setIsTerastalActive,
    myBattlePokeIndex, setMyBattlePokeIndex,
    opBattlePokeIndex, setOpBattlePokeIndex,
    myPokeStatics, opPokeStatics,
    myPokeDynamics, setMyPokeDynamics,
    opPokeDynamics, setOpPokeDynamics,
    myWeapons, opWeapons,
    mySelectedWeaponInfo, opSelectedWeaponInfo,
    mySelectedOrder, setMySelectedOrder,
    myTextRef, opTextRef, otherTextRef, textAreaRef,
    myLife, opLife,
    myChangeTurn, opChangeTurn,
    myChangePokeIndex, opChangePokeIndex,
    opTerastalFlg,
    myCantMoveFlg, opCantMoveFlg,
    myDeathFlg, opDeathFlg,
    iAmFirst,
    isHeal, isHealAtc, healHp,
    burned, poisoned,
    myPoisonedCnt, opPoisonedCnt,
    resultText,
    turnCnt,
    loopAudioRef,
    damage, newHp,
    defaultPokeStatic, defaultPokeDynamic, defaultWeapons, defaultTerastalState,
    isIncident
  };
}
