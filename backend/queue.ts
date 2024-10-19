import * as fs from "node:fs";
import * as Path from "node:path";
import {EventEmitter} from "event-emitter-typescript";

export class Queue<Type> {
    protected arr: Array<[Type, boolean]> = [];
    protected start = 0;
    public eventEmitter = new EventEmitter<{change: Queue<Type>, push: number, pop: number}>;

    protected commit() {
        fs.writeFileSync(this.file, JSON.stringify(this.arr), {encoding: "utf8"});
    }

    public constructor(public file: string) {
        if (!fs.existsSync(file)) {
            try {fs.mkdirSync(Path.parse(file).dir, {recursive: true});}
            catch {}
            fs.writeFileSync(file, "[]");
        }
        this.arr = JSON.parse(fs.readFileSync(file, {encoding: "utf8"}));
    }

    public get array(): Array<[Type, boolean]> {return this.arr;}
    public set array(arr: Array<[Type, boolean]>) {
        this.arr = arr;
        this.commit();
        this.eventEmitter.emit("change", this);
    }

    public push(elem: Type): void {
        this.arr.push([elem, false]);
        this.commit();
        this.eventEmitter.emit("push", this.arr.length - 1);
    }

    public pop(): Type {
        let [value] = this.arr[0];
        this.arr[this.start][1] = true;
        this.commit();
        this.eventEmitter.emit("pop", this.start);
        this.start++;
        return value;
    }
}

export const queue = new Queue<number>(Path.resolve(process.env.QUEUE_PATH ?? "./queue/queue.json"));