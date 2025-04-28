import { pokeInfo, weaponInfo, compatiTexts, typeChart } from "../model/model";
import { useBattleHandlers } from "./useBattleHandlers";

export function useToDoWhenFnc(battleState) {

  //インポートの取得===========================================================
  const {
    setMyAreaVisible,
    opAreaVisible, setOpAreaVisible,
    setOtherAreaVisible,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    myTurn,
    skipTurn, setSkipTurn,
    setResultText,
    changePokeName,
  } = battleState;

  const battleHandlers = useBattleHandlers(battleState);


  //toDoWhen()==========================================================================================

  //ポケモンの名前がセットされたimgをセット
  const toDoWhenSetPokeName = (who) => {
    const isMy = who === "my";
    const state = isMy ? myPokeState : opPokeState;
    const setState = isMy ? setMyPokeState : setOpPokeState;
    const getImg = () => pokeInfo[state.name].img;
    setState(prev => ({ ...prev, img: getImg() }));
  };

  //imgがセットされたらHPをセット
  const toDoWhenSetImg = (who) => {
    const isMy = who === "my";
    const state = isMy ? myPokeState : opPokeState;

    const name = state.name;
    let newHp = [state.poke1Name, state.poke2Name, state.poke3Name]
      .findIndex(n => n === name);

    if (newHp !== -1) {
      newHp = state[`poke${newHp + 1}H`];
    }


    const hpBarElem = document.querySelector(isMy ? ".my-hp-bar" : ".op-hp-bar");
    const fullHp = pokeInfo[name].h;
    const hpPercent = Math.round((newHp / fullHp) * 100);
    hpBarElem.style.width = `${hpPercent}%`;

    // 色クラスも付け替え
    hpBarElem.classList.remove("low", "mid");
    if (hpPercent <= 25) {
      hpBarElem.classList.add("low");
    } else if (hpPercent <= 50) {
      hpBarElem.classList.add("mid");
    }

    battleHandlers.handleStateChange(isMy ? "myHp" : "opHp", newHp);
  }

  //HPがセットされた時の処理
  const toDoWhenSetHp = (who) => {
    setTimeout(() => {
      //テキストエリア非表示
      setOtherAreaVisible(prev => ({ ...prev, text: false, critical: false }));
      const isMy = who === "my";
      const state = isMy ? myPokeState : opPokeState;
      const setText = (text) => battleHandlers.handleStateChange(isMy ? "myText" : "opText", text);

      //初期値のセット→はじいてる
      //初登場時のHPセット || 交代してセット→goTextをセット
      if (state.text === "" || state.text.includes("backText") || state.text.includes("deadText")) {
        const name = isMy ? myPokeState.name : opPokeState.name;
        const text = isMy
          ? `ゆけ！${name}！goText`
          : `相手は${name}をくりだした！goText`;
        setText(text);
        return;
      }

      //ダメージを受けてセット→残りＨＰや攻撃順番や交代ターンかどうかで処理を分ける 
      if (state.h > 0) {
        battleHandlers.saveHp(who);
        setTimeout(() => {
          if (isMy) {
            //交代したターンはターン終了
            if (skipTurn) {
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
              setSkipTurn(false);
              //先攻ならターン終了
            } else if (myTurn === "first") {
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
              //後攻なら自分の技テキストをセット
            } else if (myTurn === "after") {
              setText(`${myPokeState.name}！${myPokeState.weapon}！weaponText`);
            }
          } else {
            //後攻ならターン終了
            if (myTurn === "after") {
              setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
              //先攻なら相手の技テキストをセット
            } else if (myTurn === "first") {
              setText(`相手の${opPokeState.name}の${opPokeState.weapon}weaponText`);
            }
          }
        }, 1000);
        //死亡時は死亡テキストをセット
      } else {
        battleHandlers.saveHp(who);
        const name = isMy ? myPokeState.name : opPokeState.name;
        setText(`${isMy ? "" : "相手の"}${name}は倒れたdeadText`);
      }
    }, 1000);
  };

  const toDoWhenSetSkipturn = () => {
    const backText = `戻れ！${myPokeState.name}backText`;
    battleHandlers.handleStateChange("myText", backText);
  }

  //stateにweaponがセットされたときの処理
  const toDoWhenSetWeapon = (who) => {
    //自分の技がセットされたら、相手の技をセット
    if (who === "my") {
      battleHandlers.choiseOpWeapon();
    }
    //相手の技がセットされたら、先攻後攻を決める
    else if (who === "op") {
      const mySpeed = pokeInfo[myPokeState.name].s;
      const opSpeed = pokeInfo[opPokeState.name].s;

      if (skipTurn) {
        battleHandlers.handleStateChange("myTurn", "after");
      }
      // 同速の場合ランダムで先攻を決める
      else if (mySpeed === opSpeed) {
        const isMyTurnFirst = Math.random() < 0.5;
        console.log(isMyTurnFirst ? "同速のためランダムで先攻になった" : "同速のためランダムで後攻になった");
        battleHandlers.handleStateChange("myTurn", isMyTurnFirst ? "first" : "after");
      } else {
        battleHandlers.handleStateChange("myTurn", mySpeed > opSpeed ? "first" : "after");
      }
    }
  };

  //先攻後攻がセットされたら、先攻のテキストをセットする
  const toDoWhenSetMyturn = () => {
    if (myTurn === "first") {
      const text = `${myPokeState.name}！${myPokeState.weapon}！weaponText`;
      battleHandlers.handleStateChange("myText", text);
    } else if (myTurn === "after") {
      const text = `相手の${opPokeState.name}の${opPokeState.weapon}weaponText`;
      battleHandlers.handleStateChange("opText", text);
    }
  };

  // テキストがセットされたときの処理
  const toDoWhenSetText = (who) => {
    const isMy = who === "my";
    const state = isMy ? myPokeState : opPokeState;
    const setState = isMy ? setMyPokeState : setOpPokeState;
    const setAreaVisible = isMy ? setMyAreaVisible : setOpAreaVisible;

    const includes = (text) => state.text.includes(text);

    //攻撃倍率によって相性テキストを返す
    const makeCompatiText = (multiplier) => (
      multiplier >= 2 ? compatiTexts.batsugun :
        multiplier === 1 ? compatiTexts.toubai :
          multiplier > 0 ? compatiTexts.imahitotsu :
            compatiTexts.mukou
    );

    const setCompatiText = () => {
      const defender = isMy ? opPokeState.name : myPokeState.name;
      const textKey = isMy ? "opText" : "myText";

      const attackType = weaponInfo[state.weapon].type;
      const [defType1, defType2] = [pokeInfo[defender].type1, pokeInfo[defender].type2];
      const multiplier = (typeChart[attackType][defType1] ?? 1) * (typeChart[attackType][defType2] ?? 1);
      const text = makeCompatiText(multiplier) + "compatiText" + multiplier;
      battleHandlers.handleStateChange(textKey, text);
    };

    //画像を取得して死亡エフェクトのスタイルを付与する
    const deadEffect = (who) => {
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: false }));
      setSkipTurn(false);

      const imgClass = isMy ? ".my-poke-img" : ".op-poke-img";
      const pokeIMGElm = document.querySelector(imgClass);

      setTimeout(() => {
        setOtherAreaVisible(prev => ({ ...prev, text: true }));
        setAreaVisible(prev => ({ ...prev, text: true }));
        battleHandlers.playPokeVoice(state.name);
        pokeIMGElm.classList.add("pokemon-dead");
      }, 1000);

      setTimeout(() => {
        setOtherAreaVisible(prev => ({ ...prev, text: false }));
        setAreaVisible(prev => ({ ...prev, text: false, name: false }));
        setState(prev => ({ ...prev, life: state.life - 1 }));
      }, 3001);
    };

    // --- テキスト内容に応じた分岐処理 ---

    //goTextがセットされたら表示制御
    if (includes("goText")) {
      if (who === "my") {
        //初回登場時と交代時、死亡後の次のポケモンを出すときの共通の表示制御
        battleHandlers.showGoSequence(
          [setMyAreaVisible, setMyAreaVisible, battleHandlers.playPokeVoice],
          myPokeState.name,
          1000
        );
        //初回登場時のみの表示制御
        if (!opAreaVisible.name) {
          battleHandlers.showGoSequence(
            [setOpAreaVisible, setOpAreaVisible, battleHandlers.playPokeVoice],
            opPokeState.name,
            3000
          );
          battleHandlers.delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 5000);
        }
        //初回登場時以外の表示制御
        else if (!opAreaVisible.name || !skipTurn) {
          battleHandlers.delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 3000);    //コマンドエリア表示
        }
        //交代エフェクトが終わったら、相手の技をセット
        else if (skipTurn) {
          console.log(`skipTurn:${skipTurn}`);
          battleHandlers.delay(() => battleHandlers.choiseOpWeapon(), 3000);
        }
      }
      //２体目以降の相手の画像がセットされたら表示制御
      else if (who === "op" && opPokeState.life < 3 && opPokeState.life > 0) {
        battleHandlers.showGoSequence(
          [setOpAreaVisible, setOpAreaVisible, battleHandlers.playPokeVoice],
          opPokeState.name,
          1000
        );
        battleHandlers.delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 3000);
      }
      // // 登場時に画像をセット

    } else if (includes("backText") && isMy) {
      // 自分が交代するとき
      battleHandlers.playSe("back");
      setOtherAreaVisible(p => ({ ...p, text: true }));
      setAreaVisible(p => ({ ...p, text: true }));

      setTimeout(() => {
        setAreaVisible(p => ({ ...p, name: false }));
        setState(p => ({ ...p, name: changePokeName.current }));
      }, 1000);

    } else if (includes("weaponText")) {
      // 攻撃テキストのあとに相性テキストを表示
      setCompatiText();

    } else if (includes("compatiText")) {
      // 相性テキストのあとにダメージ計算
      const [attackerState, defenderState] = isMy ? [opPokeState, myPokeState] : [myPokeState, opPokeState];
      const weaponName = isMy ? opPokeState.weapon : myPokeState.weapon;
      const { damage, isCriticalHit } = battleHandlers.calcDamage(attackerState.name, defenderState.name, weaponName);
      toDoWhenSetDamage(who, damage, isCriticalHit);

    } else if (includes("deadText")) {
      // 倒されたときの処理
      deadEffect(who);
    }
  };

  // ダメージ数がセットされたとき、技名表示＆鳴き声→攻撃エフェクト＆SE→ダメージエフェクト
  const toDoWhenSetDamage = (who, damagePt, isCriticalHit) => {

    const isMy = who === "my";
    const state = isMy ? myPokeState : opPokeState;

    //ジャンプ
    const junpEffect = (selector) => {
      const elem = document.querySelector(selector);
      if (!elem) return;

      elem.classList.remove("jump"); // ← 一回消しておくと連続ジャンプにも対応
      void elem.offsetWidth;         // ← 再描画を強制するテク（重要）
      elem.classList.add("jump");

      setTimeout(() => {
        elem.classList.remove("jump");
      }, 400); // アニメーション時間と合わせる
    };

    //攻撃エフェクト
    const attackEffect = (selector) => {
      const elem = document.querySelector(selector);
      if (!elem) return;

      const attackClass = selector === ".my-poke-img" ? "my-attack" : "op-attack";

      elem.classList.remove(attackClass);
      void elem.offsetWidth; // 再描画を強制
      elem.classList.add(attackClass);

      setTimeout(() => {
        elem.classList.remove(attackClass); // アニメーション終了後にクラスを削除
      }, 500); // アニメーション時間
    };

    //ダメージエフェクトとダメージの反映
    const damageEffect = (who, damagePt) => {
      const setAreaVisible = isMy ? setMyAreaVisible : setOpAreaVisible;
      const setOtherTextInvisible = isMy ? setOpAreaVisible : setMyAreaVisible;
      const hpKey = isMy ? "myHp" : "opHp";
      const imgClass = isMy ? ".my-poke-img" : ".op-poke-img";

      setOtherTextInvisible(prev => ({ ...prev, text: false }));    //技テキストを非表示
      if(isCriticalHit){
        setOtherAreaVisible(prev => ({ ...prev, critical: true }));
      }
      if (state.text.includes(compatiTexts.toubai) && !isCriticalHit) {
        setOtherAreaVisible(prev => ({ ...prev, text: false }));
      }
      setAreaVisible(prev => ({ ...prev, text: true }));  //相性テキスト表示
      

      const pokeIMGElem = document.querySelector(imgClass);
      const hpBarElem = document.querySelector(isMy ? ".my-hp-bar" : ".op-hp-bar");
      const name = state.name;
      const fullHp = pokeInfo[name].h;
      const newHp = Math.max(0, state.h - damagePt);
      const hpPercent = Math.round((newHp / fullHp) * 100);

      console.log(`最大HP：${fullHp}\n残HP：${newHp}\n残量${hpPercent}%`);

      // ★HPバーのエフェクトだけ先に独立させる
      hpBarElem.style.width = `${hpPercent}%`;

      // 色クラスも付け替え
      hpBarElem.classList.remove("low", "mid");
      if (hpPercent <= 25) {
        hpBarElem.classList.add("low");
      } else if (hpPercent <= 50) {
        hpBarElem.classList.add("mid");
      }

      // ★実際のステート更新は少し後
      setTimeout(() => {
        battleHandlers.handleStateChange(hpKey, newHp);
      }, 600); // transition時間と合わせる

      // ダメージエフェクト（無効でなければ）
      if (pokeIMGElem && !state.text.includes(compatiTexts.mukou)) {
        pokeIMGElem.classList.add("pokemon-damage-effect");
        setTimeout(() => {
          pokeIMGElem.classList.remove("pokemon-damage-effect");
        }, 1000);
      }
    };


    //攻撃の始まりから終わりまでのエフェクトまとめ
    const playAndHandleDamage = (attacker, damageTarget, damage) => {
      const imgClassName = attacker === myPokeState ? ".my-poke-img" : ".op-poke-img";
      junpEffect(imgClassName);
      battleHandlers.playPokeVoice(attacker.name, () => {
        if (!state.text.includes(compatiTexts.mukou)) {
          attackEffect(imgClassName);
          battleHandlers.playWeaponSound(attacker.weapon, () => {
            damageEffect(damageTarget, damage);
            if (!attacker.text.includes(compatiTexts.mukou)) {
              battleHandlers.playDamageSound(damageTarget);
            }
          });
        }
        else {
          damageEffect(damageTarget, damage);
        }
      });
    };

    if (who === "my") {
      setOtherAreaVisible(prev => ({ ...prev, text: true }));
      setOpAreaVisible(prev => ({ ...prev, text: true }));
      playAndHandleDamage(opPokeState, "my", damagePt);
    } else if (who === "op") {
      setOtherAreaVisible(prev => ({ ...prev, text: true }));
      setMyAreaVisible(prev => ({ ...prev, text: true }));
      playAndHandleDamage(myPokeState, "op", damagePt);
    }
  };

  //ライフがセットされたときの処理
  const toDoWhenSetLife = (who) => {
    const setWinner = (winner) => {
      battleHandlers.stopBgm();
      setResultText(winner === "my" ? "WIN" : "LOSE");
    };

    const selectNextOpPoke = () => {
      const myTypes = [pokeInfo[myPokeState.name].type1, pokeInfo[myPokeState.name].type2];
      const opPokemons = [opPokeState.poke2Name, opPokeState.poke3Name].map(name => ({
        name,
        types: [pokeInfo[name].type1, pokeInfo[name].type2],
        speed: pokeInfo[name].s,
      }));

      const calcMultiplier = (atkTypes, defTypes) =>
        Math.max(...atkTypes.flatMap(atk => defTypes.map(def => typeChart[atk]?.[def] ?? 1)));

      const myToOp = opPokemons.map(op => calcMultiplier(myTypes, op.types));
      const opToMy = opPokemons.map(op => calcMultiplier(op.types, myTypes));

      if (myToOp[0] === myToOp[1]) {
        const target = opToMy[0] !== opToMy[1]
          ? (opToMy[0] > opToMy[1] ? opPokemons[0] : opPokemons[1])
          : (opPokemons[0].speed > opPokemons[1].speed ? opPokemons[0] : opPokemons[1]);
        setOpPokeState(prev => ({ ...prev, name: target.name }));
      } else {
        const worse = myToOp[0] > myToOp[1] ? 0 : 1;
        const better = 1 - worse;
        const mySpeed = pokeInfo[myPokeState.name].s;
        const prefer = (opPokemons[worse].speed > mySpeed && opToMy[worse] >= 2)
          ? (opPokemons[better].speed > mySpeed && opToMy[better] >= 2 ? opPokemons[better] : opPokemons[worse])
          : opPokemons[better];
        setOpPokeState(prev => ({ ...prev, name: prefer.name }));
      }
    };

    const pokeState = who === "my" ? myPokeState : opPokeState;
    const isMy = who === "my";

    if (isMy) {
      if (pokeState.life < 3 && pokeState.life > 0) {
        setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: true }));
      } else if (pokeState.life <= 0) {
        setWinner("op");
      }
    } else {
      if (pokeState.life === 2) {
        selectNextOpPoke();
      } else if (pokeState.life === 1) {
        const next = opPokeState.poke2H === 0 ? pokeState.poke3Name : pokeState.poke2Name;
        setOpPokeState(prev => ({ ...prev, name: next }));
      } else if (pokeState.life <= 0) {
        setWinner("my");
      }
    }
  };

  //勝敗がセットされたらスタイルを付与
  const toDoWhenSetResultText = () => {
    setOtherAreaVisible(prev => ({ ...prev, battle: false }));

    // playSeがundefinedでないことを確認
    if (battleHandlers?.playSe) {
      battleHandlers.playSe("gameResult");
    } else {
      console.error('battleHandlersまたはplaySeが未定義です');
    }
  };


  return {
    toDoWhenSetPokeName,
    toDoWhenSetImg,
    toDoWhenSetSkipturn,
    toDoWhenSetWeapon,
    toDoWhenSetMyturn,
    toDoWhenSetText,
    toDoWhenSetHp,
    toDoWhenSetLife,
    toDoWhenSetResultText
  };
}
