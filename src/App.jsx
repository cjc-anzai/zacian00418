import "./App.css";
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TopScreen from './components/TopScreen';

function App() {
  //state=============================================================================================================================

  //ポケモン関係の表示制御
  const defaultAreaVisible = {
    name: false,
    img: false,
    hp: false,
    text: false
  };

  const [myAreaVisible, setMyAreaVisible] = useState({ ...defaultAreaVisible });
  const [opAreaVisible, setOpAreaVisible] = useState({ ...defaultAreaVisible });

  //その他表示制御
  const [otherAreaVisible, setOtherAreaVisible] = useState({
    top: true,
    isSelecting: false,
    battle: false,
    text: false,
    actionCmd: false,
    weaponCmd: false,
    changeCmd: false,
    nextPokeCmd: false
  });

  //お互いののポケモンのState
  const defaultPokeState = {
    name: "",          //バトル場のポケモン    
    poke1Name: "",   //１番目に選択したポケモン 
    poke2Name: "",
    poke3Name: "",
    img: null,
    weapon: "",
    hp: 100,    //バトル場のポケモンのHP
    poke1Hp: 100,   //１番目に選択したポケモンのHP
    poke2Hp: 100,
    poke3Hp: 100,
    life: 3,
    text: ""
  };

  const [myPokeState, setMyPokeState] = useState({ ...defaultPokeState });
  const [opPokeState, setOpPokeState] = useState({ ...defaultPokeState });

  //stateに同じ内容がセットされるとuseStateが発火しないため、強制発火させるためのトリガー
  const defaultPokeStateTrigger = {
    weapon: "",
    hp: 0,
    text: 0
  };

  const [myPokeStateTrigger, setMyPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });
  const [opPokeStateTrigger, setOpPokeStateTrigger] = useState({ ...defaultPokeStateTrigger });

  //その他state,ref
  const loopAudioRef = useRef(null);    //ループさせるBGM
  const [selectedOrder, setSelectedOrder] = useState([]); // 選出順（配列で保持）
  const turnCnt = useRef(1);    //ターン数カウント(デバッグ用)
  const [myTurn, setMyTurn] = useState("");
  const [myTurnTrigger, setMyTurnTrigger] = useState(0);
  const [isMyAttacking, setIsMyAttacking] = useState(false);    //自分の攻撃エフェクト
  const [isOpAttacking, setIsOpAttacking] = useState(false);    //相手の攻撃エフェクト
  const [skipTurn, setSkipTurn] = useState(false);
  const changePokeName = useRef("");    //交代で出すポケモンの名前
  const [resultText, setResultText] = useState("");  //勝敗を格納する

  //一般変数========================================================================================================================================

  //サウンド関係
  const sounds = {
    bgm: {
      selection: new Audio('/sound/bgm/selectionBgm.wav'),
      battle: new Audio('/sound/bgm/battleBgm.wav'),
    },
    general: {
      start: new Audio("/sound/general/pikaVoiceSe.mp3"),
      select: new Audio("/sound/general/selectSe.mp3"),
      decide: new Audio("/sound/general/decideSe.mp3"),
      cancel: new Audio("/sound/general/cancelSe.mp3"),
      back: new Audio("/sound/general/backSe.mp3"),
      win: new Audio("/sound/general/winSe.mp3"),
      lose: new Audio("/sound/general/loseSe.mp3"),
    },
    pokeVoice: {
      diaruga: new Audio('/sound/pokeVoice/diaruga.mp3'),
      parukia: new Audio('/sound/pokeVoice/parukia.mp3'),
      rukario: new Audio('/sound/pokeVoice/rukario.mp3'),
      pikachu: new Audio('/sound/pokeVoice/pikachu.wav'),
      genga: new Audio('/sound/pokeVoice/genga.wav'),
      rizadon: new Audio('/sound/pokeVoice/rizadon.wav'),
    },
    weapon: {
      beam1: new Audio('/sound/weapon/beam1.mp3'),
      slash1: new Audio('/sound/weapon/slash1.mp3'),
      electric1: new Audio('/sound/weapon/electric1.mp3'),
      fire1: new Audio('/sound/weapon/fire1.mp3'),
      ball1: new Audio('/sound/weapon/ball1.mp3')
    },
    damage: {
      batsugun: new Audio('/sound/damage/batsugun.mp3'),
      toubai: new Audio('/sound/damage/toubai.mp3'),
      imahitotsu: new Audio('/sound/damage/imahitotsu.mp3')
    }
  };

  //画像
  const pokeImgs = {
    diaruga: '/img/poke/diaruga.png',
    parukia: '/img/poke/parukia.png',
    rukario: '/img/poke/rukario.png',
    pikachu: '/img/poke/pikachu.png',
    genga: '/img/poke/genga.png',
    rizadon: '/img/poke/rizadon.png',
  };

  //ポケモン情報　画像,鳴き声,タイプ,能力値,技
  const pokeInfo = {
    ディアルガ: { img: pokeImgs.diaruga, voice: sounds.pokeVoice.diaruga, type1: "ドラゴン", type2: "はがね", speed: 110, weapon: "ときのほうこう" },
    パルキア: { img: pokeImgs.parukia, voice: sounds.pokeVoice.parukia, type1: "ドラゴン", type2: "みず", speed: 120, weapon: "あくうせつだん" },
    ルカリオ: { img: pokeImgs.rukario, voice: sounds.pokeVoice.rukario, type1: "かくとう", type2: "はがね", speed: 109, weapon: "はどうだん" },
    ピカチュウ: { img: pokeImgs.pikachu, voice: sounds.pokeVoice.pikachu, type1: "でんき", type2: "", speed: 111, weapon: "１０万ボルト" },
    リザードン: { img: pokeImgs.rizadon, voice: sounds.pokeVoice.rizadon, type1: "ほのお", type2: "ひこう", speed: 120, weapon: "かえんほうしゃ" },
    ゲンガー: { img: pokeImgs.genga, voice: sounds.pokeVoice.genga, type1: "ゴースト", type2: "どく", speed: 130, weapon: "シャドーボール" }
  };

  //技情報　タイプ,SE
  const weaponInfo = {
    ときのほうこう: { type: "ドラゴン", sound: sounds.weapon.beam1 },
    あくうせつだん: { type: "ドラゴン", sound: sounds.weapon.slash1 },
    はどうだん: { type: "かくとう", sound: sounds.weapon.ball1 },
    "１０万ボルト": { type: "でんき", sound: sounds.weapon.electric1 },
    かえんほうしゃ: { type: "ほのお", sound: sounds.weapon.fire1 },
    シャドーボール: { type: "ゴースト", sound: sounds.weapon.ball1 }
  }

  //技相性テキスト
  const compatiTexts = {
    batsugun: "効果はバツグンだ",
    toubai: "等倍ダメージ",
    imahitotsu: "効果はいまひとつのようだ",
    mukou: "効果がないようだ"
  }

  //タイプ相性表 
  const typeChart = {
    ノーマル: { いわ: 0.5, ゴースト: 0, はがね: 0.5 },
    ほのお: { ほのお: 0.5, みず: 0.5, くさ: 2, こおり: 2, むし: 2, いわ: 0.5, ドラゴン: 0.5, はがね: 2 },
    みず: { ほのお: 2, みず: 0.5, くさ: 0.5, じめん: 2, いわ: 2, ドラゴン: 0.5 },
    でんき: { みず: 2, でんき: 0.5, くさ: 0.5, じめん: 0, ひこう: 2, ドラゴン: 0.5 },
    くさ: { ほのお: 0.5, みず: 2, くさ: 0.5, どく: 0.5, じめん: 2, ひこう: 0.5, むし: 0.5, いわ: 2, ドラゴン: 0.5, はがね: 0.5 },
    かくとう: { ノーマル: 2, こおり: 2, どく: 0.5, ひこう: 0.5, エスパー: 0.5, むし: 0.5, いわ: 2, ゴースト: 0, あく: 2, はがね: 2, フェアリー: 0.5 },
    こおり: { ほのお: 0.5, みず: 0.5, くさ: 2, こおり: 0.5, じめん: 2, ひこう: 2, ドラゴン: 2, はがね: 0.5 },
    どく: { くさ: 2, どく: 0.5, じめん: 0.5, いわ: 0.5, ゴースト: 2, はがね: 0, フェアリー: 2 },
    じめん: { ほのお: 2, でんき: 2, くさ: 0.5, どく: 2, ひこう: 0, むし: 0.5, いわ: 2, はがね: 2 },
    ひこう: { でんき: 0.5, くさ: 2, かくとう: 2, むし: 2, いわ: 0.5, はがね: 0.5 },
    エスパー: { かくとう: 2, どく: 2, エスパー: 0.5, あく: 0, はがね: 0.5 },
    むし: { ほのお: 0.5, くさ: 2, かくとう: 0.5, どく: 0.5, ひこう: 0.5, エスパー: 2, ゴースト: 0.5, あく: 2, はがね: 0.5, フェアリー: 0.5 },
    いわ: { ほのお: 2, こおり: 2, かくとう: 0.5, じめん: 0.5, ひこう: 2, むし: 2, はがね: 0.5 },
    ゴースト: { ノーマル: 0, エスパー: 2, ゴースト: 2, あく: 0.5 },
    ドラゴン: { ドラゴン: 2, はがね: 0.5, フェアリー: 0 },
    あく: { かくとう: 0.5, エスパー: 2, ゴースト: 2, あく: 0.5, フェアリー: 0.5 },
    はがね: { ほのお: 0.5, みず: 0.5, でんき: 0.5, こおり: 2, いわ: 2, はがね: 0.5, フェアリー: 2 },
    フェアリー: { ほのお: 0.5, かくとう: 2, どく: 0.5, ドラゴン: 2, あく: 2, はがね: 0.5 }
  };

  // ダメージエフェクトのための配列
  const opacityChanges = [
    { opacity: "0", delay: 50 },
    { opacity: "1", delay: 100 },
    { opacity: "0", delay: 150 },
    { opacity: "1", delay: 200 },
    { opacity: "0", delay: 250 },
    { opacity: "1", delay: 300 },
    { opacity: "0", delay: 350 },
    { opacity: "1", delay: 400 }
  ];

  //useEffect==============================================================================================================================

  // 自分のポケモン名称がセットされたら、そのポケモンの画像をセット。
  useEffect(() => {
    if (!myPokeState.name) return;
    toDoWhenSetPokeName("my");
  }, [myPokeState.name]);

  //相手のポケモン名称がセットされたら、そのポケモンの画像をセット。
  useEffect(() => {
    if (!opPokeState.name) return;
    toDoWhenSetPokeName("op");
  }, [opPokeState.name]);

  // 自分の画像がセットされたら、表示制御
  useEffect(() => {
    if (!myPokeState.img) return;
    toDoWhenSetImg("my");
  }, [myPokeState.img]);

  // 相手の画像がセットされたら、表示制御
  useEffect(() => {
    toDoWhenSetImg("op");
  }, [opPokeState.img]);

  //自分の技名がセットされたら、相手の技名をセット
  useEffect(() => {
    if (!myPokeState.weapon) return;
    toDoWhenSetWeapon("my");
  }, [myPokeState.weapon]);

  //相手の技名がセットされたら、先攻後攻をセット
  useEffect(() => {
    if (!opPokeState.weapon) return;
    toDoWhenSetWeapon("op");
  }, [opPokeState.weapon]);

  //myWeaponのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myPokeStateTrigger.weapon == 0) return;
    toDoWhenSetWeapon("my");
  }, [myPokeStateTrigger.weapon]);

  //opWeaponのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (opPokeStateTrigger.weapon == 0) return;
    toDoWhenSetWeapon("op");
  }, [opPokeStateTrigger.weapon]);

  //先攻後攻がセットされたら、先攻の技をセット
  useEffect(() => {
    if (!myTurn) return;
    toDoWhenSetMyturn();
  }, [myTurn]);

  //myTurnのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myTurnTrigger == 0) return;
    toDoWhenSetMyturn();
  }, [myTurnTrigger]);

  //交代を選択したら、交代用のテキストをセット
  useEffect(() => {
    if (!skipTurn) return;
    const backText = `戻れ！${myPokeState.name}backText`;
    handleStateChange("myText", backText);
  }, [skipTurn]);

  //自分のテキストがセットされたら、テキストの種別によって処理を分岐する
  useEffect(() => {
    if (!myPokeState.text) return;
    toDoWhenSetText("my");
  }, [myPokeState.text]);

  //相手のテキストがセットされたら、テキストの種別によって処理を分岐する
  useEffect(() => {
    if (!opPokeState.text) return;
    toDoWhenSetText("op");
  }, [opPokeState.text]);

  //myTextのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myPokeStateTrigger.text == 0) return;
    toDoWhenSetText("my");
  }, [myPokeStateTrigger.text]);

  //opTextのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (opPokeStateTrigger.text == 0) return;
    toDoWhenSetText("op");
  }, [opPokeStateTrigger.text]);

  //自分のHPがセットされたら、残HPやターン状況で処理を分岐する
  useEffect(() => {
    if (myPokeState.name === "") return;
    toDoWhenSetHp("my");
  }, [myPokeState.hp]);

  //相手のHPがセットされたら、残HPやターン状況で処理を分岐する
  useEffect(() => {
    if (opPokeState.hp == 100) return;
    toDoWhenSetHp("op");
  }, [opPokeState.hp]);

  //myHpのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (myPokeStateTrigger.hp == 0) return;
    toDoWhenSetHp("my");
  }, [myPokeStateTrigger.hp]);

  //opHpのuseEffect強制発火用のトリガー
  useEffect(() => {
    if (opPokeStateTrigger.hp == 0) return;
    toDoWhenSetHp("op");
  }, [opPokeStateTrigger.hp]);

  //自分のライフがセットされたら、残りライフによって処理分岐
  useEffect(() => {
    toDoWhenSetLife("my");
  }, [myPokeState.life]);

  //相手のライフがセットされたら、残りライフによって処理分岐
  useEffect(() => {
    toDoWhenSetLife("op");
  }, [opPokeState.life]);

  //勝敗がセットされたらスタイルを付与
  useEffect(() => {
    if (resultText === "") return;
    setOtherAreaVisible(prev => ({ ...prev, battle: false }));
    playSe("gameResult");
  }, [resultText]);


  //クリックイベント===============================================================================================================

  // スタートボタン
  const start = () => {
    playSe("decide");
    playSe("start");
    setBgm(sounds.bgm.selection);

    sounds.general.start.onended = () => {
      setOtherAreaVisible(prev => ({ ...prev, top: false, isSelecting: true }));
      sounds.bgm.selection.play();
    };
  };

  //選出画面のポケモン押下時
  const handleSelect = (pokeName) => {
    playSe("select");
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
    playSe("decide");
    stopBgm();
    setBgm(sounds.bgm.battle);
    sounds.bgm.battle.play();

    setOtherAreaVisible(prev => ({ ...prev, isSelecting: false, battle: true }));

    //自分の選出順番をセットし、1番目のポケの名前をセット
    const [p1, p2, p3] = selectedOrder;
    Object.assign(myPokeState, { poke1Name: p1, poke2Name: p2, poke3Name: p3 });
    setMyPokeState(prev => ({ ...prev, name: p1 }));

    // 相手の選出順番をランダムに選び、1番目のポケの名前をセット
    const opCandidates = ["ディアルガ", "ゲンガー", "リザードン"]
      .map(name => ({ name, ...pokeInfo[name] }))
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const [o1, o2, o3] = opCandidates.map(p => p.name);
    Object.assign(opPokeState, { poke1Name: o1, poke2Name: o2, poke3Name: o3 });
    setOpPokeState(prev => ({ ...prev, name: o1 }));
  };

  //たたかうボタン押下時、コマンド表示を切り替える
  const openBattleCmdArea = () => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, weaponCmd: true }));
  };

  //交代ボタン押下時、コマンド表示を切り替える
  const openChangeCmdArea = () => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, changeCmd: true }));
  };

  // 戻るボタン押下時、コマンド表示を切り替える
  const backCmd = () => {
    playSe("cancel");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true, weaponCmd: false, changeCmd: false }));
  };

  //技名ボタン押下時、選択した技をセット
  const battle = (weaponName) => {
    playSe("decide");
    updateTurnCnt();
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: false }));
    handleStateChange("myWeapon", weaponName);
  };

  //〇〇に交代ボタン押下時、交代するポケモン名を保存し、交代フラグを立てる
  const changeMyPoke = (changePoke) => {
    playSe("decide");
    updateTurnCnt();
    console.log(`${changePoke}に交代を選択`);
    setOtherAreaVisible(prev => ({ ...prev, changeCmd: false }));
    changePokeName.current = changePoke;
    setSkipTurn(true);
  }

  //倒れた後、次に出すポケモンボタン押下時、次のポケモン名を保存し、HPをセット
  const nextMyPoke = (nextPoke) => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: false }));
    changePokeName.current = nextPoke;
    delay(() => setChangePokeHp(nextPoke), 1000);
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
    setIsMyAttacking(false);
    setIsOpAttacking(false);
    setSkipTurn(false);
    changePokeName.current = "";
    setResultText("");
  }

  //サウンド関係============================================================================================

  //指定したSEを再生
  const playSe = (kind) => {
    const seMap = {
      start: sounds.general.start,
      select: sounds.general.select,
      decide: sounds.general.decide,
      cancel: sounds.general.cancel,
      back: sounds.general.back,
      gameResult: resultText === "WIN" ? sounds.general.win
        : resultText === "LOSE" ? sounds.general.lose
          : null
    };
    const se = seMap[kind];
    se?.play().catch(e => console.error('効果音の再生に失敗:', e));
  };

  //ポケモンの鳴き声再生
  const playPokeVoice = (pokeName, onEnded) => {
    const voice = pokeInfo[pokeName].voice;
    voice.currentTime = 0;
    voice.onended = onEnded || null;
    voice.play().catch(e => {
      console.error('効果音の再生に失敗:', e);
      onEnded?.();
    });
  };

  //各技のSEを再生
  const playWeaponSound = (weaponName, onEnded) => {
    const sound = weaponInfo[weaponName].sound;
    sound.currentTime = 0;
    sound.onended = onEnded || null;
    sound.play().catch(e => {
      console.error('効果音の再生に失敗:', e);
      onEnded?.();
    });
  };

  //技相性にあったダメージSEを再生
  const playDamageSound = (who) => {
    const text = who === "my" ? myPokeState.text : opPokeState.text;
    const sound =
      text.includes(compatiTexts.batsugun) ? sounds.damage.batsugun :
        text.includes(compatiTexts.toubai) ? sounds.damage.toubai :
          text.includes(compatiTexts.imahitotsu) ? sounds.damage.imahitotsu :
            null;

    sound?.play().catch(e => console.error('効果音の再生に失敗:', e));
  };

  //BGM情報をセット
  const setBgm = (kind) => {
    kind.volume = 0.15;
    kind.loop = true;
    loopAudioRef.current = kind;
  }

  // BGMを止める
  const stopBgm = () => {
    if (loopAudioRef.current) {
      loopAudioRef.current.pause();
      loopAudioRef.current.currentTime = 0;
    }
  }

  //toDoWhen()==========================================================================================

  //ポケモンの名前がセットされたらGoTextをセット
  const toDoWhenSetPokeName = (who) => {
    const name = who === "my" ? myPokeState.name : opPokeState.name;
    const text = who === "my"
      ? `ゆけ！${name}！goText`
      : `相手は${name}をくりだした！goText`;
    handleStateChange(who === "my" ? "myText" : "opText", text);
  };

  //imgがセットされたら行う処理
  const toDoWhenSetImg = (who) => {
    if (who === "my") {
      //初回登場時と交代時、死亡後の次のポケモンを出すときの共通の表示制御
      showGoSequence(
        [setMyAreaVisible, setMyAreaVisible, playPokeVoice],
        myPokeState.name,
        1000
      );
      //初回登場時のみの表示制御
      if (!opAreaVisible.img) {
        showGoSequence(
          [setOpAreaVisible, setOpAreaVisible, playPokeVoice],
          opPokeState.name,
          3000
        );
        delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 5000);
      }
      //初回登場時以外の表示制御
      else if (!opAreaVisible.img || !skipTurn) {
        delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 3000);    //コマンドエリア表示
      }
      //交代エフェクトが終わったら、相手の技をセット
      else if (skipTurn) {
        const weaponName = pokeInfo[opPokeState.name].weapon;
        delay(() => handleStateChange("opWeapon", weaponName), 3000);
      }
    }
    //２体目以降の相手の画像がセットされたら表示制御
    else if (who === "op" && opPokeState.life < 3 && opPokeState.life > 0) {
      showGoSequence(
        [setOpAreaVisible, setOpAreaVisible, playPokeVoice],
        opPokeState.name,
        1000
      );
      delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 3000);
    }
  }

  //stateにweaponがセットされたときの処理
  const toDoWhenSetWeapon = (who) => {
    //自分の技がセットされたら、相手の技をセット
    if (who === "my") {
      handleStateChange("opWeapon", pokeInfo[opPokeState.name].weapon);
      //相手の技がセットされたら、先攻後攻を決める
    } else if (who === "op") {
      const mySpeed = pokeInfo[myPokeState.name].speed;
      const opSpeed = pokeInfo[opPokeState.name].speed;
      handleStateChange("myTurn", mySpeed > opSpeed && !skipTurn ? "first" : "after");
    }
  };

  //先攻後攻がセットされたら、先攻の技をセットする
  const toDoWhenSetMyturn = () => {
    if (myTurn === "first") {
      const text = `${myPokeState.name}！${myPokeState.weapon}！weaponText`;
      handleStateChange("myText", text);
    } else if (myTurn === "after") {
      const text = `相手の${opPokeState.name}の${opPokeState.weapon}weaponText`;
      handleStateChange("opText", text);
    }
  };

  // テキストがセットされたときの処理
  const toDoWhenSetText = (who) => {
    const isMy = who === "my";
    const state = isMy ? myPokeState : opPokeState;
    const setState = isMy ? setMyPokeState : setOpPokeState;

    const includes = (text) => state.text.includes(text);
    const getImg = () => pokeInfo[state.name].img;

    //攻撃倍率によって相性テキストを返す
    const makeCompatiText = (multiplier) => (
      multiplier >= 2 ? compatiTexts.batsugun :
        multiplier === 1 ? compatiTexts.toubai :
          multiplier > 0 ? compatiTexts.imahitotsu :
            compatiTexts.mukou
    );

    const setCompatiText = () => {
      const attacker = isMy ? myPokeState.name : opPokeState.name;
      const defender = isMy ? opPokeState.name : myPokeState.name;
      const textKey = isMy ? "opText" : "myText";

      const attackType = weaponInfo[pokeInfo[attacker].weapon].type;
      const [defType1, defType2] = [pokeInfo[defender].type1, pokeInfo[defender].type2];
      const multiplier = (typeChart[attackType][defType1] ?? 1) * (typeChart[attackType][defType2] ?? 1);
      const text = makeCompatiText(multiplier) + "compatiText" + multiplier;
      handleStateChange(textKey, text);
    };

    //画像を取得して死亡エフェクトのスタイルを付与する
    const deadEffect = (who) => {
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: false }));
      setSkipTurn(false);

      const isMy = who === "my";
      const pokeState = isMy ? myPokeState : opPokeState;
      const setAreaVisible = isMy ? setMyAreaVisible : setOpAreaVisible;
      const setPokeState = isMy ? setMyPokeState : setOpPokeState;
      const imgClass = isMy ? ".my-poke-img" : ".op-poke-img";

      const pokeIMGElm = document.querySelector(imgClass);

      setTimeout(() => {
        setOtherAreaVisible(prev => ({ ...prev, text: true }));
        setAreaVisible(prev => ({ ...prev, text: true, name: false, hp: false }));
        playPokeVoice(pokeState.name);
        pokeIMGElm.classList.add("pokemon-dead");
      }, 1000);

      setTimeout(() => {
        setOtherAreaVisible(prev => ({ ...prev, text: false }));
        setAreaVisible(prev => ({ ...prev, text: false, img: false }));
        setPokeState(prev => ({ ...prev, life: pokeState.life - 1 }));
      }, 3001);
    };

    // --- テキスト内容に応じた分岐処理 ---

    if (includes("goText")) {
      // 登場時に画像をセット
      setState(prev => ({ ...prev, img: getImg() }));

    } else if (includes("backText") && isMy) {
      // 自分が交代するとき
      playSe("back");
      setOtherAreaVisible(p => ({ ...p, text: true }));
      setMyAreaVisible(p => ({ ...p, text: true }));

      setTimeout(() => {
        setMyAreaVisible(p => ({ ...p, img: false, name: false, hp: false }));
        saveHp("my");
        setChangePokeHp(changePokeName.current);
      }, 1000);

    } else if (includes("weaponText")) {
      // 攻撃テキストのあとに相性テキストを表示
      setCompatiText();

    } else if (includes("compatiText")) {
      // 相性テキストのあとにダメージ計算
      const match = state.text.match(/(\d+(\.\d+)?)/);
      const multiplier = match ? Number(match[0]) : 1;
      const damage = 50 * multiplier;   //ダメージ計算  攻撃力は50で固定

      console.log(`${isMy ? "自分" : "相手"}に${damage}ダメージ（50*${multiplier}）`);
      toDoWhenSetDamage(who, damage);

    } else if (includes("deadText")) {
      // 倒されたときの処理
      deadEffect(who);
    }
  };

  //ダメージ数がセットされたとき、技名表示＆鳴き声→攻撃エフェクト＆SE→ダメージエフェクト
  const toDoWhenSetDamage = (who, damagePt) => {

    //攻撃エフェクト
    const attackEffect = (who) => {
      const setAttack = who === "my" ? setIsMyAttacking : setIsOpAttacking;
      setAttack(true);
      delay(() => setAttack(false), 500);
    };

    //ダメージエフェクトとダメージの反映
    const damageEffect = (who, damagePt) => {
      const isMy = who === "my";
      const pokeState = isMy ? myPokeState : opPokeState;
      const setAreaVisible = isMy ? setMyAreaVisible : setOpAreaVisible;
      const setOtherTextInvisible = isMy ? setOpAreaVisible : setMyAreaVisible;
      const hpKey = isMy ? "myHp" : "opHp";
      const imgClass = isMy ? ".my-poke-img" : ".op-poke-img";

      setOtherTextInvisible(prev => ({ ...prev, text: false }));
      //相性が等倍ならテキストエリアは表示しない
      if (pokeState.text.includes(compatiTexts.toubai)) {
        setOtherAreaVisible(prev => ({ ...prev, text: false }));
      }

      setAreaVisible(prev => ({ ...prev, text: true }));
      const compatiText = pokeState.text;
      const pokeIMGElem = document.querySelector(imgClass);
      const newHp = Math.max(0, pokeState.hp - damagePt);
      handleStateChange(hpKey, newHp);

      //ダメージエフェクトを入れる（技相性が無効の場合を除く）
      if (pokeIMGElem && !compatiText.includes(compatiTexts.mukou)) {
        opacityChanges.forEach(({ opacity, delay }) =>
          setTimeout(() => {
            pokeIMGElem.style.opacity = opacity;
          }, delay)
        );
      }
    };

    const playAndHandleDamage = (attacker, attackTarget, damageTarget, damage) => {
      playPokeVoice(attacker.name, () => {
        attackEffect(attackTarget);
        playWeaponSound(attacker.weapon, () => {
          damageEffect(damageTarget, damage);
          if (!attacker.text.includes(compatiTexts.mukou)) {
            playDamageSound(damageTarget);
          }
        });
      });
    };

    if (who === "my") {
      setOtherAreaVisible(prev => ({ ...prev, text: true }));
      setOpAreaVisible(prev => ({ ...prev, text: true }));
      playAndHandleDamage(opPokeState, "op", "my", damagePt);
    } else if (who === "op") {
      setOtherAreaVisible(prev => ({ ...prev, text: true }));
      setMyAreaVisible(prev => ({ ...prev, text: true }));
      playAndHandleDamage(myPokeState, "my", "op", damagePt);
    }
  };

  //HPがセットされた時の処理
  const toDoWhenSetHp = (who) => {
    setTimeout(() => {
      setOtherAreaVisible(prev => ({ ...prev, text: false }));
      if (who === "my") setMyAreaVisible(prev => ({ ...prev, text: false }));
      if (who === "op") setOpAreaVisible(prev => ({ ...prev, text: false }));

      const pokeState = who === "my" ? myPokeState : opPokeState;
      const setText = (text) => handleStateChange(who === "my" ? "myText" : "opText", text);

      if (who === "my" && myPokeState.name !== changePokeName.current && changePokeName.current !== "") {
        setMyPokeState(prev => ({ ...prev, name: changePokeName.current }));
      } else if (pokeState.hp > 0) {
        saveHp(who);
        setTimeout(() => {
          if (who === "my") {
            //交代したターンはターン終了
            if (skipTurn) {
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
              setSkipTurn(false);
              //先攻ならターン終了
            } else if (myTurn === "first") {
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
              //後攻なら自分の技テキストをセット
            } else if (myTurn === "after") {
              setText(`${myPokeState.name}！${myPokeState.weapon}！weaponText`);
            }
          } else {
            //後攻ならターン終了
            if (myTurn === "after") {
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
              //選考なら相手の技テキストをセット
            } else if (myTurn === "first") {
              setText(`相手の${opPokeState.name}の${opPokeState.weapon}weaponText`);
            }
          }
        }, 1000);
        //死亡時は死亡テキストをセット
      } else {
        saveHp(who);
        const name = who === "my" ? myPokeState.name : opPokeState.name;
        setText(`${who === "my" ? "" : "相手の"}${name}は倒れたdeadText`);
      }
    }, 2000);
  };

  //ライフがセットされたときの処理
  const toDoWhenSetLife = (who) => {

    //勝敗を表示する
    const setWinner = (who) => {
      stopBgm();
      const text = who === "my" ? "WIN" : "LOSE";
      setResultText(text);
    };

    const setNextPokeOrWinner = (pokeState, isMy) => {
      if (isMy) {
        //残ライフが2か1なら、次のポケモンの選択コマンドを表示
        if (pokeState.life < 3 && pokeState.life > 0) setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: true }));
        //残ライフ0なら負け
        else if (pokeState.life <= 0) setWinner("op");
        //
      } else {
        //残ライフが2か1なら、次のポケモンをセット
        if (pokeState.life === 2) setOpPokeState(prev => ({ ...prev, name: pokeState.poke2Name, hp: 100 }));
        else if (pokeState.life === 1) setOpPokeState(prev => ({ ...prev, name: pokeState.poke3Name, hp: 100 }));
        //残ライフ0なら負け
        else if (pokeState.life <= 0) setWinner("my");
      }
    };

    if (who === "my") setNextPokeOrWinner(myPokeState, true);
    else if (who === "op") setNextPokeOrWinner(opPokeState, false);
  };


  //複数の呼び出し先がある関数=================================================================================

  //Stateに同じ値がセットされたときにトリガーを更新して、強制的にuseEffectを発火させる
  const handleStateChange = (stateName, newState) => {
    const updateState = (setter, triggerSetter, key) => {
      setter(prev => {
        if (prev[key] === newState) {
          console.log(`トリガー更新：${stateName}は変わらず「${newState}」`);
          triggerSetter(prev => ({ ...prev, [key]: prev[key] + 1 }));
          return prev;
        } else {
          console.log(`${stateName}を「${newState}」に更新する`);
          return { ...prev, [key]: newState };
        }
      });
    };

    const cases = {
      myWeapon: () => updateState(setMyPokeState, setMyPokeStateTrigger, "weapon"),
      myText: () => updateState(setMyPokeState, setMyPokeStateTrigger, "text"),
      myHp: () => updateState(setMyPokeState, setMyPokeStateTrigger, "hp"),
      myTurn: () => {
        setMyTurn(prev => {
          if (prev === newState) {
            console.log(`トリガー更新：${stateName}は変わらず「${newState}」`);
            setMyTurnTrigger(t => t + 1);
            return prev;
          } else {
            console.log(`${stateName}を「${newState}」に更新する`);
            return newState;
          }
        });
      },
      opWeapon: () => updateState(setOpPokeState, setOpPokeStateTrigger, "weapon"),
      opText: () => updateState(setOpPokeState, setOpPokeStateTrigger, "text"),
      opHp: () => updateState(setOpPokeState, setOpPokeStateTrigger, "hp"),
    };

    cases[stateName]?.();
  };

  //toDoWhenSetImg()の共通部品
  const showGoSequence = (areaSetters, name, delayBase) => {
    const [setTextVisible, setMainVisible, playVoice] = areaSetters;
    delay(() => setOtherAreaVisible(prev => ({ ...prev, text: true })), delayBase);
    delay(() => setTextVisible(prev => ({ ...prev, text: true })), delayBase);
    delay(() => setMainVisible(prev => ({ ...prev, img: true, name: true, hp: true })), delayBase + 1000);
    delay(() => playPokeVoice(name), delayBase + 1000);
    delay(() => setOtherAreaVisible(prev => ({ ...prev, text: false })), delayBase + 2000);
    delay(() => setTextVisible(prev => ({ ...prev, text: false })), delayBase + 2000);
  };

  //残りHPを保存
  const saveHp = (who) => {
    const state = who === "my" ? myPokeState : opPokeState;
    const hpKey = ["poke1Name", "poke2Name", "poke3Name"]
      .find(key => state[key] === state.name)
      ?.replace("Name", "Hp");

    if (hpKey) state[hpKey] = state.hp;
  };

  //交代時に出すポケモンに保存されたHPをセットする
  const setChangePokeHp = (changePoke) => {
    const hpKey = ["poke1Name", "poke2Name", "poke3Name"]
      .find(key => myPokeState[key] === changePoke)
      ?.replace("Name", "Hp");

    if (hpKey) handleStateChange("myHp", myPokeState[hpKey]);
  };

  //setTimeout()の簡略化
  const delay = (fn, ms) => setTimeout(fn, ms);

  //ターン数を更新してコンソールに表示する。（デバッグ用）
  const updateTurnCnt = () => {
    console.log(turnCnt.current + "ターン目================================================");
    turnCnt.current++;
  }

  //textから余計な文字を取り除く（UI表示用）
  const getTrueText = (text) => {
    const tags = ["goText", "backText", "weaponText", "compatiText", "deadText"];
    const index = tags.find(tag => text.includes(tag));
    let trueText = index ? text.slice(0, text.indexOf(index)) : text;
    return trueText === compatiTexts.toubai ? "" : trueText;
  };

  //HTML==========================================================================================================================
  return (
    <div className="App">
      <header className="App-header">
        {otherAreaVisible.top && <TopScreen onStart={start} />}
        {otherAreaVisible.isSelecting && (
          <div className="select-area">
            <div className="content">
              <h2>相手のポケモン</h2>
              <div className="op-poke-select">
                <div className="poke-preview">
                  <img src={pokeImgs.diaruga} alt="ディアルガ" />
                  <p>ディアルガ</p>
                </div>
                <div className="poke-preview">
                  <img src={pokeImgs.genga} alt="ゲンガー" />
                  <p>ゲンガー</p>
                </div>
                <div className="poke-preview">
                  <img src={pokeImgs.rizadon} alt="リザードン" />
                  <p>リザードン</p>
                </div>
              </div>

              <h2>自分のポケモンを選出</h2>
              <div className="my-poke-select">
                {[{ name: "パルキア", img: pokeImgs.parukia }, { name: "ルカリオ", img: pokeImgs.rukario }, { name: "ピカチュウ", img: pokeImgs.pikachu }].map((poke) => (
                  <div
                    key={poke.name}
                    className={`poke-option ${selectedOrder.includes(poke.name) ? "selected" : ""}`}
                    onClick={() => handleSelect(poke.name)}
                  >
                    <img src={poke.img} alt={poke.name} />
                    <p>{poke.name}</p>
                    <p className="order-num">{selectedOrder.includes(poke.name) && <span>{selectedOrder.indexOf(poke.name) + 1}番目</span>}</p>
                  </div>
                ))}
              </div>
              <div className="select-actions">
                <button
                  className={selectedOrder.length === 3 ? "active" : "inactive"}
                  onClick={confirmSelection}
                  disabled={selectedOrder.length !== 3}
                >バトル開始！</button>
              </div>
            </div>
          </div>
        )}
        {otherAreaVisible.battle && (
          <div className="battle-area-wrap">
            <div className="battle-area" style={{ display: "flex" }}>
              <div className="op-poke-area-wrap">
                <div className="op-poke-area">
                  <div className="poke-ground"></div>
                  <AnimatePresence>
                    {opAreaVisible.img && (
                      <motion.img
                        key="opPokeImg"
                        src={opPokeState.img}
                        alt="相手のポケモン"
                        className="op-poke-img"
                        initial={{ clipPath: "circle(0% at 50% 50%)" }}
                        animate={{
                          clipPath: "circle(75% at 50% 50%)",
                          ...(isOpAttacking && {
                            x: [0, 50, 0],
                            rotate: [0, 30, 0],
                          }),
                        }}
                        exit={{ clipPath: "circle(0% at 50% 50%)" }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                {opAreaVisible.name && opAreaVisible.hp && (
                  <div className="status-box">
                    <div className="status-header">
                      <h1 className="op-poke">{opPokeState.name}</h1>
                      <div className="poke-indicators">
                        {[opPokeState.poke1Hp, opPokeState.poke2Hp, opPokeState.poke3Hp].map((hp, index) => {
                          let color = "gray";
                          if (hp === 100) color = "green";
                          else if (hp > 0) color = "yellow";
                          return <div key={index} className={`poke-circle ${color}`}></div>;
                        })}
                      </div>
                    </div>
                    <div className="op-hp-container">
                      <div
                        className={`op-hp-bar ${opPokeState.hp <= 25 ? "low" : opPokeState.hp <= 50 ? "mid" : ""
                          }`}
                        style={{ width: `${opPokeState.hp}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="my-poke-area-wrap">
                <div className="my-poke-area">
                  <div className="poke-ground"></div>
                  <AnimatePresence>
                    {myAreaVisible.img && (
                      <motion.img
                        key="myPokeImg"
                        src={myPokeState.img}
                        alt="自分のポケモン"
                        className="my-poke-img"
                        initial={{ clipPath: "circle(0% at 50% 50%)" }}
                        animate={{
                          clipPath: "circle(75% at 50% 50%)",
                          ...(isMyAttacking && {
                            x: [0, -50, 0],
                            rotate: [0, -30, 0],
                          }),
                        }}
                        exit={{ clipPath: "circle(0% at 50% 50%)" }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                {myAreaVisible.name && myAreaVisible.hp && (
                  <div className="status-box">
                    <div className="status-header">
                      <h1 className="my-poke">{myPokeState.name}</h1>
                      <div className="poke-indicators">
                        {[myPokeState.poke1Hp, myPokeState.poke2Hp, myPokeState.poke3Hp].map((hp, index) => {
                          let color = "gray";
                          if (hp === 100) color = "green";
                          else if (hp > 0) color = "yellow";
                          return <div key={index} className={`poke-circle ${color}`}></div>;
                        })}
                      </div>
                    </div>
                    <div className="my-hp-container">
                      <div
                        className={`my-hp-bar ${myPokeState.hp <= 25 ? "low" : myPokeState.hp <= 50 ? "mid" : ""
                          }`}
                        style={{ width: `${myPokeState.hp}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="cmd-text-area">
              {otherAreaVisible.text && (
                <div className="text-area">
                  {opAreaVisible.text && (<p>{getTrueText(opPokeState.text)}</p>)}
                  {myAreaVisible.text && (<p>{getTrueText(myPokeState.text)}</p>)}
                </div>
              )}
              {otherAreaVisible.actionCmd && (
                <div className="cmd-area">
                  <button className="weapon-cmd-btn" onClick={openBattleCmdArea}>たたかう</button>
                  {myPokeState.life != 1 && <button className="change-cmd-btn" onClick={openChangeCmdArea}>交代</button>}
                </div>
              )}
              {otherAreaVisible.weaponCmd && (
                <div className="cmd-area">
                  <button className="weapon-cmd-btn" onClick={() => battle(pokeInfo[myPokeState.name].weapon)}>{pokeInfo[myPokeState.name].weapon}</button>
                  <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
                </div>
              )}
              {otherAreaVisible.changeCmd && (
                <div className="cmd-area">
                  {myPokeState.name !== myPokeState.poke1Name && myPokeState.poke1Hp > 0 && <button className="change-cmd-btn" onClick={() => changeMyPoke(myPokeState.poke1Name)}>{myPokeState.poke1Name}</button>}
                  {myPokeState.name !== myPokeState.poke2Name && myPokeState.poke2Hp > 0 && <button className="change-cmd-btn" onClick={() => changeMyPoke(myPokeState.poke2Name)}>{myPokeState.poke2Name}</button>}
                  {myPokeState.name !== myPokeState.poke3Name && myPokeState.poke3Hp > 0 && <button className="change-cmd-btn" onClick={() => changeMyPoke(myPokeState.poke3Name)}>{myPokeState.poke3Name}</button>}
                  <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
                </div>
              )}
              {otherAreaVisible.nextPokeCmd && (
                <div className="cmd-area">
                  {myPokeState.name !== myPokeState.poke1Name && myPokeState.poke1Hp > 0 && <button className="change-cmd-btn" onClick={() => nextMyPoke(myPokeState.poke1Name)}>{myPokeState.poke1Name}</button>}
                  {myPokeState.name !== myPokeState.poke2Name && myPokeState.poke2Hp > 0 && <button className="change-cmd-btn" onClick={() => nextMyPoke(myPokeState.poke2Name)}>{myPokeState.poke2Name}</button>}
                  {myPokeState.name !== myPokeState.poke3Name && myPokeState.poke3Hp > 0 && <button className="change-cmd-btn" onClick={() => nextMyPoke(myPokeState.poke3Name)}>{myPokeState.poke3Name}</button>}
                </div>
              )}
            </div>
          </div>
        )}
        {!otherAreaVisible.top && !otherAreaVisible.isSelecting && !otherAreaVisible.battle && (
          <div className={`result-screen ${resultText === "WIN" ? "win" : "lose"}`}>
            <h1>{resultText}</h1>
            <button onClick={goTop}>トップへ</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;