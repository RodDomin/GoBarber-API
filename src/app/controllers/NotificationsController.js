import User from '../models/User';
import Notification from '../Schemas/notifications';

class NotificationsController {
  async index(req, res) {
    const checkIsProvider = await User.findOne({
      where: {
        id: req.body.userId,
        provider: true,
      },
    });

    if (!checkIsProvider) {
      return res.status(401).json({ error: 'user is not a provider' });
    }

    const resp = await Notification.find({
      user: req.body.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(resp);
  }

  async update(req, res) {
    const resp = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    return res.json(resp);
  }
}

export default new NotificationsController();
