import BattleArea from "./subcomponents/BattleArea";
import HpArea from "./subcomponents/HpArea";
import CommandTextArea from "./subcomponents/CommandTextArea";

const BattleCommandArea = ({
  battleStates, battleControllers, battleHandlers, battleExecutors,
}) => {

  return (
    <div className="battle-command-area-wrap">
      <div className="battle-hp-area">
        <div className="op-area">
          <BattleArea
            isMe={false}
            battleStates={battleStates}
            battleHandlers={battleHandlers}
            battleExecutors={battleExecutors}
          />
          <HpArea
            isMe={false}
            battleStates={battleStates}
            battleHandlers={battleHandlers}
            battleExecutors={battleExecutors}
          />
        </div>

        <div className="my-area">
          <BattleArea
            isMe={true}
            battleStates={battleStates}
            battleHandlers={battleHandlers}
            battleExecutors={battleExecutors}
          />
          <HpArea
            isMe={true}
            battleStates={battleStates}
            battleHandlers={battleHandlers}
            battleExecutors={battleExecutors}
          />
        </div>
      </div>
      <CommandTextArea
        battleStates={battleStates}
        battleControllers={battleControllers}
        battleExecutors={battleExecutors}
      />
    </div>
  );
};

export default BattleCommandArea;
