import { typeColors, conditionColors, getPokeIndicatorsColor } from "../../../model/model";

const StatusBox = ({
    isMe,
    battleState,
    battleHandlers,
}) => {

    //インポートする変数や関数の取得
    const { myPokeStatics, opPokeStatics, myPokeDynamics, opPokeDynamics, myBattlePokeIndex } = battleState;
    const { getAreaVisible, getBattlePokeStatics, getBattlePokeDynamics } = battleHandlers;

    const areaVisible = getAreaVisible(isMe, true);
    const battlePokeStatics = getBattlePokeStatics(isMe);
    const pokeStatics = isMe ? myPokeStatics : opPokeStatics;
    const pokeDynamics = isMe ? myPokeDynamics : opPokeDynamics;
    const who = isMe ? "my" : "op";
    let pokeCondition = getBattlePokeDynamics(isMe)?.condition || "";
    pokeCondition = pokeCondition === "もうどく" ? "どく" : pokeCondition;

    return (
        <div className="status-box" style={{ display: areaVisible.poke ? "block" : "none" }}>
            <div className="status-header">
                <h1 className={`${who}-poke`}>
                    <span>{battlePokeStatics?.name || ""}</span>
                    <span className="type-wrapper">
                        {pokeCondition !== "" && (
                            <span
                                className="condition"
                                style={{ backgroundColor: conditionColors[pokeCondition], borderColor: conditionColors[pokeCondition] }}
                            >
                                {pokeCondition}
                            </span>
                        )}
                    </span>
                </h1>
                <div className="poke-indicators">
                    {[0, 1, 2].map((i) => {
                        const color = getPokeIndicatorsColor(pokeDynamics[i]?.currentHp || "", pokeStatics.current[i]?.hp || "");
                        return <div key={i} className={`poke-circle ${color}`}></div>;
                    })}
                </div>
            </div>
            <div className={`${who}-hp-container`}>
                <div className={`${who}-hp-bar`}></div>
                {isMe && (
                    <span className="hp-text">
                        {Math.round(myPokeDynamics[myBattlePokeIndex]?.currentHp || "")} / {battlePokeStatics?.hp || ""}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatusBox;
