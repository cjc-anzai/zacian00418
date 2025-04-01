import zacian from "./assets/zacian.jfif";
import habatakukami from "./assets/habatakukami.jfif";
import kyojuzan from "./assets/kyojuzan.gif"; 
import "./App.css";
import React, { useState } from "react";


function App() {
  const [isVisible1, setIsVisible1] = useState(false);
  const [isFadingOut1, setIsFadingOut1] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [isFadingOut2, setIsFadingOut2] = useState(false);
  // const [isVisible3, setIsVisible3] = useState(false);
  // const [isFadingOut3, setIsFadingOut3] = useState(false);

  const technique1 = () => {
    setIsVisible1(true); 
    setIsFadingOut1(false);

    // 6秒後にフェードアウト開始
    setTimeout(() => {
      setIsFadingOut1(true);
    }, 6000);

    // 3秒後に完全に非表示
    setTimeout1(() => {
      setIsVisible1(false);
      setIsFadingOut1(false);
    }, 7000);
  };

  const habayakukami = () => {
    setIsVisible2(true); 
    // setIsFadingOut2(false);
  };


  return (
    <div className="App">
      <header className="App-header">
      {!isVisible1 &&(
        <div className="button-container">
          <div>
            <img src={zacian} className="zacian" alt="zacian" onClick={technique1}/>
            <h1>ザシアンが現れた！</h1>
          </div>
          <div>
            <h1>どうする？</h1>
            <button onClick={habayakukami}>ハバタクカミを出す</button>
            {/* <button onClick={houou}>ホウオウをだす</button> */}
          </div>
        </div>
      )}
      {isVisible1 && (
        <div className={`content ${isFadingOut1 ? "fade-out" : ""}`}>
          <img src={kyojuzan} alt="GIF Animation" className="kyojuzan" />
          <h1>きょじゅうざん</h1>
        </div>        
      )}
      {isVisible2 && (
        <div className={`content ${isFadingOut2 ? "fade-out" : ""}`}>
          <img src={habatakukami} alt="GIF Animation" className="habatakukami" />
          <h1>ハバタクカミ</h1>
        </div>        
      )}
      {/* {isVisible3 && (
        <div className={`content ${isFadingOut3 ? "fade-out" : ""}`}>
          <img src={houou} alt="GIF Animation" className="houou" />
          <h1>ホウオウ</h1>
        </div>        
      )} */}

      </header>
    </div>
  );
}

export default App;