// Nombre del caché y lista de activos que queremos almacenar en caché
const cacheName = 'todo-cache-v1';
const assets = [
    './', // Página de inicio
    './index.html', // Archivo HTML principal
    './style.css', // Estilos
    './app.js', // Archivo JavaScript principal
    './manifest.json', // Archivo de manifiesto de la aplicación
    './images/icon-192.png', // Icono de 192px para dispositivos
    './images/icon-512.png' // Icono de 512px para dispositivos
];

// Evento de instalación: ocurre la primera vez que el Service Worker se registra
self.addEventListener('install', e => {
    // Espera hasta que todos los archivos estén en caché antes de completar la instalación
    e.waitUntil(
        caches.open(cacheName) // Abro (o creo) el caché con el nombre especificado
            .then(cache => {
                // Agrego todos los archivos en 'assets' al caché
                return cache.addAll(assets);
            })
            .then(() => self.skipWaiting()) // Fuerza al SW a activarse inmediatamente después de instalarse
            .catch(err => console.log('Falló registro de caché', err)) // Log de errores en caso de que falle
    );
});

// Evento de activación: se ejecuta después de que el SW se instala y toma el control de la aplicación
self.addEventListener('activate', e => {
    // Lista de cachés permitidos (whitelist) que queremos conservar
    const cacheWhitelist = [cacheName];

    // Elimina cachés antiguos que no están en la lista de permitidos
    e.waitUntil(
        caches.keys() // Obtiene todos los nombres de cachés actuales
            .then(cacheNames => {
                // Mapea y elimina cachés que no están en la whitelist
                return Promise.all(
                    cacheNames.map(cache => {
                        if (!cacheWhitelist.includes(cache)) {
                            return caches.delete(cache); // Elimina el caché obsoleto
                        }
                    })
                );
            })
            // Toma el control de los clientes inmediatamente después de activarse
            .then(() => self.clients.claim())
    );
});

// Evento 'fetch': intercepta las solicitudes de red y decide cómo responder
self.addEventListener('fetch', e => {
    // Responde con el recurso en caché o realiza una solicitud de red si no está en caché
    e.respondWith(
        caches.match(e.request) // Verifica si el recurso solicitado está en caché
            .then(res => {
                if (res) {
                    // Si el recurso está en caché, se devuelve desde ahí
                    return res;
                }
                // Si el recurso no está en caché, realiza una solicitud de red
                return fetch(e.request);
            })
    );
});
