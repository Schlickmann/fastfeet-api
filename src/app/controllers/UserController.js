import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    // Validing data entry
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    // Lookup for user
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists. ' });
    }

    const { id, name, email, is_admin } = await User.create(req.body);

    return res.json({ id, name, email, is_admin });
  }
}

export default new UserController();
