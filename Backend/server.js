const app = require('./src/app');
const PORT = process.env.PORT;
const http = require('http');
const server = http.createServer(app);

const db = require('./src/config/db')

app.set('trust proxy', 1);

app.get("/", (req, res) => {
  res.send(`OK-App1234`);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});