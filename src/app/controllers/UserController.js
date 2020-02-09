import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async index(req, res) {
    const administrators = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone'],
      include: [{ model: File, as: 'avatar', attributes: ['url', 'path'] }],
    });

    return res.json(administrators);
  }

  async show(req, res) {
    const administrator = await User.findOne({
      where: { id: req.params.id },
      attributes: ['id', 'name', 'email', 'phone'],
      include: [{ model: File, as: 'avatar', attributes: ['url', 'path'] }],
    });

    if (!administrator) {
      return res.status(400).json({ error: 'User not found.' });
    }

    return res.json(administrator);
  }

  async store(req, res) {
    // Validing data entry
    const defaultSchema = Yup.object().shape({
      name: Yup.string()
        .required('Name is required')
        .typeError('Invalid name'),
      email: Yup.string()
        .email()
        .required('Email is required')
        .typeError('Invalid email'),
      password: Yup.string()
        .required('Password is required')
        .typeError('Invalid password'),
      phone: Yup.string(),
    });

    await defaultSchema
      .strict()
      .validate(req.body)
      .catch(errors => {
        return res.status(400).json({ error: errors.message });
      });

    const { email } = req.body;

    // Lookup for user
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists. ' });
    }

    const { id, name, phone } = await User.create({ ...req.body });

    return res.json({ id, name, email, phone });
  }

  async update(req, res) {
    const defaultSchema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      phone: Yup.string(),
      avatar_id: Yup.number(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword
            ? field
                .required('Password is required')
                .typeError('Invalid password')
            : field
        ),
      passwordConfirmation: Yup.string().when('password', (password, field) =>
        field
          ? field
              .required('Password Confirmation is required')
              .typeError('Invalid password confirmation')
              .oneOf([Yup.ref('password')])
          : field
      ),
    });

    await defaultSchema
      .strict()
      .validate(req.body)
      .catch(errors => {
        return res.status(400).json({ error: errors.message });
      });

    const { email, oldPassword, avatar_id } = req.body;

    const user = await User.findByPk(req.userId, {
      include: [{ model: File, as: 'avatar', attributes: ['url', 'path'] }],
    });

    if (email && email !== user.email) {
      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists. ' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    if (avatar_id) {
      const avatar = await File.findOne({ avatar_id });

      if (!avatar) {
        return res.status(400).json({ error: 'Avatar does not exist.' });
      }
    }

    const { id, name, phone, avatar } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      phone,
      avatar,
    });
  }
}

export default new UserController();
