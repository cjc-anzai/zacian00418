import { useState, useEffect } from 'react';

const MyHpBar = ({ myPokeState, battleHandlers }) => {
  const { name, poke1Name, poke2Name, poke3Name, poke1H, poke2H, poke3H } = myPokeState;
  const [displayHp, setDisplayHp] = useState(1000);

  let currentHp = 0;
  if (name === poke1Name) currentHp = poke1H;
  else if (name === poke2Name) currentHp = poke2H;
  else if (name === poke3Name) currentHp = poke3H;

  const maxHp = name === poke1Name ? myPokeState.poke1FullH : poke2Name ? myPokeState.poke2FullH : poke3Name ? myPokeState.poke3FullH : 0; 
  
  useEffect(() => {
    // 数値アニメなし、即セット
    const clampedHp = Math.min(Math.max(currentHp, 0), maxHp);
    setDisplayHp(clampedHp);
  }, [currentHp, maxHp]);

  const widthPercent = Math.max((displayHp / maxHp) * 100, 0);

  return (
    <div className="my-hp-container">
      <div
        className="my-hp-bar"
        style={{ width: `${widthPercent}%` }}
      ></div>
      <span className="hp-text">
        {Math.round(displayHp)} / {maxHp}
      </span>
    </div>
  );
};

export default MyHpBar;
