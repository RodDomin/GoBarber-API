import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import jwtConfig from '../config/Auth';

export default async function(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ error: 'token not found' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, jwtConfig.secrets);

    req.body.userId = decoded.id;

    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({ error: 'token not approved' });
  }
}
