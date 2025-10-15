import "../css/App.css";
import { useEffect } from 'react';
import TopScreen from './components/TopScreen';
import SelectScreen from "./components/SelectScreen";
import BattleCommandArea from "./components/battleScreen/BattleCommandArea";
import ResultScreen from "./components/ResultScreen";
import { useBattleStates } from "../js/useBattleStates";
import { useBattleEffects } from "../js/useBattleEffects";
import { useBattleControllers } from "../js/useBattleControllers";
import { useBattleHandlers } from "../js/useBattleHandlers";
import { useBattleExecutors } from "../js/useBattleExecutors";

function App() {

  const battleStates = useBattleStates();
  useBattleEffects(battleStates);
  const battleControllers = useBattleControllers(battleStates);
  const battleHandlers = useBattleHandlers(battleStates);
  const battleExecutors = useBattleExecutors(battleStates);

  //縦画面サイズの取得
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {battleStates.areaVisible.top && (
          <TopScreen
            battleExecutors={battleExecutors}
            setAreaVisible={battleStates.setAreaVisible}
          />
        )}
        {battleStates.areaVisible.select && (
          <SelectScreen
            battleStates={battleStates}
            battleControllers={battleControllers}
            battleExecutors={battleExecutors}
          />
        )}
        {battleStates.areaVisible.battle && (
          <BattleCommandArea
            battleStates={battleStates}
            battleControllers={battleControllers}
            battleHandlers={battleHandlers}
            battleExecutors={battleExecutors}
          />
        )}
        {!battleStates.areaVisible.top && !battleStates.areaVisible.select && !battleStates.areaVisible.battle && (
          <ResultScreen
            otherTextRef={battleStates.otherTextRef}
          />
        )}
      </header>
    </div>
  );
}

export default App;