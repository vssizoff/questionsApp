import * as fs from "node:fs";
import * as Path from "node:path";

export class Queue<Type> {
    protected arr: Array<Type> = [];

    protected write() {
        fs.writeFileSync(this.file, JSON.stringify(this.arr), {encoding: "utf8"});
    }

    public constructor(public file: string) {
        if (!fs.existsSync(file)) fs.writeFileSync(file, "");
        this.arr = JSON.parse(fs.readFileSync(file, {encoding: "utf8"}));
    }

    public get array(): Array<Type> {return this.arr;}
    public set array(arr: Array<Type>) {
        this.arr = arr;
        this.write();
    }

    public push(elem: Type): void {
        this.arr.push(elem);
        this.write();
    }

    public pop(): Type {
        let value = this.arr[0];
        this.arr.shift();
        this.write();
        return value;
    }
}

export const queue = new Queue(Path.resolve(process.env.QUEUE_PATH ?? "./queue.json"));