importScripts('/src/js/idb.js');
importScripts('/src/js/db.js');

const CURRENT_STATIC_CACHE = 'static-v4';
const CURRENT_DYNAMIC_CACHE = 'dynamic-v4';
const STATIC_FILES = [
    '/',
    '/index.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/material.min.js',
    '/src/js/idb.js',
    // '/src/js/db.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/htw.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://code.getmdl.io/1.3.0/material.blue_grey-red.min.css'
];

self.addEventListener('install', event => { 
    console.log('service worker --> installing ...', event);
    event.waitUntil(
        caches.open(CURRENT_STATIC_CACHE)
            .then( cache => {
                console.log('Service-Worker-Cache erzeugt und offen');
                cache.addAll(STATIC_FILES);
            })
    );
})

const db2 = idb.openDB('posts-store', 1, {
    upgrade(db2) {
        // Create a store of objects
        const store = db2.createObjectStore('posts', {
            // The 'id' property of the object will be the key.
            keyPath: 'id',
            // If it isn't explicitly set, create a value by auto incrementing.
            autoIncrement: true,
        });
        // Create an index on the 'id' property of the objects.
        store.createIndex('id', 'id');
    },
});

self.addEventListener('activate', event => {
    console.log('service worker --> activating ...', event);
    event.waitUntil(
        caches.keys()
            .then( keyList => {
                return Promise.all(keyList.map( key => {
                    if(key !== CURRENT_STATIC_CACHE && key !== CURRENT_DYNAMIC_CACHE) {
                        console.log('service worker --> old cache removed :', key);
                        return caches.delete(key);
                    }
                }))
            })
    );
    return self.clients.claim();
})

self.addEventListener('fetch', event => {
    // check if request is made by chrome extensions or web page
    // if request is made for web page url must contains http.
    if (!(event.request.url.indexOf('http') === 0)) return;// skip the request if request is not made with http protocol

    const url = 'http://localhost:3000/posts';
    if(event.request.url.indexOf(url) >= 0) {
        event.respondWith(
            fetch(event.request)
                .then ( res => {
                    // hier Anfrage an http://localhost:3000/posts behandeln
                    const clonedResponse = res.clone();
                    clearAllData('posts')
                    .then( () => {
                        return clonedResponse.json();
                    })
                    .then( data => {
                        for(let key in data)
                        {
                            console.log('write data', data[key]);
                            writeData('posts', data[key]);
                            //nur zum Testen
                            if(data[key].id === 9) deleteOneData('posts', 5);
                        }
                    });
                    return res;
                })
        )
    } else {
    event.respondWith(
        caches.match(event.request)
            .then( response => {
                if(response) {
                    return response;
                } else {
                    return fetch(event.request)
                    .then(res => {
                        return caches.open(CURRENT_DYNAMIC_CACHE)
                        .then( cache => {
                            cache.put(event.request.url, res.clone());
                            return res;
                        })
                    });
            }
        })
    )}
    
})


