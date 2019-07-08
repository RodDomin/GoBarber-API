import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import DatabaseConfig from '../config/database';
import User from '../app/models/User';
import File from '../app/models/File';
import Appointmens from '../app/models/Appointmens';

const models = [User, File, Appointmens];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(DatabaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/gobarber',
      { useNewUrlParser: true, useFindAndModify: true }
    );
  }
}

export default new Database();
