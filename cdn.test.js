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

    async function cmsdata() { // Example fetching and caching CMS data
        if (cdn.valid('cms')) return cdn.get('cms'); // Return cached CMS data if valid
        try {
            console.log('Writing...')
            cdn.cache('cms', { 1: 2 }); // Cache the CMS data
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

    test('Get', async () => {
        var cms = await cmsdata();
        expect(cms).toEqual({ 1: 2 });
    });
});