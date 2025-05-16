//一般変数========================================================================================================================================

//技相性テキスト
export const compatiTexts = {
  batsugun: "効果はバツグンだ",
  toubai: "等倍ダメージ",
  imahitotsu: "効果はいまひとつのようだ",
  mukou: "効果がないようだ"
}

//タイプ相性表 
export const typeChart = {
  ノーマル: { いわ: 0.5, ゴースト: 0, はがね: 0.5 },
  ほのお: { ほのお: 0.5, みず: 0.5, くさ: 2, こおり: 2, むし: 2, いわ: 0.5, ドラゴン: 0.5, はがね: 2 },
  みず: { ほのお: 2, みず: 0.5, くさ: 0.5, じめん: 2, いわ: 2, ドラゴン: 0.5 },
  でんき: { みず: 2, でんき: 0.5, くさ: 0.5, じめん: 0, ひこう: 2, ドラゴン: 0.5 },
  くさ: { ほのお: 0.5, みず: 2, くさ: 0.5, どく: 0.5, じめん: 2, ひこう: 0.5, むし: 0.5, いわ: 2, ドラゴン: 0.5, はがね: 0.5 },
  かくとう: { ノーマル: 2, こおり: 2, どく: 0.5, ひこう: 0.5, エスパー: 0.5, むし: 0.5, いわ: 2, ゴースト: 0, あく: 2, はがね: 2, フェアリー: 0.5 },
  こおり: { ほのお: 0.5, みず: 0.5, くさ: 2, こおり: 0.5, じめん: 2, ひこう: 2, ドラゴン: 2, はがね: 0.5 },
  どく: { くさ: 2, どく: 0.5, じめん: 0.5, いわ: 0.5, ゴースト: 2, はがね: 0, フェアリー: 2 },
  じめん: { ほのお: 2, でんき: 2, くさ: 0.5, どく: 2, ひこう: 0, むし: 0.5, いわ: 2, はがね: 2 },
  ひこう: { でんき: 0.5, くさ: 2, かくとう: 2, むし: 2, いわ: 0.5, はがね: 0.5 },
  エスパー: { かくとう: 2, どく: 2, エスパー: 0.5, あく: 0, はがね: 0.5 },
  むし: { ほのお: 0.5, くさ: 2, かくとう: 0.5, どく: 0.5, ひこう: 0.5, エスパー: 2, ゴースト: 0.5, あく: 2, はがね: 0.5, フェアリー: 0.5 },
  いわ: { ほのお: 2, こおり: 2, かくとう: 0.5, じめん: 0.5, ひこう: 2, むし: 2, はがね: 0.5 },
  ゴースト: { ノーマル: 0, エスパー: 2, ゴースト: 2, あく: 0.5 },
  ドラゴン: { ドラゴン: 2, はがね: 0.5, フェアリー: 0 },
  あく: { かくとう: 0.5, エスパー: 2, ゴースト: 2, あく: 0.5, フェアリー: 0.5 },
  はがね: { ほのお: 0.5, みず: 0.5, でんき: 0.5, こおり: 2, いわ: 2, はがね: 0.5, フェアリー: 2 },
  フェアリー: { ほのお: 0.5, かくとう: 2, どく: 0.5, ドラゴン: 2, あく: 2, はがね: 0.5 },
  なし: {}
};

export const typeColors = {
  ノーマル: "#A8A77A",
  ほのお: "#EE8130",
  みず: "#6390F0",
  でんき: "#F7D02C",
  くさ: "#7AC74C",
  こおり: "#96D9D6",
  かくとう: "#C22E28",
  どく: "#A33EA1",
  じめん: "#E2BF65",
  ひこう: "#A98FF3",
  エスパー: "#F95587",
  むし: "#A6B91A",
  いわ: "#B6A136",
  ゴースト: "#735797",
  ドラゴン: "#6F35FC",
  あく: "#705746",
  はがね: "#B7B7CE",
  フェアリー: "#D685AD",
};

//値を返すのみでreactの状態に関与しない関数==================================================================

//相手のポケモン全ての受け/攻め相性と素早さを計算して返す。
export const calcResistanceForAllOpPokes = (myPokesInfo, opPokesInfo) => {
  const result = {};

  opPokesInfo.forEach((opPoke, index) => {
    const [name, type1, type2] = [opPoke.name, opPoke.type1, opPoke.type2];

    // resistance（自分6体 → 相手1体）
    const resistance = myPokesInfo.reduce((total, myPoke) => {
      let maxVal = Math.max(
        calcMultiplier(myPoke.type1, opPoke.type1, opPoke.type2),
        myPoke.type2 !== "なし"
          ? calcMultiplier(myPoke.type2, opPoke.type1, opPoke.type2) : 0
      );

      if (maxVal === 4) maxVal = 2;
      else if (maxVal === 0.25) maxVal = 0.5;

      return total + maxVal;
    }, 0);

    // effectiveness（相手1体 → 自分6体）
    const effectiveness = myPokesInfo.reduce((total, myPoke) => {
      let maxVal = Math.max(
        calcMultiplier(opPoke.type1, myPoke.type1, myPoke.type2),
        opPoke.type2 !== "なし"
          ? calcMultiplier(opPoke.type2, myPoke.type1, myPoke.type2) : 0
      );

      if (maxVal === 4) maxVal = 2;
      else if (maxVal === 0.25) maxVal = 0.5;

      return total + maxVal;
    }, 0);


    result[`opPoke${index + 1}`] = {
      name,
      type1,
      type2,
      resistance,
      effectiveness,
      s: opPoke.s
    };
  });

  return result;
};

//相手６体の耐性などをまとめた情報を受け取り、ソートして選出する３体を選ぶ
export const selectBetterOpPokesLogic = (resistanceMap, myPoke1Info) => {
  const sortedResistanceList = Object.entries(resistanceMap)
    .sort((a, b) => {
      const ra = a[1].resistance;
      const rb = b[1].resistance;
      if (ra !== rb) return ra - rb;

      const ea = a[1].effectiveness;
      const eb = b[1].effectiveness;
      if (ea !== eb) return eb - ea;

      return b[1].s - a[1].s;
    })
    .map(([key, value]) => ({ key, ...value }));

  // まずは3体を選出
  let betterOpPokes = sortedResistanceList.slice(0, 3);

  // 自分の1体目に対して「最も耐性が高い（受けが良い）相手」を先頭にする
  betterOpPokes.sort((a, b) => {
    const calcDefenseScore = (opPoke) => {
      const m1 = calcMultiplier(myPoke1Info.type1, opPoke.type1, opPoke.type2);
      const m2 = myPoke1Info.type2 !== "なし"
        ? calcMultiplier(myPoke1Info.type2, opPoke.type1, opPoke.type2)
        : 0;
      let maxVal = Math.max(m1, m2);

      return maxVal; // 小さい方が耐性高い
    };

    return calcDefenseScore(a) - calcDefenseScore(b); // 昇順（耐性が高い順）
  });

  betterOpPokes = betterOpPokes.map(poke => poke.name);

  console.log(`相手のポケモン\n１体目：${betterOpPokes[0]}\n２体目：${betterOpPokes[1]}\n３体目：${betterOpPokes[2]}`);

  return betterOpPokes;
};


//ダメージ後のHpを取得する
export const calcNewHp = (currentHp, damage) => {
  const newHp = Math.max(0, currentHp - damage);
  return newHp;
}

//Goテキストを取得する
export const getGoText = (isMe, pokeName) => {
  const goText = `${isMe ? "ゆけ！" : "相手は"}${pokeName}${isMe ? "！" : "をくりだした"}`;
  return goText;
}

//weaponテキストを取得する
export const getWeaponText = (isMe, pokeName, weaponName) => {
  const weaponText = `${isMe ? "" : "相手の"}${pokeName}${isMe ? "！" : "の"}${weaponName}${isMe ? "！" : ""}`;
  return weaponText;
}

//getCompatiText()のロジック
export const getCompatiTextLogic = (multiplier) => {
  let compatiText = "";
  if (multiplier >= 2) compatiText = compatiTexts.batsugun;
  else if (multiplier === 1) compatiText = compatiTexts.toubai;
  else if (multiplier > 0) compatiText = compatiTexts.imahitotsu;
  else compatiText = compatiTexts.mukou;
  return compatiText;
}

// 相性倍率を求めて、相性テキストを返す
export const getCompatiTextForWeaponInfoList = (weaponType, defType1, defType2) => {
  const multiplier = calcMultiplier(weaponType, defType1, defType2)
  let compatiText = "";
  if (multiplier >= 2) compatiText = "効果ばつぐん";
  else if (multiplier === 1) compatiText = "効果あり";
  else if (multiplier < 1 && multiplier > 0) compatiText = "いまひとつ";
  else compatiText = "効果なし";
  return compatiText;
};

//deadテキストを取得する
export const getDeadText = (isMe, pokeName) => {
  const deadText = `${isMe ? "" : "相手の"}${pokeName}は倒れた`;
  return deadText;
}

//相性倍率を取得する
export const calcMultiplier = (weaponType, defType1, defType2) => {
  const multiplier = (typeChart[weaponType][defType1] ?? 1) * (typeChart[weaponType][defType2] ?? 1);
  return multiplier;
}

//getMostEffectiveWeapon()のロジック
export const getMostEffectiveWeaponLogic = (weaponsInfo, atcInfos, defInfos) => {
  //相手の全ての攻撃技で、自分のポケモンに与えるダメージを取得
  const [opW1Damage, opW2Damage, opW3Damage] = [0, 1, 2].map(
    i => calcPureDamage(weaponsInfo[i], atcInfos[i], defInfos[i]).pureDamage
  );

  //相手の全ての技の優先度を取得
  const [opW1Priority, opW2Priority, opW3Priority] = weaponsInfo.map(w => w.priority);

  // 技とダメージ・優先度をまとめる
  const opWeapons = weaponsInfo.map((w, i) => ({
    name: w.name,
    damage: [opW1Damage, opW2Damage, opW3Damage][i],
    priority: [opW1Priority, opW2Priority, opW3Priority][i],
  }));

  //与えるダメージが最も大きい技のインデックスを取得
  const opWtrongestWeaponIndex = opWeapons
    .map((w, i) => ({ ...w, index: i }))
    .reduce((max, w) => w.damage > max.damage ? w : max)
    .index;

  // 優先度1以上の技の中で最もダメージが大きい技のインデックス（なければ null）
  const highPriorityWeapons = opWeapons
    .map((w, i) => ({ ...w, index: i }))
    .filter(w => w.priority >= 1);

  const strongestHighPriorityWeaponIndex =
    highPriorityWeapons.length > 0
      ? highPriorityWeapons.reduce((max, w) => w.damage > max.damage ? w : max).index
      : null;

  const strongestWeapon = opWeapons[opWtrongestWeaponIndex].name;   //最も与えるダメージが大きい技
  const strongestHighPriorityWeapon = opWeapons[strongestHighPriorityWeaponIndex].name;   //最も与えるダメージが大きい先制技
  const strongestHighPriorityWeaponDamage = Math.round(opWeapons[strongestHighPriorityWeaponIndex].damage * 0.85);   //最も与えるダメージが大きい先制技(最低乱数)

  console.log(`最大火力\n${opWeapons[0].name}：${opWeapons[0].damage}\n${opWeapons[1].name}：${opWeapons[1].damage}\n${opWeapons[2].name}：${opWeapons[2].damage}`);

  return { strongestWeapon, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage }
}

//predictMyAction()のロジック
export const predictMyActionLogic = (weaponsInfo, atcInfos, defInfos) => {
  //自分が出すであろう技とそのダメージを求める
  const [myW1Damage, myW2Damage, myW3Damage] = [
    calcPureDamage(weaponsInfo[0], atcInfos[0], defInfos[0]).pureDamage,
    calcPureDamage(weaponsInfo[1], atcInfos[1], defInfos[1]).pureDamage,
    calcPureDamage(weaponsInfo[2], atcInfos[2], defInfos[2]).pureDamage,
  ];
  const myMaxDamage = Math.max(myW1Damage, myW2Damage, myW3Damage) * 0.93;
  return myMaxDamage;
}

//choiseBetterWeapon()のロジック
export const choiseBetterWeaponLogic = (strongestWeapon, strongestHighPriorityWeapon, strongestHighPriorityWeaponDamage, myMaxDamage, myPokeSpeed, opPokeSpeed, myPokeHp, opPokeHp) => {
  let betterWeapon = "";
  //先制技を持っていているとき
  if (strongestHighPriorityWeapon) {
    //相手の方が遅く、自分の攻撃の中乱数で、相手が倒れる時は先制技を選択する
    if (myPokeSpeed > opPokeSpeed && opPokeHp <= myMaxDamage) {
      betterWeapon = strongestHighPriorityWeapon;
    }
    //先制技(最低乱数)で自分を倒せる場合は先制技を選択する
    else {
      betterWeapon = strongestHighPriorityWeaponDamage >= myPokeHp ? strongestHighPriorityWeapon : strongestWeapon;
    }
  }
  //通常は一番与えるダメージが大きい技を選択する
  else betterWeapon = strongestWeapon;

  return betterWeapon;
}

// 攻め側のエレメントを取得する
export const getAttackEffectElem = (attackerIsMe) => {
  const atcImgElem = document.querySelector(attackerIsMe ? `.my-poke-img` : `.op-poke-img`);
  return atcImgElem;
}

// 受け側のエレメントを取得する
export const getDamageEffectElem = (attackerIsMe) => {
  const defImgElem = document.querySelector(attackerIsMe ? `.op-poke-img` : `.my-poke-img`);
  return defImgElem;
}

//ジャンプエフェクト
export const jumpEffect = (elem) => {
  elem.classList.remove("jump"); // ← 一回消しておくと連続ジャンプにも対応
  void elem.offsetWidth;         // ← 再描画を強制するテク（重要）
  elem.classList.add("jump");
  delay(() => elem.classList.remove("jump"), 400);
}

//attackEffect()のロジック
export const attackEffectLogic = (attackerIsMe, elem) => {
  const attackClass = attackerIsMe ? "my-attack" : "op-attack";
  elem.classList.remove(attackClass);
  void elem.offsetWidth; // 再描画を強制
  elem.classList.add(attackClass);
  delay(() => elem.classList.remove(attackClass), 500);
}

//damageEffect()のロジック
export const damageEffectLogic = (elem) => {
  elem.classList.add("pokemon-damage-effect");
  delay(() => elem.classList.remove("pokemon-damage-effect"), 1000);
}

//ダメージ計算　ダメージ数/命中判定/急所判定　を返す
export const calcTrueDamage = (weaponInfo, attackerInfo, defenderInfo) => {
  let trueDamage = 0;
  const isHit = Math.random() * 100 < weaponInfo.hitrate;    //命中判定
  let isCriticalHit = false;   //急所フラグ

  //命中時のみダメージ計算する
  if (isHit) {
    const { pureDamage, basicDamage, isSameType, multiplier } = calcPureDamage(weaponInfo, attackerInfo, defenderInfo);
    const randomMultiplier = Math.floor((Math.random() * 0.16 + 0.85) * 100) / 100;    //乱数 0.85~1.00
    isCriticalHit = Math.random() < 0.0417 && multiplier !== 0;;   //急所フラグ 4.17%で急所にあたる

    trueDamage = Math.floor(pureDamage * randomMultiplier);    // 乱数
    trueDamage = Math.floor(trueDamage * (isCriticalHit ? 1.5 : 1));   //急所

    console.log(`${defenderInfo.name}に${trueDamage}ダメージ\n基礎ダメージ：${basicDamage}\n乱数：${randomMultiplier}\nタイプ一致：${isSameType ? 1.5 : 1}\n相性：${multiplier}\n急所：${isCriticalHit ? 1.5 : 1}`);
  }
  else {
    console.log(`${attackerInfo.name}の攻撃は当たらなかった`);
  }
  return { trueDamage, isHit, isCriticalHit };
}

//adjustHpBar()のロジック
export const adjustHpBarLogic = (isMe, newHp, fullHp) => {
  //HPバーの制御
  const hpPercent = Math.round((newHp / fullHp) * 100);
  //▼ロジック====
  const hpBarElem = document.querySelector(isMe ? ".my-hp-bar" : ".op-hp-bar");
  hpBarElem.style.width = `${hpPercent}%`;
  hpBarElem.classList.remove("low", "mid");
  if (hpPercent <= 25) {
    hpBarElem.classList.add("low");
  }
  else if (hpPercent <= 50) {
    hpBarElem.classList.add("mid");
  }
}

//ポケインジケータの色を取得する
export const getPokeIndicatorsColor = (currentHp, fullHp) => {
  let color = "gray";
  if (currentHp === fullHp) color = "green";
  else if (currentHp > 0) color = "yellow";
  return color;
}

//相手は自分のポケモンとの相性を考慮した、最適なポケモンを選択肢て返す
export const selectNextOpPokeLogic = (mypoke, opPokes) => {
  console.log(`相手の残りのポケモンは\n${opPokes[0].name}と${opPokes[1].name}`);

  //お互いの相性を取得する
  const myToOp = opPokes.map(op =>
    Math.max(
      calcMultiplier(mypoke.type1, op.type1, op.type2),
      calcMultiplier(mypoke.type2, op.type1, op.type2)
    )
  );
  const opToMy = opPokes.map(op =>
    Math.max(
      calcMultiplier(op.type1, mypoke.type1, mypoke.type2),
      calcMultiplier(op.type2, mypoke.type1, mypoke.type2)
    )
  );

  //相性や素早さを考慮して次に出すポケモンを決める
  let nextOpPoke = "";

  //自分から相手への相性が2体目も３体目も同じなら、
  // 相手から自分への相性が良い方を選択する　相手から自分への相性がどちらも同じなら速い方を選択する
  if (myToOp[0] === myToOp[1]) {
    if (opToMy[0] !== opToMy[1])
      nextOpPoke = (opToMy[0] > opToMy[1] ? opPokes[0] : opPokes[1]).name;
    else
      nextOpPoke = (opPokes[0].s > opPokes[1].s ? opPokes[0] : opPokes[1]).name;

    console.log(`自分のポケモンの${mypoke.name}に対しての受け相性はどちらも同じ
      ${opToMy[0] === opToMy[1] ? mypoke.name + "への攻め相性も同じため、より速い" + nextOpPoke + "を選択する" :
        mypoke.name + "への攻め相性がより良い" + nextOpPoke + "を選択する"
      }`
    );
  }

  //自分から相手への相性に差があるとき
  //相性が悪いの速さが自分よりも速くて、自分に弱点をつけるとき
  //相性がましな方の速さも自分よりも速くて、自分に弱点を付けるなら、ましな方を選択する
  else {
    const worse = myToOp[0] > myToOp[1] ? 0 : 1;
    const better = 1 - worse;
    console.log(`自分のポケモンの${mypoke.name}に対しての受け相性は${opPokes[better].name}の方が良い`);

    if (opPokes[worse].s > mypoke.s && opToMy[worse] >= 2)
      nextOpPoke = (opPokes[better].s > mypoke.s && opToMy[better] >= 2 ? opPokes[better] : opPokes[worse]).name;
    else nextOpPoke = opPokes[better].name;

    console.log(`${nextOpPoke === opPokes[better].name ?
      opPokes[worse].name + "は" + mypoke.name + "よりも遅くて弱点をつけないため、" + opPokes[better].name + "を選択する" :
      opPokes[worse].name + "は受け相性は悪いが、" + mypoke.name + "よりも速くて弱点を突けるため、" + opPokes[worse].name + "を選択する"}`);
  }
  return nextOpPoke;
};

//setTimeout()の簡略化
export const delay = (fn, ms) => setTimeout(fn, ms);

//model内の関数のパーツ=========================================================

//乱数と急所を考慮しないダメージ数と、基礎ダメージを返す
const calcPureDamage = (weaponInfo, attackerInfo, defenderInfo) => {
  const isSameType = (weaponInfo.type === attackerInfo.type1) || (weaponInfo.type === attackerInfo.type2);    //タイプ一致フラグ
  const multiplier = calcMultiplier(weaponInfo.type, defenderInfo.type1, defenderInfo.type2);

  //ダメージ計算　22 * 技威力 * (AorC / BorD) / 50 + 2 * ダメージ補正(* 乱数　* タイプ一致 * 相性 * 急所)
  let pureDamage = Math.floor(22 * weaponInfo.power * (attackerInfo.power / defenderInfo.power));
  pureDamage = Math.floor(pureDamage / 50 + 2);   //基礎ダメージ
  const basicDamage = pureDamage;   //デバッグ用
  pureDamage = Math.floor(pureDamage * (isSameType ? 1.5 : 1));    // タイプ一致補正
  pureDamage = Math.floor(pureDamage * multiplier);   //相性補正

  return { pureDamage, basicDamage, isSameType, multiplier };
}
