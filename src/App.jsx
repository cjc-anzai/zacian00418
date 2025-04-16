import "./App.css";
import React, { useState, useRef, useEffect } from "react";
import hououIMG from "./assets/houou.jfif";
import zacianIMG from "./assets/zacian.jfif";
import miraidonIMG from "./assets/miraidon.png";
import mugendainaIMG from "./assets/mugendaina.png";
import shirobadoIMG from "./assets/shirobado.jfif";
import kurobadoIMG from "./assets/kurobado.png";

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
  const [selectedOrder, setSelectedOrder] = useState([]); // 選出順（配列で保持）
  const turnCnt = useRef(1);    //ターン数カウント(デバッグ用)
  const [myTurn, setMyTurn] = useState("");
  const [myTurnTrigger, setMyTurnTrigger] = useState(0);
  const [skipTurn, setSkipTurn] = useState(false);
  const result = useRef("");  //勝敗を格納する

  //一般変数========================================================================================================================================

  //ポケモン情報
  const pokeInfo = [
    {name: "ホウオウ", img: hououIMG, type1: "ほのお", type2: "ひこう", weapon: "せいなるほのお", weaponType: "ほのお", speed: 90},
    {name: "ムゲンダイナ", img: mugendainaIMG, type1: "どく", type2: "ドラゴン", weapon: "ダイマックスほう", weaponType: "ドラゴン", speed: 130},
    {name: "白バドレックス", img: shirobadoIMG, type1: "エスパー", type2: "こおり", weapon: "ブリザードランス", weaponType: "こおり", speed: 50},
    {name: "ザシアン", type1: "フェアリー", type2: "はがね", img: zacianIMG, weapon: "きょじゅうざん", weaponType: "はがね", speed: 138},
    {name: "ミライドン", type1: "でんき", type2: "ドラゴン", img: miraidonIMG, weapon: "イナズマドライブ", weaponType: "でんき", speed: 135},
    {name: "黒バドレックス", type1: "エスパー", type2: "ゴースト", img: kurobadoIMG, weapon: "アストラルビット", weaponType: "ゴースト", speed: 150}
  ];

  //技相性テキスト
  const batsugunTxt = "効果はバツグン";
  const toubaiTxt = "等倍ダメージ";
  const imahitotsuTxt = "効果はいまひとつ";
  const mukouTxt = "効果がない";
  
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

  //交代を選択したら、相手の技をセット
  useEffect(() => {
    if (!skipTurn) return;
    console.log("交代を選択");
    let weaponName = pokeInfo.find(poke => poke.name === opPokeState.name)?.weapon;
    handleStateChange("opWeapon", weaponName);
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
    if(myPokeState.hp == 100) return;
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
    // スタート画面非表示、選出画面表示
    setOtherAreaVisible(prev => ({ ...prev, start: false, isSelecting: true }));  
  };

  //選出確定ボタン
  const confirmSelection = () => {
    // 選出画面非表示、バトル画面表示
    setOtherAreaVisible(prev => ({ ...prev, isSelecting: false, battle: true}));

    //自分の選出順番をセットし、1番目のポケの名前をセット
    myPokeState.poke1Name = selectedOrder[0];
    myPokeState.poke2Name = selectedOrder[1];
    myPokeState.poke3Name = selectedOrder[2];
    setMyPokeState(prev => ({...prev, name: selectedOrder[0]}));

    // 相手のポケモンを3体からランダムに選ぶ処理を追加
    const selectedThree = pokeInfo.filter(poke =>
      ["ザシアン", "ミライドン", "黒バドレックス"].includes(poke.name)
    );
    const shuffled = [...selectedThree].sort(() => 0.5 - Math.random());
    const selectedOpPokemons = shuffled.slice(0, 3); // ランダムに3体選ぶ

    //相手の選出順番をセットし、1番目のポケの名前をセット
    opPokeState.poke1Name = selectedOpPokemons[0].name;
    opPokeState.poke2Name = selectedOpPokemons[1].name;
    opPokeState.poke3Name = selectedOpPokemons[2].name;
    setOpPokeState(prev => ({...prev, name: opPokeState.poke1Name}));
  
    //表示状態制御
    setMyAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true}));
    setOpAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true}));
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
  };
  
  //たたかうボタン
  const openBattleCmdArea = () => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, weaponCmd: true}));
  };

  //交代ボタン
  const openChangeCmdArea = () => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, changeCmd: true}));
  };

  // 戻るボタン
  const backCmd = () => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true, changeCmd: false}));
  };

  //技名ボタン
  const battle = (weaponName) => {
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: false}));
    updateTurnCnt();    //ターン数の更新
    handleStateChange("myWeapon", weaponName);    //自分の技をセット
  };

  //〇〇に交代ボタン
  const changeMyPoke = (changePoke) => { 
    setMyAreaVisible(prev => ({ ...prev, img: false, name: false, hp: false}));
    setOtherAreaVisible(prev => ({ ...prev, changeCmd: false}));
    updateTurnCnt();    //ターン数の更新
    
    setTimeout(() => {
      saveMyHp(myPokeState.name);   //残りHPを保存
      setOtherPoke(changePoke);     //次に出すポケモンの情報をセット
      setSkipTurn(true); // 交代フラグを立てる
    }, 1000);
  }


  //その他関数=================================================================================================================================

  //選出時。。。
  const handleSelect = (pokeName) => {
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
  
  //ポケモンの名前がセットされたときの処理
  const toDoWhenSetPokeName = (who) => {
    let pokeImg = "";
    if(who === "my"){
      //画像をセット
      pokeImg = pokeInfo.find(poke => poke.name === myPokeState.name)?.img;
      setMyPokeState(prev => ({...prev, img: pokeImg}));
      //ポケモンが倒れた後の表示制御
      if(myPokeState.life < 3 && myPokeState.life > 0){
        setMyAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true})); 
        setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
      }
    }
    else if (who === "op"){
      //画像をセット
      pokeImg = pokeInfo.find(poke => poke.name === opPokeState.name)?.img;
      setOpPokeState(prev => ({...prev, img: pokeImg }));
      //ポケモンが倒れた後の表示制御
      if(opPokeState.life < 3 && opPokeState.life > 0){
        setOpAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true})); 
        setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
      }
    }
  }

  //stateにweaponがセットされたときの処理
  const toDoWhenSetWeapon = (who) => {
    if(who === "my"){
      //相手の技をセット
      let weaponName = pokeInfo.find(poke => poke.name === opPokeState.name)?.weapon;
      handleStateChange("opWeapon", weaponName);
    }
    else if(who === "op"){
      //自分と相手の素早さを取得
      let myPokeSpeed = pokeInfo.find(poke => poke.name === myPokeState.name)?.speed;
      let opPokeSpeed = pokeInfo.find(poke => poke.name === opPokeState.name)?.speed;
  
      // 先攻後攻の判定　交代した場合は後攻扱いにする
      if (myPokeSpeed > opPokeSpeed && !skipTurn) {
        handleStateChange("myTurn", "first");
      }
      else{
        handleStateChange("myTurn", "after");
      }
    }
  }

  //先攻の技をセットする
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

  //Stateに同じ値がセットされたときにトリガーを更新して、強制的にuseEffectを発火させる
  const handleStateChange = (stateName, newState) => {
    if(stateName === "myWeapon"){
      setMyPokeState(prev => {
        if (prev.weapon === newState) {
          console.log("共通１．トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setMyPokeStateTrigger(prev => ({...prev, weapon: prev.weapon + 1 }));; // トリガー発火
          return prev;
        } else {
          console.log( "共通１．" + stateName + "を「" + newState + "」に更新する");
          return { ...prev, weapon: newState }; 
        }
      });
    }
    else if(stateName === "myTurn"){
      setMyTurn(prev => {
        if (prev === newState) {
          console.log("共通３．トリガー更新：の" + stateName + "は変わらず「" + newState + "」" );
          setMyTurnTrigger(t => t + 1); 
          return prev;
        } else {
          console.log( "共通３．" + stateName + "を「" + newState + "」に更新する");
          return newState; 
        }
      });
    }
    else if(stateName === "myText"){
      setMyPokeState(prev => {
        if (prev.text === newState) {
          console.log("後攻５,８．トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setMyPokeStateTrigger(prev => ({...prev, text: prev.text + 1 }));;
          return prev; 
        } else {
          console.log( "後攻５,８．" + stateName + "を「" + newState + "」に更新する");
          return { ...prev, text: newState };
        }
      });
    }
    else if(stateName === "myHp"){
      setMyPokeState(prev => {
        if (prev.hp === newState) {
          console.log("後攻７．トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setMyPokeStateTrigger(prev => ({...prev, hp: prev.hp + 1 }));
          return prev; 
        } else {
          console.log( "後攻７．" + stateName + "を「" + newState + "」に更新する");
          return { ...prev, hp: newState };
        }
      });
    }
    else if(stateName === "opWeapon"){
      setOpPokeState(prev => {
        if (prev.weapon === newState) {
          console.log("共通２．トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setOpPokeStateTrigger(prev => ({...prev, weapon: prev.weapon + 1 }));
          return prev;
        } else {
          console.log( "共通２．" + stateName + "を「" + newState + "」に更新する");
          return { ...prev, weapon: newState };
        }
      });
    }
    else if(stateName === "opText"){
      setOpPokeState(prev => {
        if (prev.text === newState) {
          console.log("後攻４,９．トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setOpPokeStateTrigger(prev => ({...prev, text: prev.text + 1 }));
          return prev;
        } else {
          console.log( "後攻４,９．" + stateName + "を「" + newState + "」に更新する");
          return { ...prev, text: newState };
        }
      });
    }
    else if(stateName === "opHp"){
      setOpPokeState(prev => {
        if (prev.hp === newState) {
          console.log("後攻１１．トリガー更新：" + stateName + "は変わらず「" + newState + "」" );
          setOpPokeStateTrigger(prev => ({...prev, hp: prev.hp + 1 }));; // トリガー発火
          return prev;
        } else {
          console.log( "後攻１１．" + stateName + "を「" + newState + "」に更新する");
          return { ...prev, hp: newState };
        }
      });
    }
  };

  //テキストがセットされたときの処理
  const toDoWhenSetText = (who) => {
    if(who === "my"){
      //自分の技テキストがセットされたら、相手への相性テキストをセットする
      if(myPokeState.text.includes("weaponText")){
        setCompatiText("op");
      }
      // 自分への相性テキストがセットされたら、自分へのダメージ計算し、HPに反映させる
      else if(myPokeState.text.includes("compatiText")){ //text：効果はバツグンだcompatiText2
        //テキストに含まれた攻撃倍率を取得する
        const match = myPokeState.text.match(/(\d+(\.\d+)?)/);
        const attackMultiplier = match ? Number(match[0]) : 1; // デフォルト値は1倍など
        //ダメージ計算をする
        const damagePt = calcDamage(attackMultiplier);
        console.log("後攻６．自分に" + damagePt + "ダメージ（" + 50 + "*" + attackMultiplier + ")");
        //HPにダメージを反映させる
        toDoWhenSetDamage("my", damagePt);
      }
      //自分への死亡テキストがセットされたら、死亡エフェクトをいれる
      else if(myPokeState.text.includes("deadText")){
        deadEffect("my");
      }
    }
    else if(who === "op"){
      //相手の技テキストがセットされたら、自分への相性テキストをセットする
      if(opPokeState.text.includes("weaponText")){
        setCompatiText("my");
      }
      // 相手への相性テキストがセットされたら、相手へのダメージ計算し、HPに反映させる
      else if(opPokeState.text.includes("compatiText")){ //text：効果はバツグンだcompatiText2
        //テキストに含まれた攻撃倍率を取得する
        const match = opPokeState.text.match(/(\d+(\.\d+)?)/);
        const attackMultiplier = match ? Number(match[0]) : 1; // デフォルト値は1倍など
        //ダメージ計算をする
        const damagePt = calcDamage(attackMultiplier);
        console.log("後攻１０．相手に" + damagePt + "ダメージ（" + 50 + "*" + attackMultiplier + ")");
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
      delay(() => damageEffect("my", damagePt), 1000);    //HPの更新とダメージエフェクトをいれる
    }
    else if(who === "op"){
      setMyAreaVisible(prev => ({ ...prev, text: true})); //自分の技テキストを表示する
      delay(() => damageEffect("op", damagePt), 1000);    //HPの更新とダメージエフェクトをいれる
    }
  }

  //HPがセットされた時の処理
  const toDoWhenSetHp = (who) => {
    if(who === "my"){
      setTimeout(() => {
        setMyAreaVisible(prev => ({ ...prev, text: false})); // 自分の相性テキストを非表示
        setOpAreaVisible(prev => ({ ...prev, text: false}));  // 相手の技テキストを非表示
        
        //生存してる場合
        if(myPokeState.hp > 0){  
          if(!skipTurn){
            setTimeout(() => {  //相手の攻撃の１秒後に相手の技相性をセット
              //先攻ならターン終了
              if(myTurn === "first"){   
                setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
              }
              //後攻なら自分の技テキストをセット
              else {
                let weaponText = myPokeState.weapon + "weaponText";
                handleStateChange("myText", weaponText);
              }
            }, 1000);
          }
          //交代したターンは攻撃しない
          else if (skipTurn) {
            setTimeout(() => {
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
              setSkipTurn(false);
            }, 1000); 
          }
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
            else {
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

  //技のタイプを取得し、相性倍率テキストをセットする
  const setCompatiText = (who) => {
    let attackType = "";
    let defenseType1 = "";
    let defenseType2 = "";
    let attackMultiplier = 0;
    let conpatiText = "";
    if(who === "my"){
      //攻撃タイプと受けタイプを取得
      attackType = pokeInfo.find(poke => poke.name === opPokeState.name)?.weaponType;
      defenseType1 = pokeInfo.find(poke => poke.name === myPokeState.name)?.type1;
      defenseType2 = pokeInfo.find(poke => poke.name === myPokeState.name)?.type2;
      //攻撃倍率を計算する
      attackMultiplier = calcAttackMultiplier(attackType, defenseType1, defenseType2);
      //技相性テキストをセットする　（効果はバツグンcompatiText2）
      conpatiText = makeCompatiText(attackMultiplier) + "compatiText" + attackMultiplier;
      handleStateChange("myText", conpatiText);
    }
    else if (who === "op"){
      //攻撃タイプと受けタイプを取得
      attackType = pokeInfo.find(poke => poke.name === myPokeState.name)?.weaponType;
      defenseType1 = pokeInfo.find(poke => poke.name === opPokeState.name)?.type1;
      defenseType2 = pokeInfo.find(poke => poke.name === opPokeState.name)?.type2;
      //攻撃倍率を計算する
      attackMultiplier = calcAttackMultiplier(attackType, defenseType1, defenseType2);
      //技相性テキストをセットする　（効果はバツグンcompatiText2）
      conpatiText = makeCompatiText(attackMultiplier) + "compatiText" + attackMultiplier;
      handleStateChange("opText", conpatiText);
    }
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
      conpatiText = batsugunTxt;
    }
    else if(attackMultiplier == 1){
      conpatiText = toubaiTxt;
    }
    else if(attackMultiplier <= 0.5 && attackMultiplier > 0){
      conpatiText = imahitotsuTxt;
    }
    else if(attackMultiplier == 0){
      conpatiText = mukouTxt;
    }
    return conpatiText;
  }

  //ダメージ計算  攻撃力は50で固定
  const calcDamage = (attackMultiplier) => {
    let damagePt = 50 * attackMultiplier;
    return damagePt;
  }

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
    if (pokeIMGElem && !compatiText.includes("無効")) {
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
  
  //次に出すポケモンをセット
  const nextMyPoke = (nextPoke) => {
    setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: false}));
    setTimeout(() => {
      setOtherPoke(nextPoke);
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
    }, 1000);
  }

  //交代時と次のポケモンを選ぶ時の共通パーツ
  const setOtherPoke = (otherPoke) => {
    setChangePokeHp(otherPoke);    //次に出すポケモンにカレントのHPをセット
    setMyPokeState(prev => ({...prev, name: otherPoke}));
    setMyAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true}));
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
    if(who === "my"){
      result.current = "WIN";
    }
    else if(who === "op"){
      result.current = "LOSE";
    }
    setOtherAreaVisible(prev => ({ ...prev, battle: false}));
  }

  //setTimeout()の簡略化
  const delay = (fn, ms) => setTimeout(fn, ms);

  //textから余計な文字を取り除く（UI表示用）
  const getTrueText = (text) => {
    let index = "";
    if(text.includes("weaponText")){
      index = text.indexOf("weaponText");
    }
    if(text.includes("compatiText")){
      index = text.indexOf("compatiText");
    }
    if(text.includes("deadText")){
      index = text.indexOf("deadText");
    }

    const trueText = index !== -1 ? text.slice(0, index) : text;
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
          <div>
            <h1>ポケモンバトル</h1>
            <button onClick={start}>スタート</button>
          </div>
        )}
        {otherAreaVisible.isSelecting && (
          <div className="select-area">
            <h2>相手のポケモン</h2>
            <div className="op-poke-select">
              <div className="poke-preview">
                <img src={zacianIMG} alt="ザシアン" />
                <p>ザシアン</p>
              </div>
              <div className="poke-preview">
                <img src={miraidonIMG} alt="ミライドン" />
                <p>ミライドン</p>
              </div>
              <div className="poke-preview">
                <img src={kurobadoIMG} alt="黒バドレックス" />
                <p>黒バドレックス</p>
              </div>
            </div>

            <h2>自分のポケモンを選出</h2>
            <div className="my-poke-select">
              {[{ name: "ホウオウ", img: hououIMG }, { name: "ムゲンダイナ", img: mugendainaIMG }, { name: "白バドレックス", img: shirobadoIMG }].map((poke) => (
                <div
                  key={poke.name}
                  className={`poke-option ${selectedOrder.includes(poke.name) ? "selected" : ""}`}
                  onClick={() => handleSelect(poke.name)}
                >
                  <img src={poke.img} alt={poke.name} />
                  <p>{poke.name}</p>
                  {selectedOrder.includes(poke.name) && <span>{selectedOrder.indexOf(poke.name) + 1}番目</span>}
                </div>
              ))}
            </div>

            <div className="select-actions">
              {selectedOrder.length === 3 && (
                <button onClick={confirmSelection}>バトル開始！</button>
              )}
            </div>
          </div>
        )}
        <div className="battle-area-wrap">
          {otherAreaVisible.battle && (
            <div className="battle-area" style={{ display: "flex" }}>
              <div className="op-poke-area-wrap">
                <div className="txt-area">
                  {opAreaVisible.text && (<h1>{getTrueText(opPokeState.text)}</h1>)}
                </div>
                <div className="op-poke-area">
                  {opAreaVisible.img && (<img src={opPokeState.img} alt="相手のポケモン" id="opPokeIMG" className="op-poke-img" />)}
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
                  {myAreaVisible.img && (<img src={myPokeState.img} alt="自分のポケモン" id="myPokeIMG" className="my-poke-img" />)}
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
          )}
          <div className="cmd-area">
            {otherAreaVisible.actionCmd && (
              <div className="cmd-buttons">
                <button onClick={openBattleCmdArea}>たたかう</button>
                {myPokeState.life != 1 && <button onClick={openChangeCmdArea}>交代</button>}
              </div>
            )}
            {otherAreaVisible.weaponCmd && (
              <div className="cmd-buttons">
                <button onClick={() => battle(pokeInfo.find(poke => poke.name === myPokeState.name)?.weapon)}>{pokeInfo.find(poke => poke.name === myPokeState.name)?.weapon}</button>
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
        {!otherAreaVisible.start && !otherAreaVisible.battle && !otherAreaVisible.actionCmd &&(
          <h1>{result.current}</h1>
        )}
      </header>
    </div>
  );
}

export default App;