/**
 * ELO and Doubles Rating Engine for Friends Pickleball Club
 */

const K_FACTOR = 32;

/**
 * Calculate expected win probability for Team A against Team B
 */
export function getExpectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculates new Elo ratings for 4 players after a doubles match.
 */
export function calculateDoublesElo(
  teamAPlayerRatings,
  teamBPlayerRatings,
  teamAScore,
  teamBScore,
  teamAWon
) {
  const teamAAvg = (teamAPlayerRatings[0] + teamAPlayerRatings[1]) / 2;
  const teamBAvg = (teamBPlayerRatings[0] + teamBPlayerRatings[1]) / 2;

  const expectedA = getExpectedScore(teamAAvg, teamBAvg);
  const expectedB = 1 - expectedA;

  const actualA = teamAWon ? 1 : 0;
  const actualB = teamAWon ? 0 : 1;

  // Margin of victory multiplier
  const totalPoints = teamAScore + teamBScore;
  const scoreDiff = Math.abs(teamAScore - teamBScore);
  const marginMultiplier = totalPoints > 0 ? Math.log(scoreDiff + 1) * (2.2 / ((teamAAvg - teamBAvg) * (teamAWon ? 0.001 : -0.001) + 2.2)) : 1;
  const multiplier = Math.max(0.8, Math.min(2.0, isNaN(marginMultiplier) ? 1 : marginMultiplier));

  const ratingDeltaA = Math.round(K_FACTOR * (actualA - expectedA) * multiplier);
  const ratingDeltaB = Math.round(K_FACTOR * (actualB - expectedB) * multiplier);

  return {
    teamAChange: ratingDeltaA,
    teamBChange: ratingDeltaB,
    player1New: Math.max(800, teamAPlayerRatings[0] + ratingDeltaA),
    player2New: Math.max(800, teamAPlayerRatings[1] + ratingDeltaA),
    player3New: Math.max(800, teamBPlayerRatings[0] + ratingDeltaB),
    player4New: Math.max(800, teamBPlayerRatings[1] + ratingDeltaB)
  };
}

/**
 * Calculates chemistry/synergy score between two players based on their partnership history
 */
export function calculatePartnershipChemistry(matchesTogether, winsTogether) {
  if (!matchesTogether || matchesTogether === 0) return { score: 50, tier: 'Cặp Đôi Mới 🤝', color: '#94a3b8' };

  const winRate = (winsTogether / matchesTogether) * 100;
  const volumeBonus = Math.min(20, matchesTogether * 1.5);
  const chemistryScore = Math.min(100, Math.round(winRate * 0.8 + volumeBonus));

  let tier = 'Đang Phát Triển 🌱';
  let color = '#94a3b8';

  if (chemistryScore >= 90) {
    tier = 'Cực Kỳ Ăn Ý 🔥';
    color = '#ccff00';
  } else if (chemistryScore >= 75) {
    tier = 'Cặp Đôi Sát Thủ ⚡';
    color = '#06b6d4';
  } else if (chemistryScore >= 60) {
    tier = 'Phối Hợp Nhịp Nhàng ✨';
    color = '#10b981';
  }

  return { score: chemistryScore, winRate: Math.round(winRate), tier, color };
}

/**
 * Convert Elo rating to approximate DUPR skill rating (2.0 to 6.0 scale)
 */
export function eloToDupr(elo) {
  const dupr = 2.5 + ((elo - 1000) / 1000) * 3.0;
  return Math.max(2.0, Math.min(6.0, parseFloat(dupr.toFixed(2))));
}
