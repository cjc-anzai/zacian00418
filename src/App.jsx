import zacian from "./assets/zacian.jfif";
import habatakukamiPhote from "./assets/habatakukami.jfif";
import kyojuzanGif from "./assets/kyojuzan.gif"; 
import "./App.css";
import React, { useState } from "react";


function App() {
  const [zacianIsVisible, setZacianIsVisible] = useState(false);
  const [kyojuzanIsFadingOut, setKyojuzanIsFadingOut] = useState(false);
  const [habatakukamiIsVisible, setHabatakukamiIsVisible] = useState(false);
  const [moonForceIsVisible, setMoonForceIsVisible] = useState(false);
  const [myTurn, setmyTurn] = useState(true);

  const kyojuzan = () => {
    setZacianIsVisible(true); 
    setKyojuzanIsFadingOut(false);

    // 6秒後にフェードアウト開始
    setTimeout(() => {
      setKyojuzanIsFadingOut(true);
    }, 6000);

    // 7秒後に完全に非表示
    setTimeout(() => {
      setZacianIsVisible(false);
      // setKyojuzanIsFadingOut(false);
    }, 7000);

    setTimeout(() => {
      const habatakukamiElement = document.querySelector(".habatakukami");

      // opacityの値とタイミングを配列に格納
      const opacityChanges = [
          { opacity: "0", delay: 50 },
          { opacity: "1", delay: 100 },
          { opacity: "0", delay: 150 },
          { opacity: "1", delay: 200 },
          { opacity: "0", delay: 250 },
          { opacity: "1", delay: 300 }
      ];

      // 配列をループしてsetTimeoutで処理
      opacityChanges.forEach(({ opacity, delay }) => {
          setTimeout(() => {
            habatakukamiElement.style.opacity = opacity;
          }, delay);
      });

      const batsugunElement = document.querySelector(".batsugun");
      batsugunElement.style.opacity = 1;

    }, 6501);

  };

  const habatakukami = () => {
    setHabatakukamiIsVisible(true); 
  };

  const moonForce = () => {
    setTimeout(() => {
      setMoonForceIsVisible(true);
      setTimeout(() => {
        setMoonForceIsVisible(false);
      }, 2000);
      setmyTurn(false);
    
      const zacianElement = document.querySelector(".zacian");

      // opacityの値とタイミングを配列に格納
      const opacityChanges = [
          { opacity: "0", delay: 50 },
          { opacity: "1", delay: 100 },
          { opacity: "0", delay: 150 },
          { opacity: "1", delay: 200 },
          { opacity: "0", delay: 250 },
          { opacity: "1", delay: 300 }
      ];

      // 配列をループしてsetTimeoutで処理
      opacityChanges.forEach(({ opacity, delay }) => {
          setTimeout(() => {
              zacianElement.style.opacity = opacity;
          }, delay);
      });
    }, 500);

    setTimeout(() => {
      kyojuzan();
    }, 2501);
    
};


  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: "flex" }}>
          {!zacianIsVisible &&(
            <div className="button-container">
              <div>
                {moonForceIsVisible &&(<h1>効果はいまひとつのようだ</h1>)}
                <img src={zacian} className="zacian" alt="zacian" onClick={kyojuzan}/>
                <h1>ザシアンが現れた！</h1>
              </div>
              <div>
                {!habatakukamiIsVisible &&(
                  <div>
                    <h1>どうする？</h1>
                    <button onClick={habatakukami}>ハバタクカミを出す</button>
                  </div>
                )}
              </div>
            </div>
          )}
          {zacianIsVisible && (
            <div className={`content ${kyojuzanIsFadingOut ? "fade-out" : ""}`}>
              <h1>相手のザシアンの</h1>
              <img src={kyojuzanGif} alt="GIF Animation" className="kyojuzan" />
              <h1>きょじゅうざん</h1>
            </div>        
          )}
          {habatakukamiIsVisible && (
            <div style={{ display: "flex" }}>
              <div>
                {moonForceIsVisible && (<h1 style={{ color: "pink" }}>ムーンフォース</h1>)}
                <h1 className="batsugun" style={{ opacity: "0" }}>効果はバツグンだ</h1>
                <img src={habatakukamiPhote} alt="GIF Animation" className="habatakukami" />
                <h1>ハバタクカミ</h1>
              </div>
              {!moonForceIsVisible && myTurn &&(
                <div>
                  <h1>どうする？</h1>
                  <button onClick={moonForce}>ムーンフォース</button>
                </div>
              )}
            </div>        
          )}
        </div>
      </header>
    </div>
  );
}

export default App;