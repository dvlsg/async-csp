let wrapped = false;
if (!wrapped && GLOBAL.it) { // better check to see if mocha is included?
    wrapped = true; // don't accidentally wrap twice
    let mocha        = {};
    mocha.it         = GLOBAL.it;
    mocha.before     = GLOBAL.before;
    mocha.after      = GLOBAL.after;
    mocha.beforeEach = GLOBAL.beforeEach;
    mocha.afterEach  = GLOBAL.afterEach;

    for (let [key, val] of Object.entries(mocha)) {
        GLOBAL[key] = async(...args) => {
            let last = args[args.length - 1];
            if (last instanceof Function) {
                let fn = args.pop();
                let cb = async done => {
                    try {
                        await fn();
                        done();
                    }
                    catch(e) {
                        done(e);
                    }
                }
                args.push(cb);
            }
            mocha[key](...args);
        }
    }
}
