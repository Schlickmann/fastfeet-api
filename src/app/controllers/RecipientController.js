import * as Yup from 'yup';
import User from '../models/User';
import RecipientAddress from '../models/RecipientAddress';

class RecipientController {
  async store(req, res) {
    // Validing data entry
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      phone: Yup.string().required(),
      country: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

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

    if (user && user.is_admin) {
      return res.status(401).json({
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
          .status(401)
          .json('Recipient already exists and contains the specified address.');
      }
    }

    // If user does not exist in users table should add them
    if (!user) {
      user = await User.create({
        name,
        email,
        phone: phone || null,
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
}

export default new RecipientController();
