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

    // 2.5秒後にフェードアウト開始
    setTimeout(() => {
      setIsFadingOut(true);
    }, 6500);

    // 3秒後に完全に非表示
    setTimeout(() => {
      setIsVisible(false);
      setIsFadingOut(false);
    }, 7000);
  };


  return (
    <div className="App">
      <header className="App-header">
      {!isVisible &&<img src={zacian} className="zacian" alt="zacian" onClick={technique}/>}
      {isVisible && (
        <img
          src={kyojuzan}
          alt="GIF Animation"
          className={`visible-gif ${isFadingOut ? "fade-out" : ""}`}
        />
      )}

        <h1>ザシアン</h1>

      </header>
    </div>
  );
}

export default App;