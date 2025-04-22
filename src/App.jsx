import "./App.css";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

function App() {
  //state=============================================================================================================================

  //自分と相手のポケモン関係の表示制御
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
    start: true,
    isSelecting: false,   //選出画面
    battle: false,
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
  const result = useRef("");  //勝敗を格納する

  //一般変数========================================================================================================================================

  const sounds = {
    bgm: {
      selection: new Audio('/sound/bgm/selectionBgm.wav'),
      battle: new Audio('/sound/bgm/battleBgm.wav'),
    },
    general: {
      start: new Audio("/sound/general/pikaVoiceSe.mp3"),
      selection: new Audio("/sound/general/selectionSe.mp3"),
      decide: new Audio("/sound/general/decideSe.mp3"),
      cancel: new Audio("/sound/general/cancelSe.mp3"),
      win: new Audio("/sound/general/winSe.mp3"),
      lose: new Audio("/sound/general/loseSe.mp3"),
    },
    pokeVoice:{
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

  //ポケモン情報
  const pokeInfo = {
    ディアルガ: {img: pokeImgs.diaruga, voice: sounds.pokeVoice.diaruga, type1: "ドラゴン", type2: "はがね", speed: 110, weapon: "ときのほうこう"},
    パルキア: {img: pokeImgs.parukia, voice: sounds.pokeVoice.parukia, type1: "ドラゴン", type2: "みず", speed: 120, weapon: "あくうせつだん"},
    ルカリオ: {img: pokeImgs.rukario, voice: sounds.pokeVoice.rukario, type1: "かくとう", type2: "はがね", speed: 109, weapon: "はどうだん"},
    ピカチュウ: {img: pokeImgs.pikachu, voice: sounds.pokeVoice.pikachu, type1: "でんき", type2: "", speed: 111, weapon: "１０万ボルト"},
    リザードン: {img: pokeImgs.rizadon, voice: sounds.pokeVoice.rizadon, type1: "ほのお", type2: "ひこう", speed: 120, weapon: "かえんほうしゃ"},
    ゲンガー: {img: pokeImgs.genga, voice: sounds.pokeVoice.genga, type1: "ゴースト", type2: "どく", speed: 130, weapon: "シャドーボール"}
  };

  //技
  const weaponInfo = {
    ときのほうこう: {type: "ドラゴン", sound: sounds.weapon.beam1 },
    あくうせつだん: {type: "ドラゴン", sound: sounds.weapon.slash1 },
    はどうだん: {type: "かくとう", sound: sounds.weapon.ball1 },
    "１０万ボルト": {type: "でんき", sound: sounds.weapon.electric1 },
    かえんほうしゃ: {type: "ほのお", sound: sounds.weapon.fire1 },
    シャドーボール: {type: "ゴースト", sound: sounds.weapon.ball1 }
  }

  //技相性テキスト
  const compatiTexts = {
    batsugun: "効果はバツグン",
    toubai: "等倍ダメージ",
    imahitotsu: "効果はいまひとつ",
    mukou: "効果がない"
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
    if(!myPokeState.name) return;
    toDoWhenSetPokeName("my");
  }, [myPokeState.name]);  

  //相手のポケモン名称がセットされたら、そのポケモンの画像をセット。
  useEffect(() => {
    if(!opPokeState.name) return;
    toDoWhenSetPokeName("op");
  }, [opPokeState.name]);

  // 自分の画像がセットされたら、表示制御
  useEffect(() => {
    if(!myPokeState.img) return;
    toDoWhenSetImg("my");
  }, [myPokeState.img]);  

  // 相手の画像がセットされたら、表示制御
  useEffect(() => {
    toDoWhenSetImg("op");
  }, [opPokeState.img]);  

  //自分の技名がセットされたら、相手の技名をセット
  useEffect(() => {
    if(!myPokeState.weapon) return;
    toDoWhenSetWeapon("my");
  }, [myPokeState.weapon]);

  //相手の技名がセットされたら、先攻後攻をセット
  useEffect(() => {
    if(!opPokeState.weapon) return;
    toDoWhenSetWeapon("op");
  }, [opPokeState.weapon]);

  //myWeaponのuseEffect強制発火用のトリガー
  useEffect(() => {
    if(myPokeStateTrigger.weapon == 0) return;
    toDoWhenSetWeapon("my");
  }, [myPokeStateTrigger.weapon]);

  //opWeaponのuseEffect強制発火用のトリガー
  useEffect(() => {
    if(opPokeStateTrigger.weapon == 0) return;
    toDoWhenSetWeapon("op");
  }, [opPokeStateTrigger.weapon]);

  //先攻後攻がセットされたら、先攻の技をセット
  useEffect(() => {
    if(!myTurn) return;
    toDoWhenSetMyturn();
  }, [myTurn]);

  //myTurnのuseEffect強制発火用のトリガー
  useEffect(() => {
    if(myTurnTrigger == 0) return;
    toDoWhenSetMyturn();
  }, [myTurnTrigger]);

  //交代を選択したら、交代用のテキストをセット
  useEffect(() => {
    if (!skipTurn) return;
    let backText = "戻れ！" + myPokeState.name + "backText";
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
    if(myPokeStateTrigger.text == 0) return;
    toDoWhenSetText("my");
  }, [myPokeStateTrigger.text]);

  //opTextのuseEffect強制発火用のトリガー
  useEffect(() => {
    if(opPokeStateTrigger.text == 0) return;
    toDoWhenSetText("op");
  }, [opPokeStateTrigger.text]);

  //自分のHPがセットされたら、残HPやターン状況で処理を分岐する
  useEffect(() => {
    if(myPokeState.name === "") return;
    toDoWhenSetHp("my");
  }, [myPokeState.hp]);

  //相手のHPがセットされたら、残HPやターン状況で処理を分岐する
  useEffect(() => {
    if(opPokeState.hp == 100) return;
    toDoWhenSetHp("op");
  }, [opPokeState.hp]); 

  //myHpのuseEffect強制発火用のトリガー
  useEffect(() => {
    if(myPokeStateTrigger.hp == 0) return;
    toDoWhenSetHp("my");
  }, [myPokeStateTrigger.hp]);

  //opHpのuseEffect強制発火用のトリガー
  useEffect(() => {
    if(opPokeStateTrigger.hp == 0) return;
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


  //クリックイベント===============================================================================================================

  // スタートボタン
  const start = () => {
    playSe("decide");   //SE再生
    playSe("start");
    setBgm(sounds.bgm.selection);   //選出BGMをセット

    //スタートSEが終わったら、画面を切り替えて、BGMを再生
    sounds.general.start.addEventListener('ended', () => {
      setOtherAreaVisible(prev => ({ ...prev, start: false, isSelecting: true }));
      sounds.bgm.selection.play();
    });
  };

  //選出確定ボタン
  const confirmSelection = () => {
    playSe("decide");
    stopBgm();
    setBgm(sounds.bgm.battle);
    sounds.bgm.battle.play();

    // 選出画面非表示、バトル画面表示
    setOtherAreaVisible(prev => ({ ...prev, isSelecting: false, battle: true}));

    //自分の選出順番をセットし、1番目のポケの名前をセット
    myPokeState.poke1Name = selectedOrder[0];
    myPokeState.poke2Name = selectedOrder[1];
    myPokeState.poke3Name = selectedOrder[2];
    setMyPokeState(prev => ({...prev, name: selectedOrder[0]}));

    // 相手のポケモンを3体からランダムに選ぶ処理を追加
    const selectedNames = ["ディアルガ", "ゲンガー", "リザードン"];
    const selectedThree = selectedNames.map(name => ({
      name,
      ...pokeInfo[name]
    }));
    const shuffled = [...selectedThree].sort(() => 0.5 - Math.random());
    const selectedOpPokemons = shuffled.slice(0, 3); // ランダムに3体選ぶ

    //相手の選出順番をセットし、1番目のポケの名前をセット
    opPokeState.poke1Name = selectedOpPokemons[0].name;
    opPokeState.poke2Name = selectedOpPokemons[1].name;
    opPokeState.poke3Name = selectedOpPokemons[2].name;
    setOpPokeState(prev => ({...prev, name: opPokeState.poke1Name}));
  };
  
  //たたかうボタン
  const openBattleCmdArea = () => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, weaponCmd: true}));
  };

  //交代ボタン
  const openChangeCmdArea = () => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, changeCmd: true}));
  };

  // 戻るボタン
  const backCmd = () => {
    playSe("cancel");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true, weaponCmd: false, changeCmd: false}));
  };

  //技名ボタン
  const battle = (weaponName) => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: false}));
    updateTurnCnt();    //ターン数の更新
    handleStateChange("myWeapon", weaponName);    //自分の技をセット
  };

  //〇〇に交代ボタン
  const changeMyPoke = (changePoke) => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, changeCmd: false}));
    updateTurnCnt();    //ターン数の更新
    changePokeName.current = changePoke;    //交代するポケモンの名前を保存する。
    console.log(changePoke + "に交代を選択");
    setSkipTurn(true); // 交代フラグを立てる
  }

  //倒れた後、次に出すポケモンボタン
  const nextMyPoke = (nextPoke) => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: false}));
    changePokeName.current = nextPoke;    //交代するポケモンを保存
    delay(() => setChangePokeHp(nextPoke), 1000);    //次に出すポケモンにHPをセット
  }


  //サウンド関係============================================================================================
 
  //指定したSEを再生
  const playSe = (kind) => {
    let se = "";
    if(kind === "start"){
      se = sounds.general.start;
    }
    else if(kind === "selection"){
      se = sounds.general.selection;
    }
    else if(kind === "decide"){
      se = sounds.general.decide;
    }
    else if(kind === "cancel"){
      se = sounds.general.cancel;
    }
    else if(kind === "gameResult"){
      if(result.current === "WIN"){
        se = sounds.general.win;
      }
      else if(result.current === "LOSE"){
        se = sounds.general.lose;
      }
    }
    se.play().catch((e) => console.error('効果音の再生に失敗:', e));
  }

  //ポケモンの鳴き声再生
  const playPokeVoice = (pokeName, onEnded) => {
    const pokeVoice = pokeInfo[pokeName].voice;
    pokeVoice.currentTime = 0; // 再生位置を先頭にリセット（連続再生対策）
    pokeVoice.play()
      .then(() => {
        if (onEnded) {
          pokeVoice.onended = onEnded;
        }
      })
      .catch((e) => {
        console.error('効果音の再生に失敗:', e);
        onEnded?.(); // エラー時も攻撃エフェクト実行しておく
      });
  };

  //各技のSEを再生
  const playWeaponSound = (weaponName, onEnded) => {
    const weaponSound = weaponInfo[weaponName].sound;
    weaponSound.currentTime = 0; // 再生位置を先頭にリセット（連続再生対策）
    weaponSound.play()
      .then(() => {
        if (onEnded) {
          weaponSound.onended = onEnded;
        }
      })
      .catch((e) => {
        console.error('効果音の再生に失敗:', e);
        onEnded?.(); // エラー時も攻撃エフェクト実行しておく
      });
  };

  //技相性にあったダメージSEを再生
  const playDamageSound = (who) => {
    let compatiText = "";
    let damageSound = "";

    //技相性テキストを取得する
    if(who === "my"){
      compatiText = myPokeState.text;
    }
    else if(who === "op"){
      compatiText = opPokeState.text;
    }

    //技相性テキストに合った、サウンドをセットする
    if(compatiText.includes(compatiTexts.batsugun)){
      damageSound = sounds.damage.batsugun;
    }
    else if(compatiText.includes(compatiTexts.toubai)){
      damageSound = sounds.damage.toubai;
    }
    else if(compatiText.includes(compatiTexts.imahitotsu)){
      damageSound = sounds.damage.imahitotsu;
    }

    damageSound.play().catch((e) => {console.error('効果音の再生に失敗:', e);});
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
    let goText = "";
    if(who === "my"){
      goText = "ゆけ！" + myPokeState.name + "！" + "goText";
      handleStateChange("myText", goText);
    }
    else if (who === "op"){
      goText = "ゆけ！" + opPokeState.name + "！" + "goText";
      handleStateChange("opText", goText);
    }
  }

  //imgがセットされたら行う処理
  const toDoWhenSetImg = (who) => {
    if (who === "my"){
      //初回登場時と交代時、死亡後の次のポケモンを出すときの共通の表示制御
      delay(() => setMyAreaVisible(prev => ({ ...prev, text: true })), 1000);   //自分のGoテキストを表示
      delay(() => setMyAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true })), 2000);    //自分のポケ画像を表示
      delay(() => playPokeVoice(myPokeState.name), 2000);    //鳴き声再生
      
      delay(() => setMyAreaVisible(prev => ({ ...prev, text: false })), 3000);    //自分のGoテキストを非表示
      //初回登場時のみの表示制御
      if(!opAreaVisible.img){
        delay(() => setOpAreaVisible(prev => ({ ...prev, text: true })), 3000);   //相手のGoテキストを表示
        delay(() => setOpAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true })), 4000);    //相手のポケ画像を表示
        delay(() => playPokeVoice(opPokeState.name), 4000);    //鳴き声再生
        delay(() => setOpAreaVisible(prev => ({ ...prev, text: false })), 5000);   //相手のGoテキストを非表示
        delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true})), 5000);    //コマンドエリア表示
      }
      //初回登場時以外の表示制御
      else if(!opAreaVisible.img || !skipTurn){
        delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true})), 3000);    //コマンドエリア表示
      }
      //交代エフェクトが終わったら、相手の技をセット
      else if(skipTurn){
        let weaponName = pokeInfo[opPokeState.name].weapon;
        // let weaponName = pokeInfo.find(poke => poke.name === opPokeState.name).weapon;
        delay(() => handleStateChange("opWeapon",weaponName), 3000);
      }
    }
    //２体目以降の相手の画像がセットされたら表示制御
    else if (who === "op"){
      if(opPokeState.life < 3 && opPokeState.life > 0){
        delay(() => setOpAreaVisible(prev => ({ ...prev, text: true })), 1000);   //相手のGoテキストを表示
        delay(() => setOpAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true })), 2000);    //相手のポケ画像を表示
        delay(() => playPokeVoice(opPokeState.name), 2000);    //鳴き声再生
        delay(() => setOpAreaVisible(prev => ({ ...prev, text: false })), 3000);   //相手のGoテキストを非表示
        delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true})), 3000);   //アクションコマンドを表示
      }
    }
  }

  //stateにweaponがセットされたときの処理
  const toDoWhenSetWeapon = (who) => {
    //自分の技がセットされたら、相手の技をセット
    if(who === "my"){
      let weaponName = pokeInfo[opPokeState.name].weapon;
      handleStateChange("opWeapon", weaponName);
    }
    //相手の技がセットされたら、先攻後攻を決める
    else if(who === "op"){
      //自分と相手の素早さを取得
      let myPokeSpeed = pokeInfo[myPokeState.name].speed;
      let opPokeSpeed = pokeInfo[opPokeState.name].speed;
  
      if (myPokeSpeed > opPokeSpeed && !skipTurn) { //交代した場合は後攻扱いにする
        handleStateChange("myTurn", "first");
      }
      else{
        handleStateChange("myTurn", "after");
      }
    }
  }

  //先攻後攻がセットされたら、先攻の技をセットする
  const toDoWhenSetMyturn = () => {
    let weaponText = "";
    if(myTurn === ("first")){
      weaponText = myPokeState.weapon + "weaponText";
      handleStateChange("myText", weaponText);
    }
    else if(myTurn === ("after")){
      weaponText = opPokeState.weapon + "weaponText";
      handleStateChange("opText", weaponText);
    }
  }

  //テキストがセットされたときの処理
  const toDoWhenSetText = (who) => {
    let pokeImg = "";
    if(who === "my"){
      //自分のGoテキストがセットされたら、自分の画像をセット
      if(myPokeState.text.includes("goText")){
        pokeImg = pokeInfo[myPokeState.name].img;
        // pokeImg = pokeInfo.find(poke => poke.name === myPokeState.name).img;
        setMyPokeState(prev => ({...prev, img: pokeImg}));
      }
      //自分のバックテキストがセットされたら、表示制御・次ポケのnameをセット
      else if(myPokeState.text.includes("backText")){
        setMyAreaVisible(prev => ({ ...prev, text: true})); //バックテキストを表示する
        setTimeout(() => {
          setMyAreaVisible(prev => ({ ...prev, img: false, name: false, hp: false}));
          saveMyHp(myPokeState.name);   //残りHPを保存
          setChangePokeHp(changePokeName.current);    //次に出すポケモンにカレントのHPをセット
        }, 1000);
      }
      //自分の技テキストがセットされたら、相手への相性テキストをセットする
      else if(myPokeState.text.includes("weaponText")){
        setCompatiText("op");
      }
      // 自分への相性テキストがセットされたら、自分へのダメージ計算し、HPに反映させる
      else if(myPokeState.text.includes("compatiText")){ //text：効果はバツグンだcompatiText2
        //テキストに含まれた攻撃倍率を取得する
        const match = myPokeState.text.match(/(\d+(\.\d+)?)/);
        const attackMultiplier = match ? Number(match[0]) : 1; // デフォルト値は1倍など
        //ダメージ計算をする
        const damagePt = calcDamage(attackMultiplier);
        console.log("自分に" + damagePt + "ダメージ（" + 50 + "*" + attackMultiplier + ")");
        //HPにダメージを反映させる
        toDoWhenSetDamage("my", damagePt);
      }
      //自分への死亡テキストがセットされたら、死亡エフェクトをいれる
      else if(myPokeState.text.includes("deadText")){
        deadEffect("my");
      }
    }
    else if(who === "op"){
      //相手のGoテキストがセットされたら、自分の画像をセット
      if(opPokeState.text.includes("goText")){
        pokeImg = pokeInfo[opPokeState.name].img;
        // pokeImg = pokeInfo.find(poke => poke.name === opPokeState.name).img;
        setOpPokeState(prev => ({...prev, img: pokeImg}));
      }
      //相手の技テキストがセットされたら、自分への相性テキストをセットする
      else if(opPokeState.text.includes("weaponText")){
        setCompatiText("my");
      }
      // 相手への相性テキストがセットされたら、相手へのダメージ計算し、HPに反映させる
      else if(opPokeState.text.includes("compatiText")){ //text：効果はバツグンだcompatiText2
        //テキストに含まれた攻撃倍率を取得する
        const match = opPokeState.text.match(/(\d+(\.\d+)?)/);
        const attackMultiplier = match ? Number(match[0]) : 1; // デフォルト値は1倍など
        //ダメージ計算をする
        const damagePt = calcDamage(attackMultiplier);
        console.log("相手に" + damagePt + "ダメージ（" + 50 + "*" + attackMultiplier + ")");
        //HPにダメージを反映させる
        toDoWhenSetDamage("op", damagePt);
      }
      //相手への死亡テキストがセットされたら、死亡エフェクトをいれる
      else if(opPokeState.text.includes("deadText")){
        deadEffect("op");
      }
    }
  }

  //ダメージ数がセットされたときの処理
  const toDoWhenSetDamage = (who, damagePt) => {
    if(who === "my"){
      setOpAreaVisible(prev => ({ ...prev, text: true})); //相手の技テキストを表示する
      //鳴き声の再生後に、攻撃エフェクト(動き＆音)
      playPokeVoice(opPokeState.name, () => {   
        attackEffect("op");
        //攻撃音声再生後にHPの更新とダメージエフェクト
        playWeaponSound(opPokeState.weapon, () => {   
          damageEffect("my", damagePt);
          if(!myPokeState.text.includes(compatiTexts.mukou)){
            playDamageSound("my");
          }
        });  
      });
    }
    else if(who === "op"){
      setMyAreaVisible(prev => ({ ...prev, text: true})); //自分の技テキストを表示する
      //鳴き声の再生後に、攻撃エフェクト(動き＆音)
      playPokeVoice(myPokeState.name, () => {   
        attackEffect("my");
        //攻撃音声再生後にHPの更新とダメージエフェクト
        playWeaponSound(myPokeState.weapon, () => {   
          damageEffect("op", damagePt);
          if(!opPokeState.text.includes(compatiTexts.mukou)){
            playDamageSound("op");
          }
        });  
      });
    }
  }

  //HPがセットされた時の処理
  const toDoWhenSetHp = (who) => {
    if(who === "my"){
      setTimeout(() => {
        setMyAreaVisible(prev => ({ ...prev, text: false})); //自分の相性テキストを非表示
        setOpAreaVisible(prev => ({ ...prev, text: false}));  //相手の技テキストを非表示

        console.log("myPokeState.namet：" + myPokeState.name + "/changePokeName.current：" + changePokeName.current);
        //交代により、HPがセットされた場合、名前をセットする。（交代、死亡後共通）
        if(myPokeState.name !== changePokeName.current && changePokeName.current !== ""){
          setMyPokeState(prev => ({...prev, name: changePokeName.current}));
        }
        //交代後に攻撃されてHPがセットされたら、ターンは終了
        else if(skipTurn && myPokeState.hp !== 0){
            setTimeout(() => {
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
              setSkipTurn(false);
            }, 3000); 
        }
        //交代等なく、相手の攻撃後に生存してる場合
        else if(myPokeState.hp < 100 && myPokeState.hp > 0){  
          setTimeout(() => {  //相手の攻撃の１秒後に相手の技相性をセット
            //先攻ならターン終了
            if(myTurn === "first"){   
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
            }
            //交代せず後攻で攻撃するとき
            else if(myTurn === "after") {
              let weaponText = myPokeState.weapon + "weaponText";
              handleStateChange("myText", weaponText);
            }            
          }, 1000);
        }
        //死亡した場合、HPを保存し、死亡テキストをセットする
        else if(myPokeState.hp <= 0) {  
          saveMyHp(myPokeState.name);
          let deadText = myPokeState.name + "は倒れた" + "deadText";
          handleStateChange("myText", deadText);
        }
      }, 2000);
    }
    else if(who === "op"){
      setTimeout(() => {
        setOpAreaVisible(prev => ({ ...prev, text: false}));    // 相手の相性テキストを非表示
        setMyAreaVisible(prev => ({ ...prev, text: false}));    // 自分の技テキストを非表示
  
         //生存してる場合
        if(opPokeState.hp > 0){
          setTimeout(() => {    //自分の攻撃の１秒後に自分の技相性をセット
            //自分が後攻ならターン終了
            if(myTurn === "after"){
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
            }
            //先攻なら相手の技テキストをセット
            else if(myTurn === "first"){
                let weaponText = opPokeState.weapon + "weaponText";
                handleStateChange("opText", weaponText);
            }
          }, 1000);
        }
        //死亡した場合、HPを保存し、死亡テキストをセットする
        else if(opPokeState.hp <= 0) {
          let deadText = opPokeState.name + "は倒れた" + "deadText";
          handleStateChange("opText", deadText);
        }
      }, 2000);
    }
  } 

  //ライフがセットされたときの処理
  const toDoWhenSetLife = (who) => {
    if(who === "my"){
      //生存ポケモンがいる場合、次に出すポケモンを選択する
      if(myPokeState.life < 3 && myPokeState.life > 0){
        setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: true}));
      }
      //全員死亡の場合、自分の負け
      else if (myPokeState.life <= 0) {
        setWinner("op");
      }
    }
    else if(who === "op"){
      //生存ポケモンがいる場合、選出順通りのポケモン名称とHPをセットする
      console.log("相手の残りライフ" + opPokeState.life);
      if(opPokeState.life == 2){
        setOpPokeState(prev => ({...prev, name: opPokeState.poke2Name, hp: 100}));
      }
      else if(opPokeState.life == 1){
        setOpPokeState(prev => ({...prev, name: opPokeState.poke3Name, hp: 100}));
      }
      //全員死亡の場合、自分の勝ち
      else if (opPokeState.life <= 0) {
        setWinner("my");
      }
    }
  }

  //その他=================================================================================

  //自分の選出時
  const handleSelect = (pokeName) => {
    playSe("selection");
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

  //Stateに同じ値がセットされたときにトリガーを更新して、強制的にuseEffectを発火させる
  const handleStateChange = (stateName, newState) => {
    if(stateName === "myWeapon"){
      setMyPokeState(prev => {
        if (prev.weapon === newState) {
          console.log("トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setMyPokeStateTrigger(prev => ({...prev, weapon: prev.weapon + 1 }));; // トリガー発火
          return prev;
        } else {
          console.log(stateName + "を「" + newState + "」に更新する");
          return { ...prev, weapon: newState }; 
        }
      });
    }
    else if(stateName === "myTurn"){
      setMyTurn(prev => {
        if (prev === newState) {
          console.log("トリガー更新：の" + stateName + "は変わらず「" + newState + "」" );
          setMyTurnTrigger(t => t + 1); 
          return prev;
        } else {
          console.log( stateName + "を「" + newState + "」に更新する");
          return newState; 
        }
      });
    }
    else if(stateName === "myText"){
      setMyPokeState(prev => {
        if (prev.text === newState) {
          console.log("トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setMyPokeStateTrigger(prev => ({...prev, text: prev.text + 1 }));;
          return prev; 
        } else {
          console.log( stateName + "を「" + newState + "」に更新する");
          return { ...prev, text: newState };
        }
      });
    }
    else if(stateName === "myHp"){
      setMyPokeState(prev => {
        if (prev.hp === newState) {
          console.log("トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setMyPokeStateTrigger(prev => ({...prev, hp: prev.hp + 1 }));
          return prev; 
        } else {
          console.log( stateName + "を「" + newState + "」に更新する");
          return { ...prev, hp: newState };
        }
      });
    }
    else if(stateName === "opWeapon"){
      setOpPokeState(prev => {
        if (prev.weapon === newState) {
          console.log("トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setOpPokeStateTrigger(prev => ({...prev, weapon: prev.weapon + 1 }));
          return prev;
        } else {
          console.log( stateName + "を「" + newState + "」に更新する");
          return { ...prev, weapon: newState };
        }
      });
    }
    else if(stateName === "opText"){
      setOpPokeState(prev => {
        if (prev.text === newState) {
          console.log("トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setOpPokeStateTrigger(prev => ({...prev, text: prev.text + 1 }));
          return prev;
        } else {
          console.log(stateName + "を「" + newState + "」に更新する");
          return { ...prev, text: newState };
        }
      });
    }
    else if(stateName === "opHp"){
      setOpPokeState(prev => {
        if (prev.hp === newState) {
          console.log("トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setOpPokeStateTrigger(prev => ({...prev, hp: prev.hp + 1 }));; // トリガー発火
          return prev;
        } else {
          console.log(stateName + "を「" + newState + "」に更新する");
          return { ...prev, hp: newState };
        }
      });
    }
  };

  //技のタイプを取得し、相性倍率テキストをセットする
  const setCompatiText = (who) => {
    let attackPoke = "";
    let difensePoke = "";
    let whichText = "";

    if(who === "my"){
      attackPoke = opPokeState.name;
      difensePoke = myPokeState.name;
      whichText = "myText";
    }
    else if (who === "op"){
      attackPoke = myPokeState.name;
      difensePoke = opPokeState.name;
      whichText = "opText";
    }
    //攻撃タイプと受けタイプを取得
    const weaponName = pokeInfo[attackPoke].weapon;
    const attackType = weaponInfo[weaponName].type;
    const defenseType1 = pokeInfo[difensePoke].type1;
    const defenseType2 = pokeInfo[difensePoke].type2;
    //攻撃倍率を計算する
    const attackMultiplier = calcAttackMultiplier(attackType, defenseType1, defenseType2);
    //技相性テキストをセットする　（効果はバツグンcompatiText2）
    const conpatiText = makeCompatiText(attackMultiplier) + "compatiText" + attackMultiplier;
    handleStateChange(whichText, conpatiText);
  }

  //攻め受けポケモンのタイプから攻撃倍率を計算して返す
  const calcAttackMultiplier = (attackType, defenseType1, defenseType2) => {    
    const matchups = typeChart[attackType];
    const val1 = matchups[defenseType1] ?? 1;   //typeChartに相性がない場合「1」にする
    const val2 = matchups[defenseType2] ?? 1;
    const attackMultiplier = val1 * val2;

    return attackMultiplier;
  }

  //攻撃倍率によって相性テキストを返す
  const makeCompatiText = (attackMultiplier) => {
    let conpatiText = "";
    if(attackMultiplier >= 2){
      conpatiText = compatiTexts.batsugun;
    }
    else if(attackMultiplier == 1){
      conpatiText = compatiTexts.toubai;
    }
    else if(attackMultiplier <= 0.5 && attackMultiplier > 0){
      conpatiText = compatiTexts.imahitotsu;
    }
    else if(attackMultiplier == 0){
      conpatiText = compatiTexts.mukou;
    }
    return conpatiText;
  }

  //ダメージ計算  攻撃力は50で固定
  const calcDamage = (attackMultiplier) => {
    let damagePt = 50 * attackMultiplier;
    return damagePt;
  }

  //攻撃エフェクト
  const attackEffect = (who) => {
    if(who === "my"){
      setIsMyAttacking(true);
      delay(() => setIsMyAttacking(false), 500);
    }
    else if(who === "op"){
      setIsOpAttacking(true); // 攻撃アニメーション開始
      delay(() => setIsOpAttacking(false), 500);
    }
  };

  //ダメージエフェクトとダメージの反映
  const damageEffect = (who, damagePt) => {
    let newHp = 0;
    let pokeIMGElem = "";
    let compatiText = "";

    if(who === "my"){
      setMyAreaVisible(prev => ({ ...prev, text: true}));   //自分の相性テキストを表示
      compatiText = myPokeState.text;  //自分の相性テキストを取得
      pokeIMGElem = document.querySelector(".my-poke-img");   //ダメージエフェクトを入れる要素を取得

      //攻撃を受けた後のHPをセット
      newHp = Math.max(0, myPokeState.hp - damagePt)
      handleStateChange("myHp", newHp)
    }
    else if(who === "op"){
      setOpAreaVisible(prev => ({ ...prev, text: true}));   //相手の相性テキストを表示
      compatiText = opPokeState.text;   //相手の相性テキストを取得
      pokeIMGElem = document.querySelector(".op-poke-img");   //ダメージエフェクトを入れる要素を取得

      //攻撃を受けた後のHPをセット
      newHp = Math.max(0, opPokeState.hp - damagePt)
      handleStateChange("opHp", newHp);
    }

    //ダメージエフェクトを入れる（技相性が無効の場合を除く）
    if (pokeIMGElem && !compatiText.includes(compatiTexts.mukou)) {
      opacityChanges.forEach(({ opacity, delay }) => {
        setTimeout(() => {
          pokeIMGElem.style.opacity = opacity;
        }, delay);
      });
    }
  }

  //画像を取得して死亡エフェクトのスタイルを付与する
  const deadEffect = (who) => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false}));
    setSkipTurn(false);
    
    let pokeIMGElm = "";
    if(who === "my"){
      pokeIMGElm = document.querySelector(".my-poke-img");
      setTimeout(() => {
        setMyAreaVisible(prev => ({ ...prev, text: true, name: false, hp: false}));   //死亡テキストを表示
        playPokeVoice(myPokeState.name);
        pokeIMGElm.classList.add("pokemon-dead");
      }, 1000);
      setTimeout(() => {
        setMyAreaVisible(prev => ({ ...prev, text: false, img: false}));    //死亡テキストとIMGを非表示
        setMyPokeState(prev => ({...prev, life: myPokeState.life - 1}));    //ライフを減らす
      }, 3001);
    }
    else if(who === "op"){
      pokeIMGElm = document.querySelector(".op-poke-img");
      setTimeout(() => {
        setOpAreaVisible(prev => ({ ...prev, text: true, name: false, hp: false}));   //死亡テキストを表示
        playPokeVoice(opPokeState.name);
        pokeIMGElm.classList.add("pokemon-dead");
      }, 1000);
      setTimeout(() => {
        setOpAreaVisible(prev => ({ ...prev, text: false, img: false}));    //死亡テキストとIMGを非表示
        setOpPokeState(prev => ({...prev, life: opPokeState.life - 1}));    //ライフを減らす
      }, 3001);
    }
  }

  //残りHPを保存（交代時用）
  const saveMyHp = (myPokeName) => {
    if(myPokeName === myPokeState.poke1Name){
      myPokeState.poke1Hp = myPokeState.hp;
    }
    else if(myPokeName === myPokeState.poke2Name){
      myPokeState.poke2Hp = myPokeState.hp;
    }
    else if(myPokeName === myPokeState.poke3Name){
      myPokeState.poke3Hp = myPokeState.hp;
    }
  }

  //交代時に出すポケモンに保存されたHPをセットする
  const setChangePokeHp = (changePoke) => {
    if(changePoke === myPokeState.poke1Name){
      handleStateChange("myHp", myPokeState.poke1Hp);
    }
    else if(changePoke === myPokeState.poke2Name){
      handleStateChange("myHp", myPokeState.poke2Hp);
    }
    else if(changePoke === myPokeState.poke3Name){
      handleStateChange("myHp", myPokeState.poke3Hp);
    }
  }

  //勝敗を表示する
  const setWinner = (who) => {
    stopBgm();

    if(who === "my"){
      result.current = "WIN";
    }
    else if(who === "op"){
      result.current = "LOSE";
    }
    
    setOtherAreaVisible(prev => ({ ...prev, battle: false}));
    playSe("gameResult");
  }

  //setTimeout()の簡略化
  const delay = (fn, ms) => setTimeout(fn, ms);

  //textから余計な文字を取り除く（UI表示用）
  const getTrueText = (text) => {
    let index = -1;
    if(text.includes("goText")){
      index = text.indexOf("goText");
    }
    else if(text.includes("backText")){
      index = text.indexOf("backText");
    }
    else if(text.includes("weaponText")){
      index = text.indexOf("weaponText");
    }
    else if(text.includes("compatiText")){
      index = text.indexOf("compatiText");
    }
    else if(text.includes("deadText")){
      index = text.indexOf("deadText");
    }

    let trueText = index !== -1 ? text.slice(0, index) : text;
    if(trueText === compatiTexts.toubai){
      trueText = "";
    }
    return trueText;
  }

  //ターン数を更新してコンソールに表示する。（デバッグ用）
  const updateTurnCnt = () => {
    console.log(turnCnt.current + "ターン目================================================");
    turnCnt.current++;
  }


//HTML==========================================================================================================================

  return (
    <div className="App">
      <header className="App-header">
        {otherAreaVisible.start && (
          <div className="start-screen">
            <h1>ポケモンバトル</h1>
            <button onClick={start}>スタート</button>
          </div>
        )}
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
                <div className="txt-area">
                  {opAreaVisible.text && (<h1>{getTrueText(opPokeState.text)}</h1>)}
                </div>
                <div className="op-poke-area">
                  {opAreaVisible.img && (
                    <motion.img
                      src={opPokeState.img} alt="相手のポケモン" id="opPokeIMG" className="op-poke-img"
                      animate={isOpAttacking ? { x: [0, 50, 0], rotate: [0, 30, 0] } : {}} transition={{ duration: 0.5 }}
                    />
                  )}
                  {opAreaVisible.name && ( <h1 className="op-poke">{opPokeState.name}</h1>)}
                </div>
                <div className="op-hp-area">
                  {opAreaVisible.hp && (
                    <div className="op-hp-container">
                      <div className={`op-hp-bar ${opPokeState.hp <= 25 ? "low" : opPokeState.hp <= 50 ? "mid" : ""}`} style={{ width: `${opPokeState.hp}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="my-poke-area-wrap">
                <div className="txt-area">
                  {myAreaVisible.text && (<h1>{getTrueText(myPokeState.text)}</h1>)}
                </div>
                <div className="my-poke-area">
                  {myAreaVisible.img && (
                    <motion.img
                      src={myPokeState.img} alt="自分のポケモン" id="myPokeIMG" className="my-poke-img"
                      animate={isMyAttacking ? { x: [0, -50, 0], rotate: [0, -30, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                  {myAreaVisible.name && ( <h1 className="my-poke">{myPokeState.name}</h1>)}
                </div>
                <div className="my-hp-area">
                  {myAreaVisible.hp && (
                    <div className="my-hp-container">
                      <div   className={`my-hp-bar ${myPokeState.hp <= 25 ? "low" : myPokeState.hp <= 50 ? "mid" : ""}`}style={{ width: `${myPokeState.hp}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          
            <div className="cmd-area">
              {otherAreaVisible.actionCmd && (
                <div className="cmd-buttons">
                  <button onClick={openBattleCmdArea}>たたかう</button>
                  {myPokeState.life != 1 && <button onClick={openChangeCmdArea}>交代</button>}
                </div>
              )}
              {otherAreaVisible.weaponCmd && (
                <div className="cmd-buttons">
                  <button onClick={() => battle(pokeInfo[myPokeState.name].weapon)}>{pokeInfo[myPokeState.name].weapon}</button>
                  <button onClick={backCmd}>戻る</button>
                </div>
              )}
              {otherAreaVisible.changeCmd && (
                <div className="cmd-buttons">
                  {myPokeState.name !== myPokeState.poke1Name && myPokeState.poke1Hp > 0 && <button onClick={() => changeMyPoke(myPokeState.poke1Name)}>{myPokeState.poke1Name}</button>}
                  {myPokeState.name !== myPokeState.poke2Name && myPokeState.poke2Hp > 0 && <button onClick={() => changeMyPoke(myPokeState.poke2Name)}>{myPokeState.poke2Name}</button>}
                  {myPokeState.name !== myPokeState.poke3Name && myPokeState.poke3Hp > 0 && <button onClick={() => changeMyPoke(myPokeState.poke3Name)}>{myPokeState.poke3Name}</button>}
                  <button onClick={backCmd}>戻る</button>
                </div>
              )}            
              {otherAreaVisible.nextPokeCmd && (
                <div className="cmd-buttons">
                  {myPokeState.name !== myPokeState.poke1Name && myPokeState.poke1Hp > 0 && <button onClick={() => nextMyPoke(myPokeState.poke1Name)}>{myPokeState.poke1Name}</button>}
                  {myPokeState.name !== myPokeState.poke2Name && myPokeState.poke2Hp > 0 && <button onClick={() => nextMyPoke(myPokeState.poke2Name)}>{myPokeState.poke2Name}</button>}
                  {myPokeState.name !== myPokeState.poke3Name && myPokeState.poke3Hp > 0 && <button onClick={() => nextMyPoke(myPokeState.poke3Name)}>{myPokeState.poke3Name}</button>}
                </div>
              )}
            </div>
          </div>
        )}
        {!otherAreaVisible.start && !otherAreaVisible.isSelecting && !otherAreaVisible.battle &&(
          <h1>{result.current}</h1>
        )}
      </header>
    </div>
  );
}

export default App;