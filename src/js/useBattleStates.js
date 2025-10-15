import { useState, useRef } from "react";

export function useBattleStates() {

  //表示制御のState
  const [areaVisible, setAreaVisible] = useState({
    myPoke: false, opPoke: false,
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

  // 変わる情報（HP・状態異常）
  const defaultPokeDynamic = {    //値が確実に入る要素以外はnullにしない
    currentHp: null, condition: null,
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

  //バフのstate
  const defaultPokeBuff = {
    a: 0, b: 0, c: 0, d: 0, s: 0
  };
  const [myPokeBuff, setMyPokeBuff] = useState({ ...defaultPokeBuff });
  const [opPokeBuff, setOpPokeBuff] = useState({ ...defaultPokeBuff });

  //攻め受けのポケモン情報
  const defaultBattlePokeInfo = {
    name: null, img: null, voice: null,
    type1: null, type2: null, terastal: null,
    hp: null, a: null, b: null, c: null, d: null, s: null,
    currentHp: null, condition: null,
    aBuff: 0, bBuff: 0, cBuff: 0, dBuff: 0, sBuff: 0,
    selectedWeapon: null,
  };
  const atcPokeInfo = useRef({ ...defaultBattlePokeInfo });
  const defPokeInfo = useRef({ ...defaultBattlePokeInfo });

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
  const mySelectedWeaponInfo = useRef(null);
  const opSelectedWeaponInfo = useRef(null);

  //テラスタル用state
  const defaultTerastalState = {
    canTerastal: true, terastalPokeNum: null,                              //canTerastalはテラスタルボタンを押下にするために必要
  };                                                                       //相手のはrefでもいいがまとめて管理 
  const [myTerastalState, setMyTerastalState] = useState({ ...defaultTerastalState });
  const [opTerastalState, setOpTerastalState] = useState({ ...defaultTerastalState });
  const [isTerastalActive, setIsTerastalActive] = useState(false);         //テラスタルボタン
  const opTerastalFlg = useRef(false);

  //自分が選出するポケモン3体
  const [mySelectedOrder, setMySelectedOrder] = useState([]);

  //useRef
  const textAreaRef = useRef(null);                                             //テキストエリアに表示するテキスト
  const myTextRef = useRef({ kind: "", content: "" });                          //自分向けの一般のテキスト
  const opTextRef = useRef({ kind: "", content: "" });                          //相手向けの一般のテキスト
  const otherTextRef = useRef({ kind: "", content: "" });                       //イレギュラーなテキスト
  const secondaryTextRef = useRef({ kind: "", content: "" });                   //追加効果のテキスト
  const myLife = useRef(3);                                                     //手持ち3体のライフ
  const opLife = useRef(3);
  const myChangeTurn = useRef(false);                                           //交代ターンフラグ
  const opChangeTurn = useRef(false);
  const myChangePokeIndex = useRef(null);                                       //交代するポケモン番号
  const opChangePokeIndex = useRef(null);
  const iAmFirst = useRef(false);                                               //先攻後攻
  const cantMoveFlg = useRef(false);                                            //行動不能フラグ
  const moveFailed = useRef(false);                                             //技失敗フラグ
  const multiplierRef = useRef(1);                                              //技相性の倍率
  const damage = useRef(0);
  const newHp = useRef(0);                                                      //攻撃後や回復後のHP
  const isIncident = useRef(false);                                             //追加効果の発生フラグ
  const newBuff = useRef(null);                                                 //バフの増減値
  const healHp = useRef(0);                                                     //回復するHP
  const burned = useRef(false);                                                 //火傷ダメージをセットしたフラグ
  const poisoned = useRef(false);                                               //毒ダメージをセットしたフラグ
  const myPoisonedCnt = useRef(1);                                              //猛毒状態のカウント
  const opPoisonedCnt = useRef(1);
  const turnCnt = useRef(0);                                                    //デバッグ用ターンカウント    
  const loopAudioRef = useRef(null);                                            //再生中のBGM

  return {
    areaVisible, setAreaVisible,
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
    cantMoveFlg,
    iAmFirst,
    healHp,
    burned, poisoned,
    myPoisonedCnt, opPoisonedCnt,
    turnCnt,
    loopAudioRef,
    damage, newHp,
    isIncident,
    myPokeBuff, setMyPokeBuff,
    opPokeBuff, setOpPokeBuff,
    moveFailed,
    atcPokeInfo, defPokeInfo,
    secondaryTextRef, newBuff,
    multiplierRef,
    defaultBattlePokeInfo,
  };
}
