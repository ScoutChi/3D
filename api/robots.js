const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const robots = fs.readFileSync(path.join(process.cwd(), 'public', 'robots.txt'), 'utf-8');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(robots);
};
