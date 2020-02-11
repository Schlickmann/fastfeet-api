import * as Yup from 'yup';
import Recipients from '../models/Recipients';

class RecipientController {
  async index(req, res) {
    const recipients = await Recipients.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'country',
        'state',
        'city',
        'zip_code',
        'number',
        'street',
        'complement',
      ],
    });

    return res.json(recipients);
  }

  async show(req, res) {
    const { id } = req.params;

    const recipient = await Recipients.findOne({
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'country',
        'state',
        'city',
        'zip_code',
        'number',
        'street',
        'complement',
      ],
      where: { id },
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

    const { email, phone } = req.body;

    // Lookup for user
    const recipient = await Recipients.findOne({
      where: { email },
    });

    if (recipient) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    const {
      id,
      name,
      country,
      state,
      city,
      zip_code,
      number,
      street,
      complement,
    } = await Recipients.create({ ...req.body });

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

    const { email } = req.body;

    const recipient = await Recipients.findByPk(req.params.id);

    if (!recipient) {
      res.status(400).json({ error: 'Recipient not found.' });
    }

    if (email && email !== recipient.email) {
      const recipientExists = await Recipients.findOne({
        where: { email },
      });

      if (recipientExists) {
        return res.status(400).json({ error: 'Recipient already exists. ' });
      }
    }

    const {
      id,
      name,
      phone,
      country,
      state,
      city,
      zip_code,
      number,
      street,
      complement,
    } = await recipient.update(req.body);

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

    const recipient = await Recipients.findByPk(id);

    if (!recipient) {
      res.status(400).json({ error: 'Recipient not found.' });
    }

    const deleted = await recipient.destroy();

    return res.status(200).json(deleted);
  }
}

export default new RecipientController();
