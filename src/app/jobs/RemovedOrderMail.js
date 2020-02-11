import Mail from '../../lib/Mail';

class NewOrderMail {
  // Variable key
  get key() {
    return 'RemovedOrderMail';
  }

  async handle({ data }) {
    const { order } = data;

    console.log('Queue started.');
    await Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'An order has been removed from your queue',
      template: 'removedOrder',
      context: {
        deliveryman: order.deliveryman.name,
        recipient: order.recipient.name,
        order: order.id,
        product: order.product,
      },
    });
  }
}

export default new NewOrderMail();
