const colorSet = {
    Reset: "\x1b[0m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Magenta: "\x1b[35m"
};

const funcNames = ["info", "log", "warn", "error"];
const colors = [colorSet.Green, colorSet.Blue, colorSet.Yellow, colorSet.Red];
let myConsole: any = console;
for (var i = 0; i < funcNames.length; i++) {
    let funcName = funcNames[i];
    let color = colors[i];

    let oldFunc: any = myConsole[funcName];
    myConsole[funcName] = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length) {
            args = [color + args[0]].concat(args.slice(1), colorSet.Reset);
        }
        oldFunc.apply(null, args);
    }
}
console = myConsole;