import { typeColors, conditionColors, getPokeIndicatorsColor } from "../../../model/model";

const HpArea = ({
    isMe,
    battleState,
    battleHandlers,
}) => {

    //インポートする変数や関数の取得
    const { areaVisible, myPokeStatics, opPokeStatics, myPokeDynamics, opPokeDynamics, myBattlePokeIndex } = battleState;
    const { getBattlePokeStatics, getBattlePokeDynamics } = battleHandlers;

    const battlePokeStatics = getBattlePokeStatics(isMe);
    const pokeStatics = isMe ? myPokeStatics : opPokeStatics;
    const pokeDynamics = isMe ? myPokeDynamics : opPokeDynamics;
    const who = isMe ? "my" : "op";
    let pokeCondition = getBattlePokeDynamics(isMe)?.condition;
    pokeCondition = pokeCondition ? pokeCondition : "";
    pokeCondition = pokeCondition === "もうどく" ? "どく" : pokeCondition;

    return (
        <div className="hp-area" style={{ opacity: areaVisible[isMe ? "myPoke" : "opPoke"] ? 1 : 0 }}>
            <div className="hp-area-header">
                <p className={`${who}-poke-name`}>
                    {battlePokeStatics?.name || ""}
                </p>
                <p className="condition" style={{ backgroundColor: conditionColors[pokeCondition], borderColor: conditionColors[pokeCondition] }}>
                    {pokeCondition}
                </p>
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
                    <p className="hp-text">
                        {Math.round(myPokeDynamics[myBattlePokeIndex]?.currentHp || "")} / {battlePokeStatics?.hp || ""}
                    </p>
                )}
            </div>
        </div >
    );
};

export default HpArea;
