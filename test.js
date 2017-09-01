const jwt = require('jsonwebtoken');
const fs = require('fs');

// sign with RSA SHA256
const cert = fs.readFileSync('./key');
const token = jwt.sign({ foo: 'bar' }, cert, { algorithm: 'RS256' });

console.log(token);

const certPub = fs.readFileSync('./pub.pem');  // get public key
jwt.verify(token, certPub, (err, decoded) => {
  if (err) throw (err);
  console.log(decoded.foo); // bar
});
