export class AccountNotFoundException extends Error {
    constructor(message) {
        super(message);
        this.name = "AccountNotFoundError";
    }
}
