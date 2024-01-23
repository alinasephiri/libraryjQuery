
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<html><body>');
  res.write('<h1>Hello, world!</h1>');
  res.write('</body></html>');
  res.end();
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});