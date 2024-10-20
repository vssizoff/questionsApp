import * as fs from "node:fs";
import * as Path from "node:path";
import {EventEmitter} from "event-emitter-typescript";

export class Queue<Type> {
    protected arr: Array<[Type, boolean]> = [];
    protected start = 0;
    public eventEmitter = new EventEmitter<{change: Queue<Type>, push: Type, pop: undefined, remove: Type, replace: [Type, Type]}>;

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
        this.eventEmitter.emit("push", elem);
    }

    public pop(): Type {
        let [value] = this.arr[0];
        this.arr[this.start][1] = true;
        this.commit();
        this.eventEmitter.emit("pop", undefined);
        this.start++;
        return value;
    }

    public remove(id: Type): void {
        let found = false;
        this.arr = this.arr.filter(([item]) => {
            if (item === id) found = true;
            return item !== id;
        });
        if (!found) return;
        this.commit();
        this.eventEmitter.emit("remove", id);
    }

    public replace(from: Type, to: Type): void {
        this.arr = this.arr.map(([elem, used]) => [elem === from ? to : elem, used]);
        this.commit();
        this.eventEmitter.emit("replace", [from, to]);
    }
}

export const queue = new Queue<number>(Path.resolve(process.env.QUEUE_PATH ?? "./queue/queue.json"));