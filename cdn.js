"use strict";

const fs = require('fs');
const path = require('path');

class CDN {
    constructor(options = {}) {
        this.dir = options.dir || './cdn/';
        this.lockDir = options.lockDir || options.dir || './cdn/';
        this.extension = options.extension || '.cdn.json';
        this.lockExtension = options.lockExtension || '.cdn.lock';
        this.ttl = (typeof options.ttl === 'number') ? options.ttl : 3600;
    };

    getFilePath(name, isLock = false) {
        const dir = isLock ? this.lockDir : this.dir;
        const extension = isLock ? this.lockExtension : this.extension;
        return path.resolve(path.join(dir, String(name).replace(/[^a-z0-9]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + extension));
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

    lock(name, content) {
        const file = this.getFilePath(name, true);
        try {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, content || 'locked', { flag: 'wx' });
            return true;
        } catch (e) {
            if (e.code === 'EEXIST') {
                console.error(`Lockfile ${file} already exists.`);
                return false;
            };
            console.error('Error in CDN.lock():', e);
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

    unlock(name) {
        const file = this.getFilePath(name, true);
        try {
            if (fs.existsSync(file)) fs.unlinkSync(file);
            return true;
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.error(`Lockfile ${file} does not exist.`);
                return false;
            };
            console.error('Error in CDN.unlock():', e);
            return false;
        };
    };

    get(name) {
        const file = this.getFilePath(name);
        try {
            const data = fs.readFileSync(file, 'utf8');
            try {
                return JSON.parse(data);
            } catch (e) {
                return data;
            };
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

    exists(name, isLock = false) {
        const file = this.getFilePath(name, isLock);
        try {
            const lockFile = fs.existsSync(file);
            if (lockFile) return true;
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.error(`${isLock ? 'Lockfile' : 'CDN file'} ${file} does not exist.`);
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

    allLocks() {
        try {
            const files = fs.readdirSync(this.lockDir);
            return files.filter(file => file.endsWith(this.lockExtension)).map(file => file.replace(this.lockExtension, ''));
        } catch (e) {
            console.error('Error in CDN.allLocks():', e);
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

    locked(name) {
        return this.exists(name, true);
    };

    unlocked(name) {
        return !this.valid(name);
    };

    locks() {
        return this.allLocks();
    };
};

module.exports = CDN;
