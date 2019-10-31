import Express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as os from 'os';
import cookieParser from 'cookie-parser';

import Database from './mongoose';
import swaggerify from './swagger';

import l from './logger';

const app = new Express();

export default class ExpressServer {
  constructor() {
    const root = path.normalize(`${__dirname}/../..`);
    app.set('appPath', `${root}client`);
    app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(Express.static(`${root}/public`));
  }

  router(routes) {
    swaggerify(app, routes);

    return this;
  }

  connectDatabase(){
    const database = new Database();
    return database.createConnection();
  }

  listen(port = process.env.PORT) {
    const welcome = p => () => {
      l.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port: ${p}}`);
      this.connectDatabase();
    };
    http.createServer(app).listen(port, welcome(port));
    return app;
  }
}
