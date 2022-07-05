#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const cfDir = path.join(process.cwd(), 'config');
const src = path.join(__dirname, '..', 'config');

// copy .env file
if (!fs.existsSync(path.join(process.cwd(), '.env'))) {
    fs.copyFileSync(path.join(__dirname, '..', '.env.sample'), path.join(process.cwd(), '.env'));
}
// create config folder first
if (!fs.existsSync(cfDir)) {
    fs.mkdirSync(cfDir);
}

fs.readdirSync(src).forEach(file => {
    const _dest_file = path.join(cfDir, file);
    const _src_file = path.join(src, file);
    if (!fs.existsSync(file)) {    
        fs.copyFileSync(_src_file, _dest_file);
    }
});
