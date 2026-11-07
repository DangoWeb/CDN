const fs = require('fs');
const os = require('os');
const path = require('path');
const CDN = require('./cdn.js');

describe('CDN', () => {
    let root;
    let cdn;

    beforeEach(() => {
        root = fs.mkdtempSync(path.join(os.tmpdir(), 'cdn-test-'));
        cdn = new CDN({
            dir: path.join(root, 'cache'),
            lockDir: path.join(root, 'locks'),
            extension: '.data.json',
            lockExtension: '.lock',
            ttl: 3600,
        });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(async () => {
        console.error.mockRestore();
        if (fs.promises.rm) {
            await fs.promises.rm(root, { recursive: true, force: true });
        } else {
            await fs.promises.rmdir(root, { recursive: true });
        }
    });

    test('constructs with defaults and custom options', () => {
        const defaults = new CDN();
        expect(defaults.dir).toBe('./cdn/');
        expect(defaults.lockDir).toBe('./cdn/');
        expect(defaults.extension).toBe('.cdn.json');
        expect(defaults.lockExtension).toBe('.cdn.lock');
        expect(defaults.ttl).toBe(3600);

        expect(cdn.dir).toBe(path.join(root, 'cache'));
        expect(cdn.lockDir).toBe(path.join(root, 'locks'));
        expect(cdn.extension).toBe('.data.json');
        expect(cdn.lockExtension).toBe('.lock');
        expect(cdn.ttl).toBe(3600);
    });

    test('builds sanitized cache and lock paths', () => {
        expect(cdn.getFilePath('Hello, world!')).toBe(
            path.resolve(path.join(root, 'cache', 'Hello-world.data.json')),
        );
        expect(cdn.getFilePath('Hello, world!', true)).toBe(
            path.resolve(path.join(root, 'locks', 'Hello-world.lock')),
        );
    });

    test('caches and retrieves JSON data', async () => {
        expect(await cdn.cache('cms', { version: 2 })).toBe(true);
        expect(await cdn.get('cms')).toEqual({ version: 2 });
        expect(await cdn.exists('cms')).toBe(true);
    });

    test('retrieves non-JSON content as a string', async () => {
        await fs.promises.mkdir(cdn.dir, { recursive: true });
        await fs.promises.writeFile(cdn.getFilePath('text'), 'plain text');

        expect(await cdn.get('text')).toBe('plain text');
    });

    test('returns false for missing cache files', async () => {
        expect(await cdn.get('missing')).toBe(false);
        expect(await cdn.valid('missing')).toBe(false);
        expect(await cdn.exists('missing')).toBe(false);
    });

    test('checks cache validity using the default and supplied TTL', async () => {
        await cdn.cache('fresh', { ok: true });

        expect(await cdn.valid('fresh')).toBe(true);
        expect(await cdn.valid('fresh', -1)).toBe(false);
    });

    test('lists and deletes cache files', async () => {
        await cdn.cache('first', 1);
        await cdn.cache('second', 2);
        await fs.promises.writeFile(path.join(cdn.dir, 'ignored.txt'), 'ignored');

        expect((await cdn.all()).sort()).toEqual(['first', 'second']);
        expect(await cdn.delete('first')).toBe(true);
        expect(await cdn.all()).toEqual(['second']);
        expect(await cdn.delete('missing')).toBe(true);
    });

    test('creates, detects, lists, and removes lock files', async () => {
        expect(await cdn.lock('resource', 'busy')).toBe(true);
        expect(await cdn.locked('resource')).toBe(true);
        expect(await cdn.exists('resource', true)).toBe(true);
        expect(await cdn.lock('resource')).toBe(false);
        expect(await cdn.allLocks()).toEqual(['resource']);
        expect(await fs.promises.readFile(cdn.getFilePath('resource', true), 'utf8')).toBe('busy');

        expect(await cdn.unlock('resource')).toBe(true);
        expect(await cdn.locked('resource')).toBe(false);
        expect(await cdn.locks()).toEqual([]);
        expect(await cdn.unlock('resource')).toBe(true);
    });

    test('reports an absent cache as unlocked', async () => {
        expect(await cdn.unlocked('resource')).toBe(true);
    });

    test.each([
        ['push', 'push-value'],
        ['set', 'set-value'],
        ['put', 'put-value'],
        ['update', 'update-value'],
        ['upd', 'upd-value'],
    ])('%s aliases cache', async (method, value) => {
        expect(await cdn[method](method, value)).toBe(true);
        expect(await cdn.get(method)).toBe(value);
    });

    test.each([
        ['del', 'del-value'],
        ['remove', 'remove-value'],
        ['rem', 'rem-value'],
    ])('%s aliases delete', async (method, value) => {
        await cdn.cache(method, value);
        expect(await cdn[method](method)).toBe(true);
        expect(await cdn.exists(method)).toBe(false);
    });

    test.each([
        ['pull', 'pull-value'],
        ['contents', 'contents-value'],
    ])('%s aliases get', async (method, value) => {
        await cdn.cache(method, value);
        expect(await cdn[method](method)).toBe(value);
    });
});
