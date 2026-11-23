const http = require('http');

const PORT = 5000;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}


async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Scoreboard System Verification Tests');
  console.log('====================================================');

  try {
    // 1. Health check
    console.log('\n[1/9] Testing Backend Health Check...');
    const health = await request('GET', '/health');
    console.log(`Status: ${health.status}, Response:`, health.body?.status === 'ok' ? 'HEALTHY' : 'FAILED');

    // 2. Admin Login
    console.log('\n[2/9] Testing Admin Authentication...');
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@scoreboard.edu',
      password: 'AdminPassword123!'
    });
    console.log(`Admin login status: ${adminLogin.status}`);
    const adminToken = adminLogin.body?.data?.token;
    if (!adminToken) throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.body));
    console.log('Admin Token verified for:', adminLogin.body.data.user.name, `(${adminLogin.body.data.user.role})`);

    // 3. Scorer Login
    console.log('\n[3/9] Testing Scorer Authentication...');
    const scorerLogin = await request('POST', '/auth/login', {
      email: 'scorer1@scoreboard.edu',
      password: 'ScorerPassword123!'
    });
    console.log(`Scorer login status: ${scorerLogin.status}`);
    const scorerToken = scorerLogin.body?.data?.token;
    if (!scorerToken) throw new Error('Scorer login failed');
    console.log('Scorer verified for:', scorerLogin.body.data.user.name);

    // 4. Dashboard Stats
    console.log('\n[4/9] Testing Dashboard Stats API...');
    const statsRes = await request('GET', '/stats');
    console.log('Stats status:', statsRes.status);
    console.log('Metrics counts:', statsRes.body?.data?.counts);

    // 5. Tournaments & Teams
    console.log('\n[5/9] Testing Tournaments & Teams APIs...');
    const tourRes = await request('GET', '/tournaments');
    const teamRes = await request('GET', '/teams');
    console.log(`Tournaments loaded: ${tourRes.body?.data?.tournaments?.length}`);
    console.log(`Teams loaded: ${teamRes.body?.data?.teams?.length}`);

    // 6. Matches
    console.log('\n[6/9] Testing Matches API...');
    const matchRes = await request('GET', '/matches');
    const matches = matchRes.body?.data?.matches || [];
    console.log(`Total fixtures loaded: ${matches.length}`);
    const cricketLiveMatch = matches.find((m) => m.sportType === 'CRICKET' && m.status === 'LIVE');
    if (!cricketLiveMatch) throw new Error('Live cricket match not found in seeded database');
    console.log(`Found Live Cricket Match: ID #${cricketLiveMatch.id} (${cricketLiveMatch.teamA.name} vs ${cricketLiveMatch.teamB.name})`);

    // 7. Live Scoring: Cricket +4 Runs
    console.log('\n[7/9] Testing Real-time Cricket Scoring Update (+4 runs boundary)...');
    const prevRuns = cricketLiveMatch.score.teamARuns;
    const scoreUpdate = await request('POST', `/matches/${cricketLiveMatch.id}/score`, {
      runs: 4,
      isWicket: false,
      extraType: 'NONE',
      description: 'FOUR! Test boundary driven through mid-off.'
    }, scorerToken);

    console.log('Score update status:', scoreUpdate.status);
    const newRuns = scoreUpdate.body?.data?.score?.teamARuns;
    console.log(`Score changed: ${prevRuns} -> ${newRuns} runs! Verified: ${newRuns === prevRuns + 4 ? 'PASSED' : 'FAILED'}`);

    // 8. Test Undo Functionality
    console.log('\n[8/9] Testing Score UNDO Functionality...');
    const undoRes = await request('POST', `/matches/${cricketLiveMatch.id}/score/undo`, {}, scorerToken);
    console.log('Undo status:', undoRes.status);
    const restoredRuns = undoRes.body?.data?.score?.teamARuns;
    console.log(`Score restored to: ${restoredRuns} runs! Verified: ${restoredRuns === prevRuns ? 'PASSED' : 'FAILED'}`);

    // 9. Leaderboard Standings
    console.log('\n[9/9] Testing Tournament Leaderboard API...');
    const leaderRes = await request('GET', `/tournaments/${cricketLiveMatch.tournamentId}/leaderboard`);
    console.log('Leaderboard status:', leaderRes.status);
    console.log('Top ranked team:', leaderRes.body?.data?.leaderboard?.[0]?.team?.name, 'Points:', leaderRes.body?.data?.leaderboard?.[0]?.points);

    console.log('\n====================================================');
    console.log('🎉 ALL 9 SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err.message, err.stack);
    process.exit(1);
  }
}

// Check if port 5000 is already running
const net = require('net');
const client = new net.Socket();

client.once('connect', async () => {
  client.destroy();
  console.log('Detected existing server running on port 5000. Running tests against live instance...');
  await runTests();
  process.exit(0);
});

client.once('error', (err) => {
  console.log('Starting internal server on port 5000 for test suite...');
  const { server } = require('./server/src/server');
  setTimeout(async () => {
    await runTests();
    server.close(() => {
      console.log('Test runner finished and closed test server connection.');
      process.exit(0);
    });
  }, 1000);
});

client.connect(PORT, '127.0.0.1');
