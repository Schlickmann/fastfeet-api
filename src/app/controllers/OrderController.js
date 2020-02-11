import * as Yup from 'yup';
import Recipients from '../models/Recipients';
import Couriers from '../models/Couriers';
import Files from '../models/Files';
import Orders from '../models/Orders';
import Notification from '../schemas/Notification';

import NewOrderMail from '../jobs/NewOrderMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Orders.findAll({
      where: { canceled_at: null },
      attributes: ['id', 'product', 'start_date', 'end_date'],
      limit: page,
      offset: (page - 1) * 20,
      include: [
        {
          model: Recipients,
          as: 'recipient',
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
        },
        {
          model: Couriers,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: Files,
          as: 'signature',
          attributes: ['url', 'path'],
        },
      ],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const defaultSchema = Yup.object().shape({
      product: Yup.string()
        .required('Product is required')
        .typeError('Invalid product'),
      recipient_id: Yup.number()
        .required('Recipient is required')
        .typeError('Invalid recipient'),
      deliveryman_id: Yup.number()
        .required('Deliveryman is required')
        .typeError('Invalid deliveryman'),
    });

    await defaultSchema
      .strict()
      .validate(req.body)
      .catch(errors => {
        return res.status(400).json({ error: errors.message });
      });

    const { product, recipient_id, deliveryman_id } = req.body;

    /**
     *  Check if recipient exists
     */
    const existRecipient = await Recipients.findByPk(recipient_id);

    if (!existRecipient) {
      return res.status(400).json({ error: 'Recipient does not exist.' });
    }

    /**
     *  Check if deliveryman exists
     */
    const existDeliveryman = await Couriers.findByPk(deliveryman_id);

    if (!existDeliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exist.' });
    }

    const order = await Orders.create({
      product,
      recipient_id,
      deliveryman_id,
    });

    /**
     * Notify Deliveryman
     */

    await Notification.create({
      content: `New order available to be picked up`,
      deliveryman: deliveryman_id,
    });

    // Adding email to queue
    await Queue.add(NewOrderMail.key, { appointment });

    return res.json(order);
  }
}

export default new OrderController();
