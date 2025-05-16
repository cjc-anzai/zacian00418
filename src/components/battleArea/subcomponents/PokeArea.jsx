import { motion, AnimatePresence } from "framer-motion";

const PokeArea = ({
    who,
    battleState
}) => {

    //インポートする変数や関数の取得
    const { opPokeState, myPokeState, opAreaVisible, myAreaVisible, } = battleState;
    
    const isMy = who === "my"; 
    const areaVisivle = isMy ? myAreaVisible : opAreaVisible;
    const pokeState = isMy ? myPokeState : opPokeState;

        return (
            <div className={`${who}-poke-area`}>
                <div className="poke-ground"></div>
                <AnimatePresence>
                    {areaVisivle.poke && (
                        <motion.img
                            key={`${who}PokeImg`}
                            src={pokeState.img}
                            alt="ポケモン画像"
                            className={`${who}-poke-img`}
                            initial={{ clipPath: "circle(0% at 50% 50%)" }}
                            animate={{ clipPath: "circle(75% at 50% 50%)", }}
                            exit={{ clipPath: "circle(0% at 50% 50%)" }}
                            transition={{ duration: 0.5 }}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
};

export default PokeArea;