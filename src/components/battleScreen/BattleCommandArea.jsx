import BattleArea from "./subcomponents/BattleArea";
import HpArea from "./subcomponents/HpArea";
import CommandTextArea from "./subcomponents/CommandTextArea";

const BattleCommandArea = ({
  battleState,
  battleHandlers,
}) => {

  return (
    <div className="battle-command-area-wrap">
      <div className="battle-hp-area">
        <div className="op-area">
          <BattleArea
            isMe={false}
            battleState={battleState}
            battleHandlers={battleHandlers}
          />
          <HpArea
            isMe={false}
            battleState={battleState}
            battleHandlers={battleHandlers}
          />
        </div>

        <div className="my-area">
          <BattleArea
            isMe={true}
            battleState={battleState}
            battleHandlers={battleHandlers}
          />
          <HpArea
            isMe={true}
            battleState={battleState}
            battleHandlers={battleHandlers}
          />
        </div>
      </div>
      <CommandTextArea
        battleState={battleState}
        battleHandlers={battleHandlers}
      />
    </div>
  );
};

export default BattleCommandArea;
