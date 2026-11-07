# CDN

Cache local files and manage lockfiles in your Node.js web app.

## Requirements

- Must be using Node.js v10.12 or higher.

## CDN Usage

Include the `@dangoweb/cdn` package in your Express.js application:

```javascript
const CDN = require('@dangoweb/cdn');
const cdn = new CDN({
    dir: './cdn/',
    extension: '.cdn.json',
    ttl: 3600,
});

async function cmsdata() { // Example fetching and caching CMS data
    if (await cdn.valid('cms')) return cdn.get('cms'); // Return cached CMS data if valid
    try {
        const response = await fetch(`...`, { }); // Given fetch function
        const result = await response.json();
        const cmsData = JSON.parse(JSON.stringify(result.data).replaceAll('.spaces', 'clients'));
        console.log('Writing...');
        await cdn.cache('cms', cmsData); // Cache the CMS data
        return cmsData;
    } catch {
        try {
            return await cdn.get('cms'); // Fall back to cached CMS data
        } catch {
            console.error('Failed to fetch CMS data and no cached data found.');
            return null;
        };
    };
};

async function startApp() {
    let cms = await cmsdata();
    console.log(cms);
};

startApp();
```

## Lockfile Usage

Lockfiles can prevent multiple processes from using the same resource at the same time. A lock is created atomically, so a second call for the same resource returns `false` while the lock already exists. Always remove the lock when the work is complete, including in a `finally` block.

```javascript
async function updateResource() {
    const resource = 'resource';
    if (!await cdn.lock(resource)) return false;

    try {
        // Do something with the locked resource.
        return true;
    } finally {
        await cdn.unlock(resource);
    }
}

await updateResource();
```

`lock(name, content)` writes `content` to the lockfile, or `locked` when no content is provided. `locked(name)` checks whether the lockfile exists, `locks()` lists lock names, and `unlock(name)` removes a lock. `allLocks()` is the direct equivalent of `locks()`.

## Functions

All filesystem functions are asynchronous and return promises. Use `await` when calling them.

### Constructor

```javascript
const cdn = new CDN({
    dir: './cdn/',
    lockDir: './locks/',
    extension: '.cdn.json',
    lockExtension: '.cdn.lock',
    ttl: 3600,
});
```

### `getFilePath(name, isLock)`

Returns the absolute path for a cache or lockfile. This helper is synchronous.

```javascript
const cachePath = cdn.getFilePath('cms');
const lockPath = cdn.getFilePath('cms', true);
```

### `cache(name, object)`

Writes an object as JSON and returns `true` when it succeeds.

```javascript
await cdn.cache('cms', { title: 'Example' });
```

### `get(name)`

Reads a cache file, parsing JSON when possible. It returns raw text for non-JSON files and `false` when the file does not exist.

```javascript
const cms = await cdn.get('cms');
```

### `delete(name)`

Removes a cache file. It returns `true` when the file is removed or already absent.

```javascript
await cdn.delete('cms');
```

### `valid(name, ttl)`

Checks whether a cache file exists and was modified within `ttl` seconds. The configured `ttl` is used when no value is supplied.

```javascript
if (await cdn.valid('cms', 3600)) {
    const cms = await cdn.get('cms');
}
```

### `exists(name, isLock)`

Checks whether a cache or lockfile exists.

```javascript
const hasCache = await cdn.exists('cms');
const hasLock = await cdn.exists('cms', true);
```

### `all()`

Returns the names of all cache files in the configured cache directory.

```javascript
const names = await cdn.all();
```

### `lock(name, content)`

Creates a lockfile atomically. It returns `false` if the lock already exists.

```javascript
const acquired = await cdn.lock('cms', 'Updating CMS');
```

### `unlock(name)`

Removes a lockfile and returns `true` when it is removed or already absent.

```javascript
await cdn.unlock('cms');
```

### `allLocks()`

Returns the names of all lockfiles in the configured lock directory.

```javascript
const activeLocks = await cdn.allLocks();
```

### `locked(name)`

Checks whether a named lockfile exists.

```javascript
if (await cdn.locked('cms')) console.log('CMS is locked');
```

### `unlocked(name)`

Returns `true` when the named cache is missing or expired.

```javascript
if (await cdn.unlocked('cms')) console.log('Refresh the CMS cache');
```

### `locks()`

Alias for `allLocks()`.

```javascript
const activeLocks = await cdn.locks();
```

### Cache-writing aliases

`push`, `set`, `put`, `update`, and `upd` are aliases for `cache`.

```javascript
await cdn.push('cms', data);
await cdn.set('settings', settings);
await cdn.put('profile', profile);
await cdn.update('navigation', navigation);
await cdn.upd('summary', summary);
```

### Cache-deletion aliases

`del`, `remove`, and `rem` are aliases for `delete`.

```javascript
await cdn.del('cms');
await cdn.remove('settings');
await cdn.rem('profile');
```

### Cache-reading aliases

`pull` and `contents` are aliases for `get`.

```javascript
const cms = await cdn.pull('cms');
const settings = await cdn.contents('settings');
```



## Tests

Run tests using Jest:

```bash
npm test
```

## Credits

Original developed by [Komrod/local-cache](https://github.com/Komrod/local-cache)
