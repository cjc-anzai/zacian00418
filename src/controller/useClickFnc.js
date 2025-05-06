import { useBattleHandlers } from "./useBattleHandlers";

export function useClickFnc(battleState) {

  //インポートの取得===========================================================
  const {
    setMyAreaVisible,
    setOpAreaVisible,
    setOtherAreaVisible,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    setMyPokeStateTrigger,
    setOpPokeStateTrigger,
    selectedOrder, setSelectedOrder,
    setMyTurn,
    setMyTurnTrigger,
    setSkipTurn,
    turnCnt, changePokeName, beforePokeName,
    defaultAreaVisible,
    defaultPokeState,
    defaultPokeStateTrigger,
    setResultText
  } = battleState;

  const battleHandlers = useBattleHandlers(battleState);

  //クリックイベント===============================================================================================================


  const start = () => {
    battleHandlers.playSe("decide");
    const startSe = battleHandlers.playSe("start");
    const bgm = battleHandlers.setBgm("selection");

    startSe.onended = () => {
      setOtherAreaVisible(prev => ({ ...prev, top: false, isSelecting: true }));
      bgm.play();
    };


    // (async () => {
    //   const weaponName = await battleHandlers.getPokeInfo("ディアルガ", "Weapon1");
    //   console.log("C列の値:", weaponName);
    // })();
    // (async () => { await battleHandlers.getPokeInfo("ディアルガ", "Weapon1") })();
    // (async () => {
    //   const value = await battleHandlers.getWeaponInfo(weaponName, "type");
    //   console.log("C列の値:", value);
    // })();

  }




  //選出画面のポケモン押下時
  const handleSelect = (pokeName) => {
    battleHandlers.playSe("select");
    setSelectedOrder((prev) => {
      if (prev.includes(pokeName)) {
        return prev.filter((name) => name !== pokeName); // クリックで解除
      }
      if (prev.length < 3) {
        return [...prev, pokeName]; // 3体まで選択OK
      }
      return prev; // 3体以上は無視
    });
  };

  //選出確定ボタン
  const confirmSelection = async () => {
    battleHandlers.playSe("decide");
    battleHandlers.stopBgm();
    const bgm = battleHandlers.setBgm("battle");
    battleHandlers.delay(() => bgm.play(), 50);

    setOtherAreaVisible(prev => ({ ...prev, isSelecting: false, battle: true }));

    //自分の選出順番をセットし、1番目のポケの名前をセット
    const [p1, p2, p3] = selectedOrder;

    // HPを非同期で取得
    const [myP1FullH, myP2FullH, myP3FullH] = await Promise.all([
      battleHandlers.getPokeInfo(p1, "H"),
      battleHandlers.getPokeInfo(p2, "H"),
      battleHandlers.getPokeInfo(p3, "H"),
    ]);
  
    setMyPokeState(prev => ({
      ...prev,
      name: p1, poke1Name: p1, poke2Name: p2, poke3Name: p3,
      poke1FullH: myP1FullH, poke2FullH: myP2FullH, poke3FullH: myP3FullH,
      poke1H: myP1FullH, poke2H: myP2FullH, poke3H: myP3FullH,
    }));

    // 相手の選出順番をランダムに選び、1番目のポケの名前をセット
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
    };

    const opCandidates = ["ディアルガ", "ゲンガー", "リザードン", "ラグラージ", "カイリキー", "サーナイト"];
    // .map(name => ({ name, ...pokeInfo[name] }));

    shuffleArray(opCandidates); // Fisher-Yatesアルゴリズムでシャッフル

    // シャッフル後、最初の3体を選ぶ
    const [o1, o2, o3] = opCandidates.slice(0, 3);

    // 非同期でHPを取得
    const [opP1FullH, opP2FullH, opP3FullH] = await Promise.all([
      battleHandlers.getPokeInfo(o1, "H"),
      battleHandlers.getPokeInfo(o2, "H"),
      battleHandlers.getPokeInfo(o3, "H"),
    ]);
    
    setOpPokeState(prev => ({
      ...prev,
      name: o1, poke1Name: o1, poke2Name: o2, poke3Name: o3,
      poke1FullH: opP1FullH, poke2FullH: opP2FullH, poke3FullH: opP3FullH,
      poke1H: opP1FullH, poke2H: opP2FullH, poke3H: opP3FullH,
    }));
    console.log(`相手1体目：${o1}\n2体目：${o2}\n3体目：${o3}`);
  };


  //たたかうボタン押下時、コマンド表示を切り替える
  const openBattleCmdArea = () => {
    battleHandlers.playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, weaponCmd: true }));
  };

  //交代ボタン押下時、コマンド表示を切り替える
  const openChangeCmdArea = () => {
    battleHandlers.playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, changeCmd: true }));
  };

  // 戻るボタン押下時、コマンド表示を切り替える
  const backCmd = () => {
    battleHandlers.playSe("cancel");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true, weaponCmd: false, changeCmd: false }));
  };

  //技名ボタン押下時、選択した技をセット
  const battle = (weaponName) => {
    battleHandlers.playSe("decide");
    battleHandlers.updateTurnCnt();
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: false }));
    battleHandlers.handleStateChange("myWeapon", weaponName);
  };

  //〇〇に交代ボタン押下時、交代するポケモン名を保存し、交代フラグを立てる
  const changeMyPoke = (changePoke) => {
    battleHandlers.playSe("decide");
    battleHandlers.updateTurnCnt();
    console.log(`${changePoke}に交代を選択`);
    setOtherAreaVisible(prev => ({ ...prev, changeCmd: false }));
    beforePokeName.current = myPokeState.name;
    changePokeName.current = changePoke;
    setSkipTurn(true);
  }

  //倒れた後、次に出すポケモンボタン押下時、次のポケモン名を保存し、HPをセット
  const nextMyPoke = (nextPoke) => {
    battleHandlers.playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: false }));
    changePokeName.current = nextPoke;
    battleHandlers.delay(() => setMyPokeState(p => ({ ...p, name: nextPoke })), 1000);
  }

  //トップへ戻るボタン押下時、すべてのステータスを初期化
  const goTop = () => {

    // ポケモン表示制御
    setMyAreaVisible({ ...defaultAreaVisible });
    setOpAreaVisible({ ...defaultAreaVisible });

    // その他表示制御
    setOtherAreaVisible({
      top: true,
      isSelecting: false,
      battle: false,
      text: false,
      actionCmd: false,
      weaponCmd: false,
      changeCmd: false,
      nextPokeCmd: false
    });

    // ポケモンのステータス
    setMyPokeState({ ...defaultPokeState });
    setOpPokeState({ ...defaultPokeState });

    // 強制トリガー
    setMyPokeStateTrigger({ ...defaultPokeStateTrigger });
    setOpPokeStateTrigger({ ...defaultPokeStateTrigger });

    // その他state
    setSelectedOrder([]);
    turnCnt.current = 1;
    setMyTurn("");
    setMyTurnTrigger(0);
    setSkipTurn(false);
    changePokeName.current = "";
    setResultText("");
  }

  return {
    start,
    handleSelect,
    confirmSelection,
    openBattleCmdArea,
    openChangeCmdArea,
    backCmd,
    battle,
    changeMyPoke,
    nextMyPoke,
    goTop,
  };
}
