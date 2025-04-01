import zacian from "./assets/zacian.jfif";
import kyojuzan from "./assets/kyojuzan.gif"; 
import "./App.css";
import React, { useState } from "react";


function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const technique = () => {
    setIsVisible(true); 
    setIsFadingOut(false);

    // 6秒後にフェードアウト開始
    setTimeout(() => {
      setIsFadingOut(true);
    }, 6000);

    // 3秒後に完全に非表示
    setTimeout(() => {
      setIsVisible(false);
      setIsFadingOut(false);
    }, 7000);
  };


  return (
    <div className="App">
      <header className="App-header">
      {!isVisible &&(
        <div>
          <img src={zacian} className="zacian" alt="zacian" onClick={technique}/>
          <h1>ザシアン</h1>
        </div>
      )}
      {isVisible && (
        <div className={`content ${isFadingOut ? "fade-out" : ""}`}>
          <img src={kyojuzan} alt="GIF Animation" className="visible-gif" />
          <h1>きょじゅうざん</h1>
        </div>        
      )}

      </header>
    </div>
  );
}

export default App;