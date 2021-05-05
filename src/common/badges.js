export class Badges {
    constructor(badges) {
        this.badges = badges;
        this.nextId = 0;
    }

    next() {
        if (this.nextId >= this.badges.length) {
            return null;
        }
        return this.badges[this.inc()];
    }

    inc() {
        if (this.badges.length == 0) {
            throw new Error("Method called without badges");
        }
        const oldId = this.nextId;
        this.nextId = (this.nextId + 1) % this.badges.length
        return oldId;
    }
}