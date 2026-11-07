const CDN = require('./cdn.js');

describe('CDN Tests', () => {
    const cdn = new CDN({
        dir: './cdn/',
        extension: '.cdn.json',
        ttl: 3600,
    });

    test('Constructor', () => {
        expect(cdn.dir).toBe('./cdn/');
        expect(cdn.extension).toBe('.cdn.json');
        expect(cdn.ttl).toBe(3600);
    });

    test('Lock', async () => {
        expect(await cdn.lock('cms')).toBe(true);
    });

    async function cmsdata() { // Example fetching and caching CMS data
        if (await cdn.valid('cms')) return cdn.get('cms'); // Return cached CMS data if valid
        try {
            console.log('Writing...')
            await cdn.cache('cms', { 1: 2 }); // Cache the CMS data
            return { 1: 2 };
        } catch {
            try {
                return cdn.get('cms'); // Retrieve cached CMS data
            } catch {
                console.error('Failed to fetch CMS data and no cached data found.');
                return null;
            };
        };
    };

    test('Cache', async () => {
        var cms = await cmsdata();
        expect(cms).toEqual({ 1: 2 });
    });

    test('All', async () => {
        expect(await cdn.all()).toEqual(['cms']);
    });

    test('Get', async () => {
        var cms = await cmsdata();
        expect(cms).toEqual({ 1: 2 });
    });

    test('Valid', async () => {
        expect(await cdn.valid('cms')).toBe(true);
    });

    test('Delete', async () => {
        expect(await cdn.del('cms')).toBe(true);
        expect(await cdn.all()).toEqual([]);
    });

    test('Unlock', async () => {
        expect(await cdn.unlock('cms')).toBe(true);
        expect(await cdn.locks()).toEqual([]);
        expect(await cdn.unlocked('cms')).toBe(true);
    });
});

describe('Lock Tests', () => {
    const cdn = new CDN({
        lockDir: './locks/',
        lockExtension: '.lock',
    });

    test('Constructor', () => {
        expect(cdn.lockDir).toBe('./locks/');
        expect(cdn.lockExtension).toBe('.lock');
    });

    test('Lock', async () => {
        if (await cdn.locked('cms')) await cdn.unlock('cms');
        expect(await cdn.lock('cms')).toBe(true);
    });

    test('All Locks', async () => {
        expect(await cdn.allLocks()).toEqual(['cms']);
    });
});