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

  protected getFilePath() {
    return path.resolve(this.filepath, this.filename);
  }

  protected write() {
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

  public update(find: (item: T) => boolean, item: T) {
    const index = this.items.findIndex(find);
    this.items[index] = item;
    this.write();
  }

  public filter(check: (item: T) => boolean): T[] {
    return this.items.filter(check);
  }

  public aggregate<TValue>(
    aggregator: (prev: TValue, item: T) => TValue,
    initialValue: TValue
  ) {
    return this.items.reduce(aggregator, initialValue);
  }

  public clear() {
    fs.unlinkSync(this.getFilePath());
  }
}
