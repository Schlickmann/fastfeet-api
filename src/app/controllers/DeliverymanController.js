import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';
import UserType from '../models/UserType';

class DeliverymanController {
  async index(req, res) {
    const couriers = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'user_type_id', 'avatar_id'],
      where: { user_type_id: 3 },
      include: [
        { model: UserType, as: 'user_type', attributes: ['id', 'type'] },
        { model: File, as: 'avatar', attributes: ['url', 'path'] },
      ],
    });

    return res.json(couriers);
  }

  async store(req, res) {
    // Validing data entry
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      phone: Yup.string().required(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    // Lookup for user
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists. ' });
    }

    const { id, name, email } = await User.create({
      ...req.body,
      user_type_id: 3,
    });

    return res.json({ id, name, email });
  }

  async show(req, res) {
    const deliveryman = await User.findOne({
      attributes: ['id', 'name', 'email', 'phone', 'user_type_id', 'avatar_id'],
      where: { id: req.params.id, user_type_id: 3 },
      include: [
        { model: UserType, as: 'user_type', attributes: ['id', 'type'] },
        { model: File, as: 'avatar', attributes: ['url', 'path'] },
      ],
    });

    return res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      phone: Yup.string().required(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

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

    const { id, name, phone } = await user.update(req.body);

    return res.json({ id, name, email, phone });
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new DeliverymanController();
