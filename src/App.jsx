import zacian from "./assets/zacian.jfif";
import habatakukami from "./assets/habatakukami.jfif";
import kyojuzanGif from "./assets/kyojuzan.gif"; 
import "./App.css";
import React, { useState } from "react";


function App() {
  const [zacianIsVisible, setzacianIsVisible] = useState(false);
  const [kyojuzanIsFadingOut, setKyojuzanIsFadingOut] = useState(false);
  const [habatakukamiIsVisible, setHabatakukamiIsVisible] = useState(false);

  const kyojuzan = () => {
    setzacianIsVisible(true); 
    kyojuzanIsFadingOut(false);

    // 6秒後にフェードアウト開始
    setTimeout(() => {
      setKyojuzanIsFadingOut(true);
    }, 6000);

    // 7秒後に完全に非表示
    setTimeout1(() => {
      setzacianIsVisible(false);
      setKyojuzanIsFadingOut(false);
    }, 7000);
  };

  // const habayakukami = () => {
  //   habatakukamiIsVisible(true); 
  // };

  // const moonForce = () => {
  //   alert("ムーンフォース");
  // };


  return (
    <div className="App">
      <header className="App-header">
        <div style="display: flex;">
          {!zacianIsVisible &&(
            <div className="button-container">
              <div>
                <img src={zacian} className="zacian" alt="zacian" onClick={kyojuzan}/>
                <h1>ザシアンが現れた！</h1>
              </div>
              <div>
                {!isVisible2 &&(
                  <div>
                    <h1>どうする？</h1>
                    <button onClick={habayakukami}>ハバタクカミを出す</button>
                  </div>
                )}
              </div>
            </div>
          )}
          {zacianIsVisible && (
            <div className={`content ${kyojuzanIsFadingOut ? "fade-out" : ""}`}>
              <img src={kyojuzanGif} alt="GIF Animation" className="kyojuzan" />
              <h1>きょじゅうざん</h1>
            </div>        
          )}
          {habatakukamiIsVisible && (
            <div>
              <div>
                <img src={habatakukami} alt="GIF Animation" className="habatakukami" />
                <h1>ハバタクカミ</h1>
              </div>
              <div>
                <h1>どうする？</h1>
                <button onClick={moonForce}>ムーンフォース</button>
              </div>
            </div>        
          )}
        </div>
      </header>
    </div>
  );
}

export default App;