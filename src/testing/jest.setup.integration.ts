import * as fs from "fs";
import * as path from "path";
import { App } from "../app";
import {
  IConfig,
  I_CONFIG,
} from "../modules/core/domain/ports/config.interface";

async function clearFSDBFiles() {
  const app = new App();
  app.setup();

  const config = app.getContainer().get<IConfig>(I_CONFIG);
  const fsdb = config.getFSDBDirectory();

  const files = fs.readdirSync(fsdb);
  await Promise.all(
    files.map(async (filename) => {
      return new Promise((accept, reject) => {
        const filepath = path.resolve(fsdb, filename);
        fs.unlink(filepath, (err) => {
          if (err) {
            reject(err);
          } else {
            accept(null);
          }
        });
      });
    })
  );
}

beforeEach(async () => {
  await clearFSDBFiles();
});
