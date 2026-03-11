const { execSync } = require('child_process');
const config = require('./config');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function apiCall(method, path, body = null) {
  const url = `${config.BASE_URL}${path}`;
  const args = [
    'curl', '-s', '-X', method,
    `"${url}"`,
    `-H "Authorization: Bearer ${config.API_KEY}"`,
    `-H "Version: ${config.API_VERSION}"`,
    `-H "Content-Type: application/json"`,
    `-H "Accept: application/json"`,
  ];

  if (body) {
    const jsonBody = JSON.stringify(body).replace(/'/g, "'\\''");
    args.push(`-d '${jsonBody}'`);
  }

  try {
    const result = execSync(args.join(' '), { encoding: 'utf-8', timeout: 30000 });
    return JSON.parse(result);
  } catch (err) {
    return { error: true, message: err.message };
  }
}

async function apiCallAsync(method, path, body = null) {
  await sleep(config.RATE_LIMIT_DELAY);
  return apiCall(method, path, body);
}

module.exports = { apiCall: apiCallAsync, apiCallSync: apiCall };
