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

    async cache(name, object) {
        const file = this.getFilePath(name);
        try {
            const json = JSON.stringify(object);
            await fs.promises.mkdir(path.dirname(file), { recursive: true });
            await fs.promises.writeFile(file, json);
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

    async lock(name, content) {
        const file = this.getFilePath(name, true);
        try {
            await fs.promises.mkdir(path.dirname(file), { recursive: true });
            await fs.promises.writeFile(file, content || 'locked', { flag: 'wx' });
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

    async delete(name) {
        const file = this.getFilePath(name);
        try {
            await fs.promises.unlink(file);
            return true;
        } catch (e) {
            if (e.code === 'ENOENT') {
                return true;
            };
            console.error('Error in CDN.delete():', e);
            return false;
        };
    };

    async unlock(name) {
        const file = this.getFilePath(name, true);
        try {
            await fs.promises.unlink(file);
            return true;
        } catch (e) {
            if (e.code === 'ENOENT') {
                return true;
            };
            console.error('Error in CDN.unlock():', e);
            return false;
        };
    };

    async get(name) {
        const file = this.getFilePath(name);
        try {
            const data = await fs.promises.readFile(file, 'utf8');
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

    async valid(name, ttl) {
        ttl = (typeof ttl === 'number') ? ttl : this.ttl;
        const file = this.getFilePath(name);
        try {
            const stats = await fs.promises.stat(file);
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

    async exists(name, isLock = false) {
        const file = this.getFilePath(name, isLock);
        try {
            await fs.promises.access(file);
            return true;
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.error(`${isLock ? 'Lockfile' : 'CDN file'} ${file} does not exist.`);
                return false;
            };
            console.error('Error in CDN.valid():', e);
            return false;
        };
    };

    async all() {
        try {
            const files = await fs.promises.readdir(this.dir);
            return files.filter(file => file.endsWith(this.extension)).map(file => file.replace(this.extension, ''));
        } catch (e) {
            console.error('Error in CDN.all():', e);
            return [];
        };
    };

    async allLocks() {
        try {
            const files = await fs.promises.readdir(this.lockDir);
            return files.filter(file => file.endsWith(this.lockExtension)).map(file => file.replace(this.lockExtension, ''));
        } catch (e) {
            console.error('Error in CDN.allLocks():', e);
            return [];
        };
    };

    async push(name, object) {
        return this.cache(name, object);
    };

    async set(name, object) {
        return this.cache(name, object);
    };

    async put(name, object) {
        return this.cache(name, object);
    };

    async update(name, object) {
        return this.cache(name, object);
    };

    async upd(name, object) {
        return this.cache(name, object);
    };

    async del(name) {
        return this.delete(name);
    };

    async remove(name) {
        return this.delete(name);
    };

    async rem(name) {
        return this.delete(name);
    };

    async pull(name) {
        return this.get(name);
    };

    async contents(name) {
        return this.get(name);
    };

    async locked(name) {
        return this.exists(name, true);
    };

    async unlocked(name) {
        return !(await this.valid(name));
    };

    async locks() {
        return this.allLocks();
    };
};

module.exports = CDN;
