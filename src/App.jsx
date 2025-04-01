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

    // 3秒後に完全に非表示
    setTimeout1(() => {
      setzacianIsVisible(false);
      setKyojuzanIsFadingOut(false);
    }, 7000);
  };

  const habayakukami = () => {
    habatakukamiIsVisible(true); 
    // setIsVisible3(true); 
    // setIsFadingOut2(false);
  };

  const moonForce = () => {
    alert("ムーンフォース");
  };


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
                    {/* <button onClick={houou}>ホウオウをだす</button> */}
                  </div>
                )}
              </div>
            </div>
          )}
          {isVisible1 && (
            <div className={`content ${isFadingOut1 ? "fade-out" : ""}`}>
              <img src={kyojuzanGif} alt="GIF Animation" className="kyojuzan" />
              <h1>きょじゅうざん</h1>
            </div>        
          )}
          {habatakukamiIsVisible && (
            <div className={`content ${isFadingOut2 ? "fade-out" : ""}`}>
              <div>
                <img src={habatakukami} alt="GIF Animation" className="habatakukami" />
                <h1>ハバタクカミ</h1>
              </div>
              <div>
                <h1>どうする？</h1>
                <button onClick={moonForce}>ムーンフォース</button>
                {/* <button onClick={houou}>ホウオウをだす</button> */}
              </div>
            </div>        
          )}
          {/* {isVisible3 && (
            <div className={`content ${isFadingOut3 ? "fade-out" : ""}`}>
              <img src={houou} alt="GIF Animation" className="houou" />
              <h1>ホウオウ</h1>
            </div>        
          )} */}
        </div>
      </header>
    </div>
  );
}

export default App;