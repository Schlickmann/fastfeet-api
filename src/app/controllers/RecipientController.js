import * as Yup from 'yup';
import RecipientAddress from '../models/RecipientAddress';

class RecipientController {
  async store(req, res) {
    // Validing data entry
    const schema = Yup.object().shape({
      country: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    // Adding recipient address
    const address = await RecipientAddress.create({
      ...req.body,
      user_id: req.userId,
    });

    return res.json(address);
  }
}

export default new RecipientController();
