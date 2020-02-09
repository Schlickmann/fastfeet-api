import * as Yup from 'yup';
import User from '../models/User';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const recipients = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone'],
      where: { user_type_id: 2 },
      include: [
        {
          model: Recipient,
          as: 'recipient_address',
          attributes: [
            'id',
            'country',
            'state',
            'city',
            'zip_code',
            'number',
            'street',
            'complement',
          ],
        },
      ],
    });

    return res.json(recipients);
  }

  async show(req, res) {
    const { id } = req.params;

    const recipient = await User.findOne({
      attributes: ['id', 'name', 'email', 'phone'],
      where: { id, user_type_id: 2 },
      include: [
        {
          model: Recipient,
          as: 'recipient_address',
          attributes: [
            'id',
            'country',
            'state',
            'city',
            'zip_code',
            'number',
            'street',
            'complement',
          ],
        },
      ],
    });

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    return res.json(recipient);
  }

  async store(req, res) {
    const defaultSchema = Yup.object().shape({
      // Validing data entry
      name: Yup.string()
        .required('Name is required')
        .typeError('Invalid name'),
      email: Yup.string()
        .email()
        .required('Email is required')
        .typeError('Invalid email address'),
      user_type_id: Yup.number()
        .required('User Type is required')
        .typeError('Invalid user type'),
      phone: Yup.string()
        .required('Phone is required')
        .typeError('Invalid phone number'),
      recipient_address: Yup.object().shape({
        country: Yup.string()
          .required('Country is required')
          .typeError('Invalid country'),
        state: Yup.string()
          .required('State is required')
          .typeError('Invalid state'),
        city: Yup.string()
          .required('City is required')
          .typeError('Invalid city'),
        street: Yup.string()
          .required('Street is required')
          .typeError('Invalid street'),
        number: Yup.string()
          .required('Number is required')
          .typeError('Invalid number'),
        complement: Yup.string(),
        zip_code: Yup.string()
          .required('Zip Code is required')
          .typeError('Invalid Zip Code'),
      }),
    });

    await defaultSchema
      .strict()
      .validate(req.body)
      .catch(errors => {
        return res.status(400).json({ error: errors.message });
      });

    const { name, email, user_type_id, recipient_address, phone } = req.body;

    if (user_type_id !== 2) {
      return res.status(400).json({
        error: 'The user must be an recipient.',
      });
    }

    // Lookup for user
    let user = await User.findOne({
      where: { email },
    });

    if (user) {
      const addressExists = await Recipient.findOne({
        where: {
          ...recipient_address,
        },
      });

      if (addressExists) {
        return res
          .status(400)
          .json('Recipient already exists and contains the specified address.');
      }
    } else {
      // If user does not exist in users table should add them
      user = await User.create({
        name,
        email,
        phone,
        user_type_id,
      });
    }

    // Adding recipient address
    const {
      country,
      state,
      city,
      street,
      number,
      complement,
      zip_code,
    } = await Recipient.create({
      ...req.body.recipient_address,
      user_id: user.id,
    });

    return res.json({
      id: user.id,
      user_type_id,
      name,
      email,
      phone,
      recipient_address: {
        country,
        state,
        city,
        street,
        number,
        complement,
        zip_code,
      },
    });
  }

  async update(req, res) {
    const defaultSchema = Yup.object().shape({
      // Validing data entry
      name: Yup.string(),
      email: Yup.string().email(),
      phone: Yup.string(),
      country: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      zip_code: Yup.string(),
    });

    await defaultSchema
      .strict()
      .validate(req.body)
      .catch(errors => {
        return res.status(400).json({ error: errors.message });
      });

    const { id } = req.params;
    const { email } = req.body;

    const recipient = await User.findByPk(id);

    if (!recipient) {
      res.status(400).json({ error: 'Recipient not found.' });
    }

    if (email && email !== recipient.email) {
      const recipientExists = await User.findOne({
        where: { email },
      });

      if (recipientExists) {
        return res.status(400).json({ error: 'User already exists. ' });
      }
    }

    const {
      name,
      phone,
      user_type,
      recipient_address,
    } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      email,
      phone,
      user_type,
      recipient_address,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const recipient = await User.findByPk(id);

    if (!recipient) {
      res.status(400).json({ error: 'Recipient not found.' });
    } else if (recipient.user_type_id !== 2) {
      res.status(400).json({ error: 'User is not a recipient.' });
    }

    const deleted = await recipient.destroy();

    return res.status(200).json(deleted);
  }
}

export default new RecipientController();
