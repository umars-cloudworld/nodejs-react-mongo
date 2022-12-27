export class Logger {
    // Gets the full current system time and date
    private static getTime(): string {
        const date = new Date();
        const left = date.toLocaleDateString('fr-FR');
        const right = date.toLocaleTimeString('fr-FR');

        return `${left} ${right}`;
    }

    // Logs a green message
    static success(title: string, body: unknown): void {
        console.log(`✔ [${this.getTime()}] - [${title}] ` + body);
    }

    // Logs a yellow message
    static warn(title: string, body: unknown): void {
        console.warn(`⚠️ [${this.getTime()}] - [${title}] ` + body);
    }

    // Logs a red message
    static error(title: string, body: unknown): void {
        console.error(`𐄂 [${this.getTime()}] - [${title}] `, body);
    }

    // Logs a white message
    static debug(title: string, body: unknown): void {
        console.debug(`ℹ [${this.getTime()}] - [${title}] ` + body);
    }

    static date(): string {
        return `ℹ [${this.getTime()}] - [api]`;
    }
}
