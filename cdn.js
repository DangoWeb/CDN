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
        return path.resolve(path.join(this.dir, String(name).replace(/[^a-z0-9]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + this.extension));
    };

    cache(name, object) {
        const file = this.getFilePath(name);
        try {
            const json = JSON.stringify(object);
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, json);
            return true;
        } catch (e) {
            if (e.code === 'EEXIST') {
                console.error(`CDN file ${file} already exists.`);
                return false;
            };
            console.error('Error in CDN.cache():', e);
            return false;
        };
    };

    delete(name) {
        const file = this.getFilePath(name);
        try {
            if (fs.existsSync(file)) fs.unlinkSync(file);
            return true;
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.error(`CDN file ${file} does not exist.`);
                return false;
            };
            console.error('Error in CDN.delete():', e);
            return false;
        };
    };

    get(name) {
        const file = this.getFilePath(name);
        try {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.error(`CDN file ${file} does not exist.`);
                return false;
            };
            console.error('Error in CDN.get():', e);
            return false;
        };
    };

    valid(name, ttl) {
        ttl = (typeof ttl === 'number') ? ttl : this.ttl;
        const file = this.getFilePath(name);
        try {
            if (!fs.existsSync(file)) return false;
            const stats = fs.statSync(file);
            return (stats.mtimeMs + ttl * 1000) > Date.now();
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.error(`CDN file ${file} does not exist.`);
                return false;
            };
            console.error('Error in CDN.valid():', e);
            return false;
        };
    };

    all() {
        try {
            const files = fs.readdirSync(this.dir);
            return files.filter(file => file.endsWith(this.extension)).map(file => file.replace(this.extension, ''));
        } catch (e) {
            console.error('Error in CDN.all():', e);
            return [];
        };
    };

    push(name, object) {
        return this.cache(name, object);
    };

    set(name, object) {
        return this.cache(name, object);
    };

    put(name, object) {
        return this.cache(name, object);
    };

    update(name, object) {
        return this.cache(name, object);
    };

    upd(name, object) {
        return this.cache(name, object);
    };

    del(name) {
        return this.delete(name);
    };

    remove(name) {
        return this.delete(name);
    };

    rem(name) {
        return this.delete(name);
    };

    pull(name) {
        return this.get(name);
    };

    contents(name) {
        return this.get(name);
    };

    exists(name) {
        return this.valid(name);
    };

    locked(name) {
        return this.valid(name);
    };

    unlocked(name) {
        return !this.valid(name);
    };
};

module.exports = CDN;
