import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import configAuth from '../../config/auth';

export default async function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: 'Token not provided. ' });

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, configAuth.secret);

    req.userId = decoded.id;
  } catch (err) {
    return res
      .status(401)
      .json({ error: 'Authentication Failed, invalid Token.' });
  }

  return next();
}
