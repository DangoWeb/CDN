# CDN

Cache Dango Web Solutions CMS data and built-in Soar CDN assets in your Node.js web app as JSON.

## Requirements

- Must be using Node.js v10.12 or higher.

## Usage

Include the `@dangoweb/cdn` package in your Express.js application:

```javascript
const CDN = require('@dangoweb/cdn');
const cdn = new CDN({
    dir: './cdn/',
    extension: '.cdn.json',
    ttl: 3600,
});

async function cmsdata() { // Example fetching and caching CMS data
    if (cdn.valid('cms')) return cdn.get('cms'); // Return cached CMS data if valid
    try {
        return await fetch(`...`, { }) // Given fetch function to fetch CMS data from Dango Web Solutions
            .then(res => res.json())
            .then(res => {
                var cmsData = JSON.parse(JSON.stringify(res.data).replaceAll('.spaces', 'clients'));
                console.log('Writing...');
                cdn.cache('cms', cmsData); // Cache the CMS data
                return cmsData;
            });
    } catch {
        try {
            return cdn.get('cms'); // Fall back to cached CMS data
        } catch {
            console.error('Failed to fetch CMS data and no cached data found.');
            return null;
        };
    };
};

async function startApp() {
    var cms = await cmsdata();
    console.log(cms);
};

startApp();
```

## Tests

Run tests using Jest:

```bash
npm test
```

## Credits

Original developed by [Komrod/local-cache](https://github.com/Komrod/local-cache)
