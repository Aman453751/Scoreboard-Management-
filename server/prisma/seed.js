const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // Clean existing data in reverse order of foreign keys
  await prisma.notification.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.score.deleteMany();
  await prisma.match.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.tournamentTeam.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data.');

  // 1. Create Users
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const hashedPasswordAdmin = await bcrypt.hash(adminPassword, 10);
  const hashedPasswordScorer = await bcrypt.hash('ScorerPassword123!', 10);
  const hashedPasswordStudent = await bcrypt.hash('StudentPassword123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME || 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@scoreboard.edu',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
      college: 'Apex Institute of Technology',
      phone: '+1 555-0199',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    }
  });

  const scorerCricket = await prisma.user.create({
    data: {
      name: 'Michael Davis (Official Scorer)',
      email: 'scorer1@scoreboard.edu',
      password: hashedPasswordScorer,
      role: 'SCORER',
      college: 'Apex Institute of Technology',
      phone: '+1 555-0144',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  });

  const scorerFootball = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins (Official Scorer)',
      email: 'scorer2@scoreboard.edu',
      password: hashedPasswordScorer,
      role: 'SCORER',
      college: 'Metro State University',
      phone: '+1 555-0177',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    }
  });

  const student = await prisma.user.create({
    data: {
      name: 'Alex Turner (Student)',
      email: 'student@scoreboard.edu',
      password: hashedPasswordStudent,
      role: 'VIEWER',
      college: 'Apex Institute of Technology',
      phone: '+1 555-0122',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
  });

  console.log(`Created 4 Users: Admin (${admin.email}), Scorer 1 (${scorerCricket.email}), Scorer 2 (${scorerFootball.email}), Viewer (${student.email})`);

  // 2. Create Teams & Players
  const teamsData = [
    {
      name: 'Apex Gladiators',
      shortName: 'APX',
      college: 'Apex Institute of Technology',
      department: 'Computer Science & Engineering',
      captainName: 'Rohan Sharma',
      contactEmail: 'gladiators@apex.edu',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      players: [
        { name: 'Rohan Sharma', jerseyNumber: 7, role: 'All-Rounder / Captain', isCaptain: true },
        { name: 'Arjun Verma', jerseyNumber: 18, role: 'Top-order Batsman', isCaptain: false },
        { name: 'Kabir Mehta', jerseyNumber: 45, role: 'Fast Bowler', isCaptain: false },
        { name: 'Dev Patel', jerseyNumber: 10, role: 'Wicketkeeper Batsman', isCaptain: false },
        { name: 'Siddharth Rao', jerseyNumber: 23, role: 'Spin Bowler', isCaptain: false }
      ]
    },
    {
      name: 'Cyber Knights',
      shortName: 'CYB',
      college: 'Apex Institute of Technology',
      department: 'Artificial Intelligence & Robotics',
      captainName: 'Vikram Malhotra',
      contactEmail: 'knights@apex.edu',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150',
      players: [
        { name: 'Vikram Malhotra', jerseyNumber: 9, role: 'Opening Batsman / Captain', isCaptain: true },
        { name: 'Neil Singhania', jerseyNumber: 11, role: 'Pace Bowler', isCaptain: false },
        { name: 'Yash Vardhan', jerseyNumber: 33, role: 'Middle-order Batsman', isCaptain: false },
        { name: 'Aman Joshi', jerseyNumber: 8, role: 'All-Rounder', isCaptain: false },
        { name: 'Karan Saxena', jerseyNumber: 99, role: 'Off-Spinner', isCaptain: false }
      ]
    },
    {
      name: 'Mechanical Bulls',
      shortName: 'MECH',
      college: 'Metro State University',
      department: 'Mechanical Engineering',
      captainName: 'Marcus Vance',
      contactEmail: 'bulls@metro.edu',
      logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150',
      players: [
        { name: 'Marcus Vance', jerseyNumber: 10, role: 'Striker / Captain', isCaptain: true },
        { name: 'Leo Sterling', jerseyNumber: 4, role: 'Center Back', isCaptain: false },
        { name: 'Diego Ramos', jerseyNumber: 1, role: 'Goalkeeper', isCaptain: false },
        { name: 'Ethan Hunt', jerseyNumber: 8, role: 'Central Midfielder', isCaptain: false },
        { name: 'Carlos Mendez', jerseyNumber: 7, role: 'Left Winger', isCaptain: false }
      ]
    },
    {
      name: 'Quantum Strikers',
      shortName: 'QTM',
      college: 'Metro State University',
      department: 'Electronics & Communication',
      captainName: 'Lucas Grey',
      contactEmail: 'strikers@metro.edu',
      logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150',
      players: [
        { name: 'Lucas Grey', jerseyNumber: 9, role: 'Center Forward / Captain', isCaptain: true },
        { name: 'Julian Drake', jerseyNumber: 5, role: 'Defensive Midfielder', isCaptain: false },
        { name: 'Oliver Stone', jerseyNumber: 11, role: 'Right Winger', isCaptain: false },
        { name: 'Felix Wright', jerseyNumber: 3, role: 'Fullback', isCaptain: false },
        { name: 'Nate Cole', jerseyNumber: 12, role: 'Goalkeeper', isCaptain: false }
      ]
    },
    {
      name: 'Titan Warriors',
      shortName: 'TTN',
      college: 'Apex Institute of Technology',
      department: 'Civil & Architectural Engineering',
      captainName: 'Zane Archer',
      contactEmail: 'warriors@apex.edu',
      logo: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=150',
      players: [
        { name: 'Zane Archer', jerseyNumber: 23, role: 'Point Guard / Captain', isCaptain: true },
        { name: 'Brody Fox', jerseyNumber: 34, role: 'Power Forward', isCaptain: false },
        { name: 'Dominic Chase', jerseyNumber: 15, role: 'Center', isCaptain: false },
        { name: 'Tyler Reed', jerseyNumber: 3, role: 'Shooting Guard', isCaptain: false },
        { name: 'Mason Cross', jerseyNumber: 21, role: 'Small Forward', isCaptain: false }
      ]
    },
    {
      name: 'Vanguard Phoenix',
      shortName: 'VNG',
      college: 'Metro State University',
      department: 'Biotechnology & Health Sciences',
      captainName: 'Dante Rivera',
      contactEmail: 'phoenix@metro.edu',
      logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150',
      players: [
        { name: 'Dante Rivera', jerseyNumber: 1, role: 'Point Guard / Captain', isCaptain: true },
        { name: 'Xavier Cruz', jerseyNumber: 13, role: 'Shooting Guard', isCaptain: false },
        { name: 'Cole Barrett', jerseyNumber: 32, role: 'Power Forward', isCaptain: false },
        { name: 'Jaxson Pierce', jerseyNumber: 0, role: 'Small Forward', isCaptain: false },
        { name: 'Rowan Bennett', jerseyNumber: 55, role: 'Center', isCaptain: false }
      ]
    }
  ];

  const createdTeams = [];
  for (const t of teamsData) {
    const { players, ...teamDetails } = t;
    const team = await prisma.team.create({
      data: {
        ...teamDetails,
        players: {
          create: players
        }
      }
    });
    createdTeams.push(team);
  }
  console.log(`Created ${createdTeams.length} teams with active player rosters.`);

  // 3. Tournaments
  const cricketTournament = await prisma.tournament.create({
    data: {
      name: 'Inter-College T20 Cricket Championship 2026',
      sportType: 'CRICKET',
      startDate: new Date('2026-11-10T09:00:00Z'),
      endDate: new Date('2026-11-25T18:00:00Z'),
      location: 'Apex International Cricket Arena',
      description: 'Premier collegiate T20 cricket tournament featuring premier engineering and tech universities.',
      status: 'ONGOING',
      bannerImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'
    }
  });

  const footballTournament = await prisma.tournament.create({
    data: {
      name: 'University Premier Football League 2026',
      sportType: 'FOOTBALL',
      startDate: new Date('2026-11-12T14:00:00Z'),
      endDate: new Date('2026-11-28T20:00:00Z'),
      location: 'Metro Main Athletics Stadium',
      description: 'Annual inter-departmental soccer championship with round-robin group stages and knockout finals.',
      status: 'ONGOING',
      bannerImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'
    }
  });

  const basketballTournament = await prisma.tournament.create({
    data: {
      name: 'National Campus Basketball Slam 2026',
      sportType: 'BASKETBALL',
      startDate: new Date('2026-11-20T10:00:00Z'),
      endDate: new Date('2026-12-05T21:00:00Z'),
      location: 'Apex Indoor Sports Complex - Court 1',
      description: 'Fast-paced 5v5 full-court basketball tournament.',
      status: 'UPCOMING',
      bannerImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'
    }
  });

  // Link teams to tournaments
  // Cricket teams: APX, CYB
  await prisma.tournamentTeam.createMany({
    data: [
      { tournamentId: cricketTournament.id, teamId: createdTeams[0].id },
      { tournamentId: cricketTournament.id, teamId: createdTeams[1].id }
    ]
  });

  // Football teams: MECH, QTM
  await prisma.tournamentTeam.createMany({
    data: [
      { tournamentId: footballTournament.id, teamId: createdTeams[2].id },
      { tournamentId: footballTournament.id, teamId: createdTeams[3].id }
    ]
  });

  // Basketball teams: TTN, VNG
  await prisma.tournamentTeam.createMany({
    data: [
      { tournamentId: basketballTournament.id, teamId: createdTeams[4].id },
      { tournamentId: basketballTournament.id, teamId: createdTeams[5].id }
    ]
  });

  console.log('Linked teams to tournaments.');

  // 4. Create Matches & Scores

  // --- MATCH 1: LIVE CRICKET MATCH ---
  // Apex Gladiators vs Cyber Knights
  const cricketMatch = await prisma.match.create({
    data: {
      tournamentId: cricketTournament.id,
      teamAId: createdTeams[0].id, // APX
      teamBId: createdTeams[1].id, // CYB
      sportType: 'CRICKET',
      matchDate: new Date(),
      venue: 'Main Cricket Ground - Pitch 2',
      status: 'LIVE',
      scorerId: scorerCricket.id,
      currentPeriod: '2nd Inning'
    }
  });

  // Score for Cricket Match:
  // Inning 1 (Cyber Knights): 165/6 in 20.0 overs (120 balls)
  // Inning 2 (Apex Gladiators chasing 166): 134/4 in 15.2 overs (92 balls)
  const cricketScore = await prisma.score.create({
    data: {
      matchId: cricketMatch.id,
      teamARuns: 134,
      teamAWickets: 4,
      teamABalls: 92, // 15.2 overs
      teamAExtras: 8,
      teamBRuns: 165,
      teamBWickets: 6,
      teamBBalls: 120, // 20.0 overs
      teamBExtras: 11,
      battingTeamId: createdTeams[0].id, // APX batting
      bowlingTeamId: createdTeams[1].id, // CYB bowling
      currentInning: 2,
      targetRuns: 166,
      lastEventDescription: 'FOUR! Rohan Sharma cuts through backward point for a boundary!'
    }
  });

  // Cricket Match Events
  const cricketSnap1 = JSON.stringify({
    teamARuns: 124, teamAWickets: 4, teamABalls: 89, teamAExtras: 8,
    teamBRuns: 165, teamBWickets: 6, teamBBalls: 120, teamBExtras: 11,
    currentInning: 2, battingTeamId: createdTeams[0].id
  });
  const cricketSnap2 = JSON.stringify({
    teamARuns: 130, teamAWickets: 4, teamABalls: 91, teamAExtras: 8,
    teamBRuns: 165, teamBWickets: 6, teamBBalls: 120, teamBExtras: 11,
    currentInning: 2, battingTeamId: createdTeams[0].id
  });
  const cricketSnap3 = JSON.stringify({
    teamARuns: 134, teamAWickets: 4, teamABalls: 92, teamAExtras: 8,
    teamBRuns: 165, teamBWickets: 6, teamBBalls: 120, teamBExtras: 11,
    currentInning: 2, battingTeamId: createdTeams[0].id
  });

  await prisma.matchEvent.createMany({
    data: [
      {
        matchId: cricketMatch.id,
        period: '2nd Inning (14.5)',
        eventType: 'RUN',
        teamId: createdTeams[0].id,
        description: 'Single run taken to deep mid-wicket by Rohan Sharma',
        scoreSnapshot: cricketSnap1,
        createdAt: new Date(Date.now() - 3 * 60 * 1000)
      },
      {
        matchId: cricketMatch.id,
        period: '2nd Inning (15.1)',
        eventType: 'RUN',
        teamId: createdTeams[0].id,
        description: 'SIX! Colossal strike over long-on into the student gallery!',
        scoreSnapshot: cricketSnap2,
        createdAt: new Date(Date.now() - 1 * 60 * 1000)
      },
      {
        matchId: cricketMatch.id,
        period: '2nd Inning (15.2)',
        eventType: 'RUN',
        teamId: createdTeams[0].id,
        description: 'FOUR! Rohan Sharma cuts through backward point for a boundary!',
        scoreSnapshot: cricketSnap3,
        createdAt: new Date()
      }
    ]
  });

  // --- MATCH 2: LIVE FOOTBALL MATCH ---
  // Mechanical Bulls vs Quantum Strikers
  const footballMatch = await prisma.match.create({
    data: {
      tournamentId: footballTournament.id,
      teamAId: createdTeams[2].id, // MECH
      teamBId: createdTeams[3].id, // QTM
      sportType: 'FOOTBALL',
      matchDate: new Date(),
      venue: 'Athletic Field - Pitch A',
      status: 'LIVE',
      scorerId: scorerFootball.id,
      currentPeriod: '2nd Half'
    }
  });

  const footballScore = await prisma.score.create({
    data: {
      matchId: footballMatch.id,
      teamAGoals: 2,
      teamBGoals: 1,
      matchMinutes: 68,
      currentHalf: '2nd Half',
      lastEventDescription: 'GOAL! Marcus Vance scores a curling free kick into the top right corner!'
    }
  });

  const fbSnap1 = JSON.stringify({ teamAGoals: 1, teamBGoals: 0, matchMinutes: 24, currentHalf: '1st Half' });
  const fbSnap2 = JSON.stringify({ teamAGoals: 1, teamBGoals: 1, matchMinutes: 52, currentHalf: '2nd Half' });
  const fbSnap3 = JSON.stringify({ teamAGoals: 2, teamBGoals: 1, matchMinutes: 68, currentHalf: '2nd Half' });

  await prisma.matchEvent.createMany({
    data: [
      {
        matchId: footballMatch.id,
        period: '24\'',
        eventType: 'GOAL',
        teamId: createdTeams[2].id,
        description: 'GOAL! Carlos Mendez taps in from close range after a cross.',
        scoreSnapshot: fbSnap1,
        createdAt: new Date(Date.now() - 44 * 60 * 1000)
      },
      {
        matchId: footballMatch.id,
        period: '52\'',
        eventType: 'GOAL',
        teamId: createdTeams[3].id,
        description: 'GOAL! Lucas Grey equalizes with a powerful header!',
        scoreSnapshot: fbSnap2,
        createdAt: new Date(Date.now() - 16 * 60 * 1000)
      },
      {
        matchId: footballMatch.id,
        period: '61\'',
        eventType: 'CARD_YELLOW',
        teamId: createdTeams[3].id,
        description: 'Yellow card shown to Julian Drake for a reckless slide tackle.',
        scoreSnapshot: fbSnap2,
        createdAt: new Date(Date.now() - 7 * 60 * 1000)
      },
      {
        matchId: footballMatch.id,
        period: '68\'',
        eventType: 'GOAL',
        teamId: createdTeams[2].id,
        description: 'GOAL! Marcus Vance scores a curling free kick into the top right corner!',
        scoreSnapshot: fbSnap3,
        createdAt: new Date()
      }
    ]
  });

  // --- MATCH 3: LIVE BASKETBALL MATCH ---
  // Titan Warriors vs Vanguard Phoenix
  const basketballMatch = await prisma.match.create({
    data: {
      tournamentId: basketballTournament.id,
      teamAId: createdTeams[4].id, // TTN
      teamBId: createdTeams[5].id, // VNG
      sportType: 'BASKETBALL',
      matchDate: new Date(),
      venue: 'Gymnasium Center Court',
      status: 'LIVE',
      scorerId: scorerFootball.id,
      currentPeriod: 'Q3'
    }
  });

  const bballScore = await prisma.score.create({
    data: {
      matchId: basketballMatch.id,
      teamAPoints: 68,
      teamBPoints: 63,
      currentQuarter: 'Q3',
      teamAFouls: 3,
      teamBFouls: 4,
      quarterTimeLeft: '04:18',
      lastEventDescription: '3-POINTER! Zane Archer sinks a deep step-back 3 from downtown!'
    }
  });

  const bbSnap1 = JSON.stringify({ teamAPoints: 65, teamBPoints: 63, currentQuarter: 'Q3', teamAFouls: 3, teamBFouls: 4 });
  const bbSnap2 = JSON.stringify({ teamAPoints: 68, teamBPoints: 63, currentQuarter: 'Q3', teamAFouls: 3, teamBFouls: 4 });

  await prisma.matchEvent.createMany({
    data: [
      {
        matchId: basketballMatch.id,
        period: 'Q3 (05:20)',
        eventType: 'POINT_2',
        teamId: createdTeams[5].id,
        description: 'Dante Rivera drives into the lane for a reverse layup!',
        scoreSnapshot: bbSnap1,
        createdAt: new Date(Date.now() - 2 * 60 * 1000)
      },
      {
        matchId: basketballMatch.id,
        period: 'Q3 (04:18)',
        eventType: 'POINT_3',
        teamId: createdTeams[4].id,
        description: '3-POINTER! Zane Archer sinks a deep step-back 3 from downtown!',
        scoreSnapshot: bbSnap2,
        createdAt: new Date()
      }
    ]
  });

  // --- MATCH 4: COMPLETED CRICKET MATCH (For History & Leaderboard) ---
  const completedMatch = await prisma.match.create({
    data: {
      tournamentId: cricketTournament.id,
      teamAId: createdTeams[1].id, // CYB
      teamBId: createdTeams[0].id, // APX
      sportType: 'CRICKET',
      matchDate: new Date('2026-11-12T10:00:00Z'),
      venue: 'Apex Cricket Oval',
      status: 'COMPLETED',
      scorerId: scorerCricket.id,
      currentPeriod: 'Full Time',
      winnerTeamId: createdTeams[0].id,
      resultSummary: 'Apex Gladiators won by 5 wickets'
    }
  });

  await prisma.score.create({
    data: {
      matchId: completedMatch.id,
      teamARuns: 152,
      teamAWickets: 8,
      teamABalls: 120,
      teamAExtras: 9,
      teamBRuns: 156,
      teamBWickets: 5,
      teamBBalls: 114,
      teamBExtras: 6,
      currentInning: 2,
      targetRuns: 153,
      lastEventDescription: 'Match finished: Apex Gladiators chased down the target successfully.'
    }
  });

  // --- MATCH 5: UPCOMING MATCH ---
  const upcomingMatch = await prisma.match.create({
    data: {
      tournamentId: footballTournament.id,
      teamAId: createdTeams[3].id, // QTM
      teamBId: createdTeams[2].id, // MECH
      sportType: 'FOOTBALL',
      matchDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      venue: 'Metro Main Stadium',
      status: 'UPCOMING',
      scorerId: scorerFootball.id,
      currentPeriod: 'Pre-Match'
    }
  });

  await prisma.score.create({
    data: {
      matchId: upcomingMatch.id,
      teamAGoals: 0,
      teamBGoals: 0,
      matchMinutes: 0,
      currentHalf: 'Pre-Match'
    }
  });

  // 5. Leaderboard Records
  await prisma.leaderboard.createMany({
    data: [
      {
        tournamentId: cricketTournament.id,
        teamId: createdTeams[0].id, // APX
        played: 1,
        won: 1,
        lost: 0,
        drawn: 0,
        points: 2,
        rank: 1,
        goalDiffOrNRR: 0.850
      },
      {
        tournamentId: cricketTournament.id,
        teamId: createdTeams[1].id, // CYB
        played: 1,
        won: 0,
        lost: 1,
        drawn: 0,
        points: 0,
        rank: 2,
        goalDiffOrNRR: -0.850
      },
      {
        tournamentId: footballTournament.id,
        teamId: createdTeams[2].id, // MECH
        played: 1,
        won: 1,
        lost: 0,
        drawn: 0,
        points: 3,
        rank: 1,
        goalDiffOrNRR: 2.0
      },
      {
        tournamentId: footballTournament.id,
        teamId: createdTeams[3].id, // QTM
        played: 1,
        won: 0,
        lost: 1,
        drawn: 0,
        points: 0,
        rank: 2,
        goalDiffOrNRR: -2.0
      }
    ]
  });

  // 6. System Notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'Championship Live Now!',
        message: 'Apex Gladiators are chasing 166 vs Cyber Knights in the T20 Finals.',
        type: 'MATCH'
      },
      {
        title: 'GOAL Alert!',
        message: 'Marcus Vance scores for Mechanical Bulls in the 68th minute.',
        type: 'SCORE'
      },
      {
        title: 'System Initialized',
        message: 'All college sports facilities and tournament scoreboards are online.',
        type: 'INFO'
      }
    ]
  });

  console.log('--- Database Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
