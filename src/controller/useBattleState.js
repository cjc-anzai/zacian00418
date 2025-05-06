import { useState, useRef } from "react";

export function useBattleState() {

  const defaultAreaVisible = { name: false, text: false };
  const [myAreaVisible, setMyAreaVisible] = useState({ ...defaultAreaVisible });
  const [opAreaVisible, setOpAreaVisible] = useState({ ...defaultAreaVisible });

  const [otherAreaVisible, setOtherAreaVisible] = useState({
    top: true, isSelecting: false, battle: false, text: false, notHit: false, critical: false,
    actionCmd: false, weaponCmd: false, changeCmd: false, nextPokeCmd: false
  });

  const defaultPokeState = {
    name: "", poke1Name: "", poke2Name: "", poke3Name: "",
    img: null, type1: "", type2: "", h: 1000, 
    weapon: "", weapon1: "", weapon2: "", weapon3: "", weapon4: "",
    poke1FullH: 1000, poke2FullH: 1000, poke3FullH: 1000,
    poke1H: 1000, poke2H: 1000, poke3H: 1000,
    life: 3, text: ""
  };

  const [myPokeState, setMyPokeState] = useState({ ...defaultPokeState });
  const [opPokeState, setOpPokeState] = useState({ ...defaultPokeState });

  const defaultPokeStateTrigger = { weapon: 0, h: 0, text: 0 };
  const [myPokeStateTrigger, setMyPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });
  const [opPokeStateTrigger, setOpPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });

  const loopAudioRef = useRef(null);
  const turnCnt = useRef(1);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [myTurn, setMyTurn] = useState("");
  const [myTurnTrigger, setMyTurnTrigger] = useState(0);
  const [skipTurn, setSkipTurn] = useState(false);
  const changePokeName = useRef("");
  const beforePokeName = useRef("");
  const [resultText, setResultText] = useState("");

  // "状態"だけ返す
  return {
    myAreaVisible, setMyAreaVisible,
    opAreaVisible, setOpAreaVisible,
    otherAreaVisible, setOtherAreaVisible,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    myPokeStateTrigger, setMyPokeStateTrigger,
    opPokeStateTrigger, setOpPokeStateTrigger,
    selectedOrder, setSelectedOrder,
    myTurn, setMyTurn,
    myTurnTrigger, setMyTurnTrigger,
    skipTurn, setSkipTurn,
    resultText, setResultText,
    loopAudioRef, turnCnt, changePokeName, beforePokeName,
    defaultPokeState,defaultPokeStateTrigger,
  };
}
