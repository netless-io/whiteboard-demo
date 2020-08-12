const child_process = require("child_process");

function execSyncInDir(dir, command) {
    return execSync(`cd ${dir} && ${command}`);
}

function execSync(command) {
    return child_process.execSync(command).toString().trim();
}

async function execInDir(dir, command){
    return exec(`cd ${dir} && ${command}`);
}

async function exec(command) {
    return new Promise((resolve, reject) => {
        const cmd = child_process.exec(`${command}`, (err, stdout, stderr) => {
            if (err) {
                reject({ err, stderr });
            } else {
                resolve(stdout);
            }
        });
        cmd.stderr.on("data", data => {
            process.stdout.write(`${data}`);
        });
        cmd.stdout.on("data", data => {
            process.stdout.write(`${data}`);
        }); 
    });
}

async function remoteCommand(address, commands) {
    await exec(`ssh ${address} -tt ${JSON.stringify(commands.join(" && "))}`);
}

process.on("uncaughtException", error => {
    console.error("uncaughtException: ", error);
    process.exit(3);
});

process.on("unhandledRejection", error => {
    console.error("unhandledRejection: ", error);
    process.exit(4);
});

module.exports.execSyncInDir = execSyncInDir;
module.exports.execSync = execSync;
module.exports.exec = exec;
module.exports.execInDir = execInDir;
module.exports.remoteCommand = remoteCommand;