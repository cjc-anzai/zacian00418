import React, { useState } from "react";
import PokemonDetailModal from "./PokemonDetailModal";

const TeamBuildingScreen = ({ battleStates, battleControllers, battleExecutors }) => {
  // propsから必要なデータと関数を展開
  // ※実際のプロパティ名は useBattleStates 等の実装に依存しますが、
  //   要件に合わせて想定される名前で記述しています。
  //   allPokemonList: 全18体のポケモン配列
  //   myTeam: 選択されたポケモンの配列
  // const { myTeam } = battleStates;
  // const { handleToggleTeamMember, handleShowDetail } = battleControllers;

  const { setAreaVisible, myTeam, setMyTeam, setOpTeam } = battleStates;
  // const { handleShowDetail } = battleControllers;
  const { selectOpPokeOrder, getPokeInfo } = battleExecutors;

  const [detailPokemon, setDetailPokemon] = useState(null);

  

  const handleToggleTeamMember = (pokemon) => {
    setMyTeam((prev) => {
      const validTeam = prev.filter((p) => p);
      if (validTeam.some((p) => p.kanaName === pokemon.kanaName)) {
        return validTeam.filter((p) => p.kanaName !== pokemon.kanaName);
      }
      return validTeam.length < 6 ? [...validTeam, pokemon] : prev;
    });
  };

  const handleDecide = async () => {
    // myTeamにいるポケモンの名前の配列を作成します。
    const myTeamNames = myTeam.map(p => p.kanaName);
    // pokesKanaName配列から、myTeamにいるポケモンを除いた新しい配列を作成します。
    const remainingPokes = pokesKanaName
      .map((kanaName, index) => ({
        kanaName: kanaName,
        romaName: pokesRomaName[index]
      }))
      .filter((poke) => !myTeamNames.includes(poke.kanaName));
    // console.log(remainingPokes); 
    const opSelectedOrder = await selectOpPokeOrder(remainingPokes, "teamBuilding", "hard");
    setOpTeam((prev) => ({
      ...prev,
      [0]: opSelectedOrder[0],
      [1]: opSelectedOrder[1],
      [2]: opSelectedOrder[2],
      [3]: opSelectedOrder[3],
      [4]: opSelectedOrder[4],
      [5]: opSelectedOrder[5],
    }));
    // setAreaVisible((prev) => ({ ...prev, teamBuilding: false, select: true }));
  };

  const getPokeImg = (pokeName) => {
    const url = `https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/pokeImg/${pokeName}.png`
    return url;
  }

  const pokesRomaName = [
    "raguraji", "gyaradosu", "rizadon", "goukazaru", "buban", "jibakoiru",
    "dosaidon", "guraion", "manmu", "erureido", "sanaito", "genga",
    "eamudo", "bangirasu", "rukario", "metagurosu", "gaburiasu", "kairyu",
  ];
  const pokesKanaName = [
    "ラグラージ", "ギャラドス", "リザードン", "ゴウカザル", "ブーバーン", "ジバコイル",
    "ドサイドン", "グライオン", "マンムー", "エルレイド", "サーナイト", "ゲンガー",
    "エアームド", "バンギラス", "ルカリオ", "メタグロス", "ガブリアス", "カイリュー",
  ];

  return (
    <div className="team-building-screen">
      <div className="team-building-text">
        <h2>ポケモンを６体選んでね</h2>
      </div>

      {/* 上部エリア：選択候補のポケモン一覧 (18体) */}
      {/* CSSで grid-template-columns: repeat(6, 1fr); を想定 */}
      <div className="pokemon-selection-list">
        {pokesRomaName.map((romaName, index) => {
          const kanaName = pokesKanaName[index];
          const pokemon = {
            kanaName: kanaName,
            romaName: romaName,
            img: getPokeImg(romaName),
          };
          // 選択済みかどうかを判定
          const isSelected = myTeam.some((p) => p && p.kanaName === pokemon.kanaName);

          return (
            <div
              key={pokemon.kanaName}
              className={`pokemon-card ${isSelected ? "selected" : ""}`}
            >
              {/* ポケモン選択ボタン */}
              <button
                className={`pokemon-img-btn ${isSelected ? "selected" : ""}`}
                onClick={() => handleToggleTeamMember(pokemon)}
                aria-label={`${pokemon.kanaName}を選択`}
              >
                <img src={pokemon.img} alt={pokemon.kanaName} />
                <p>{pokemon.kanaName}</p>
              </button>

              {/* 詳細表示ボタン */}
              <button
                className="detail-btn"
                onClick={async () => {
                  const info = await getPokeInfo(pokemon.kanaName);
                  setDetailPokemon(info);
                }}
              >
                詳細
              </button>
            </div>
          );
        })}
      </div>

      {/* 下部エリア：現在のパーティメンバー (最大6体) */}
      <div className="current-team-container">
        {/* 6つのスロットを表示 */}
        {[...Array(6)].map((_, index) => {
          const member = myTeam[index];
          return (
            <div key={index} className="team-slot">
              {member && <img src={member.img} alt={member.name} />}
            </div>
          );
        })}
        {/* 7つ目のスロット：決定ボタン */}
        <button
          className={`team-slot decide-slot-btn ${myTeam.length === 6 ? "active" : "inactive"}`}
          onClick={handleDecide}
          disabled={myTeam.length !== 6}
        >
          決定
        </button>
      </div>

      {/* 詳細モーダル */}
      {detailPokemon && (
        <PokemonDetailModal
          pokeInfo={detailPokemon}
          onClose={() => setDetailPokemon(null)}
        />
      )}
    </div>
  );
};

export default TeamBuildingScreen;