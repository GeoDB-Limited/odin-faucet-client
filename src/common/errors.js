export class AccountNotFoundException extends Error {
    constructor(message) {
        super(message);
        this.name = "AccountNotFoundError";
    }
}

export class PendingTimeException extends Error {
    constructor(data, message) {
        super(message);
        this.name = "PendingTimeException";
        this.data = data;
    }
}