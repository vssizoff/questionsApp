import * as fs from "node:fs";
import * as Path from "node:path";
import {EventEmitter} from "event-emitter-typescript";

export class Queue<Type> {
    protected arr: Array<Type> = [];
    public eventEmitter = new EventEmitter<{change: Queue<Type>, push: Type, pop: Type}>;

    protected commit() {
        fs.writeFileSync(this.file, JSON.stringify(this.arr), {encoding: "utf8"});
    }

    public constructor(public file: string) {
        if (!fs.existsSync(file)) fs.writeFileSync(file, "");
        this.arr = JSON.parse(fs.readFileSync(file, {encoding: "utf8"}));
    }

    public get array(): Array<Type> {return this.arr;}
    public set array(arr: Array<Type>) {
        this.arr = arr;
        this.commit();
        this.eventEmitter.emit("change", this);
    }

    public push(elem: Type): void {
        this.arr.push(elem);
        this.commit();
        this.eventEmitter.emit("push", elem);
    }

    public pop(): Type {
        let value = this.arr[0];
        this.arr.shift();
        this.commit();
        this.eventEmitter.emit("pop", value);
        return value;
    }
}

export const queue = new Queue<number>(Path.resolve(process.env.QUEUE_PATH ?? "./queue.json"));