import * as fs from "fs";
import * as path from "path";

export class FSDB<T> {
  private items: T[] = [];

  constructor(private filepath: string, private filename: string) {
    if (!fs.existsSync(path.resolve(filepath, filename))) {
      if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath, { recursive: true });
      }

      this.write();
    } else {
      const result = fs.readFileSync(path.resolve(filepath, filename), "utf-8");
      this.items = JSON.parse(result);
    }
  }

  public getFilePath() {
    return path.resolve(this.filepath, this.filename);
  }

  public write() {
    const data = JSON.stringify(this.items);
    fs.writeFileSync(this.getFilePath(), data);
  }

  public find(check: (item: T) => boolean): T | undefined {
    return this.items.find(check);
  }

  public insert(item: T) {
    this.items.push(item);
    this.write();
  }

  public rewrite(find: (item: T) => boolean, item: T) {
    const index = this.items.findIndex(find);
    this.items[index] = item;
    this.write();
  }

  public clear() {
    fs.unlinkSync(this.getFilePath());
  }
}
