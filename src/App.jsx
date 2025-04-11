import "./App.css";
import React, { useState, useRef, useEffect } from "react";
import hououIMG from "./assets/houou.jfif";
import zacianIMG from "./assets/zacian.jfif";
import miraidonIMG from "./assets/miraidon.png";
import mugendainaIMG from "./assets/mugendaina.png";

function App() {

  //useState=============================================================================================================

  //表示・非表示の設定=====================================================================
  //自分のポケモン関係
  const [battleArea, setBattleArea] = useState(false);  //バトルエリア
  const [myWeaponArea, setMyWeaponArea] = useState(false);  //技名エリア
  const [myCompatiArea, setMyCompatiArea] = useState(false);  //技相性エリア
  const [myDeadArea, setMyDeadArea]= useState(false); //死亡表記エリア
  const [myPokeIMGArea, setMyPokeIMGArea] = useState(false);  //ポケモン画像エリア
  const [myPokeNameArea, setMyPokeNameArea] = useState(false); //ポケモン名称エリア
  const [myPokeHPArea, setMyPokeHPArea] = useState(false); //ポケモンHPエリア

  //相手のポケモン関係
  const [opWeaponArea, setOpWeaponArea] = useState(false);  //技名エリア
  const [opCompatiArea, setOpCompatiArea] = useState(false);  //技相性エリア
  const [opDeadArea, setOpDeadArea] = useState(false);  //死亡表記エリア
  const [opPokeIMGArea, setOpPokeIMGArea] = useState(false); //ポケモン画像エリア
  const [opPokeNameArea, setOpPokeNameArea] = useState(false);  //ポケモン名称エリア
  const [opPokeHPArea, setOpPokeHPArea] = useState(false); //ポケモンHPエリア

  //その他
  const [battleStart, setBattleStart] = useState(true); //初期表示 
  const [cmdArea, setCmdArea] = useState(false);  //コマンドエリア
  
  //文字列・数値を格納する変数===================================================================
  const [myPokeName, setMyPokeName] = useState("");   //自分のポケモン名称
  const [opPokeName, setOpPokeName] = useState(""); //相手のポケモン名称
  const [myPokeIMG, setMyPokeIMG] = useState(null);   //自分のポケモンの画像
  const [opPokeIMG, setOpPokeIMG] = useState(null);   //相手のポケモンの画像
  const [myWeaponName, setMyWeaponName] = useState("");   //自分のポケモンの技名
  const [opWeaponName, setOpWeaponName] = useState(""); //相手のポケモンの技名
  const [myTurn, setMyTurn] = useState("");
  const [myCompati, setMyCompati] = useState("");   //自分への技相性
  const [opCompati, setOpCompati] = useState("");   //相手への技相性
  const [myDamagePt, setMyDamagePt] = useState(1); //自分へのダメージ数
  const [opDamagePt, setOpDamagePt] = useState(1); //相手へのダメージ数
  const [myHp, setMyHp] = useState(100);   // 自分のHP
  const [opHp, setOpHp] = useState(100); // 相手のHP
  const [myLife, setMyLife] = useState(2);   // 自分の生存ポケモンの数
  const [opLife, setOpLife] = useState(2); // 相手の生存ポケモンの数

  const [skipTurn, setSkipTurn] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false); // 選出中かどうか
  const [selectedOrder, setSelectedOrder] = useState([]); // 選出順（配列で保持）

  //useRef==========================================================================
  const myHP1 = useRef(100);  //自分のポケモンのHP
  const myHP2 = useRef(100);
  const result = useRef("");  //勝敗を格納する

  //一般変数==========================================================================================================================
  const myPoke1 = "ホウオウ";
  const myPoke2 = "ムゲンダイナ";
  const opPoke1 = "ザシアン";
  const opPoke2 = "ミライドン";
  const myWeapon1 = "せいなるほのお";
  const myWeapon2 = "ダイマックスほう";
  const opWeapon1 = "きょじゅうざん";
  const opWeapon2 = "イナズマドライブ";
  let myPokeSpeed = 0;
  let opPokeSpeed = 0;
  const batsugunTxt = "効果はバツグン";
  const toubaiTxt = "等倍ダメージ";
  const imahitotsuTxt = "効果はいまひとつ";
  const mukouTxt = "効果がない";

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
    if(myPokeName !== ""){
      if(myPokeName === myPoke1){
        setMyPokeIMG(hououIMG);
      }
      else if(myPokeName === myPoke2){
        setMyPokeIMG(mugendainaIMG);
      }
      if(myLife == 1){ //2体編成のための条件式
        setMyPokeIMGArea(true); 
        setMyPokeNameArea(true);
        setMyPokeHPArea(true);
        setCmdArea(true);
      }
    }
  }, [myPokeName]);  

  //相手のポケモン名称が決まったら画像をセット
  useEffect(() => {
    if(opPokeName !== ""){
      if(opPokeName === opPoke1){
        setOpPokeIMG(zacianIMG);
      }
      else if(opPokeName === opPoke2){
        setOpPokeIMG(miraidonIMG);
      }
      if(opLife == 1){ //2体編成のための条件式
        setOpPokeIMGArea(true); 
        setOpPokeNameArea(true);
        setOpPokeHPArea(true);
        setCmdArea(true);
      }
    }
  }, [opPokeName]);


  //skipTurn===========================================================

  //交代を選択したら相手の技をセットする。
  useEffect(() => {
    if (skipTurn) {
      if (opPokeName === opPoke1) {
        setOpWeaponName(opWeapon1 + Math.random());
      }
      else if (opPokeName === opPoke2) {
        setOpWeaponName(opWeapon2 + Math.random());
      }
    }
  }, [skipTurn]);
  

  //技名===============================================================

  //自分の技名がセットされたら、相手の技名をセットする。
  useEffect(() => {
    if(opPokeName !== ""){
      console.log(myWeaponName + "がセットされた");
      if (opPokeName === opPoke1) {
        setOpWeaponName(opWeapon1 + Math.random());
      }
      else if (opPokeName === opPoke2) {
        setOpWeaponName(opWeapon2 + Math.random());
      }
    }
  }, [myWeaponName]);

  //相手の技名がセットされたら、先攻後攻を決める
  useEffect(() => {
    if(opPokeName !== ""){
      console.log(opWeaponName + "がセットされた");
      // 素早さをセット
      if(myPokeName === myPoke1){
        myPokeSpeed = 90;
      }
      else if(myPokeName === myPoke2){
        myPokeSpeed = 130;
      }

      if(opPokeName === opPoke1){
        opPokeSpeed = 138;
      }
      else if(opPokeName === opPoke2){
        opPokeSpeed = 135;
      }
      
      // 先攻後攻の判定　交代した場合は後攻扱いにする
      if (myPokeSpeed > opPokeSpeed && !skipTurn) {
        setMyTurn("first" + Math.random());
      }
      else{
        setMyTurn("after" + Math.random());
      }
    }
  }, [opWeaponName]);


  //先攻後攻が決まったら技相性をセット=======================================================
  useEffect(() => {
    if (myTurn !== "") {
      if(myTurn.includes("first")){   //先攻なら相手の技相性をセット
        console.log("先攻がセットされた");
        if (myPokeName === myPoke1) {
          if (opPokeName === opPoke1) {
            setOpCompati(batsugunTxt + Math.random());
          }
          else if (opPokeName === opPoke2) {
            setOpCompati(imahitotsuTxt + Math.random());
          }
        }
        else if (myPokeName === myPoke2) {
          if (opPokeName === opPoke1) {
            setOpCompati(mukouTxt + Math.random());
          }
          else if (opPokeName === opPoke2) {
            setOpCompati(batsugunTxt + Math.random());
          }  
        }
      }
      else if(myTurn.includes("after")){    //後攻なら自分の技相性をセット
        console.log("後攻がセットされた");
        if (opPokeName === opPoke1) {
          if (myPokeName === myPoke1) {
            setMyCompati(imahitotsuTxt + Math.random());
          }
          else if (myPokeName === myPoke2) {
            setMyCompati(toubaiTxt + Math.random());
          }
        }
        else if (opPokeName === opPoke2) {
          if (myPokeName === myPoke1) {
            setMyCompati(batsugunTxt + Math.random());
          }
          else if (myPokeName === myPoke2) {
            setMyCompati(imahitotsuTxt + Math.random());
          }
        }
      }
    }
  }, [myTurn]);


  //技相性=======================================================

  //自分の技相性が決まったら、自分へのダメージ数をセット
  useEffect(() => {
    if(myCompati !== "" && !cmdArea){
      console.log("自分に" + myCompati);
      if(myCompati.includes(batsugunTxt)){
        setMyDamagePt(100 + Math.random());
      }
      else if(myCompati.includes(toubaiTxt)){
        setMyDamagePt(50 + Math.random());
      }
      else if(myCompati.includes(imahitotsuTxt)){
        setMyDamagePt(25 + Math.random());
      }
      else{
        setMyDamagePt(0 + Math.random());
      }
    }
  }, [myCompati]);

  //相手の技相性が決まったら、相手へのダメージ数をセット
  useEffect(() => {
    if(opCompati !== "" && !cmdArea){
      console.log("相手に" + opCompati);
      if(opCompati.includes(batsugunTxt)){
        setOpDamagePt(100 + Math.random());
      }
      else if(opCompati.includes(toubaiTxt)){
        setOpDamagePt(50 + Math.random());
      }
      else if(opCompati.includes(imahitotsuTxt)){
        setOpDamagePt(25 + Math.random());
      }
      else{
        setOpDamagePt(0 + Math.random());
      }
    }
  }, [opCompati]);


  //ダメージ数===========================================================

  //自分へのダメージ数が決まったら、ダメージエフェクトを呼ぶ
  useEffect(() => {
    if(myDamagePt != 1){
      console.log("自分に" + myDamagePt + "ダメージ");
      setOpWeaponArea(true);
      setTimeout(() => {  //技名を表示してから１秒後に相手にダメージエフェクト
        myDamage();
      }, 1000);
    } 
  }, [myDamagePt]);

  //相手へのダメージ数が決まったら、ダメージエフェクトを呼ぶ
  useEffect(() => {
    if(opDamagePt != 1){
      console.log("相手に" + opDamagePt + "ダメージ");
      setMyWeaponArea(true);
      setTimeout(() => {  //技名を表示してから１秒後に相手にダメージエフェクト
        opDamage();
      }, 1000);
    }
  }, [opDamagePt]);


  // HP==============================================================================

  //自分のHPが変わったら、死亡判定
  useEffect(() => {
    if(myHp != 100){
      console.log("自分の残りHP" + myHp);
      setTimeout(() => {
        setMyCompatiArea(false);
        setOpWeaponArea(false);
        
        if(myHp > 0){  //生存してる場合
          if(!skipTurn){  //交代したターンは攻撃しない
            setTimeout(() => {  //相手の攻撃の１秒後に相手の技相性をセット
              if(myTurn.includes("first")){   //先攻で自分ＨＰが減ったら攻撃ターン終了
                setCmdArea(true);
              }
              else if (myPokeName === myPoke1) {
                if (opPokeName === opPoke1) {
                  setOpCompati(batsugunTxt + Math.random());
                }
                else if (opPokeName === opPoke2) {
                  setOpCompati(imahitotsuTxt + Math.random());
                }
              }
              else if (myPokeName === myPoke2) {
                if (opPokeName === opPoke1) {
                  setOpCompati(mukouTxt + Math.random());
                }
                else if (opPokeName === opPoke2) {
                  setOpCompati(batsugunTxt + Math.random());
                }
              }
            }, 1000);
          }
          else if (skipTurn) { // 交代後、相手の攻撃が終わるころ、コマンドボタンを表示
            setTimeout(() => {
              setCmdArea(true);
              setSkipTurn(false);
            }, 1000); 
          }
        }
        else if(myHp <= 0) {  //死亡したとき
          setCmdArea(false);

          //倒れたポケモンは交代コマンドに出ないためにHP０にする
          if(myPokeName === myPoke1){
            myHP1.current = 0;
          }
          else if(myPokeName === myPoke2){
            myHP2.current = 0;
          }

          //画像を取得して死亡演出のスタイルを付与する
          const myPokeIMGElm = document.querySelector(".my-poke-img");
          setTimeout(() => {
            setMyDeadArea(true);
            setMyPokeNameArea(false);
            setMyPokeHPArea(false);
            myPokeIMGElm.classList.add("pokemon-dead");
          }, 1000);
          setTimeout(() => {
            setMyDeadArea(false);
            setMyPokeIMGArea(false);
            setMyLife(myLife - 1);
          }, 3001);
        }
      }, 2000);
    }
  }, [myHp]);


  //相手のHPが変わったら、死亡判定
  useEffect(() => {
    if(opHp != 100){
      console.log("相手の残りHP" + opHp);
      setTimeout(() => {
        setOpCompatiArea(false);
        setMyWeaponArea(false);

        if(opHp > 0){   //生存している場合
          setTimeout(() => {    //自分の攻撃の１秒後に自分の技相性をセット
            if(myTurn.includes("after")){   //後攻で相手ＨＰが減ったら攻撃ターン終了
              setCmdArea(true);
            }
            else if (opPokeName === opPoke1) {
              if (myPokeName === myPoke1) {
                setMyCompati(imahitotsuTxt + Math.random());
              }
              if (myPokeName === myPoke2) {
                setMyCompati(toubaiTxt + Math.random());
              }
            }
            else if (opPokeName === opPoke2) {
              if (myPokeName === myPoke1) {
                setMyCompati(batsugunTxt + Math.random());
              }
              else if (myPokeName === myPoke2) {
                setMyCompati(imahitotsuTxt + Math.random());
              }
            }
          }, 1000);
        }
        else if(opHp <= 0) {  //死亡したとき
          setCmdArea(false);

          //画像を取得して死亡演出のスタイルを付与する
          const opPokeIMGElm = document.querySelector(".op-poke-img");
          setTimeout(() => {
            setOpDeadArea(true);
            setOpPokeNameArea(false);
            setOpPokeHPArea(false);
            opPokeIMGElm.classList.add("pokemon-dead");
          }, 1000);
          setTimeout(() => {
            setOpDeadArea(false);  
            setOpPokeIMGArea(false); 
            setOpLife(opLife - 1);
          }, 3001);
        }
      }, 2000);
    }
  }, [opHp]); 


  //ライフ================================================================

  //自分のライフが減ったら勝敗判定
  useEffect(() => {
    //生存ポケモンがいる場合、ポケモン名称とHPをセットする
    if(myLife != 2 && myLife > 0){
      if(myPokeName === myPoke1){
        setMyPokeName(myPoke2);
        setMyHp(myHP2.current);
      }
      else if(myPokeName === myPoke2){
        setMyPokeName(myPoke1);
        setMyHp(myHP1.current);
      }
    }
    //全員死亡の場合、負け
    else if (myLife <= 0) {
      result.current = "LOSE";
      setBattleArea(false);
    }
  }, [myLife]); 

  //自分のライフが減ったら勝敗判定
  useEffect(() => {
    //生存ポケモンがいる場合、ポケモン名称とHPをセットする
    if(opLife != 2 && opLife > 0){
      console.log("相手の残りライフ" + opLife);
      if(opPokeName === opPoke1){
        setOpPokeName(opPoke2);
        setOpHp(100);
      }
      else if(opPokeName === opPoke2){
        setOpPokeName(opPoke1);
        setOpHp(100);
      }
    }
    //全員死亡の場合、勝ち
    else if (opLife <= 0) {
      result.current = "WIN";
      setBattleArea(false);
    }
  }, [opLife]); 


  //クリックイベント=====================================================================

  // スタートボタン
  const start = () => {    
    setBattleStart(false);
    setIsSelecting(true); // 選出画面へ
  };

  //選出確定ボタン
  const confirmSelection = () => {
    setIsSelecting(false);
    setBattleArea(true);
  
    setMyPokeName(selectedOrder[0]);
    if (selectedOrder[0] === "ホウオウ") {
      myHP1.current = 100;
      myHP2.current = 100;
    } else {
      myHP2.current = 100;
      myHP1.current = 100;
    }
  
    setOpPokeName(Math.random() < 0.5 ? "ザシアン" : "ミライドン");
  
    setMyPokeIMGArea(true);
    setOpPokeIMGArea(true);
    setMyPokeNameArea(true);
    setOpPokeNameArea(true);
    setMyPokeHPArea(true);
    setOpPokeHPArea(true);
    setCmdArea(true);
  };

  // たたかうボタン
  const battle = () => {
    setCmdArea(false);

    // 自分の技名をセット
    if (myPokeName === myPoke1) {
      setMyWeaponName(myWeapon1 + Math.random());
    }
    else if (myPokeName === myPoke2) {
      setMyWeaponName(myWeapon2 + Math.random());
    }
  };

  //控えに交代ボタン
  const changeMyPoke = () => {
    setCmdArea(false);  
    setMyPokeIMGArea(false);
    setMyPokeNameArea(false);
    setMyPokeHPArea(false);
    
   //控えポケモンをセット
    setTimeout(() => {
      if(myPokeName === myPoke1){
        myHP1.current = myHp;             // 今のHPを保存
        setMyPokeName(myPoke2);
        setMyHp(myHP2.current);          // 保存したHPをセット
      }
      else if(myPokeName === myPoke2){
        myHP2.current = myHp;
        setMyPokeName(myPoke1);
        setMyHp(myHP1.current);
      }
      setMyPokeIMGArea(true);
      setMyPokeNameArea(true);
      setMyPokeHPArea(true);
      setSkipTurn(true); // 交代フラグを立てる
    }, 1000);
  }

  //その他関数===============================================================================================

  //ダメージエフェクト=================================================================
  const myDamage = () => {
    setMyCompatiArea(true);
    setMyHp((prevHp) => Math.max(0, prevHp - myDamagePt));  // HPが0未満にならないように修正
    const myPokeIMGElem = document.querySelector(".my-poke-img");

    //技相性が無効の時はエフェクトをつけない
    if (myPokeIMGElem && !myCompati.includes(mukouTxt)) {
      opacityChanges.forEach(({ opacity, delay }) => {
        setTimeout(() => {
          myPokeIMGElem.style.opacity = opacity;
        }, delay);
      });
    }
  }

  const opDamage = () => {
    setOpCompatiArea(true);
    setOpHp((prevHp) => Math.max(0, prevHp - opDamagePt));  // HPが0未満にならないように修正
    const opPokeIMGElm = document.querySelector(".op-poke-img");

    //技相性が無効の時はエフェクトをつけない
    if (opPokeIMGElm && !opCompati.includes(mukouTxt)) {
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
      if (prev.length < 2) {
        return [...prev, pokeName]; // 2体まで選択OK
      }
      return prev; // 2体以上は無視
    });
  };


//HTML===============================================================================================

  return (
    <div className="App">
      <header className="App-header">
        {battleStart && (
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
            </div>

            <h2>自分のポケモンを選出</h2>
            <div className="my-poke-select">
              {[{ name: "ホウオウ", img: hououIMG }, { name: "ムゲンダイナ", img: mugendainaIMG }].map((poke) => (
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
              {selectedOrder.length === 2 && (
                <button onClick={confirmSelection}>バトル開始！</button>
              )}
            </div>
          </div>
        )}
        <div className="battle-area-wrap">
          {battleArea && (
            <div className="battle-area" style={{ display: "flex" }}>
              <div className="op-poke-area-wrap">
                <div className="txt-area">
                  {opCompatiArea && (<h1>{opCompati.replace(/[0-9.]/g, '')}</h1>)}
                  {opDeadArea && (<h1>{opPokeName}は倒れた</h1>)}
                  {opWeaponArea && opPokeName && opWeaponName && (<h1>{opWeaponName.replace(/[0-9.]/g, '')}</h1>)}
                </div>
                <div className="op-poke-area">
                  {opPokeIMGArea && (<img src={opPokeIMG} alt="相手のポケモン" id="opPokeIMG" className="op-poke-img" />)}
                  {opPokeNameArea && ( <h1 className="op-poke">{opPokeName.replace(/[0-9.]/g, '')}</h1>)}
                </div>
                <div className="op-hp-area">
                  {opPokeHPArea && (
                    <div className="op-hp-container">
                      <div className={`op-hp-bar ${opHp <= 25 ? "low" : opHp <= 50 ? "mid" : ""}`} style={{ width: `${opHp}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="my-poke-area-wrap">
                <div className="txt-area">
                  {myCompatiArea && (<h1>{myCompati.replace(/[0-9.]/g, '')}</h1>)}
                  {myDeadArea && (<h1>{myPokeName}は倒れた</h1>)}
                  {myWeaponArea && myPokeName && myWeaponName && (<h1>{myWeaponName.replace(/[0-9.]/g, '')}</h1>)}
                </div>
                <div className="my-poke-area">
                  {myPokeIMGArea && (<img src={myPokeIMG} alt="自分のポケモン" id="myPokeIMG" className="my-poke-img" />)}
                  {myPokeNameArea && ( <h1 className="my-poke">{myPokeName}</h1>)}
                </div>
                <div className="my-hp-area">
                  {myPokeHPArea && (
                    <div className="my-hp-container">
                      <div   className={`my-hp-bar ${myHp <= 25 ? "low" : myHp <= 50 ? "mid" : ""}`}style={{ width: `${myHp}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="cmd-area">
            {cmdArea && (
              <div className="cmd-buttons">
                <button onClick={battle}>たたかう</button>
                {myPokeName === myPoke1 && myHP2.current > 0 && <button onClick={changeMyPoke}>{myPoke2}</button>}
                {myPokeName === myPoke2 && myHP1.current > 0 && <button onClick={changeMyPoke}>{myPoke1}</button>}
              </div>
            )}
          </div>
        </div>
        {!battleStart && !battleArea && !cmdArea &&(
          <h1>{result.current}</h1>
        )}
      </header>
    </div>
  );
}

export default App;