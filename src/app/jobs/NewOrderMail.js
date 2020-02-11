import Mail from '../../lib/Mail';

class NewOrderMail {
  // Variable key
  get key() {
    return 'NewOrderMail';
  }

  async handle({ data }) {
    const { order } = data;

    console.log('Queue started.');
    await Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'New order added to be delivered',
      template: 'newOrder',
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
