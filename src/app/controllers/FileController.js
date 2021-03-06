import File from '../models/File';

class FileControlller {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    try {
      const file = await File.create({ name, path });

      return res.json(file);
    } catch (err) {
      return res.status(500).json({ error: 'internal error' });
    }
  }
}

export default new FileControlller();
