import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import configAuth from '../../config/auth';

class SessionController {
  async store(req, res) {
    // Validing data entry
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    // Lookup for user
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ error: 'User does not exist.' });

    if (!(await user.checkPassword(password)))
      return res.status(401).json({ error: 'Password does not match.' });

    const { id, name } = user;

    // Returning the user and new token
    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, configAuth.secret, {
        expiresIn: configAuth.expiresIn,
      }),
    });
  }
}

export default new SessionController();
