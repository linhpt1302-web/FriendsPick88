/**
 * Tournament Engine for Friends Pickleball Club
 * Supports Flexible 1-30 Teams, 1-10 Divisions (Bảng A ➔ Bảng J), Balanced Division Arranging,
 * Round-Robin Group Fixture Generation, and Knockout Quarterfinals with Best 3rd-Placed Wildcards.
 */

export const DIVISION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const DIVISION_NAMES = [
  'Bảng A', 'Bảng B', 'Bảng C', 'Bảng D', 'Bảng E',
  'Bảng F', 'Bảng G', 'Bảng H', 'Bảng I', 'Bảng J'
];

/**
 * Creates a flexible championship tournament with guaranteed round-robin match fixtures
 * @param {Object} config - { name, date, surface, prizeTrophy, description, teams, numGroups, manualGroups }
 */
export function createChampionshipTournament({
  name,
  date,
  surface = 'Sân Trung tâm 1 & 2',
  prizeTrophy = 'Cúp Vàng & Cặp Vợt Selkirk Pro 🏆',
  description = 'Giải đấu đôi chính thức CLB Friends',
  teams = [],
  numGroups = 4,
  manualGroups = null
}) {
  const totalTeams = teams.length;
  // Determine effective group count (each group should ideally have at least 2 teams)
  const maxPossibleGroups = Math.max(1, Math.floor(totalTeams / 2));
  const groupsCount = Math.max(1, Math.min(10, Math.min(Number(numGroups), maxPossibleGroups || 1)));

  // Initialize groups
  const groups = [];
  for (let g = 0; g < groupsCount; g++) {
    groups.push({
      id: `group-${DIVISION_LETTERS[g].toLowerCase()}`,
      name: DIVISION_NAMES[g],
      code: DIVISION_LETTERS[g],
      teams: [],
      matches: []
    });
  }

  // Populate teams into groups
  if (manualGroups && Array.isArray(manualGroups)) {
    manualGroups.forEach((mg, idx) => {
      if (groups[idx]) {
        groups[idx].teams = mg.teams || [];
      }
    });
  } else {
    // Check if teams already have valid group codes within our groupsCount range
    const validGroupCodes = groups.map(g => g.code);
    const hasExplicitGroups = teams.some(t => t.groupCode && validGroupCodes.includes(t.groupCode));

    if (hasExplicitGroups) {
      teams.forEach((team, idx) => {
        let targetGroup = groups.find(g => g.code === team.groupCode);
        if (!targetGroup) {
          targetGroup = groups[idx % groupsCount];
        }
        targetGroup.teams.push({
          ...team,
          groupCode: targetGroup.code
        });
      });
    } else {
      // Balanced snake draft allocation by average Elo
      const sortedTeams = [...teams].sort((a, b) => (b.avgElo || 0) - (a.avgElo || 0));
      sortedTeams.forEach((team, idx) => {
        const cycle = Math.floor(idx / groupsCount);
        const rem = idx % groupsCount;
        const targetGroupIndex = cycle % 2 === 0 ? rem : groupsCount - 1 - rem;
        const assignedGroup = groups[targetGroupIndex % groupsCount];
        assignedGroup.teams.push({
          ...team,
          groupCode: assignedGroup.code
        });
      });
    }
  }

  // Re-balance: if any group has 0 or 1 team while others have > 2, redistribute evenly
  const flatTeams = groups.flatMap(g => g.teams);
  const minTeamsPerGroup = Math.min(...groups.map(g => g.teams.length));
  if (minTeamsPerGroup < 2 && flatTeams.length >= groupsCount * 2) {
    groups.forEach(g => { g.teams = []; });
    flatTeams.forEach((team, idx) => {
      const assignedGroup = groups[idx % groupsCount];
      assignedGroup.teams.push({ ...team, groupCode: assignedGroup.code });
    });
  }

  // Generate round-robin match fixtures for each group
  let matchIdCounter = 1;
  const timestamp = Date.now();

  groups.forEach((group) => {
    const grpTeams = group.teams;
    let roundNum = 1;

    for (let i = 0; i < grpTeams.length; i++) {
      for (let j = i + 1; j < grpTeams.length; j++) {
        const tA = grpTeams[i];
        const tB = grpTeams[j];

        group.matches.push({
          id: `gm-${group.code.toLowerCase()}-${timestamp}-${matchIdCounter++}`,
          groupId: group.id,
          groupName: group.name,
          stage: 'group',
          roundName: `${group.name} - Trận ${roundNum++}`,
          teamA: {
            id: tA.id,
            name: tA.name,
            playerIds: tA.playerIds || [tA.player1Id, tA.player2Id].filter(Boolean),
            avgElo: tA.avgElo || 1200
          },
          teamB: {
            id: tB.id,
            name: tB.name,
            playerIds: tB.playerIds || [tB.player1Id, tB.player2Id].filter(Boolean),
            avgElo: tB.avgElo || 1200
          },
          scoreA: null,
          scoreB: null,
          winnerId: null,
          isFinal: false,
          status: 'scheduled'
        });
      }
    }
  });

  // Calculate advancing teams count for knockout bracket
  let advancingTeamsCount = 8;
  if (groupsCount === 1) {
    advancingTeamsCount = Math.min(4, Math.max(2, totalTeams));
  } else if (groupsCount === 2) {
    advancingTeamsCount = Math.min(8, Math.max(4, groupsCount * 2));
  } else if (groupsCount <= 4) {
    advancingTeamsCount = 8;
  } else {
    advancingTeamsCount = Math.min(16, groupsCount * 2);
  }

  // Build Knockout Bracket (Quarterfinals / Semifinals / Finals)
  const rounds = [];

  if (advancingTeamsCount >= 8) {
    // 4 Quarterfinal Matches
    let qfMatches = [];
    if (groupsCount === 3) {
      // 3 Groups (Odd): Top 2 from A, B, C (6 teams) + 2 Best 3rd-placed teams
      qfMatches = [
        {
          id: `qf-1-${timestamp}`,
          round: 1,
          stage: 'quarterfinal',
          roundName: 'Tứ kết 1 (Nhất A vs Hạng 3 Tốt Nhất 2)',
          slotA: 'Nhất Bảng A',
          slotB: 'Đội Hạng 3 Tốt Nhất #2 ⭐',
          teamA: null,
          teamB: null,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          isFinal: false,
          status: 'pending'
        },
        {
          id: `qf-2-${timestamp}`,
          round: 1,
          stage: 'quarterfinal',
          roundName: 'Tứ kết 2 (Nhất B vs Nhì C)',
          slotA: 'Nhất Bảng B',
          slotB: 'Nhì Bảng C',
          teamA: null,
          teamB: null,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          isFinal: false,
          status: 'pending'
        },
        {
          id: `qf-3-${timestamp}`,
          round: 1,
          stage: 'quarterfinal',
          roundName: 'Tứ kết 3 (Nhất C vs Hạng 3 Tốt Nhất 1)',
          slotA: 'Nhất Bảng C',
          slotB: 'Đội Hạng 3 Tốt Nhất #1 ⭐',
          teamA: null,
          teamB: null,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          isFinal: false,
          status: 'pending'
        },
        {
          id: `qf-4-${timestamp}`,
          round: 1,
          stage: 'quarterfinal',
          roundName: 'Tứ kết 4 (Nhì A vs Nhì B)',
          slotA: 'Nhì Bảng A',
          slotB: 'Nhì Bảng B',
          teamA: null,
          teamB: null,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          isFinal: false,
          status: 'pending'
        }
      ];
    } else {
      qfMatches = [
        {
          id: `qf-1-${timestamp}`,
          round: 1,
          stage: 'quarterfinal',
          roundName: 'Tứ kết 1 (Nhất A vs Nhì B)',
          slotA: 'Nhất Bảng A',
          slotB: groupsCount >= 2 ? 'Nhì Bảng B' : 'Hạng 4 Bảng A',
          teamA: null,
          teamB: null,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          isFinal: false,
          status: 'pending'
        },
        {
          id: `qf-2-${timestamp}`,
          round: 1,
          stage: 'quarterfinal',
          roundName: 'Tứ kết 2 (Nhất C vs Nhì D)',
          slotA: groupsCount >= 3 ? 'Nhất Bảng C' : 'Hạng 2 Bảng A',
          slotB: groupsCount >= 4 ? 'Nhì Bảng D' : 'Hạng 3 Bảng B',
          teamA: null,
          teamB: null,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          isFinal: false,
          status: 'pending'
        },
        {
          id: `qf-3-${timestamp}`,
          round: 1,
          stage: 'quarterfinal',
          roundName: 'Tứ kết 3 (Nhất B vs Nhì A)',
          slotA: groupsCount >= 2 ? 'Nhất Bảng B' : 'Hạng 2 Bảng A',
          slotB: groupsCount >= 1 ? 'Nhì Bảng A' : 'Hạng 4 Bảng A',
          teamA: null,
          teamB: null,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          isFinal: false,
          status: 'pending'
        },
        {
          id: `qf-4-${timestamp}`,
          round: 1,
          stage: 'quarterfinal',
          roundName: 'Tứ kết 4 (Nhất D vs Nhì C)',
          slotA: groupsCount >= 4 ? 'Nhất Bảng D' : 'Hạng 2 Bảng B',
          slotB: groupsCount >= 3 ? 'Nhì Bảng C' : 'Hạng 3 Bảng A',
          teamA: null,
          teamB: null,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          isFinal: false,
          status: 'pending'
        }
      ];
    }

    rounds.push({
      roundNumber: 1,
      title: 'Vòng Tứ Kết (Chạm 15)',
      matches: qfMatches
    });
  }

  // Semifinals (2 matches)
  const qfIds = rounds[0]?.matches?.map(m => m.id) || [];
  const semifinalMatches = [
    {
      id: `sf-1-${timestamp}`,
      round: rounds.length + 1,
      stage: 'semifinal',
      roundName: 'Bán kết 1 (Thắng TK1 vs Thắng TK2)',
      slotA: advancingTeamsCount < 8 ? 'Nhất Bảng A' : null,
      slotB: advancingTeamsCount < 8 ? (groupsCount >= 2 ? 'Nhì Bảng B' : 'Hạng 4') : null,
      teamA: null,
      teamB: null,
      scoreA: null,
      scoreB: null,
      winnerId: null,
      isFinal: false,
      status: 'pending',
      feederMatchIds: qfIds.length >= 2 ? [qfIds[0], qfIds[1]] : null
    },
    {
      id: `sf-2-${timestamp}`,
      round: rounds.length + 1,
      stage: 'semifinal',
      roundName: 'Bán kết 2 (Thắng TK3 vs Thắng TK4)',
      slotA: advancingTeamsCount < 8 ? (groupsCount >= 2 ? 'Nhất Bảng B' : 'Hạng 2') : null,
      slotB: advancingTeamsCount < 8 ? 'Nhì Bảng A' : null,
      teamA: null,
      teamB: null,
      scoreA: null,
      scoreB: null,
      winnerId: null,
      isFinal: false,
      status: 'pending',
      feederMatchIds: qfIds.length >= 4 ? [qfIds[2], qfIds[3]] : null
    }
  ];

  rounds.push({
    roundNumber: rounds.length + 1,
    title: 'Vòng Bán Kết (Chạm 15)',
    matches: semifinalMatches
  });

  // Grand Final (1 match - Best of 3 sets to 11 pts)
  const finalMatches = [
    {
      id: `final-1-${timestamp}`,
      round: rounds.length + 1,
      stage: 'final',
      roundName: 'Chung Kết Vô Địch (Thắng 2/3 set)',
      teamA: null,
      teamB: null,
      scoreA: null,
      scoreB: null,
      sets: [],
      winnerId: null,
      isFinal: true,
      status: 'pending',
      feederMatchIds: [`sf-1-${timestamp}`, `sf-2-${timestamp}`]
    }
  ];

  rounds.push({
    roundNumber: rounds.length + 1,
    title: 'Chung Kết Tranh Cúp (Bo3 chạm 11)',
    matches: finalMatches
  });

  const bracket = {
    rounds,
    champion: null
  };

  return {
    id: `tourney-${timestamp}`,
    name: name || `Giải Đôi CLB Friends ${new Date().getFullYear()}`,
    date: date || 'Tháng 8, 2026',
    surface,
    prizeTrophy,
    description,
    format: 'championship',
    status: 'in-progress',
    totalTeams,
    numGroups: groupsCount,
    groups,
    bracket,
    eloGains: []
  };
}

/**
 * Calculates standings table for a single group
 */
export function calculateGroupStandings(teams = [], matches = []) {
  const standings = teams.map(team => ({
    teamId: team.id,
    teamName: team.name,
    playerIds: team.playerIds,
    avgElo: team.avgElo || 1200,
    played: 0,
    won: 0,
    lost: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pointsDiff: 0,
    winRate: 0
  }));

  matches.forEach(m => {
    if (m.status === 'completed' && m.scoreA !== null && m.scoreB !== null) {
      const standA = standings.find(s => s.teamId === m.teamA?.id);
      const standB = standings.find(s => s.teamId === m.teamB?.id);

      if (standA && standB) {
        standA.played += 1;
        standB.played += 1;

        standA.pointsFor += m.scoreA;
        standA.pointsAgainst += m.scoreB;
        standB.pointsFor += m.scoreB;
        standB.pointsAgainst += m.scoreA;

        if (m.winnerId === m.teamA.id || m.scoreA > m.scoreB) {
          standA.won += 1;
          standB.lost += 1;
        } else if (m.winnerId === m.teamB.id || m.scoreB > m.scoreA) {
          standB.won += 1;
          standA.lost += 1;
        }
      }
    }
  });

  standings.forEach(s => {
    s.pointsDiff = s.pointsFor - s.pointsAgainst;
    s.winRate = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;
  });

  // Sort by Wins desc, then Points Diff desc, then Points For desc, then avgElo desc
  standings.sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won;
    if (b.pointsDiff !== a.pointsDiff) return b.pointsDiff - a.pointsDiff;
    if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
    return (b.avgElo || 0) - (a.avgElo || 0);
  });

  return standings;
}

/**
 * Computes rankings of third-placed teams across odd groups to award wildcard Quarterfinal berths
 */
export function getBestThirdPlacedTeams(groups = [], countNeeded = 2) {
  const thirdPlacedTeams = [];

  groups.forEach(g => {
    const standings = calculateGroupStandings(g.teams, g.matches);
    if (standings[2]) {
      const thirdTeam = standings[2];
      const fullTeamObj = g.teams.find(t => t.id === thirdTeam.teamId);
      thirdPlacedTeams.push({
        ...thirdTeam,
        groupCode: g.code,
        groupName: g.name,
        teamObj: fullTeamObj
      });
    }
  });

  thirdPlacedTeams.sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won;
    if (b.pointsDiff !== a.pointsDiff) return b.pointsDiff - a.pointsDiff;
    if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
    return (b.avgElo || 0) - (a.avgElo || 0);
  });

  return thirdPlacedTeams.slice(0, countNeeded);
}

/**
 * Automatically syncs qualified group teams into the Quarterfinals/Semifinals bracket
 */
export function syncGroupWinnersToQuarterfinals(tournament) {
  if (!tournament.groups || !tournament.bracket) return tournament;

  const updatedTournament = JSON.parse(JSON.stringify(tournament));
  const { groups, bracket } = updatedTournament;
  const firstRoundMatches = bracket.rounds[0]?.matches || [];

  // Calculate standings for each group
  const groupStandingsMap = {};
  groups.forEach(g => {
    const standings = calculateGroupStandings(g.teams, g.matches);
    groupStandingsMap[g.code] = { standings };
  });

  if (firstRoundMatches.length === 4) {
    const grpA = groupStandingsMap['A']?.standings;
    const grpB = groupStandingsMap['B']?.standings;
    const grpC = groupStandingsMap['C']?.standings;
    const grpD = groupStandingsMap['D']?.standings;

    if (groups.length === 3) {
      const bestThirds = getBestThirdPlacedTeams(groups, 2);
      const bestThird1 = bestThirds[0]?.teamObj;
      const bestThird2 = bestThirds[1]?.teamObj;

      if (grpA && grpA[0]) firstRoundMatches[0].teamA = groups.find(g => g.code === 'A')?.teams.find(t => t.id === grpA[0].teamId);
      if (bestThird2) firstRoundMatches[0].teamB = bestThird2;

      if (grpB && grpB[0]) firstRoundMatches[1].teamA = groups.find(g => g.code === 'B')?.teams.find(t => t.id === grpB[0].teamId);
      if (grpC && grpC[1]) firstRoundMatches[1].teamB = groups.find(g => g.code === 'C')?.teams.find(t => t.id === grpC[1].teamId);

      if (grpC && grpC[0]) firstRoundMatches[2].teamA = groups.find(g => g.code === 'C')?.teams.find(t => t.id === grpC[0].teamId);
      if (bestThird1) firstRoundMatches[2].teamB = bestThird1;

      if (grpA && grpA[1]) firstRoundMatches[3].teamA = groups.find(g => g.code === 'A')?.teams.find(t => t.id === grpA[1].teamId);
      if (grpB && grpB[1]) firstRoundMatches[3].teamB = groups.find(g => g.code === 'B')?.teams.find(t => t.id === grpB[1].teamId);
    } else if (groups.length >= 4) {
      if (grpA && grpA[0]) firstRoundMatches[0].teamA = groups.find(g => g.code === 'A')?.teams.find(t => t.id === grpA[0].teamId);
      if (grpB && grpB[1]) firstRoundMatches[0].teamB = groups.find(g => g.code === 'B')?.teams.find(t => t.id === grpB[1].teamId);

      if (grpC && grpC[0]) firstRoundMatches[1].teamA = groups.find(g => g.code === 'C')?.teams.find(t => t.id === grpC[0].teamId);
      if (grpD && grpD[1]) firstRoundMatches[1].teamB = groups.find(g => g.code === 'D')?.teams.find(t => t.id === grpD[1].teamId);

      if (grpB && grpB[0]) firstRoundMatches[2].teamA = groups.find(g => g.code === 'B')?.teams.find(t => t.id === grpB[0].teamId);
      if (grpA && grpA[1]) firstRoundMatches[2].teamB = groups.find(g => g.code === 'A')?.teams.find(t => t.id === grpA[1].teamId);

      if (grpD && grpD[0]) firstRoundMatches[3].teamA = groups.find(g => g.code === 'D')?.teams.find(t => t.id === grpD[0].teamId);
      if (grpC && grpC[1]) firstRoundMatches[3].teamB = groups.find(g => g.code === 'C')?.teams.find(t => t.id === grpC[1].teamId);
    } else if (groups.length === 2) {
      if (grpA && grpA[0]) firstRoundMatches[0].teamA = groups.find(g => g.code === 'A')?.teams.find(t => t.id === grpA[0].teamId);
      if (grpB && grpB[3]) firstRoundMatches[0].teamB = groups.find(g => g.code === 'B')?.teams.find(t => t.id === grpB[3].teamId);

      if (grpA && grpA[1]) firstRoundMatches[1].teamA = groups.find(g => g.code === 'A')?.teams.find(t => t.id === grpA[1].teamId);
      if (grpB && grpB[2]) firstRoundMatches[1].teamB = groups.find(g => g.code === 'B')?.teams.find(t => t.id === grpB[2].teamId);

      if (grpB && grpB[0]) firstRoundMatches[2].teamA = groups.find(g => g.code === 'B')?.teams.find(t => t.id === grpB[0].teamId);
      if (grpA && grpA[3]) firstRoundMatches[2].teamB = groups.find(g => g.code === 'A')?.teams.find(t => t.id === grpA[3].teamId);

      if (grpB && grpB[1]) firstRoundMatches[3].teamA = groups.find(g => g.code === 'B')?.teams.find(t => t.id === grpB[1].teamId);
      if (grpA && grpA[2]) firstRoundMatches[3].teamB = groups.find(g => g.code === 'A')?.teams.find(t => t.id === grpA[2].teamId);
    }
  } else if (firstRoundMatches.length === 2) {
    const grpA = groupStandingsMap['A']?.standings;
    const grpB = groupStandingsMap['B']?.standings;

    if (grpA && grpA[0]) firstRoundMatches[0].teamA = groups.find(g => g.code === 'A')?.teams.find(t => t.id === grpA[0].teamId);
    if (grpB && grpB[1]) firstRoundMatches[0].teamB = groups.find(g => g.code === 'B')?.teams.find(t => t.id === grpB[1].teamId);

    if (grpB && grpB[0]) firstRoundMatches[1].teamA = groups.find(g => g.code === 'B')?.teams.find(t => t.id === grpB[0].teamId);
    if (grpA && grpA[1]) firstRoundMatches[1].teamB = groups.find(g => g.code === 'A')?.teams.find(t => t.id === grpA[1].teamId);
  }

  firstRoundMatches.forEach(m => {
    if (m.teamA && m.teamB && m.status === 'pending') {
      m.status = 'scheduled';
    }
  });

  return updatedTournament;
}
