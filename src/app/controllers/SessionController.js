import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import jwtConfig from '../../config/Auth';

class SessionController {
  async store(req, res, next) {
    const { email, password } = req.body;

    const usr = await User.findOne({ where: { email } });

    if (!usr) return res.status(400).json({ error: 'user not found' });

    if (!(await bcrypt.compare(password, usr.password_hash))) {
      return res.status(400).send({ error: 'password does not match' });
    }

    const { id, name } = usr;
    const token = jwt.sign({ id }, jwtConfig.secrets, {
      expiresIn: jwtConfig.expiresIn,
    });

    return res.send({ id, name, email, token });
  }
}

export default new SessionController();
