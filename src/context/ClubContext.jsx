import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MEMBERS, INITIAL_MATCHES, INITIAL_TOURNAMENTS } from '../data/seedData';
import { calculateDoublesElo, eloToDupr, calculatePartnershipChemistry } from '../utils/eloCalculator';
import { createChampionshipTournament, syncGroupWinnersToQuarterfinals, calculateGroupStandings } from '../utils/tournamentEngine';

const ClubContext = createContext();

export const ADMIN_PASSWORD = '01082026';

export function ClubProvider({ children }) {
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedRole = localStorage.getItem('fpc_user_role');
      if (savedRole === 'admin') {
        return { role: 'admin', name: 'Quản trị viên' };
      } else if (savedRole === 'guest') {
        return { role: 'guest', name: 'Khách xem' };
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState(null);

  // Initialize members: 29 members with custom avatar support
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('fpc_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === INITIAL_MEMBERS.length) {
          return parsed.map(p => {
            const seed = INITIAL_MEMBERS.find(im => im.id === p.id);
            if (seed && seed.avatar?.startsWith('data:image') && (!p.avatar || !p.avatar.startsWith('data:image'))) {
              return { ...p, avatar: seed.avatar, dupr: seed.dupr || p.dupr, paddle: seed.paddle || p.paddle };
            }
            return p;
          });
        }
      }
      return INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [matches, setMatches] = useState(() => {
    try {
      const saved = localStorage.getItem('fpc_matches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return INITIAL_MATCHES;
    } catch {
      return INITIAL_MATCHES;
    }
  });

  const [tournaments, setTournaments] = useState(() => {
    try {
      const saved = localStorage.getItem('fpc_tournaments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_TOURNAMENTS;
    } catch {
      return INITIAL_TOURNAMENTS;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isLogMatchOpen, setIsLogMatchOpen] = useState(false);
  const [isCreateTournamentOpen, setIsCreateTournamentOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [isHeadToHeadOpen, setIsHeadToHeadOpen] = useState(false);
  const [activeTournamentId, setActiveTournamentId] = useState(INITIAL_TOURNAMENTS[0]?.id || null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fpc_members', JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members to localStorage', e);
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem('fpc_matches', JSON.stringify(matches));
    } catch (e) {
      console.error('Failed to save matches to localStorage', e);
    }
  }, [matches]);

  useEffect(() => {
    try {
      localStorage.setItem('fpc_tournaments', JSON.stringify(tournaments));
    } catch (e) {
      console.error('Failed to save tournaments to localStorage', e);
    }
  }, [tournaments]);

  /**
   * Login handler with validation (Admin password: 01082026)
   */
  const login = (role, password = '') => {
    if (role === 'admin') {
      if (password === ADMIN_PASSWORD) {
        const userObj = { role: 'admin', name: 'Quản trị viên' };
        setCurrentUser(userObj);
        try {
          localStorage.setItem('fpc_user_role', 'admin');
        } catch (e) {
          console.error(e);
        }
        setIsAuthModalOpen(false);

        // Run any pending action that requested admin auth
        if (pendingAdminAction && typeof pendingAdminAction === 'function') {
          try {
            pendingAdminAction();
          } catch (err) {
            console.error('Error running pending admin action', err);
          }
          setPendingAdminAction(null);
        }

        return { success: true };
      } else {
        return { success: false, message: 'Mật khẩu quản trị viên không chính xác.' };
      }
    } else {
      const userObj = { role: 'guest', name: 'Khách xem' };
      setCurrentUser(userObj);
      try {
        localStorage.setItem('fpc_user_role', 'guest');
      } catch (e) {
        console.error(e);
      }
      setIsAuthModalOpen(false);
      return { success: true };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('fpc_user_role');
    } catch (e) {
      console.error(e);
    }
  };

  const requireAdmin = (actionCallback) => {
    if (currentUser?.role === 'admin') {
      if (typeof actionCallback === 'function') actionCallback();
      return true;
    } else {
      if (typeof actionCallback === 'function') {
        setPendingAdminAction(() => actionCallback);
      }
      setIsAuthModalOpen(true);
      return false;
    }
  };

  /**
   * Recalculates Elo ratings for 4 players and applies to member state
   */
  const applyMatchEloUpdate = (p1Id, p2Id, p3Id, p4Id, scoreA, scoreB, sets, matchType = 'regular', notes = '', tournamentId = null) => {
    let eloResult = null;
    let newMatch = null;

    setMembers(prev => {
      const p1 = prev.find(m => m.id === p1Id);
      const p2 = prev.find(m => m.id === p2Id);
      const p3 = prev.find(m => m.id === p3Id);
      const p4 = prev.find(m => m.id === p4Id);

      if (!p1 || !p2 || !p3 || !p4) return prev;

      const teamAWon = scoreA > scoreB;
      const winnerTeam = teamAWon ? 'A' : 'B';

      eloResult = calculateDoublesElo(
        [p1.elo, p2.elo],
        [p3.elo, p4.elo],
        scoreA,
        scoreB,
        teamAWon
      );

      const matchId = `m-${Date.now()}`;
      newMatch = {
        id: matchId,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: matchType,
        tournamentId: tournamentId || null,
        teamA: {
          player1Id: p1.id,
          player2Id: p2.id,
          name: `${p1.nickname || p1.name.split(' ')[0]} & ${p2.nickname || p2.name.split(' ')[0]}`
        },
        teamB: {
          player1Id: p3.id,
          player2Id: p4.id,
          name: `${p3.nickname || p3.name.split(' ')[0]} & ${p4.nickname || p4.name.split(' ')[0]}`
        },
        scoreA,
        scoreB,
        sets: sets && sets.length > 0 ? sets : [{ setNum: 1, scoreA, scoreB }],
        winnerTeam,
        eloDelta: Math.abs(eloResult.teamAChange),
        notes: notes || 'Trận đấu giải CLB Friends.'
      };

      return prev.map(member => {
        if (member.id === p1.id) {
          const newWins = teamAWon ? member.wins + 1 : member.wins;
          const newLosses = teamAWon ? member.losses : member.losses + 1;
          const newStreak = teamAWon ? Math.max(1, member.streak + 1) : -1;
          const newElo = eloResult.player1New;
          const badges = [...(member.badges || [])];
          if (newStreak >= 3 && !badges.includes('hot-streak')) badges.push('hot-streak');
          if (member.matchesPlayed + 1 >= 15 && !badges.includes('veteran')) badges.push('veteran');

          return {
            ...member,
            elo: newElo,
            dupr: eloToDupr(newElo),
            matchesPlayed: member.matchesPlayed + 1,
            wins: newWins,
            losses: newLosses,
            streak: newStreak,
            pointsScored: member.pointsScored + scoreA,
            badges
          };
        }

        if (member.id === p2.id) {
          const newWins = teamAWon ? member.wins + 1 : member.wins;
          const newLosses = teamAWon ? member.losses : member.losses + 1;
          const newStreak = teamAWon ? Math.max(1, member.streak + 1) : -1;
          const newElo = eloResult.player2New;
          const badges = [...(member.badges || [])];
          if (newStreak >= 3 && !badges.includes('hot-streak')) badges.push('hot-streak');
          if (member.matchesPlayed + 1 >= 15 && !badges.includes('veteran')) badges.push('veteran');

          return {
            ...member,
            elo: newElo,
            dupr: eloToDupr(newElo),
            matchesPlayed: member.matchesPlayed + 1,
            wins: newWins,
            losses: newLosses,
            streak: newStreak,
            pointsScored: member.pointsScored + scoreA,
            badges
          };
        }

        if (member.id === p3.id) {
          const newWins = !teamAWon ? member.wins + 1 : member.wins;
          const newLosses = !teamAWon ? member.losses : member.losses + 1;
          const newStreak = !teamAWon ? Math.max(1, member.streak + 1) : -1;
          const newElo = eloResult.player3New;
          const badges = [...(member.badges || [])];
          if (newStreak >= 3 && !badges.includes('hot-streak')) badges.push('hot-streak');
          if (member.matchesPlayed + 1 >= 15 && !badges.includes('veteran')) badges.push('veteran');

          return {
            ...member,
            elo: newElo,
            dupr: eloToDupr(newElo),
            matchesPlayed: member.matchesPlayed + 1,
            wins: newWins,
            losses: newLosses,
            streak: newStreak,
            pointsScored: member.pointsScored + scoreB,
            badges
          };
        }

        if (member.id === p4.id) {
          const newWins = !teamAWon ? member.wins + 1 : member.wins;
          const newLosses = !teamAWon ? member.losses : member.losses + 1;
          const newStreak = !teamAWon ? Math.max(1, member.streak + 1) : -1;
          const newElo = eloResult.player4New;
          const badges = [...(member.badges || [])];
          if (newStreak >= 3 && !badges.includes('hot-streak')) badges.push('hot-streak');
          if (member.matchesPlayed + 1 >= 15 && !badges.includes('veteran')) badges.push('veteran');

          return {
            ...member,
            elo: newElo,
            dupr: eloToDupr(newElo),
            matchesPlayed: member.matchesPlayed + 1,
            wins: newWins,
            losses: newLosses,
            streak: newStreak,
            pointsScored: member.pointsScored + scoreB,
            badges
          };
        }

        return member;
      });
    });

    if (newMatch) {
      setMatches(prev => [newMatch, ...prev]);
    }

    return { eloResult, newMatch };
  };

  /**
   * Log a new doubles match directly
   */
  const logMatch = (matchInput) => {
    const {
      type,
      teamA,
      teamB,
      scoreA,
      scoreB,
      sets,
      notes
    } = matchInput;

    const res = applyMatchEloUpdate(
      teamA.player1Id,
      teamA.player2Id,
      teamB.player1Id,
      teamB.player2Id,
      scoreA,
      scoreB,
      sets,
      type,
      notes
    );

    return res?.newMatch;
  };

  /**
   * Update a tournament match score cleanly & update Elo
   */
  const updateTournamentMatchScore = (tournamentId, matchId, scoreA, scoreB, sets = []) => {
    let matchFound = null;
    let isGroupMatch = false;
    let isFinalMatch = false;

    setTournaments(prev => {
      return prev.map(t => {
        if (t.id !== tournamentId) return t;

        let updatedTournament = JSON.parse(JSON.stringify(t));

        // Check in Groups
        if (updatedTournament.groups) {
          for (const group of updatedTournament.groups) {
            const gm = group.matches?.find(m => m.id === matchId);
            if (gm) {
              matchFound = JSON.parse(JSON.stringify(gm));
              isGroupMatch = true;
              gm.scoreA = Number(scoreA);
              gm.scoreB = Number(scoreB);
              gm.sets = sets;
              gm.winnerId = Number(scoreA) > Number(scoreB) ? gm.teamA.id : gm.teamB.id;
              gm.status = 'completed';
              break;
            }
          }
        }

        // Check in Knockout Bracket
        if (!matchFound && updatedTournament.bracket) {
          const { rounds } = updatedTournament.bracket;
          for (let rIdx = 0; rIdx < rounds.length; rIdx++) {
            const bm = rounds[rIdx].matches?.find(m => m.id === matchId);
            if (bm) {
              matchFound = JSON.parse(JSON.stringify(bm));
              bm.scoreA = Number(scoreA);
              bm.scoreB = Number(scoreB);
              bm.sets = sets;
              bm.status = 'completed';

              const teamAWon = Number(scoreA) > Number(scoreB);
              const winningTeam = teamAWon ? bm.teamA : bm.teamB;
              bm.winnerId = winningTeam.id;

              if (rIdx === rounds.length - 1) {
                isFinalMatch = true;
                updatedTournament.bracket.champion = winningTeam;
                updatedTournament.status = 'completed';

                if (winningTeam.playerIds) {
                  setMembers(prevMembers => prevMembers.map(m => {
                    if (winningTeam.playerIds.includes(m.id)) {
                      const badges = [...(m.badges || [])];
                      if (!badges.includes('mvp')) badges.push('mvp');
                      return { ...m, badges };
                    }
                    return m;
                  }));
                }
              } else {
                const nextRound = rounds[rIdx + 1];
                if (nextRound) {
                  const feederMatchIndex = nextRound.matches?.findIndex(m =>
                    m.feederMatchIds && m.feederMatchIds.includes(matchId)
                  );

                  if (feederMatchIndex !== -1 && feederMatchIndex !== undefined) {
                    const nextMatch = nextRound.matches[feederMatchIndex];
                    if (nextMatch.feederMatchIds && nextMatch.feederMatchIds[0] === matchId) {
                      nextMatch.teamA = winningTeam;
                    } else {
                      nextMatch.teamB = winningTeam;
                    }
                    if (nextMatch.teamA && nextMatch.teamB) {
                      nextMatch.status = 'scheduled';
                    }
                  }
                }
              }
              break;
            }
          }
        }

        if (isGroupMatch) {
          updatedTournament = syncGroupWinnersToQuarterfinals(updatedTournament);
        }

        return updatedTournament;
      });
    });

    // Update Elo ratings asynchronously
    setTimeout(() => {
      if (matchFound && matchFound.teamA?.playerIds && matchFound.teamB?.playerIds) {
        const p1Id = matchFound.teamA.playerIds[0];
        const p2Id = matchFound.teamA.playerIds[1];
        const p3Id = matchFound.teamB.playerIds[0];
        const p4Id = matchFound.teamB.playerIds[1];

        if (p1Id && p2Id && p3Id && p4Id) {
          applyMatchEloUpdate(
            p1Id,
            p2Id,
            p3Id,
            p4Id,
            Number(scoreA),
            Number(scoreB),
            sets,
            isFinalMatch ? 'final' : 'regular',
            `Giải đấu: ${matchFound.roundName || 'Trận đấu giải CLB'}`,
            tournamentId
          );
        }
      }
    }, 50);
  };

  /**
   * Delete a tournament and roll back Elo ratings
   */
  const deleteTournament = (tournamentId) => {
    const tourneyToDelete = tournaments.find(t => t.id === tournamentId);
    if (!tourneyToDelete) return false;

    const remainingMatches = matches.filter(m => {
      const matchInTourney = m.tournamentId === tournamentId || 
        (m.notes && m.notes.includes(tourneyToDelete.name));
      return !matchInTourney;
    });

    const updatedTournaments = tournaments.filter(t => t.id !== tournamentId);
    setTournaments(updatedTournaments);
    setMatches(remainingMatches);

    if (activeTournamentId === tournamentId) {
      setActiveTournamentId(updatedTournaments[0]?.id || null);
    }

    return true;
  };

  /**
   * Add a new member to the roster with status support
   */
  const addMember = (memberData) => {
    const newId = `p-${Date.now()}`;
    const initialElo = Number(memberData.elo) || 1150;
    const newMember = {
      id: newId,
      name: memberData.name,
      nickname: memberData.nickname || memberData.name.split(' ').pop(),
      avatar: memberData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      elo: initialElo,
      dupr: eloToDupr(initialElo),
      gender: memberData.gender || 'Nam',
      status: memberData.status || 'active',
      tier: memberData.tier || (initialElo >= 1260 ? 'Tiềm năng' : 'Mới bắt đầu'),
      playStyle: memberData.playStyle || 'Toàn diện',
      paddle: memberData.paddle || 'Vợt Carbon tiêu chuẩn',
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      streak: 0,
      pointsScored: 0,
      badges: [],
      favoritePartnerId: null,
      joinDate: new Date().toISOString().split('T')[0]
    };

    setMembers(prev => [newMember, ...prev]);
    return newMember;
  };

  /**
   * Update an existing member's information and status
   */
  const updateMember = (memberId, updatedData) => {
    setMembers(prev => {
      return prev.map(m => {
        if (m.id !== memberId) return m;
        const newElo = updatedData.elo !== undefined ? Number(updatedData.elo) : m.elo;
        return {
          ...m,
          ...updatedData,
          elo: newElo,
          dupr: eloToDupr(newElo)
        };
      });
    });

    if (selectedPlayer && selectedPlayer.id === memberId) {
      setSelectedPlayer(prev => ({
        ...prev,
        ...updatedData,
        elo: updatedData.elo !== undefined ? Number(updatedData.elo) : prev.elo,
        dupr: eloToDupr(updatedData.elo !== undefined ? Number(updatedData.elo) : prev.elo)
      }));
    }

    return true;
  };

  /**
   * Delete a member from the club roster
   */
  const deleteMember = (memberId) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));

    if (selectedPlayer && selectedPlayer.id === memberId) {
      setSelectedPlayer(null);
    }
    return true;
  };

  /**
   * Create a championship tournament
   */
  const createTournament = (tourneyData) => {
    const newTournament = createChampionshipTournament({
      name: tourneyData.name,
      date: tourneyData.date || `Tháng ${new Date().getMonth() + 1}, ${new Date().getFullYear()}`,
      surface: tourneyData.surface || 'Sân Trung tâm 1 & 2',
      prizeTrophy: tourneyData.prizeTrophy || 'Cúp Vàng & Vợt Selkirk Pro 🏆',
      description: tourneyData.description || 'Giải đấu đôi chính thức CLB Friends',
      teams: tourneyData.teams,
      numGroups: tourneyData.numGroups || 4,
      manualGroups: tourneyData.manualGroups || null
    });

    setTournaments(prev => [newTournament, ...prev]);
    setActiveTournamentId(newTournament.id);
    return newTournament;
  };

  /**
   * Import backup JSON data
   */
  const importBackupData = (backupJson) => {
    try {
      const data = typeof backupJson === 'string' ? JSON.parse(backupJson) : backupJson;
      if (data.members && Array.isArray(data.members)) {
        setMembers(data.members);
      }
      if (data.matches && Array.isArray(data.matches)) {
        setMatches(data.matches);
      }
      if (data.tournaments && Array.isArray(data.tournaments)) {
        setTournaments(data.tournaments);
        if (data.tournaments.length > 0) {
          setActiveTournamentId(data.tournaments[0].id);
        }
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  /**
   * Reset data to initial 29 members with 0 match stats and initial tournament
   */
  const resetToDefaultData = () => {
    localStorage.removeItem('fpc_members');
    localStorage.removeItem('fpc_matches');
    localStorage.removeItem('fpc_tournaments');
    setMembers(INITIAL_MEMBERS);
    setMatches(INITIAL_MATCHES);
    setTournaments(INITIAL_TOURNAMENTS);
    setActiveTournamentId(INITIAL_TOURNAMENTS[0]?.id || null);
  };

  return (
    <ClubContext.Provider
      value={{
        currentUser,
        login,
        logout,
        requireAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        members,
        setMembers,
        matches,
        setMatches,
        tournaments,
        setTournaments,
        activeTab,
        setActiveTab,
        selectedPlayer,
        setSelectedPlayer,
        editingPlayer,
        setEditingPlayer,
        isLogMatchOpen,
        setIsLogMatchOpen,
        isCreateTournamentOpen,
        setIsCreateTournamentOpen,
        isDataManagementOpen,
        setIsDataManagementOpen,
        isHeadToHeadOpen,
        setIsHeadToHeadOpen,
        activeTournamentId,
        setActiveTournamentId,
        logMatch,
        updateTournamentMatchScore,
        deleteTournament,
        createTournament,
        importBackupData,
        addMember,
        updateMember,
        deleteMember,
        resetToDefaultData
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
}
