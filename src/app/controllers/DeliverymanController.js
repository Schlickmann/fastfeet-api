import * as Yup from 'yup';
import Couriers from '../models/Couriers';
import Files from '../models/Files';

class DeliverymanController {
  async index(req, res) {
    const couriers = await Couriers.findAll({
      attributes: ['id', 'name', 'email', 'phone'],
      include: [{ model: Files, as: 'avatar', attributes: ['url', 'path'] }],
      order: ['name'],
    });

    return res.json(couriers);
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
      phone: Yup.string()
        .required('Phone is required')
        .typeError('Invalid phone'),
      avatar_id: Yup.number(),
    });

    await defaultSchema
      .strict()
      .validate(req.body)
      .catch(errors => {
        return res.status(400).json({ error: errors.message });
      });

    const { email, avatar_id } = req.body;

    // Lookup for user
    const deliverymanExists = await Couriers.findOne({
      where: { email },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman already exists.' });
    }

    if (avatar_id) {
      const avatar = await Files.findOne({ avatar_id });

      if (!avatar) {
        return res.status(400).json({ error: 'Avatar does not exist.' });
      }
    }

    const { id, name, phone } = await Couriers.create({
      ...req.body,
    });

    return res.json({ id, name, email, phone });
  }

  async show(req, res) {
    const deliveryman = await Couriers.findOne({
      attributes: ['id', 'name', 'email', 'phone'],
      where: { id: req.params.id },
      include: [{ model: Files, as: 'avatar', attributes: ['url', 'path'] }],
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
    }

    return res.json(deliveryman);
  }

  async update(req, res) {
    const defaultSchema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      phone: Yup.string(),
      avatar_id: Yup.number(),
    });

    await defaultSchema
      .strict()
      .validate(req.body)
      .catch(errors => {
        return res.status(400).json({ error: errors.message });
      });

    const { email } = req.body;
    const { id } = req.params;

    const deliveryman = await Couriers.findByPk(id, {
      include: [{ model: Files, as: 'avatar', attributes: ['url', 'path'] }],
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
    }

    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Couriers.findOne({
        where: { email },
      });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman already exists.' });
      }
    }

    const { name, phone, avatar } = await deliveryman.update(req.body);

    return res.json({ id, name, email, phone, avatar });
  }

  async delete(req, res) {
    const { id } = req.params;
    const deliveryman = await Couriers.findOne({ where: { id } });

    if (!deliveryman) {
      res.status(400).json({ error: 'Deliveryman not found.' });
    }

    const deleted = await deliveryman.destroy();

    return res.status(200).json(deleted);
  }
}

export default new DeliverymanController();
