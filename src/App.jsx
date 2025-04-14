import "./App.css";
import React, { useState, useRef, useEffect } from "react";
import hououIMG from "./assets/houou.jfif";
import zacianIMG from "./assets/zacian.jfif";
import miraidonIMG from "./assets/miraidon.png";
import mugendainaIMG from "./assets/mugendaina.png";
import shirobadoIMG from "./assets/shirobado.jfif";
import kurobadoIMG from "./assets/kurobado.png";

function App() {
  //state==============================================================================================================================
  //自分と相手のポケモン関係の表示制御
  const defaultAreaVisible = {
    name: false,
    img: false,
    hp: false,
    weapon: false,
    compati: false,
    dead: false
  };

  const [myAreaVisible, setMyAreaVisible] = useState({ ...defaultAreaVisible });
  const [opAreaVisible, setOpAreaVisible] = useState({ ...defaultAreaVisible });


  //その他表示制御
  const [otherAreaVisible, setOtherAreaVisible] = useState({
    start: true,
    battle: false,
    actionCmd: false,
    weaponCmd: false,
    changeCmd: false,
    nextPokeCmd: false
  });
  
  //自分のポケモンのState
  const defaultPokeState = {
    name: "",          //バトル場のポケモン    
    poke1Name: "",   //１番目に選択したポケモン 
    poke2Name: "",
    poke3Name: "",
    img: null,
    type1: "",
    type2: "",       
    weapon: "",     
    compati: "",      
    damage: 1,        
    hp: 100,    //バトル場のポケモンのHP
    poke1Hp: 100,   //１番目に選択したポケモンのHP
    poke2Hp: 100,
    poke3Hp: 100,  
    life: 3             
  };

  const [myPokeState, setMyPokeState] = useState({ ...defaultPokeState });
  const [opPokeState, setOpPokeState] = useState({ ...defaultPokeState });

  const [isSelecting, setIsSelecting] = useState(false); // 選出中かどうか
  const [selectedOrder, setSelectedOrder] = useState([]); // 選出順（配列で保持）
  const [myTurn, setMyTurn] = useState("");
  const [skipTurn, setSkipTurn] = useState(false);
  const result = useRef("");  //勝敗を格納する

  //一般変数========================================================================================================================================
  const pokeInfo = [
    {name: "ホウオウ", img: hououIMG, type1: "ほのお", type2: "ひこう", weapon: "せいなるほのお", weaponType: "ほのお", speed: 90},
    {name: "ムゲンダイナ", img: mugendainaIMG, type1: "どく", type2: "ドラゴン", weapon: "ダイマックスほう", weaponType: "ドラゴン", speed: 130},
    {name: "白バドレックス", img: shirobadoIMG, type1: "エスパー", type2: "こおり", weapon: "ブリザードランス", weaponType: "こおり", speed: 50},
    {name: "ザシアン", type1: "フェアリー", type2: "はがね", img: zacianIMG, weapon: "きょじゅうざん", weaponType: "はがね", speed: 138},
    {name: "ミライドン", type1: "でんき", type2: "ドラゴン", img: miraidonIMG, weapon: "イナズマドライブ", weaponType: "でんき", speed: 135},
    {name: "黒バドレックス", type1: "エスパー", type2: "ゴースト", img: kurobadoIMG, weapon: "アストラルビット", weaponType: "ゴースト", speed: 150}
  ];

  const batsugunTxt = "効果はバツグン";
  const toubaiTxt = "等倍ダメージ";
  const imahitotsuTxt = "効果はいまひとつ";
  const mukouTxt = "効果がない";

  
  //タイプ相性表
  const typeChart = {
    ほのお: { ほのお: 0.5, こおり: 2, ドラゴン: 0.5, はがね: 2 },
    でんき: { でんき: 0.5, ひこう: 2, ドラゴン: 0.5 },
    こおり: { ほのお: 0.5, こおり: 0.5, ひこう: 2, ドラゴン: 2, はがね: 0.5 },
    どく: { どく: 0.5, ゴースト: 0.5, はがね: 0, フェアリー: 2 },
    ひこう: { でんき: 0.5, はがね: 0.5 },
    エスパー: { どく: 2, エスパー: 0.5,  はがね: 0.5 },
    ゴースト: { エスパー: 2,  ゴースト: 2 },
    ドラゴン: { ドラゴン: 2, はがね: 0.5, フェアリー: 0 },
    はがね: { ほのお: 0.5, でんき: 0.5, こおり: 2, はがね: 0.5, フェアリー: 2 },
    フェアリー: { ほのお: 0.5, どく: 0.5, ドラゴン: 2, はがね: 0.5 }
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

  // 自分のポケモン名称がセットされたら、画像とタイプをセット。
  useEffect(() => {
    toDoWhenSetPokeName("my", myPokeState.name);
  }, [myPokeState.name]);  

  //相手のポケモン名称が決まったら画像とタイプをセット
  useEffect(() => {
    toDoWhenSetPokeName("op", opPokeState.name);
  }, [opPokeState.name]);


  //skipTurn　交代を選択したら相手の技をセットする。
  useEffect(() => {
    if (!skipTurn) return;
    console.log("交代を選択");
    setOpPokeState(prev => ({...prev, weapon: pokeInfo.find(poke => poke.name === opPokeState.name)?.weapon + Math.random()}));
  }, [skipTurn]);
  

  //自分の技名がセットされたら、表示制御
  useEffect(() => {
    if(!opPokeState.name) return;
    console.log("自分の技:" + myPokeState.weapon);
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: true}));
  }, [myPokeState.weapon]);

  //相手の技名がセットされたら、先攻後攻を決める
  useEffect(() => {
    if(!opPokeState.name) return;
    console.log("相手の技:" + opPokeState.weapon);
    //自分と相手の素早さを取得
    let myPokeSpeed = pokeInfo.find(poke => poke.name === myPokeState.name)?.speed;
    let opPokeSpeed = pokeInfo.find(poke => poke.name === opPokeState.name)?.speed;

    // 先攻後攻の判定　交代した場合は後攻扱いにする
    if (myPokeSpeed > opPokeSpeed && !skipTurn) {
      setMyTurn("first" + Math.random());
    }
    else{
      setMyTurn("after" + Math.random());
    }
  }, [opPokeState.weapon]);


  //先攻後攻が決まったら技相性をセット
  useEffect(() => {
    if(!myTurn) return;
    console.log("先攻後攻：" + myTurn);
    if(myTurn.includes("first")){   //先攻なら相手の技相性をセット
      setCompatiTxt("my");
    }
    else if(myTurn.includes("after")){    //後攻なら自分の技相性をセット
      setCompatiTxt("op");
    }
  }, [myTurn]);


  //自分の技相性テキストが決まったら、自分へのダメージ数をセット
  useEffect(() => {
    toDoWhenSetCompati("my", myPokeState.compati);
  }, [myPokeState.compati]);

  //相手の技相性が決まったら、相手へのダメージ数をセット
  useEffect(() => {
    toDoWhenSetCompati("op", opPokeState.compati);
  }, [opPokeState.compati]);


  //自分へのダメージ数が決まったら、ダメージエフェクトを呼ぶ
  useEffect(() => {
    toDoWhenSetDamage("my", myPokeState.damage);
  }, [myPokeState.damage]);

  //相手へのダメージ数が決まったら、ダメージエフェクトを呼ぶ
  useEffect(() => {
    toDoWhenSetDamage("op", opPokeState.damage);
  }, [opPokeState.damage]);


  //自分のHPが変わったら、死亡判定
  useEffect(() => {
    if(myPokeState.hp == 100) return;
    console.log("自分の残りHP:" + myPokeState.hp);
    setTimeout(() => {
      setMyAreaVisible(prev => ({ ...prev, compati: false}));
      setOpAreaVisible(prev => ({ ...prev, weapon: false}));
      
      if(myPokeState.hp > 0){  //生存してる場合
        if(!skipTurn){  //交代したターンは攻撃しない
          setTimeout(() => {  //相手の攻撃の１秒後に相手の技相性をセット
            if(myTurn.includes("first")){   //先攻で自分ＨＰが減ったら攻撃ターン終了
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
            }
            else {
              //技のタイプを取得し、相性倍率テキストをセットする
              setCompatiTxt("my");
            }
          }, 1000);
        }
        else if (skipTurn) { // 交代後、相手の攻撃が終わるころ、コマンドボタンを表示
          setTimeout(() => {
            setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
            setSkipTurn(false);
          }, 1000); 
        }
      }
      else if(myPokeState.hp <= 0) {  //死亡したとき
        //倒れたポケモンは交代コマンドに出ないためにHP０にする
        saveMyHp(myPokeState.name);

        //画像を取得して死亡演出のスタイルを付与する
        deadEffect("my");
      }
    }, 2000);
  }, [myPokeState.hp]);


  //相手のHPが変わったら、死亡判定
  useEffect(() => {
    if(opPokeState.hp == 100) return;
    console.log("相手の残りHP" + opPokeState.hp);
    setTimeout(() => {
      setOpAreaVisible(prev => ({ ...prev, compati: false}));
      setMyAreaVisible(prev => ({ ...prev, weapon: false}));

      if(opPokeState.hp > 0){   //生存している場合
        setTimeout(() => {    //自分の攻撃の１秒後に自分の技相性をセット
          if(myTurn.includes("after")){   //後攻で相手ＨＰが減ったら攻撃ターン終了
            setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
          }
          else {
            setCompatiTxt("op");    //技のタイプを取得し、相性倍率テキストをセットする
          }
        }, 1000);
      }
      else if(opPokeState.hp <= 0) {  //死亡したとき
        deadEffect("op");    //画像を取得して死亡演出のスタイルを付与する
      }
    }, 2000);
  }, [opPokeState.hp]); 


  //自分のライフが減ったら勝敗判定
  useEffect(() => {
    if(myPokeState.life < 3 && myPokeState.life > 0){
      //次に出すポケモンを選ぶコマンドを表示する。
      setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: true}));
    }
    //全員死亡の場合、自分の負け
    else if (myPokeState.life <= 0) {
      setWinner("op");
    }
  }, [myPokeState.life]); 

  //相手のライフが減ったら勝敗判定
  useEffect(() => {
    //生存ポケモンがいる場合、ポケモン名称とHPをセットする
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
  }, [opPokeState.life]); 


  //クリックイベント===============================================================================================================

  // スタートボタン
  const start = () => {    
    setOtherAreaVisible(prev => ({ ...prev, start: false})); 
    setIsSelecting(true); // 選出画面へ
  };

  //選出確定ボタン
  const confirmSelection = () => {
    setIsSelecting(false);
    setOtherAreaVisible(prev => ({ ...prev, battle: true}));

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
  
  // たたかうボタン
  const openBattleCmdArea = () => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, weaponCmd: true}));
    //自分のバトル場のポケモンの技をセットする
    setMyPokeState(prev => ({...prev, weapon: pokeInfo.find(poke => poke.name === myPokeState.name)?.weapon + Math.random()}));
  };

  //交代ボタン
  const openChangeCmdArea = () => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, changeCmd: true}));
  };

  // 戻るボタン
  const backCmd = () => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true, backCmd: false, changeCmd: false}));
  };

  //技名ボタン
  const battle = () => {
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: false}));
    //相手の技名をセットする
    setOpPokeState(prev => ({...prev, weapon: pokeInfo.find(poke => poke.name === opPokeState.name)?.weapon + Math.random()}));
  };

  //控えに交代ボタン
  const changeMyPoke = (changePoke) => { 
    setMyAreaVisible(prev => ({ ...prev, img: false, name: false, hp: false}));
    setOtherAreaVisible(prev => ({ ...prev, changeCmd: false}));
    
   //控えポケモンをセット
    setTimeout(() => {
      saveMyHp(myPokeState.name);   //残りHPを保存
      setOtherPoke(changePoke);
      setSkipTurn(true); // 交代フラグを立てる
    }, 1000);
  }


  //その他関数=================================================================================================================================
  
  //ポケモンの名前がセットされたときの処理
  const toDoWhenSetPokeName = (who, pokeName) => {
    if(!pokeName) return;
    if(who === "my"){
      //バトル場のポケモンの情報を取得
      const myBattlePokeInfo = pokeInfo.find(poke => poke.name === myPokeState.name);
      //画像とタイプをセットする
      setMyPokeState(prev => ({...prev, img: myBattlePokeInfo?.img, type1: myBattlePokeInfo?.type1, type2: myBattlePokeInfo?.type2,}));
      //ポケモンが倒れた後の表示制御
      if(myPokeState.life < 3 && myPokeState.life > 0){
        setMyAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true})); 
        setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
      }
    }
    else if (who === "op"){
      //バトル場のポケモンの情報を取得
      const opBattlePokeInfo = pokeInfo.find(poke => poke.name === opPokeState.name);
      setOpPokeState(prev => ({...prev, img: opBattlePokeInfo?.img, type1: opBattlePokeInfo?.type1, type2: opBattlePokeInfo?.type2,}));
      //ポケモンが倒れた後の表示制御
      if(opPokeState.life < 3 && opPokeState.life > 0){
        setOpAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true})); 
        setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
      }
    }
  }

  //技相性テキストがセットされたときの処理
  const toDoWhenSetCompati = (who, compati) => {
    if(!compati && !otherAreaVisible.actionCmd) return;
    //テキストの技相性を数値に変換
    const attackMultiplier = changeAttackMultiplier(compati);
    
    if(who === "my"){
      console.log("自分への相性は：" + myPokeState.compati);
      setMyPokeState(prev => ({...prev, damage: calcDamage(attackMultiplier) + Math.random()}));
    }
    else if(who === "op"){
      console.log("相手への相性は：" + opPokeState.compati);
      setOpPokeState(prev => ({...prev, damage: calcDamage(attackMultiplier) + Math.random()}));
    }
  }

  //ダメージ数がセットされたときの処理
  const toDoWhenSetDamage = (who, damage) => {
    if(damage == 1) return;
    if(who === "my"){
      console.log("自分に" + damage + "ダメージ");
      setOpAreaVisible(prev => ({ ...prev, weapon: true}));
      delay(() => damageEffect("my"), 1000);
    }
    else if(who === "op"){
      console.log("相手に" + damage + "ダメージ");
      setMyAreaVisible(prev => ({ ...prev, weapon: true }));
      delay(() => damageEffect("op"), 1000);
    }
  }

  //残りHPを保存
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

  //攻撃倍率計算　都合上文字列で返す。
  const calcAttackMultiplier = (attackWeaponType, defensePokeType1, defensePokeType2) => {
    if (!defensePokeType1 || !defensePokeType2) {
      console.warn("防御側のタイプが未定義:", defensePokeType1, defensePokeType2);
      return 1; // とりあえず1倍にしておく
    }
    console.log("攻撃タイプ:" + attackWeaponType + "/受けタイプ１:" + defensePokeType1 + "/受けタイプ２:" + defensePokeType2);
    
    //複合タイプを考慮した相性を算出
    const matchups = typeChart[attackWeaponType];
    const val1 = matchups[defensePokeType1] ?? 1;
    const val2 = matchups[defensePokeType2] ?? 1;
    const numMatchupsResult = val1 * val2;
    let strMatchupsResult = "";

    if(numMatchupsResult == 4){
      strMatchupsResult = "四倍";
    }
    else if(numMatchupsResult == 2){
      strMatchupsResult = "二倍";
    }
    else if(numMatchupsResult == 1){
      strMatchupsResult = "等倍";
    }
    else if(numMatchupsResult == 0.5){
      strMatchupsResult = "半減";
    }
    else if(numMatchupsResult == 0.25){
      strMatchupsResult = "四半減";
    }
    else if(numMatchupsResult == 0){
      strMatchupsResult = "無効";
    }
    console.log("相性１:" + val1 + "/相性2:" + val2 + "/真相性:" + strMatchupsResult);

    return strMatchupsResult;
  }

  //技のタイプを取得し、相性倍率テキストをセットする
  const setCompatiTxt = (who) => {
    let weaponType = "";
    let strMatchupsResult = "";
    if(who === "my"){
      weaponType = pokeInfo.find(poke => poke.name === myPokeState.name)?.weaponType;
      strMatchupsResult = calcAttackMultiplier(weaponType, opPokeState.type1, opPokeState.type2);
      setOpPokeState(prev => ({...prev, compati: strMatchupsResult + Math.random()}));
    }
    else if (who === "op"){
      weaponType = pokeInfo.find(poke => poke.name === opPokeState.name)?.weaponType;
      strMatchupsResult = calcAttackMultiplier(weaponType, myPokeState.type1, myPokeState.type2);
      setMyPokeState(prev => ({...prev, compati: strMatchupsResult + Math.random()}));
    }
  }

  //相性のテキストを数値に変換
  const changeAttackMultiplier = (multiplierTxt) => {
    let attackMultiplier = 0;
    if(multiplierTxt.includes("四倍")){
      attackMultiplier = 4;
    }
    else if(multiplierTxt.includes("二倍")){
      attackMultiplier = 2;
    }
    else if(multiplierTxt.includes("等倍")){
      attackMultiplier = 1;
    }
    else if(multiplierTxt.includes("半減")){
      attackMultiplier = 0.5;
    }
    else if(multiplierTxt.includes("四半減")){
      attackMultiplier = 0.25;
    }
    else if(multiplierTxt.includes("無効")){
      attackMultiplier = 0;
    }

    return attackMultiplier;
  }

  //ダメージ計算
  const calcDamage = (attackMultiplier) => {
    let damagePt = 50 * attackMultiplier;
    return damagePt;
  }

  //ダメージエフェクト
  const damageEffect = (who) => {
    let pokeIMGElem = "";
    let compati = "";

    if(who === "my"){
      setMyAreaVisible(prev => ({ ...prev, compati: true}));
      setMyPokeState(prev => ({...prev,hp: Math.max(0, prev.hp - myPokeState.damage)}));
      pokeIMGElem = document.querySelector(".my-poke-img");
      compati = myPokeState.compati;
    }
    else if(who === "op"){
      setOpAreaVisible(prev => ({ ...prev, compati: true}));
      setOpPokeState(prev => ({...prev,hp: Math.max(0, prev.hp - opPokeState.damage)}));    // HPが0未満にならないように修正
      pokeIMGElem = document.querySelector(".op-poke-img");
      compati = opPokeState.compati;
    }

    //技相性が無効の時はエフェクトをつけない
    if (pokeIMGElem && !compati.includes("無効")) {
      opacityChanges.forEach(({ opacity, delay }) => {
        setTimeout(() => {
          pokeIMGElem.style.opacity = opacity;
        }, delay);
      });
    }
  }

  //画像を取得して死亡演出のスタイルを付与する
  const deadEffect = (who) => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false}));
    setSkipTurn(false);
    let pokeIMGElm = "";

    if(who === "my"){
      pokeIMGElm = document.querySelector(".my-poke-img");
      setTimeout(() => {
        setMyAreaVisible(prev => ({ ...prev, dead: true, name: false, hp: false}));
        pokeIMGElm.classList.add("pokemon-dead");
      }, 1000);
      setTimeout(() => {
        setMyAreaVisible(prev => ({ ...prev, dead: false, img: false}));
        setMyPokeState(prev => ({...prev, life: myPokeState.life - 1}));
      }, 3001);
    }
    else if(who === "op"){
      pokeIMGElm = document.querySelector(".op-poke-img");
      setTimeout(() => {
        setOpAreaVisible(prev => ({ ...prev, dead: true, name: false, hp: false}));
        pokeIMGElm.classList.add("pokemon-dead");
      }, 1000);
      setTimeout(() => {
        setOpAreaVisible(prev => ({ ...prev, dead: false, img: false}));  
        setOpPokeState(prev => ({...prev, life: opPokeState.life - 1}));
      }, 3001);
    }
  }

  //交代時と次のポケモンを選ぶ時の共通パーツ
  const setOtherPoke = (otherPoke) => {
    setHp(otherPoke);    //次に出すポケモンにカレントのHPをセット
    setMyPokeState(prev => ({...prev, name: otherPoke}));
    setMyAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true}));
  }
  
  //次に出すポケモンをセット
  const nextMyPoke = (nextPoke) => {
    setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: false}));
    
   //控えポケモンをセット
    setTimeout(() => {
      setOtherPoke(nextPoke);
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
    }, 1000);
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

  //setTimeout()の簡略化
  const delay = (fn, ms) => setTimeout(fn, ms);

  //交代時にバトル場のポケモンにカレントのHPをセットする
  const setHp = (poke) => {
    if(poke === myPokeState.poke1Name){
      setMyPokeState(prev => ({...prev, hp: myPokeState.poke1Hp}));
    }
    else if(poke === myPokeState.poke2Name){
      setMyPokeState(prev => ({...prev, hp: myPokeState.poke2Hp}));
    }
    else if(poke === myPokeState.poke3Name){
      setMyPokeState(prev => ({...prev, hp: myPokeState.poke3Hp}));
    }
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
        {isSelecting && (
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
                  {/* {opAreaVisible.compati && (<h1>{opPokeState.compati.replace(/[0-9.]/g, '')}</h1>)} */}
                  {opAreaVisible.compati && (() => {
                    const compati = opPokeState.compati;
                    if (compati.includes("四倍") || compati.includes("二倍")) {
                      return <h1>{batsugunTxt}</h1>;
                    } else if (compati.includes("等倍")) {
                      return <h1>{toubaiTxt}</h1>;
                    } else if (compati.includes("半減")) {
                      return <h1>{imahitotsuTxt}</h1>;
                    } else if (compati.includes("無効")) {
                      return <h1>{mukouTxt}</h1>;
                    }
                  })()}
                  {opAreaVisible.dead && (<h1>{opPokeState.name}は倒れた</h1>)}
                  {opAreaVisible.weapon && opPokeState.name && opPokeState.weapon && (<h1>{opPokeState.weapon.replace(/[0-9.]/g, '')}</h1>)}
                </div>
                <div className="op-poke-area">
                  {opAreaVisible.img && (<img src={opPokeState.img} alt="相手のポケモン" id="opPokeIMG" className="op-poke-img" />)}
                  {opAreaVisible.name && ( <h1 className="op-poke">{opPokeState.name.replace(/[0-9.]/g, '')}</h1>)}
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
                  {/* {myAreaVisible.compati && (<h1>{myPokeState.compati.replace(/[0-9.]/g, '')}</h1>)} */}
                  {myAreaVisible.compati && (() => {
                    const compati = myPokeState.compati;
                    if (compati.includes("四倍") || compati.includes("二倍")) {
                      return <h1>{batsugunTxt}</h1>;
                    } else if (compati.includes("等倍")) {
                      return <h1>{toubaiTxt}</h1>;
                    } else if (compati.includes("半減")) {
                      return <h1>{imahitotsuTxt}</h1>;
                    } else if (compati.includes("無効")) {
                      return <h1>{mukouTxt}</h1>;
                    }
                  })()}
                  {myAreaVisible.dead && (<h1>{myPokeState.name}は倒れた</h1>)}
                  {myAreaVisible.weapon && myPokeState.name && myPokeState.weapon && (<h1>{myPokeState.weapon.replace(/[0-9.]/g, '')}</h1>)}
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
                <button onClick={battle}>{myPokeState.weapon.replace(/[0-9.]/g, '')}</button>
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