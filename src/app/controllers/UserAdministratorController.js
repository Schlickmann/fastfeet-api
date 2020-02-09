import * as Yup from 'yup';
import User from '../models/User';
import UserType from '../models/UserType';
import File from '../models/File';

class UserAdministratorController {
  async index(req, res) {
    const administrators = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'user_type_id', 'avatar_id'],
      where: { user_type_id: 1 },
      include: [
        { model: UserType, as: 'user_type', attributes: ['id', 'type'] },
        { model: File, as: 'avatar', attributes: ['url', 'path'] },
      ],
    });

    return res.json(administrators);
  }

  async show(req, res) {
    const administrator = await User.findOne({
      where: { id: req.params.id, user_type_id: 1 },
      attributes: ['id', 'name', 'email', 'phone'],
      include: [
        { model: UserType, as: 'user_type', attributes: ['id', 'type'] },
        { model: File, as: 'avatar', attributes: ['url', 'path'] },
      ],
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
      user_type_id: Yup.number()
        .required('User Type is required')
        .typeError('Invalid user type'),
      // Password is only required for administrator users
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

    const { user_type_id, email } = req.body;

    if (user_type_id !== 1) {
      return res
        .status(400)
        .json({ error: 'The user must be an administrator.' });
    }

    // Lookup for user
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists. ' });
    }

    const { id, name } = await User.create({
      ...req.body,
    });

    return res.json({ id, name, email, user_type_id });
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
              .required('Password is required')
              .typeError('Invalid password')
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

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId, {
      include: [
        { model: UserType, as: 'user_type', attributes: ['id', 'type'] },
        { model: File, as: 'avatar', attributes: ['url', 'path'] },
      ],
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

    const { id, name, phone, user_type, avatar } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      phone,
      user_type,
      avatar,
    });
  }
}

export default new UserAdministratorController();
