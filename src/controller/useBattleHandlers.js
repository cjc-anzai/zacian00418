import { sounds, pokeInfo, weaponInfo, compatiTexts, typeChart, opacityChanges } from "../model/model";

export function useBattleHandlers(battleState) {

  //インポートの取得===========================================================
  const {
    setMyAreaVisible,
    opAreaVisible, setOpAreaVisible,
    setOtherAreaVisible,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    setMyPokeStateTrigger,
    setOpPokeStateTrigger,
    selectedOrder, setSelectedOrder,
    myTurn, setMyTurn,
    setMyTurnTrigger,
    setIsMyAttacking,
    setIsOpAttacking,
    skipTurn, setSkipTurn,
    resultText, setResultText,
    loopAudioRef, turnCnt, changePokeName,
    defaultAreaVisible,
    defaultPokeState,
    defaultPokeStateTrigger,
  } = battleState;

  //クリックイベント===============================================================================================================


  const start = () => {
    playSe("decide");
    playSe("start");
    setBgm(sounds.bgm.selection);
    sounds.general.start.onended = () => {
      setOtherAreaVisible(prev => ({ ...prev, top: false, isSelecting: true }));
      sounds.bgm.selection.play();
    };
  };

  //選出画面のポケモン押下時
  const handleSelect = (pokeName) => {
    playSe("select");
    setSelectedOrder((prev) => {
      if (prev.includes(pokeName)) {
        return prev.filter((name) => name !== pokeName); // クリックで解除
      }
      if (prev.length < 3) {
        return [...prev, pokeName]; // 3体まで選択OK
      }
      return prev; // 3体以上は無視
    });
  };

  //選出確定ボタン
  const confirmSelection = () => {
    playSe("decide");
    stopBgm();
    setBgm(sounds.bgm.battle);
    sounds.bgm.battle.play();

    setOtherAreaVisible(prev => ({ ...prev, isSelecting: false, battle: true }));

    //自分の選出順番をセットし、1番目のポケの名前をセット
    const [p1, p2, p3] = selectedOrder;
    Object.assign(myPokeState, { poke1Name: p1, poke2Name: p2, poke3Name: p3 });
    setMyPokeState(prev => ({ ...prev, name: p1 }));

    // 相手の選出順番をランダムに選び、1番目のポケの名前をセット
    const opCandidates = ["ディアルガ", "ゲンガー", "リザードン"]
      .map(name => ({ name, ...pokeInfo[name] }))
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const [o1, o2, o3] = opCandidates.map(p => p.name);
    Object.assign(opPokeState, { poke1Name: o1, poke2Name: o2, poke3Name: o3 });
    setOpPokeState(prev => ({ ...prev, name: o1 }));
  };

  //たたかうボタン押下時、コマンド表示を切り替える
  const openBattleCmdArea = () => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, weaponCmd: true }));
  };

  //交代ボタン押下時、コマンド表示を切り替える
  const openChangeCmdArea = () => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, changeCmd: true }));
  };

  // 戻るボタン押下時、コマンド表示を切り替える
  const backCmd = () => {
    playSe("cancel");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true, weaponCmd: false, changeCmd: false }));
  };

  //技名ボタン押下時、選択した技をセット
  const battle = (weaponName) => {
    playSe("decide");
    updateTurnCnt();
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: false }));
    handleStateChange("myWeapon", weaponName);
  };

  //〇〇に交代ボタン押下時、交代するポケモン名を保存し、交代フラグを立てる
  const changeMyPoke = (changePoke) => {
    playSe("decide");
    updateTurnCnt();
    console.log(`${changePoke}に交代を選択`);
    setOtherAreaVisible(prev => ({ ...prev, changeCmd: false }));
    changePokeName.current = changePoke;
    setSkipTurn(true);
  }

  //倒れた後、次に出すポケモンボタン押下時、次のポケモン名を保存し、HPをセット
  const nextMyPoke = (nextPoke) => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: false }));
    changePokeName.current = nextPoke;
    delay(() => setChangePokeHp(nextPoke), 1000);
  }

  //トップへ戻るボタン押下時、すべてのステータスを初期化
  const goTop = () => {

    // ポケモン表示制御
    setMyAreaVisible({ ...defaultAreaVisible });
    setOpAreaVisible({ ...defaultAreaVisible });

    // その他表示制御
    setOtherAreaVisible({
      top: true,
      isSelecting: false,
      battle: false,
      text: false,
      actionCmd: false,
      weaponCmd: false,
      changeCmd: false,
      nextPokeCmd: false
    });

    // ポケモンのステータス
    setMyPokeState({ ...defaultPokeState });
    setOpPokeState({ ...defaultPokeState });

    // 強制トリガー
    setMyPokeStateTrigger({ ...defaultPokeStateTrigger });
    setOpPokeStateTrigger({ ...defaultPokeStateTrigger });

    // その他state
    setSelectedOrder([]);
    turnCnt.current = 1;
    setMyTurn("");
    setMyTurnTrigger(0);
    setIsMyAttacking(false);
    setIsOpAttacking(false);
    setSkipTurn(false);
    changePokeName.current = "";
    setResultText("");
  }

  //サウンド関係============================================================================================

  //指定したSEを再生
  const playSe = (kind) => {
    const seMap = {
      start: sounds.general.start,
      select: sounds.general.select,
      decide: sounds.general.decide,
      cancel: sounds.general.cancel,
      back: sounds.general.back,
      gameResult:
        resultText === "WIN" ? sounds.general.win
        : resultText === "LOSE" ? sounds.general.lose
        : null,
    };
  
    const se = seMap[kind];
    if (!se) return;
  
    if (kind === "start") {
      // onended 仕込みたい音は元のインスタンスで
      se.play().catch(e => console.error('効果音の再生に失敗:', e));
    } else {
      // その他は clone で連続再生対応
      se.cloneNode().play().catch(e => console.error('効果音の再生に失敗:', e));
    }
  };
  

  //ポケモンの鳴き声再生
  const playPokeVoice = (pokeName, onEnded) => {
    const voice = pokeInfo[pokeName].voice;
    voice.currentTime = 0;
    voice.onended = onEnded || null;
    voice.play().catch(e => {
      console.error('効果音の再生に失敗:', e);
      onEnded?.();
    });
  };

  //各技のSEを再生
  const playWeaponSound = (weaponName, onEnded) => {
    const sound = weaponInfo[weaponName].sound;
    sound.currentTime = 0;
    sound.onended = onEnded || null;
    sound.play().catch(e => {
      console.error('効果音の再生に失敗:', e);
      onEnded?.();
    });
  };

  //技相性にあったダメージSEを再生
  const playDamageSound = (who) => {
    const text = who === "my" ? myPokeState.text : opPokeState.text;
    const sound =
      text.includes(compatiTexts.batsugun) ? sounds.damage.batsugun :
        text.includes(compatiTexts.toubai) ? sounds.damage.toubai :
          text.includes(compatiTexts.imahitotsu) ? sounds.damage.imahitotsu :
            null;

    sound?.play().catch(e => console.error('効果音の再生に失敗:', e));
  };

  //BGM情報をセット
  const setBgm = (kind) => {
    kind.volume = 0.15;
    kind.loop = true;
    loopAudioRef.current = kind;
  }

  // BGMを止める
  const stopBgm = () => {
    if (loopAudioRef.current) {
      loopAudioRef.current.pause();
      loopAudioRef.current.currentTime = 0;
    }
  }

  //toDoWhen()==========================================================================================

  //ポケモンの名前がセットされたらGoTextをセット
  const toDoWhenSetPokeName = (who) => {
    const name = who === "my" ? myPokeState.name : opPokeState.name;
    const text = who === "my"
      ? `ゆけ！${name}！goText`
      : `相手は${name}をくりだした！goText`;
    handleStateChange(who === "my" ? "myText" : "opText", text);
  };

  //imgがセットされたら行う処理
  const toDoWhenSetImg = (who) => {
    if (who === "my") {
      //初回登場時と交代時、死亡後の次のポケモンを出すときの共通の表示制御
      showGoSequence(
        [setMyAreaVisible, setMyAreaVisible, playPokeVoice],
        myPokeState.name,
        1000
      );
      //初回登場時のみの表示制御
      if (!opAreaVisible.img) {
        showGoSequence(
          [setOpAreaVisible, setOpAreaVisible, playPokeVoice],
          opPokeState.name,
          3000
        );
        delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 5000);
      }
      //初回登場時以外の表示制御
      else if (!opAreaVisible.img || !skipTurn) {
        delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 3000);    //コマンドエリア表示
      }
      //交代エフェクトが終わったら、相手の技をセット
      else if (skipTurn) {
        const weaponName = pokeInfo[opPokeState.name].weapon;
        delay(() => handleStateChange("opWeapon", weaponName), 3000);
      }
    }
    //２体目以降の相手の画像がセットされたら表示制御
    else if (who === "op" && opPokeState.life < 3 && opPokeState.life > 0) {
      showGoSequence(
        [setOpAreaVisible, setOpAreaVisible, playPokeVoice],
        opPokeState.name,
        1000
      );
      delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 3000);
    }
  }

  //stateにweaponがセットされたときの処理
  const toDoWhenSetWeapon = (who) => {
    //自分の技がセットされたら、相手の技をセット
    if (who === "my") {
      handleStateChange("opWeapon", pokeInfo[opPokeState.name].weapon);
      //相手の技がセットされたら、先攻後攻を決める
    } else if (who === "op") {
      const mySpeed = pokeInfo[myPokeState.name].speed;
      const opSpeed = pokeInfo[opPokeState.name].speed;
      handleStateChange("myTurn", mySpeed > opSpeed && !skipTurn ? "first" : "after");
    }
  };

  //先攻後攻がセットされたら、先攻の技をセットする
  const toDoWhenSetMyturn = () => {
    if (myTurn === "first") {
      const text = `${myPokeState.name}！${myPokeState.weapon}！weaponText`;
      handleStateChange("myText", text);
    } else if (myTurn === "after") {
      const text = `相手の${opPokeState.name}の${opPokeState.weapon}weaponText`;
      handleStateChange("opText", text);
    }
  };

  // テキストがセットされたときの処理
  const toDoWhenSetText = (who) => {
    const isMy = who === "my";
    const state = isMy ? myPokeState : opPokeState;
    const setState = isMy ? setMyPokeState : setOpPokeState;

    const includes = (text) => state.text.includes(text);
    const getImg = () => pokeInfo[state.name].img;

    //攻撃倍率によって相性テキストを返す
    const makeCompatiText = (multiplier) => (
      multiplier >= 2 ? compatiTexts.batsugun :
        multiplier === 1 ? compatiTexts.toubai :
          multiplier > 0 ? compatiTexts.imahitotsu :
            compatiTexts.mukou
    );

    const setCompatiText = () => {
      const attacker = isMy ? myPokeState.name : opPokeState.name;
      const defender = isMy ? opPokeState.name : myPokeState.name;
      const textKey = isMy ? "opText" : "myText";

      const attackType = weaponInfo[pokeInfo[attacker].weapon].type;
      const [defType1, defType2] = [pokeInfo[defender].type1, pokeInfo[defender].type2];
      const multiplier = (typeChart[attackType][defType1] ?? 1) * (typeChart[attackType][defType2] ?? 1);
      const text = makeCompatiText(multiplier) + "compatiText" + multiplier;
      handleStateChange(textKey, text);
    };

    //画像を取得して死亡エフェクトのスタイルを付与する
    const deadEffect = (who) => {
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: false }));
      setSkipTurn(false);

      const isMy = who === "my";
      const pokeState = isMy ? myPokeState : opPokeState;
      const setAreaVisible = isMy ? setMyAreaVisible : setOpAreaVisible;
      const setPokeState = isMy ? setMyPokeState : setOpPokeState;
      const imgClass = isMy ? ".my-poke-img" : ".op-poke-img";

      const pokeIMGElm = document.querySelector(imgClass);

      setTimeout(() => {
        setOtherAreaVisible(prev => ({ ...prev, text: true }));
        setAreaVisible(prev => ({ ...prev, text: true }));
        playPokeVoice(pokeState.name);
        pokeIMGElm.classList.add("pokemon-dead");
      }, 1000);

      setTimeout(() => {
        setOtherAreaVisible(prev => ({ ...prev, text: false }));
        setAreaVisible(prev => ({ ...prev, text: false, name: false }));
        setPokeState(prev => ({ ...prev, life: pokeState.life - 1 }));
      }, 3001);
    };

    // --- テキスト内容に応じた分岐処理 ---

    if (includes("goText")) {
      // 登場時に画像をセット
      setState(prev => ({ ...prev, img: getImg() }));

    } else if (includes("backText") && isMy) {
      // 自分が交代するとき
      playSe("back");
      setOtherAreaVisible(p => ({ ...p, text: true }));
      setMyAreaVisible(p => ({ ...p, text: true }));

      setTimeout(() => {
        setMyAreaVisible(p => ({ ...p, img: false, name: false, hp: false }));
        saveHp("my");
        setChangePokeHp(changePokeName.current);
      }, 1000);

    } else if (includes("weaponText")) {
      // 攻撃テキストのあとに相性テキストを表示
      setCompatiText();

    } else if (includes("compatiText")) {
      // 相性テキストのあとにダメージ計算
      const match = state.text.match(/(\d+(\.\d+)?)/);
      const multiplier = match ? Number(match[0]) : 1;
      const damage = 400 * multiplier;   //ダメージ計算  攻撃力は50で固定

      console.log(`${isMy ? "自分" : "相手"}に${damage}ダメージ（50*${multiplier}）`);
      toDoWhenSetDamage(who, damage);

    } else if (includes("deadText")) {
      // 倒されたときの処理
      deadEffect(who);
    }
  };

  //ダメージ数がセットされたとき、技名表示＆鳴き声→攻撃エフェクト＆SE→ダメージエフェクト
  const toDoWhenSetDamage = (who, damagePt) => {

    //攻撃エフェクト
    const attackEffect = (who) => {
      const setAttack = who === "my" ? setIsMyAttacking : setIsOpAttacking;
      setAttack(true);
      delay(() => setAttack(false), 500);
    };

    //ダメージエフェクトとダメージの反映
    const damageEffect = (who, damagePt) => {
      const isMy = who === "my";
      const pokeState = isMy ? myPokeState : opPokeState;
      const setAreaVisible = isMy ? setMyAreaVisible : setOpAreaVisible;
      const setOtherTextInvisible = isMy ? setOpAreaVisible : setMyAreaVisible;
      const hpKey = isMy ? "myHp" : "opHp";
      const imgClass = isMy ? ".my-poke-img" : ".op-poke-img";

      setOtherTextInvisible(prev => ({ ...prev, text: false }));
      //相性が等倍ならテキストエリアは表示しない
      if (pokeState.text.includes(compatiTexts.toubai)) {
        setOtherAreaVisible(prev => ({ ...prev, text: false }));
      }

      setAreaVisible(prev => ({ ...prev, text: true }));
      const compatiText = pokeState.text;
      const pokeIMGElem = document.querySelector(imgClass);
      const newHp = Math.max(0, pokeState.hp - damagePt);
      handleStateChange(hpKey, newHp);

      //ダメージエフェクトを入れる（技相性が無効の場合を除く）
      if (pokeIMGElem && !compatiText.includes(compatiTexts.mukou)) {
        opacityChanges.forEach(({ opacity, delay }) =>
          setTimeout(() => {
            pokeIMGElem.style.opacity = opacity;
          }, delay)
        );
      }
    };

    const playAndHandleDamage = (attacker, attackTarget, damageTarget, damage) => {
      playPokeVoice(attacker.name, () => {
        attackEffect(attackTarget);
        playWeaponSound(attacker.weapon, () => {
          damageEffect(damageTarget, damage);
          if (!attacker.text.includes(compatiTexts.mukou)) {
            playDamageSound(damageTarget);
          }
        });
      });
    };

    if (who === "my") {
      setOtherAreaVisible(prev => ({ ...prev, text: true }));
      setOpAreaVisible(prev => ({ ...prev, text: true }));
      playAndHandleDamage(opPokeState, "op", "my", damagePt);
    } else if (who === "op") {
      setOtherAreaVisible(prev => ({ ...prev, text: true }));
      setMyAreaVisible(prev => ({ ...prev, text: true }));
      playAndHandleDamage(myPokeState, "my", "op", damagePt);
    }
  };

  //HPがセットされた時の処理
  const toDoWhenSetHp = (who) => {
    setTimeout(() => {
      setOtherAreaVisible(prev => ({ ...prev, text: false }));
      if (who === "my") setMyAreaVisible(prev => ({ ...prev, text: false }));
      if (who === "op") setOpAreaVisible(prev => ({ ...prev, text: false }));

      const pokeState = who === "my" ? myPokeState : opPokeState;
      const setText = (text) => handleStateChange(who === "my" ? "myText" : "opText", text);

      if (who === "my" && myPokeState.name !== changePokeName.current && changePokeName.current !== "") {
        setMyPokeState(prev => ({ ...prev, name: changePokeName.current }));
      } else if (pokeState.hp > 0) {
        saveHp(who);
        setTimeout(() => {
          if (who === "my") {
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
              //選考なら相手の技テキストをセット
            } else if (myTurn === "first") {
              setText(`相手の${opPokeState.name}の${opPokeState.weapon}weaponText`);
            }
          }
        }, 1000);
        //死亡時は死亡テキストをセット
      } else {
        saveHp(who);
        const name = who === "my" ? myPokeState.name : opPokeState.name;
        setText(`${who === "my" ? "" : "相手の"}${name}は倒れたdeadText`);
      }
    }, 2000);
  };

  //ライフがセットされたときの処理
  const toDoWhenSetLife = (who) => {

    //勝敗を表示する
    const setWinner = (who) => {
      stopBgm();
      const text = who === "my" ? "WIN" : "LOSE";
      setResultText(text);
    };

    const setNextPokeOrWinner = (pokeState, isMy) => {
      if (isMy) {
        //残ライフが2か1なら、次のポケモンの選択コマンドを表示
        if (pokeState.life < 3 && pokeState.life > 0) setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: true }));
        //残ライフ0なら負け
        else if (pokeState.life <= 0) setWinner("op");
        //
      } else {
        //残ライフが2か1なら、次のポケモンをセット
        if (pokeState.life === 2) setOpPokeState(prev => ({ ...prev, name: pokeState.poke2Name, hp: 100 }));
        else if (pokeState.life === 1) setOpPokeState(prev => ({ ...prev, name: pokeState.poke3Name, hp: 100 }));
        //残ライフ0なら負け
        else if (pokeState.life <= 0) setWinner("my");
      }
    };

    if (who === "my") setNextPokeOrWinner(myPokeState, true);
    else if (who === "op") setNextPokeOrWinner(opPokeState, false);
  };


  //複数の呼び出し先がある関数=================================================================================

  //Stateに同じ値がセットされたときにトリガーを更新して、強制的にuseEffectを発火させる
  const handleStateChange = (stateName, newState) => {
    const updateState = (setter, triggerSetter, key) => {
      setter(prev => {
        if (prev[key] === newState) {
          console.log(`トリガー更新：${stateName}は変わらず「${newState}」`);
          triggerSetter(prev => ({ ...prev, [key]: prev[key] + 1 }));
          return prev;
        } else {
          console.log(`${stateName}を「${newState}」に更新する`);
          return { ...prev, [key]: newState };
        }
      });
    };

    const cases = {
      myWeapon: () => updateState(setMyPokeState, setMyPokeStateTrigger, "weapon"),
      myText: () => updateState(setMyPokeState, setMyPokeStateTrigger, "text"),
      myHp: () => updateState(setMyPokeState, setMyPokeStateTrigger, "hp"),
      myTurn: () => {
        setMyTurn(prev => {
          if (prev === newState) {
            console.log(`トリガー更新：${stateName}は変わらず「${newState}」`);
            setMyTurnTrigger(t => t + 1);
            return prev;
          } else {
            console.log(`${stateName}を「${newState}」に更新する`);
            return newState;
          }
        });
      },
      opWeapon: () => updateState(setOpPokeState, setOpPokeStateTrigger, "weapon"),
      opText: () => updateState(setOpPokeState, setOpPokeStateTrigger, "text"),
      opHp: () => updateState(setOpPokeState, setOpPokeStateTrigger, "hp"),
    };

    cases[stateName]?.();
  };

  //toDoWhenSetImg()の共通部品
  const showGoSequence = (areaSetters, name, delayBase) => {
    const [setTextVisible, setMainVisible, playVoice] = areaSetters;
    delay(() => setOtherAreaVisible(prev => ({ ...prev, text: true })), delayBase);
    delay(() => setTextVisible(prev => ({ ...prev, text: true })), delayBase);
    delay(() => setMainVisible(prev => ({ ...prev, img: true, name: true, hp: true })), delayBase + 1000);
    delay(() => playPokeVoice(name), delayBase + 1000);
    delay(() => setOtherAreaVisible(prev => ({ ...prev, text: false })), delayBase + 2000);
    delay(() => setTextVisible(prev => ({ ...prev, text: false })), delayBase + 2000);
  };

  //残りHPを保存
  const saveHp = (who) => {
    const state = who === "my" ? myPokeState : opPokeState;
    const hpKey = ["poke1Name", "poke2Name", "poke3Name"]
      .find(key => state[key] === state.name)
      ?.replace("Name", "Hp");

    if (hpKey) state[hpKey] = state.hp;
  };

  //交代時に出すポケモンに保存されたHPをセットする
  const setChangePokeHp = (changePoke) => {
    const hpKey = ["poke1Name", "poke2Name", "poke3Name"]
      .find(key => myPokeState[key] === changePoke)
      ?.replace("Name", "Hp");

    if (hpKey) handleStateChange("myHp", myPokeState[hpKey]);
  };

  //setTimeout()の簡略化
  const delay = (fn, ms) => setTimeout(fn, ms);

  //ターン数を更新してコンソールに表示する。（デバッグ用）
  const updateTurnCnt = () => {
    console.log(turnCnt.current + "ターン目================================================");
    turnCnt.current++;
  }

  //textから余計な文字を取り除く（UI表示用）
  const getTrueText = (text) => {
    const tags = ["goText", "backText", "weaponText", "compatiText", "deadText"];
    const index = tags.find(tag => text.includes(tag));
    let trueText = index ? text.slice(0, text.indexOf(index)) : text;
    return trueText === compatiTexts.toubai ? "" : trueText;
  };

  return {
    start,
    handleSelect,
    confirmSelection,
    openBattleCmdArea,
    openChangeCmdArea,
    backCmd,
    battle,
    changeMyPoke,
    nextMyPoke,
    goTop,
    playSe,
    playPokeVoice,
    playWeaponSound,
    playDamageSound,
    setBgm,
    stopBgm,
    handleStateChange,
    toDoWhenSetPokeName,
    toDoWhenSetImg,
    toDoWhenSetWeapon,
    toDoWhenSetMyturn,
    toDoWhenSetText,
    toDoWhenSetHp,
    toDoWhenSetLife,
    getTrueText
  };
}
