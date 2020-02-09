import * as Yup from 'yup';
import User from '../models/User';
import RecipientAddress from '../models/RecipientAddress';

class RecipientController {
  async index(req, res) {
    const recipients = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone'],
      where: { user_type_id: 2 },
      include: [
        {
          model: RecipientAddress,
          as: 'recipient_addresses',
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

    const recipients = await User.findOne({
      attributes: ['id', 'name', 'email', 'phone'],
      where: { id, user_type_id: 2 },
      include: [
        {
          model: RecipientAddress,
          as: 'recipient_addresses',
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
      phone: Yup.string()
        .required('Phone is required')
        .typeError('Invalid phone number'),
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
    });

    await defaultSchema
      .strict()
      .validate(req.body)
      .catch(errors => {
        return res.status(400).json({ error: errors.message });
      });

    const {
      name,
      email,
      phone,
      zip_code,
      number,
      street,
      complement,
    } = req.body;

    // Lookup for user
    let user = await User.findOne({ where: { email } });

    if (user && user.user_type_id === 1) {
      return res.status(400).json({
        error:
          'Administrators cannot use corporative email to add themselves as recipient.',
      });
    }

    if (user) {
      const addressExists = await RecipientAddress.findOne({
        where: {
          zip_code,
          number,
          street,
          complement: complement || null,
        },
      });

      if (addressExists) {
        return res
          .status(400)
          .json('Recipient already exists and contains the specified address.');
      }
    }

    // If user does not exist in users table should add them
    if (!user) {
      user = await User.create({
        name,
        email,
        phone: phone || null,
        user_type_id: 2,
      });
    }

    // Adding recipient address
    const { country, state, city } = await RecipientAddress.create({
      ...req.body,
      user_id: user.id,
    });

    return res.json({
      id: user.id,
      name,
      email,
      phone: phone || null,
      country,
      state,
      city,
      zip_code,
      number,
      street,
      complement,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
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

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const { id } = req.params;

    const recipient = await User.findByPk(id);

    if (!recipient) {
      res.status(400).json({ error: 'Recipient not found.' });
    } else if (recipient.user_type_id === 1) {
      res.status(400).json({ error: 'User is not a recipient.' });
    }

    const recipientAddress = await RecipientAddress.findOne({
      where: { user_id: id },
    });

    if (!recipientAddress) {
      res.status(400).json({ error: 'Recipient Address not found.' });
    }

    const { name, email, phone } = await recipient.update(req.body);
    const {
      country,
      state,
      city,
      zip_code,
      number,
      street,
      complement,
    } = await recipientAddress.update(req.body);

    return res.json({
      id,
      name,
      email,
      phone,
      country,
      state,
      city,
      zip_code,
      number,
      street,
      complement,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const recipient = await User.findByPk(id);

    if (!recipient) {
      res.status(400).json({ error: 'Recipient not found.' });
    } else if (recipient.user_type_id === 1) {
      res.status(400).json({ error: 'User is not a recipient.' });
    }

    const deleted = await recipient.destroy();

    return res.status(200).json(deleted);
  }
}

export default new RecipientController();
