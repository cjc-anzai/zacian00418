import { useState, useRef } from "react";

export function useBattleState() {
  const defaultAreaVisible = { name: false, text: false };
  const defaultPokeState = {
    name: "",
    poke1Name: "", poke2Name: "", poke3Name: "",
    img: null, weapon: "", hp: 100,
    poke1Hp: 100, poke2Hp: 100, poke3Hp: 100,
    life: 3, text: ""
  };
  const defaultPokeStateTrigger = { weapon: "", hp: 0, text: 0 };

  const [myAreaVisible, setMyAreaVisible] = useState({ ...defaultAreaVisible });
  const [opAreaVisible, setOpAreaVisible] = useState({ ...defaultAreaVisible });

  const [otherAreaVisible, setOtherAreaVisible] = useState({
    top: true, isSelecting: false, battle: false, text: false,
    actionCmd: false, weaponCmd: false, changeCmd: false, nextPokeCmd: false
  });

  const [myPokeState, setMyPokeState] = useState({ ...defaultPokeState });
  const [opPokeState, setOpPokeState] = useState({ ...defaultPokeState });

  const [myPokeStateTrigger, setMyPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });
  const [opPokeStateTrigger, setOpPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });

  const loopAudioRef = useRef(null);
  const turnCnt = useRef(1);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [myTurn, setMyTurn] = useState("");
  const [myTurnTrigger, setMyTurnTrigger] = useState(0);
  const [isMyAttacking, setIsMyAttacking] = useState(false);
  const [isOpAttacking, setIsOpAttacking] = useState(false);
  const [skipTurn, setSkipTurn] = useState(false);
  const changePokeName = useRef("");
  const [resultText, setResultText] = useState("");

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
    isMyAttacking, setIsMyAttacking,
    isOpAttacking, setIsOpAttacking,
    skipTurn, setSkipTurn,
    resultText, setResultText,
    loopAudioRef, turnCnt, changePokeName,

    defaultAreaVisible, defaultPokeState, defaultPokeStateTrigger,
  };
}
