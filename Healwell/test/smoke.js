// Lightweight smoke check for local dev: verifies host, remotes, and API
(async function () {
  const urls = [
    'http://localhost:3000',
    'http://localhost:3000/remoteEntry.js',
    'http://localhost:5174/remoteEntry.js',
    'http://localhost:5175/remoteEntry.js',
    'http://localhost:4000/api/health',
    'http://localhost:4000/api/policies',
    'http://localhost:4000/api/claims'
  ]

  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'GET' })
      console.log(u, '=>', res.status)
    } catch (err) {
      console.error(u, '=> ERROR', err.message || err)
    }
  }
})()
