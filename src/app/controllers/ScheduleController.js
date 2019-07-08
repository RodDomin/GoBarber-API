import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointmens';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const { userId } = req.body;

    const CheckUserProvider = await User.findOne({
      where: { id: userId, provider: true },
    });

    if (!CheckUserProvider) {
      return res.status(401).json({ error: 'user is not a provider' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointment = await Appointment.findAll({
      where: {
        provider_id: userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ['date'],
    });

    return res.json(appointment);
  }
}

export default new ScheduleController();
