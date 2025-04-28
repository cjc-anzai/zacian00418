import "./App.css";
import TopScreen from './components/TopScreen';
import SelectScreen from "./components/SelectScreen";
import BattleArea from "./components/BattleArea";
import CommandArea from "./components/CommandArea";
import ResultScreen from "./components/ResultScreen";
import { useBattleState } from "./controller/useBattleState";
import { useBattleHandlers } from "./controller/useBattleHandlers";
import { useBattleEffects } from "./controller/useBattleEffects";
import { useClickFnc } from "./controller/useClickFnc";
import { pokeImgs, pokeInfo } from "./model/model";

function App() {

  const battleState = useBattleState();
  const battleHandlers = useBattleHandlers(battleState);
  useBattleEffects(battleState);
  const clickFnc = useClickFnc(battleState);

  //HTML==========================================================================================================================
  return (
    <div className="App">
      <header className="App-header">
        {battleState.otherAreaVisible.top && <TopScreen onStart={clickFnc.start} />}
        {battleState.otherAreaVisible.isSelecting && (
          <SelectScreen
            pokeImgs={pokeImgs}
            selectedOrder={battleState.selectedOrder}
            handleSelect={clickFnc.handleSelect}
            confirmSelection={clickFnc.confirmSelection}
          />
        )}
        {battleState.otherAreaVisible.battle && (
          <div className="battle-area-wrap">
            <BattleArea
              opPokeState={battleState.opPokeState}
              myPokeState={battleState.myPokeState}
              opAreaVisible={battleState.opAreaVisible}
              myAreaVisible={battleState.myAreaVisible}
            />
            <CommandArea
              otherAreaVisible={battleState.otherAreaVisible}
              opAreaVisible={battleState.opAreaVisible}
              myAreaVisible={battleState.myAreaVisible}
              opPokeState={battleState.opPokeState}
              myPokeState={battleState.myPokeState}
              getTrueText={battleHandlers.getTrueText}
              pokeInfo={pokeInfo}
              openBattleCmdArea={clickFnc.openBattleCmdArea}
              openChangeCmdArea={clickFnc.openChangeCmdArea}
              backCmd={clickFnc.backCmd}
              battle={clickFnc.battle}
              changeMyPoke={clickFnc.changeMyPoke}
              nextMyPoke={clickFnc.nextMyPoke}
            />
          </div>
        )}
        {!battleState.otherAreaVisible.top && !battleState.otherAreaVisible.isSelecting && !battleState.otherAreaVisible.battle && (
          <ResultScreen resultText={battleState.resultText} goTop={clickFnc.goTop} />
        )}
      </header>
    </div>
  );
}

export default App;