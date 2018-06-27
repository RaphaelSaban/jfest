const clc = require('cli-color');

module.exports = {
    out: console.log,
    error: (...args) => console.log(clc.bold.red(args)),
    success: (...args) => console.log(clc.bold.green(args)),
    fileChange: (...args) => console.log(clc.bold.magenta(args)),
    hLine: () => console.log(Array(50).fill('\u2500').join(''))
}
