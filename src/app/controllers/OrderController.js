import * as Yup from 'yup';
import Recipients from '../models/Recipients';
import Couriers from '../models/Couriers';
import Files from '../models/Files';
import Orders from '../models/Orders';
import Notification from '../schemas/Notification';

import NewOrderMail from '../jobs/NewOrderMail';
import ChangedOrderMail from '../jobs/ChangedOrderMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Orders.findAll({
      where: { canceled_at: null },
      attributes: ['id', 'product', 'start_date', 'end_date'],
      limit: 20,
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
          include: [
            { model: Files, as: 'avatar', attributes: ['url', 'path'] },
          ],
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
    await Queue.add(NewOrderMail.key, {
      order: {
        id: order.id,
        product: order.product,
        recipient: { name: existRecipient.name },
        deliveryman: {
          name: existDeliveryman.name,
          email: existDeliveryman.email,
        },
      },
    });

    return res.json(order);
  }

  async show(req, res) {
    const order = await Orders.findOne({
      attributes: ['id', 'product', 'start_date', 'end_date'],
      where: { id: req.params.id },
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
          include: [
            { model: Files, as: 'avatar', attributes: ['url', 'path'] },
          ],
        },
        { model: Files, as: 'signature', attributes: ['url', 'path'] },
      ],
    });

    if (!order) {
      return res.status(400).json({ error: 'Order not found.' });
    }

    return res.json(order);
  }

  async update(req, res) {
    const defaultSchema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
    });

    await defaultSchema
      .strict()
      .validate(req.body)
      .catch(errors => {
        return res.status(400).json({ error: errors.message });
      });

    const { id } = req.params;
    const { deliveryman_id, recipient_id, product } = req.body;

    let order = await Orders.findByPk(id, {
      attributes: ['product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        { model: Recipients, as: 'recipient', attributes: ['name'] },
        {
          model: Couriers,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!order) {
      return res.status(400).json({ error: 'Order not found.' });
    }

    if (order.canceled_at) {
      return res
        .status(401)
        .json({ error: 'You cannot change a canceled order.' });
    }

    if (order.start_date) {
      return res
        .status(401)
        .json({ error: 'You cannot change orders in transit.' });
    }

    if (deliveryman_id === order.deliveryman.id) {
      /**
       * Notify Deliveryman
       */

      await Notification.create({
        content: `Order ${id} has been changed`,
        deliveryman: deliveryman_id,
      });

      // Adding email to queue
      await Queue.add(ChangedOrderMail.key, {
        order: {
          id,
          product,
          recipient: { name: order.recipient.name },
          deliveryman: {
            name: order.deliveryman.name,
            email: order.deliveryman.email,
          },
        },
      });
    } else {
      /**
       * Notify Deliveryman
       */

      await Notification.create({
        content: `Order ${id} has been removed from your queue`,
        deliveryman: order.deliveryman.id,
      });

      // Adding email to queue
      await Queue.add(ChangedOrderMail.key, {
        order: {
          id,
          product,
          recipient: { name: order.recipient.name },
          deliveryman: {
            name: order.deliveryman.name,
            email: order.deliveryman.email,
          },
        },
      });
    }

    order = await order.update(req.body);

    return res.json(order);
  }
}

export default new OrderController();
