import "./App.css";
import React, { useState, useRef, useEffect } from "react";
import hououIMG from "./assets/houou.jfif";
import zacianIMG from "./assets/zacian.jfif";
import miraidonIMG from "./assets/miraidon.png";
import mugendainaIMG from "./assets/mugendaina.png";
import shirobadoIMG from "./assets/shirobado.jfif";
import kurobadoIMG from "./assets/kurobado.png";

function App() {

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
  const [myPokeState, setMyPokeState] = useState({
    name: "",          //バトル場のポケモン    
    poke1Name: "",   //１番目に選択したポケモン 
    poke2Name: "",
    poke3Name: "",
    img: null,          
    weapon: "",     
    compati: "",        
    damage: 1,        
    hp: 100,    //バトル場のポケモンのHP
    poke1Hp: 100,   //１番目に選択したポケモンのHP
    poke2Hp: 100,
    poke3Hp: 100,  
    life: 3             
  });

  //相手のポケモンのState
  const [opPokeState, setOpPokeState] = useState({
    name: "",
    poke1Name: "",   //１番目に選択したポケモン 
    poke2Name: "",
    poke3Name: "",        
    img: null,          
    weapon: "",     
    compati: "",        
    damage: 1,        
    hp: 100,            
    life: 3             
  });

  const [isSelecting, setIsSelecting] = useState(false); // 選出中かどうか
  const [selectedOrder, setSelectedOrder] = useState([]); // 選出順（配列で保持）
  const [myTurn, setMyTurn] = useState("");
  const [skipTurn, setSkipTurn] = useState(false);
  const result = useRef("");  //勝敗を格納する

  //一般変数==========================================================================================================================
  const myPoke = [
    {name: "ホウオウ", img: hououIMG, weapon: "せいなるほのお", speed: 90},
    {name: "ムゲンダイナ", img: mugendainaIMG, weapon: "ダイマックスほう", speed: 130},
    {name: "白バドレックス", img: shirobadoIMG, weapon: "ブリザードランス", speed: 50}
  ];

  const opPoke = [
    {name: "ザシアン", img: zacianIMG, weapon: "きょじゅうざん", speed: 138},
    {name: "ミライドン", img: miraidonIMG, weapon: "イナズマドライブ", speed: 135},
    {name: "黒バドレックス", img: kurobadoIMG, weapon: "アストラルビット", speed: 150}
  ];

  const batsugunTxt = "効果はバツグン";
  const toubaiTxt = "等倍ダメージ";
  const imahitotsuTxt = "効果はいまひとつ";
  const mukouTxt = "効果がない";

  const compati = {
    my: {
      ホウオウ: { ザシアン: imahitotsuTxt, ミライドン: batsugunTxt, 黒バドレックス: toubaiTxt },
      ムゲンダイナ: { ザシアン: toubaiTxt, ミライドン: imahitotsuTxt, 黒バドレックス: toubaiTxt },
      白バドレックス: { ザシアン: batsugunTxt, ミライドン: toubaiTxt, 黒バドレックス: batsugunTxt },
    },
    op: {
      ザシアン: { ホウオウ: batsugunTxt, ムゲンダイナ: mukouTxt, 白バドレックス: imahitotsuTxt },
      ミライドン: { ホウオウ: imahitotsuTxt, ムゲンダイナ: batsugunTxt, 白バドレックス: batsugunTxt },
      黒バドレックス: { ホウオウ: toubaiTxt, ムゲンダイナ: toubaiTxt, 白バドレックス: toubaiTxt },
    },
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

  //useEffect================================================================================================================

  //ポケモン名称=========================================================

  // 自分のポケモン名称がセットされたら、画像をセット。
  useEffect(() => {
    if(myPokeState.name !== ""){
      setMyPokeState(prev => ({...prev, img: myPoke.find(poke => poke.name === myPokeState.name)?.img}));
      if(myPokeState.life == 2 || myPokeState.life == 1){
        setMyAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true})); 
        setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
      }
    }
  }, [myPokeState.name]);  

  //相手のポケモン名称が決まったら画像をセット
  useEffect(() => {
    if(opPokeState.name !== ""){
      console.log(opPokeState.name + "を出したい");
      setOpPokeState(prev => ({...prev, img: opPoke.find(poke => poke.name === opPokeState.name)?.img}));
      if(opPokeState.life == 2 || opPokeState.life == 1){
        setOpAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true})); 
        setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
      }
    }
  }, [opPokeState.name]);


  //skipTurn===========================================================

  //交代を選択したら相手の技をセットする。
  useEffect(() => {
    if (skipTurn) {
      setOpPokeState(prev => ({...prev, weapon: opPoke.find(poke => poke.name === opPokeState.name)?.weapon + Math.random()}));
    }
  }, [skipTurn]);
  

  //技名===============================================================

  //自分の技名がセットされたら、相手の技名をセットする。
  useEffect(() => {
    if(opPokeState.name !== ""){
      console.log(myPokeState.weapon + "がセットされた");
      setOtherAreaVisible(prev => ({ ...prev, weaponCmd: true}));
    }
  }, [myPokeState.weapon]);

  //相手の技名がセットされたら、先攻後攻を決める
  useEffect(() => {
    if(opPokeState.name !== ""){
      console.log(opPokeState.weapon + "がセットされた");
      let myPokeSpeed = myPoke.find(poke => poke.name === myPokeState.name)?.speed;
      let opPokeSpeed = opPoke.find(poke => poke.name === opPokeState.name)?.speed;

      // 先攻後攻の判定　交代した場合は後攻扱いにする
      if (myPokeSpeed > opPokeSpeed && !skipTurn) {
        setMyTurn("first" + Math.random());
      }
      else{
        setMyTurn("after" + Math.random());
      }
    }
  }, [opPokeState.weapon]);


  //先攻後攻が決まったら技相性をセット=======================================================
  useEffect(() => {
    if (myTurn !== "") {
      if(myTurn.includes("first")){   //先攻なら相手の技相性をセット
        console.log("先攻がセットされた");
        setOpPokeState(prev => ({...prev, compati: compati.op[opPokeState.name][myPokeState.name] + Math.random()}));
      }
      else if(myTurn.includes("after")){    //後攻なら自分の技相性をセット
        console.log("後攻がセットされた");
        setMyPokeState(prev => ({...prev, compati: compati.my[myPokeState.name][opPokeState.name] + Math.random()}));
      }
    }
  }, [myTurn]);


  //技相性=======================================================

  //自分の技相性が決まったら、自分へのダメージ数をセット
  useEffect(() => {
    if(myPokeState.compati !== "" && !otherAreaVisible.actionCmd){
      console.log("自分に" + myPokeState.compati);
      setMyPokeState(prev => ({...prev, damage: calcDamage(myPokeState.compati) + Math.random()}));
    }
  }, [myPokeState.compati]);

  //相手の技相性が決まったら、相手へのダメージ数をセット
  useEffect(() => {
    if(opPokeState.compati !== "" && !otherAreaVisible.actionCmd){
      console.log("相手に" + opPokeState.compati);
      setOpPokeState(prev => ({...prev, damage: calcDamage(opPokeState.compati) + Math.random()}));
    }
  }, [opPokeState.compati]);


  //ダメージ数===========================================================

  //自分へのダメージ数が決まったら、ダメージエフェクトを呼ぶ
  useEffect(() => {
    if(myPokeState.damage != 1){
      console.log("自分に" + myPokeState.damage + "ダメージ");
      setOpAreaVisible(prev => ({ ...prev, weapon: true}));
      delay(() => myDamage(), 1000);
    } 
  }, [myPokeState.damage]);

  //相手へのダメージ数が決まったら、ダメージエフェクトを呼ぶ
  useEffect(() => {
    if(opPokeState.damage != 1){
      console.log("相手に" + opPokeState.damage + "ダメージ");
      setMyAreaVisible(prev => ({ ...prev, weapon: true }));
      delay(() => opDamage(), 1000);
    }
  }, [opPokeState.damage]);


  // HP==============================================================================

  //自分のHPが変わったら、死亡判定
  useEffect(() => {
    if(myPokeState.hp != 100){
      console.log("自分の残りHP" + myPokeState.hp);
      setTimeout(() => {
        setMyAreaVisible(prev => ({ ...prev, compati: false}));
        setOpAreaVisible(prev => ({ ...prev, weapon: false}));
        
        if(myPokeState.hp > 0){  //生存してる場合
          if(!skipTurn){  //交代したターンは攻撃しない
            setTimeout(() => {  //相手の攻撃の１秒後に相手の技相性をセット
              if(myTurn.includes("first")){   //先攻で自分ＨＰが減ったら攻撃ターン終了
                setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
              }
              setOpPokeState(prev => ({...prev, compati: compati.op[opPokeState.name][myPokeState.name] + Math.random()}));
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
          setOtherAreaVisible(prev => ({ ...prev, actionCmd: false}));
          setSkipTurn(false);

          //倒れたポケモンは交代コマンドに出ないためにHP０にする
          if(myPokeState.name === myPokeState.poke1Name){
            myPokeState.poke1Hp = 0;
          }
          else if(myPokeState.name === myPokeState.poke2Name){
            myPokeState.poke2Hp = 0;
          }
          else if(myPokeState.name === myPokeState.poke3Name){
            myPokeState.poke3Hp = 0;
          }

          //画像を取得して死亡演出のスタイルを付与する
          const myPokeIMGElm = document.querySelector(".my-poke-img");
          setTimeout(() => {
            setMyAreaVisible(prev => ({ ...prev, dead: true, name: false, hp: false}));
            myPokeIMGElm.classList.add("pokemon-dead");
          }, 1000);
          setTimeout(() => {
            setMyAreaVisible(prev => ({ ...prev, dead: false, img: false}));
            setMyPokeState(prev => ({...prev, life: myPokeState.life - 1}));
          }, 3001);
        }
      }, 2000);
    }
  }, [myPokeState.hp]);


  //相手のHPが変わったら、死亡判定
  useEffect(() => {
    if(opPokeState.hp != 100){
      console.log("相手の残りHP" + opPokeState.hp);
      setTimeout(() => {
        setOpAreaVisible(prev => ({ ...prev, compati: false}));
        setMyAreaVisible(prev => ({ ...prev, weapon: false}));

        if(opPokeState.hp > 0){   //生存している場合
          setTimeout(() => {    //自分の攻撃の１秒後に自分の技相性をセット
            if(myTurn.includes("after")){   //後攻で相手ＨＰが減ったら攻撃ターン終了
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
            }
            setMyPokeState(prev => ({...prev, compati: compati.my[myPokeState.name][opPokeState.name] + Math.random()}));
          }, 1000);
        }
        else if(opPokeState.hp <= 0) {  //死亡したとき
          setOtherAreaVisible(prev => ({ ...prev, actionCmd: false}));

          //画像を取得して死亡演出のスタイルを付与する
          const opPokeIMGElm = document.querySelector(".op-poke-img");
          setTimeout(() => {
            setOpAreaVisible(prev => ({ ...prev, dead: true, name: false, hp: false}));
            opPokeIMGElm.classList.add("pokemon-dead");
          }, 1000);
          setTimeout(() => {
            setOpAreaVisible(prev => ({ ...prev, dead: false, img: false}));  
            setOpPokeState(prev => ({...prev, life: opPokeState.life - 1}));
          }, 3001);
        }
      }, 2000);
    }
  }, [opPokeState.hp]); 


  //ライフ================================================================

  //自分のライフが減ったら勝敗判定
  useEffect(() => {
    if(myPokeState.life != 3 && myPokeState.life > 0){
      //次に出すポケモンを選ぶコマンドを表示する。
      setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: true}));
    }
    //全員死亡の場合、負け
    else if (myPokeState.life <= 0) {
      result.current = "LOSE";
      setOtherAreaVisible(prev => ({ ...prev, battle: false}));
    }
  }, [myPokeState.life]); 

  //相手のライフが減ったら勝敗判定
  useEffect(() => {
    //生存ポケモンがいる場合、ポケモン名称とHPをセットする
    console.log("相手の残りライフ" + opPokeState.life);
    if(opPokeState.life == 2){
      setOpPokeState(prev => ({...prev, name: opPokeState.poke2Name}));
      setOpPokeState(prev => ({...prev, hp: 100}));
    }
    else if(opPokeState.life == 1){
      setOpPokeState(prev => ({...prev, name: opPokeState.poke3Name}));
      setOpPokeState(prev => ({...prev, hp: 100}));
    }
    //全員死亡の場合、勝ち
    else if (opPokeState.life <= 0) {
      result.current = "WIN";
      setOtherAreaVisible(prev => ({ ...prev, battle: false}));
    }
  }, [opPokeState.life]); 


  //クリックイベント=====================================================================

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
    const shuffled = [...opPoke].sort(() => 0.5 - Math.random());
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

  // 戻るボタン
  const backCmd = () => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true, backCmd: false, changeCmd: false}));
  };
  
  // たたかうボタン
  const openBattleCmdArea = () => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, weaponCmd: true}));
    //自分のバトル場のポケモンの技をセットする
    setMyPokeState(prev => ({...prev, weapon: myPoke.find(poke => poke.name === myPokeState.name)?.weapon + Math.random()}));
  };

  //技名ボタン
  const battle = () => {
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: false}));
    //相手の技名をセットする
    setOpPokeState(prev => ({...prev, weapon: opPoke.find(poke => poke.name === opPokeState.name)?.weapon + Math.random()}));
  };

  //交代ボタン
  const openChangeCmdArea = () => {
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, changeCmd: true}));
  };
  
  //控えに交代ボタン
  const changeMyPoke = (changePoke) => { 
    setMyAreaVisible(prev => ({ ...prev, img: false, name: false, hp: false}));
    setOtherAreaVisible(prev => ({ ...prev, changeCmd: false}));
    
   //控えポケモンをセット
    setTimeout(() => {

      //残りHPを保存
      if(myPokeState.name === myPokeState.poke1Name){
        myPokeState.poke1Hp = myPokeState.hp;
      }
      else if(myPokeState.name === myPokeState.poke2Name){
        myPokeState.poke2Hp = myPokeState.hp;
      }
      else if(myPokeState.name === myPokeState.poke3Name){
        myPokeState.poke3Hp = myPokeState.hp;
      }

      setHp(changePoke);    //次に出すポケモンにカレントのHPをセット
      setMyPokeState(prev => ({...prev, name: changePoke}));
      setMyAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true}));
      setSkipTurn(true); // 交代フラグを立てる
    }, 1000);
  }

  //控えポケモンをセット
  const nextMyPoke = (nextPoke) => {
    setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: false}));
    
   //控えポケモンをセット
    setTimeout(() => {
      setMyPokeState(prev => ({...prev, name: nextPoke}));
      setHp(nextPoke);    //次に出すポケモンにカレントのHPをセット
      setMyAreaVisible(prev => ({ ...prev, img: true, name: true, hp: true}));
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: true}));
    }, 1000);
  }


  //その他関数===============================================================================================

  //ダメージ計算
  const calcDamage = (compatiTxt) => {
    let damagePt = 1;
    if(compatiTxt.includes(batsugunTxt)){
      damagePt = 100;
    }
    else if(compatiTxt.includes(toubaiTxt)){
      damagePt = 50;
    }
    else if(compatiTxt.includes(imahitotsuTxt)){
      damagePt = 25;
    }
    else if(compatiTxt.includes(mukouTxt)){
      damagePt = 0;
    }
    return damagePt;
  }

  //ダメージエフェクト=================================================================
  const myDamage = () => {
    setMyAreaVisible(prev => ({ ...prev, compati: true}));
    setMyPokeState(prev => ({...prev,hp: Math.max(0, prev.hp - myPokeState.damage)}));
    const myPokeIMGElem = document.querySelector(".my-poke-img");

    //技相性が無効の時はエフェクトをつけない
    if (myPokeIMGElem && !myPokeState.compati.includes(mukouTxt)) {
      opacityChanges.forEach(({ opacity, delay }) => {
        setTimeout(() => {
          myPokeIMGElem.style.opacity = opacity;
        }, delay);
      });
    }
  }

  const opDamage = () => {
    setOpAreaVisible(prev => ({ ...prev, compati: true}));
    setOpPokeState(prev => ({...prev,hp: Math.max(0, prev.hp - opPokeState.damage)}));    // HPが0未満にならないように修正
    const opPokeIMGElm = document.querySelector(".op-poke-img");

    //技相性が無効の時はエフェクトをつけない
    if (opPokeIMGElm && !opPokeState.compati.includes(mukouTxt)) {
      opacityChanges.forEach(({ opacity, delay }) => {
        setTimeout(() => {
          opPokeIMGElm.style.opacity = opacity;
        }, delay);
      });
    }
  }

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


//HTML===============================================================================================

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
                  {opAreaVisible.compati && (<h1>{opPokeState.compati.replace(/[0-9.]/g, '')}</h1>)}
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
                  {myAreaVisible.compati && (<h1>{myPokeState.compati.replace(/[0-9.]/g, '')}</h1>)}
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