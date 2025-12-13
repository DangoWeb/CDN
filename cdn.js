"use strict";

const fs = require('fs');
const path = require('path');

class CDN {
    constructor(options = {}) {
        this.dir = options.dir || './cdn/';
        this.extension = options.extension || '.cdn.json';
        this.ttl = (typeof options.ttl === 'number') ? options.ttl : 3600;
    };

    getFilePath(name) {
        return path.resolve(path.join(this.dir, String(name).toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + this.extension));
    };

    cache(name, object) {
        try {
            const json = JSON.stringify(object);
            const file = this.getFilePath(name);
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, json);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        };
    };

    delete(name) {
        try {
            const file = this.getFilePath(name);
            if (fs.existsSync(file)) fs.unlinkSync(file);
            return true;
        } catch (e) {
            return false;
        };
    };

    get(name, ttl = undefined) {
        if ((ttl !== false) && !this.valid(name, ttl)) return false;
        try {
            return JSON.parse(fs.readFileSync(this.getFilePath(name), 'utf8'));
        } catch (e) {
            return false;
        };
    };

    valid(name, ttl) {
        ttl = (typeof ttl === 'number') ? ttl : this.ttl;
        try {
            const file = this.getFilePath(name);
            if (!fs.existsSync(file)) return false;
            const stats = fs.statSync(file);
            return (stats.mtimeMs + ttl * 1000) > Date.now();
        } catch (e) {
            return false;
        };
    };
};

module.exports = CDN;