import { sounds, pokeInfo } from "../model/model";
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
    battleHandlers.playSe("start");
    battleHandlers.setBgm(sounds.bgm.selection);

    sounds.general.start.onended = () => {
      setOtherAreaVisible(prev => ({...prev, top: false, isSelecting: true }));
      sounds.bgm.selection.play();
    };
  };


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
  const confirmSelection = () => {
    battleHandlers.playSe("decide");
    battleHandlers.stopBgm();
    battleHandlers.setBgm(sounds.bgm.battle);
    battleHandlers.delay(() => sounds.bgm.battle.play(), 50);

    setOtherAreaVisible(prev => ({ ...prev, isSelecting: false, battle: true }));

    //自分の選出順番をセットし、1番目のポケの名前をセット
    const [p1, p2, p3] = selectedOrder;
    Object.assign(myPokeState, {
      poke1Name: p1, poke2Name: p2, poke3Name: p3,
      poke1FullH: pokeInfo[p1].h, poke2FullH: pokeInfo[p2].h, poke3FullH: pokeInfo[p3].h,
      poke1H: pokeInfo[p1].h, poke2H: pokeInfo[p2].h, poke3H: pokeInfo[p3].h,
    });
    setMyPokeState(prev => ({ ...prev, name: p1 }));

    // 相手の選出順番をランダムに選び、1番目のポケの名前をセット
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
    };

    const opCandidates = ["ディアルガ", "ゲンガー", "リザードン", "ラグラージ", "カイリキー", "サーナイト"]
      .map(name => ({ name, ...pokeInfo[name] }));

    shuffleArray(opCandidates); // Fisher-Yatesアルゴリズムでシャッフル

    // シャッフル後、最初の3体を選ぶ
    const [o1, o2, o3] = opCandidates.slice(0, 3).map(p => p.name);
    Object.assign(opPokeState, {
      poke1Name: o1, poke2Name: o2, poke3Name: o3,
      poke1FullH: pokeInfo[o1].h, poke2FullH: pokeInfo[o2].h, poke3FullH: pokeInfo[o3].h,
      poke1H: pokeInfo[o1].h, poke2H: pokeInfo[o2].h, poke3H: pokeInfo[o3].h,
    });
    setOpPokeState(prev => ({ ...prev, name: o1 }));
    console.log(`相手1体目：${opPokeState.poke1Name}\n2体目：${opPokeState.poke2Name}\n3体目：${opPokeState.poke3Name}`);
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
