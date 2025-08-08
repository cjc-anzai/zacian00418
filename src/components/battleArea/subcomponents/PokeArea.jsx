import { motion, AnimatePresence } from "framer-motion";
import { terastalImgList, } from "../../../model/model";

const PokeArea = ({
    isMe,
    battleState,
    battleHandlers,
}) => {

    //インポートする変数や関数の取得
    const { opPokeState, myPokeState, opAreaVisible, myAreaVisible } = battleState;
    const { checkIsTerastal, getPokeState, getAreaVisible } = battleHandlers;

    const [pokeState, areaVisible, pokeArea] = [getPokeState(isMe, true), getAreaVisible(isMe, true)];
    const isTerastal = checkIsTerastal(isMe);
    const who = isMe ? "my" : "op";

    return (
        <div className={`${who}-poke-area`}>
            <div className="poke-img-wrapper">
                {areaVisible.poke && isTerastal && (
                    <img
                        src={terastalImgList[pokeState.terastal]}
                        alt={`${pokeState.terastal}テラスタル`}
                        className="terastal-img"
                    />
                )}
                <AnimatePresence>
                    {areaVisible.poke && (
                        <motion.img
                            key={`${who}PokeImg`}
                            src={pokeState.img}
                            alt="ポケモン画像"
                            className={`${who}-poke-img`}
                            initial={{ clipPath: "circle(0% at 50% 50%)" }}
                            animate={{ clipPath: "circle(75% at 50% 50%)" }}
                            exit={{ clipPath: "circle(0% at 50% 50%)" }}
                            transition={{ duration: 0.5 }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* 地面 */}
            <div className="poke-ground"></div>
        </div>
    );

};

export default PokeArea;