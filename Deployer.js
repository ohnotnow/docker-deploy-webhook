const { execSync } = require('child_process');
const { format } = require('date-fns');
const fs = require('fs');
const APP_SECRET = 'abcd1234';

module.exports = class Deployer {
    constructor(options = {}) {
        this.project = options.project;
        this.projectPath = options.projectPath;
        this.jsonParams = options.jsonParams;
        this.stackContents = this.getStackContents();
        this.dotenvContents = this.getDotenvContents();
    }

    recordLog(message) {
        const timestamp = format(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS');
        console.log(`${timestamp}: ${this.project} -> ${message}`);
    }

    getStackContents() {
        if (!this.jsonParams.stack) {
            return false;
        }
        this.recordLog(`Have a new stack`);
        let buff = new Buffer.from(this.jsonParams.stack, 'base64');
        return buff.toString('ascii');
    }

    getDotenvContents() {
        if (!this.jsonParams.dotenv) {
            return false;
        }
        this.recordLog(`Have a new dotenv`);
        let buff = new Buffer.from(this.jsonParams.dotenv, 'base64');
        return buff.toString('ascii');
    }

    projectPathExists() {
        return fs.existsSync(this.projectPath);
    }

    invalidSecret() {
        return this.jsonParams.secret !== APP_SECRET;
    }

    invalidOptions() {
        return !this.projectPathExists() && !this.stackContents;
    }

    updateStackFile() {
        if (this.stackContents) {
            fs.writeFileSync(`${this.projectPath}/stack.yml`, this.stackContents);
        }
    }

    updateDotenvFile() {
        if (this.dotenvContents) {
            fs.writeFileSync(`${this.projectPath}/.env`, this.dotenvContents);
        }
    }

    ensureProjectIsDeployable() {
        if (this.invalidOptions()) {
            return false;
        }
        if (!this.projectPathExists()) {
            fs.mkdirSync(this.projectPath);
        }
        this.updateStackFile();
        this.updateDotenvFile();
        return true;
    }

    deployStack() {
        const command = `echo docker stack deploy -c ${this.projectPath}/stack.yml ${this.project}`;
        this.recordLog(`Deploying stack with '${command}'`);
        execSync(command);
    }
}