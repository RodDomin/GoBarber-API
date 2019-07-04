import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

export default {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, response) => {
        if (err) return cb(err);

        return cb(
          null,
          response.toString('hex') + path.extname(file.originalname)
        );
      });
    },
  }),
};
