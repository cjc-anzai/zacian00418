  //一般変数========================================================================================================================================

  //サウンド関係
  export const sounds = {
    bgm: {
      selection: new Audio('/sound/bgm/selectionBgm.wav'),
      battle: new Audio('/sound/bgm/battleBgm.wav'),
    },
    general: {
      start: new Audio("/sound/general/pikaVoiceSe.mp3"),
      select: new Audio("/sound/general/selectSe.mp3"),
      decide: new Audio("/sound/general/decideSe.mp3"),
      cancel: new Audio("/sound/general/cancelSe.mp3"),
      back: new Audio("/sound/general/backSe.mp3"),
      win: new Audio("/sound/general/winSe.mp3"),
      lose: new Audio("/sound/general/loseSe.mp3"),
    },
    pokeVoice: {
      diaruga: new Audio('/sound/pokeVoice/diaruga.mp3'),
      parukia: new Audio('/sound/pokeVoice/parukia.mp3'),
      rukario: new Audio('/sound/pokeVoice/rukario.mp3'),
      pikachu: new Audio('/sound/pokeVoice/pikachu.wav'),
      genga: new Audio('/sound/pokeVoice/genga.wav'),
      rizadon: new Audio('/sound/pokeVoice/rizadon.wav'),
      raguraji: new Audio('/sound/pokeVoice/raguraji.wav'),
      manyura: new Audio('/sound/pokeVoice/manyura.mp3'),
      dodaitosu: new Audio('/sound/pokeVoice/dodaitosu.mp3'),
      megayanma: new Audio('/sound/pokeVoice/megayanma.mp3'),
      sanaito: new Audio('/sound/pokeVoice/sanaito.wav'),
      kairiki: new Audio('/sound/pokeVoice/kairiki.wav'),
    },
    weapon: {
      beam1: new Audio('/sound/weapon/beam1.mp3'),
      beam2: new Audio('/sound/weapon/beam2.mp3'),
      slash1: new Audio('/sound/weapon/slash1.mp3'),
      slash2: new Audio('/sound/weapon/slash2.mp3'),
      electric1: new Audio('/sound/weapon/electric1.mp3'),
      fire1: new Audio('/sound/weapon/fire1.mp3'),
      ball1: new Audio('/sound/weapon/ball1.mp3'),
      water1: new Audio('/sound/weapon/water1.mp3'),
      hit1: new Audio('/sound/weapon/hit1.mp3'),
      hit2: new Audio('/sound/weapon/hit2.mp3'),
      hit3: new Audio('/sound/weapon/hit3.mp3'),
      ice1: new Audio('/sound/weapon/ice1.mp3'),
      ground1: new Audio('/sound/weapon/ground1.mp3'),
      bomb1: new Audio('/sound/weapon/bomb1.mp3'),
      flash1: new Audio('/sound/weapon/flash1.mp3'),
      laser1: new Audio('/sound/weapon/laser1.mp3'),
      esper1: new Audio('/sound/weapon/esper1.mp3'),
    },
    damage: {
      batsugun: new Audio('/sound/damage/batsugun.mp3'),
      toubai: new Audio('/sound/damage/toubai.mp3'),
      imahitotsu: new Audio('/sound/damage/imahitotsu.mp3')
    }
  };

  //画像
  export const pokeImgs = {
    diaruga: '/img/poke/diaruga.png',
    parukia: '/img/poke/parukia.png',
    rukario: '/img/poke/rukario.png',
    pikachu: '/img/poke/pikachu.png',
    genga: '/img/poke/genga.png',
    rizadon: '/img/poke/rizadon.png',
    raguraji: '/img/poke/raguraji.png',
    manyura: '/img/poke/manyura.png',
    dodaitosu: '/img/poke/dodaitosu.png',
    megayanma: '/img/poke/megayanma.png',
    sanaito: '/img/poke/sanaito.png',
    kairiki: '/img/poke/kairiki.png',
  };

  //ポケモン情報　画像,鳴き声,タイプ,能力値,技
  export const pokeInfo = {
    ディアルガ: { img: pokeImgs.diaruga, voice: sounds.pokeVoice.diaruga, type1: "ドラゴン", type2: "はがね", speed: 110, weapon1: "ときのほうこう", weapon2: "ラスターカノン" },
    パルキア: { img: pokeImgs.parukia, voice: sounds.pokeVoice.parukia, type1: "ドラゴン", type2: "みず", speed: 120, weapon1: "あくうせつだん", weapon2: "ハイドロポンプ" },
    ルカリオ: { img: pokeImgs.rukario, voice: sounds.pokeVoice.rukario, type1: "かくとう", type2: "はがね", speed: 110, weapon1: "はどうだん", weapon2: "ラスターカノン" },
    ピカチュウ: { img: pokeImgs.pikachu, voice: sounds.pokeVoice.pikachu, type1: "でんき", type2: "", speed: 110, weapon1: "１０万ボルト", weapon2: "アイアンテール" },
    リザードン: { img: pokeImgs.rizadon, voice: sounds.pokeVoice.rizadon, type1: "ほのお", type2: "ひこう", speed: 120, weapon1: "かえんほうしゃ", weapon2: "エアスラッシュ" },
    ゲンガー: { img: pokeImgs.genga, voice: sounds.pokeVoice.genga, type1: "ゴースト", type2: "どく", speed: 130, weapon1: "シャドーボール", weapon2: "ヘドロばくだん" },
    ラグラージ: { img: pokeImgs.raguraji, voice: sounds.pokeVoice.raguraji, type1: "みず", type2: "じめん", speed: 80, weapon1: "アクアブレイク", weapon2: "じしん" },
    マニューラ: { img: pokeImgs.manyura, voice: sounds.pokeVoice.manyura, type1: "こおり", type2: "あく", speed: 145, weapon1: "つららおとし", weapon2: "じごくづき" },
    カイリキー: { img: pokeImgs.kairiki, voice: sounds.pokeVoice.kairiki, type1: "かくとう", type2: "", speed: 75, weapon1: "ばくれつパンチ", weapon2: "ほのおのパンチ" },
    サーナイト: { img: pokeImgs.sanaito, voice: sounds.pokeVoice.sanaito, type1: "エスパー", type2: "フェアリー", speed: 100, weapon1: "ムーンフォース", weapon2: "サイコキネシス" },
    メガヤンマ: { img: pokeImgs.megayanma, voice: sounds.pokeVoice.megayanma, type1: "むし", type2: "ひこう", speed: 115, weapon1: "むしのさざめき", weapon2: "エアスラッシュ" },
    ドダイトス: { img: pokeImgs.dodaitosu, voice: sounds.pokeVoice.dodaitosu, type1: "くさ", type2: "じめん", speed: 76, weapon1: "タネばくだん", weapon2: "じしん" },
  };

  //技情報　タイプ,SE
  export const weaponInfo = {
    かえんほうしゃ: { type: "ほのお", sound: sounds.weapon.fire1 },
    ほのおのパンチ: { type: "ほのお", sound: sounds.weapon.hit3 },
    ハイドロポンプ: { type: "みず", sound: sounds.weapon.water1 },
    アクアブレイク: { type: "みず", sound: sounds.weapon.hit2 },
    "１０万ボルト": { type: "でんき", sound: sounds.weapon.electric1 },
    タネばくだん: { type: "くさ", sound: sounds.weapon.bomb1 },
    はどうだん: { type: "かくとう", sound: sounds.weapon.ball1 },
    ばくれつパンチ: { type: "かくとう", sound: sounds.weapon.hit3 },
    サイコキネシス: { type: "エスパー", sound: sounds.weapon.esper1 },
    むしのさざめき: { type: "むし", sound: sounds.weapon.laser1 },
    シャドーボール: { type: "ゴースト", sound: sounds.weapon.ball1 },
    ときのほうこう: { type: "ドラゴン", sound: sounds.weapon.beam1 },
    あくうせつだん: { type: "ドラゴン", sound: sounds.weapon.slash1 },
    ラスターカノン: { type: "はがね", sound: sounds.weapon.beam2 },
    アイアンテール: { type: "はがね", sound: sounds.weapon.hit1 },
    ヘドロばくだん: { type: "どく", sound: sounds.weapon.bomb1 },
    じしん: { type: "じめん", sound: sounds.weapon.ground1 },
    エアスラッシュ: { type: "ひこう", sound: sounds.weapon.slash2 },
    つららおとし: { type: "こおり", sound: sounds.weapon.ice1 },
    じごくづき: { type: "あく", sound: sounds.weapon.hit2 },
    ムーンフォース: { type: "フェアリー", sound: sounds.weapon.flash1 },
  }

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
    フェアリー: { ほのお: 0.5, かくとう: 2, どく: 0.5, ドラゴン: 2, あく: 2, はがね: 0.5 }
  };

