import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointments from '../models/Appointmens';
import Notification from '../Schemas/notifications';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail.js';

class AppointmentController {
  async index(req, res) {
    let { page = 1 } = req.query;

    page = page <= 0 ? 1 : page;

    const appointment = await Appointments.findAll({
      where: { user_id: req.body.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.send(appointment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation error' });
    }

    const { provider_id, date } = req.body;

    // Check if provider id is a provider
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider)
      return res
        .status(401)
        .json({ error: 'you can only create appointments with provider' });

    if (provider_id === req.body.userId) {
      return res
        .status(401)
        .json({ error: 'user cannot appoint with himself' });
    }

    // Check for past dates
    const hour = startOfHour(parseISO(date));

    if (isBefore(hour, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' });
    }

    //
    // Check date availability
    //
    const checkAvailability = await Appointments.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hour,
      },
    });

    if (checkAvailability) {
      return res
        .status(401)
        .json({ error: 'appointment date is not available' });
    }

    const appointment = await Appointments.create({
      user_id: req.body.userId,
      provider_id,
      date,
    });

    const user = await User.findByPk(req.body.userId);
    const formatedDate = format(hour, "'dia' dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formatedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointments.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.body.userId) {
      return res
        .status(401)
        .json({ erro: 'you dont have permission to cancel this appointment' });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'you cannot cancel past appointments' });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
