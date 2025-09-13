/**
 * Service Worker for BuildEase Construction Site Performance
 * Optimized for offline media component caching and poor network conditions
 */

const CACHE_VERSION = 'buildease-v1.0.0';
const MEDIA_CACHE = 'buildease-media-v1.0.0';
const COMPONENT_CACHE = 'buildease-components-v1.0.0';
const API_CACHE = 'buildease-api-v1.0.0';

// Cache strategies for construction sites
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Resources to cache immediately for offline functionality
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/buildease-logo-1.svg',
  '/buildease-logo-2.svg'
];

// Media component chunks to prioritize
const MEDIA_COMPONENT_PATTERNS = [
  /\/js\/media-components-.*\.js$/,
  /\/js\/media-services-.*\.js$/,
  /\/js\/virtualization-vendor-.*\.js$/,
  /\/js\/upload-components-.*\.js$/
];

// API endpoints to cache for construction site offline functionality
const CACHEABLE_API_PATTERNS = [
  /\/api\/projects\/\w+$/,
  /\/api\/projects\/\w+\/media$/,
  /\/api\/projects\/\w+\/documents$/
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(CACHE_VERSION).then((cache) => {
        console.log('[ServiceWorker] Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES.map(url => new Request(url, { 
          cache: 'reload' // Bypass cache to ensure fresh resources
        })));
      }),
      
      // Initialize media and component caches
      caches.open(MEDIA_CACHE),
      caches.open(COMPONENT_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('[ServiceWorker] Installation complete');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('buildease-') && 
              ![CACHE_VERSION, MEDIA_CACHE, COMPONENT_CACHE, API_CACHE].includes(cacheName)
            )
            .map(cacheName => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[ServiceWorker] Activation complete');
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on request type
  if (isMediaComponentRequest(request)) {
    event.respondWith(handleMediaComponentRequest(request));
  } else if (isMediaAssetRequest(request)) {
    event.respondWith(handleMediaAssetRequest(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAssetRequest(request)) {
    event.respondWith(handleStaticAssetRequest(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

// Check if request is for media components
function isMediaComponentRequest(request) {
  return MEDIA_COMPONENT_PATTERNS.some(pattern => pattern.test(request.url));
}

// Check if request is for media assets (images, videos, documents)
function isMediaAssetRequest(request) {
  const url = new URL(request.url);
  return /\.(jpg|jpeg|png|gif|webp|mp4|pdf|doc|docx)$/i.test(url.pathname) ||
         url.pathname.includes('/storage/') ||
         url.hostname.includes('supabase');
}

// Check if request is for API endpoints
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         CACHEABLE_API_PATTERNS.some(pattern => pattern.test(request.url));
}

// Check if request is for static assets
function isStaticAssetRequest(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

// Handle media component requests - Cache First for performance
async function handleMediaComponentRequest(request) {
  console.log('[ServiceWorker] Media component request:', request.url);
  
  try {
    const cache = await caches.open(COMPONENT_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[ServiceWorker] Serving media component from cache');
      // Serve from cache, but update in background
      updateCacheInBackground(cache, request);
      return cachedResponse;
    }
    
    // Not in cache, fetch and cache
    const response = await fetchWithRetry(request, 3);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
    
  } catch (error) {
    console.error('[ServiceWorker] Media component request failed:', error);
    return createOfflineResponse('Media component unavailable offline');
  }
}

// Handle media asset requests - Stale While Revalidate
async function handleMediaAssetRequest(request) {
  console.log('[ServiceWorker] Media asset request:', request.url);
  
  try {
    const cache = await caches.open(MEDIA_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Always serve from cache if available
    if (cachedResponse) {
      console.log('[ServiceWorker] Serving media asset from cache');
      // Update in background for construction site efficiency
      updateCacheInBackground(cache, request);
      return cachedResponse;
    }
    
    // Not in cache, fetch with construction site optimizations
    const response = await fetchWithConstructionSiteOptimizations(request);
    if (response && response.status === 200) {
      // Cache successful responses
      cache.put(request, response.clone());
    }
    return response;
    
  } catch (error) {
    console.error('[ServiceWorker] Media asset request failed:', error);
    return createMediaFallbackResponse(request);
  }
}

// Handle API requests - Network First with fallback
async function handleAPIRequest(request) {
  console.log('[ServiceWorker] API request:', request.url);
  
  try {
    // Try network first for fresh data
    const response = await fetchWithTimeout(request, 5000);
    
    if (response && response.status === 200) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
    
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', error);
    
    // Fallback to cache
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[ServiceWorker] Serving API response from cache');
      return cachedResponse;
    }
    
    // No cache available, return offline response
    return createOfflineAPIResponse(request);
  }
}

// Handle static asset requests - Cache First
async function handleStaticAssetRequest(request) {
  try {
    const cache = await caches.open(CACHE_VERSION);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
    
  } catch (error) {
    console.error('[ServiceWorker] Static asset request failed:', error);
    return new Response('Asset unavailable', { status: 404 });
  }
}

// Handle generic requests
async function handleGenericRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[ServiceWorker] Generic request failed:', error);
    return new Response('Request failed', { status: 500 });
  }
}

// Utility: Fetch with retry for construction site reliability
async function fetchWithRetry(request, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.log(`[ServiceWorker] Fetch attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      } else {
        throw error;
      }
    }
  }
}

// Utility: Fetch with timeout
async function fetchWithTimeout(request, timeout = 5000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

// Utility: Construction site optimized fetch
async function fetchWithConstructionSiteOptimizations(request) {
  // Check connection quality and adjust request accordingly
  if ('connection' in navigator) {
    const connection = navigator.connection;
    if (connection && connection.effectiveType === 'slow-2g') {
      // On very slow connections, try to get compressed version
      const modifiedRequest = new Request(request.url, {
        ...request,
        headers: {
          ...request.headers,
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });
      return fetchWithRetry(modifiedRequest, 2, 2000);
    }
  }
  
  return fetchWithRetry(request);
}

// Utility: Update cache in background
async function updateCacheInBackground(cache, request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      await cache.put(request, response);
      console.log('[ServiceWorker] Background cache update completed');
    }
  } catch (error) {
    console.log('[ServiceWorker] Background cache update failed:', error);
  }
}

// Utility: Create offline response
function createOfflineResponse(message) {
  return new Response(
    JSON.stringify({
      error: 'offline',
      message: message,
      timestamp: Date.now()
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Utility: Create media fallback response
function createMediaFallbackResponse(request) {
  const url = new URL(request.url);
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url.pathname);
  
  if (isImage) {
    // Return placeholder image for failed image loads
    return new Response(
      '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="200" height="150" fill="#f3f4f6"/>' +
      '<text x="100" y="75" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="14">' +
      'Image unavailable offline' +
      '</text></svg>',
      {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
  
  return createOfflineResponse('Media unavailable offline');
}

// Utility: Create offline API response
function createOfflineAPIResponse(request) {
  const url = new URL(request.url);
  
  // Provide basic offline responses for common endpoints
  if (url.pathname.includes('/projects')) {
    return new Response(
      JSON.stringify({
        offline: true,
        message: 'Project data unavailable offline',
        cachedAt: Date.now()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return createOfflineResponse('API unavailable offline');
}

// Message handling for cache management from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'CLEAR_CACHE':
      handleClearCache(payload.cacheNames || []);
      break;
    case 'PRELOAD_MEDIA_COMPONENTS':
      handlePreloadMediaComponents(payload.urls || []);
      break;
    case 'GET_CACHE_STATUS':
      handleGetCacheStatus().then(status => {
        try {
          if (event.ports[0]) {
            event.ports[0].postMessage(status);
          } else {
            console.log('[ServiceWorker] Cache status ready:', status);
          }
        } catch (error) {
          console.warn('[ServiceWorker] Failed to send cache status:', error);
        }
      }).catch(error => {
        console.error('[ServiceWorker] Failed to get cache status:', error);
      });
      break;
  }
});

// Handle cache clearing
async function handleClearCache(cacheNames) {
  try {
    const results = await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    console.log('[ServiceWorker] Caches cleared:', results);
  } catch (error) {
    console.error('[ServiceWorker] Cache clearing failed:', error);
  }
}

// Handle media component preloading
async function handlePreloadMediaComponents(urls) {
  try {
    const cache = await caches.open(COMPONENT_CACHE);
    const preloadPromises = urls.map(url => 
      fetch(url).then(response => {
        if (response.ok) {
          return cache.put(url, response);
        }
      }).catch(error => {
        console.warn('[ServiceWorker] Preload failed for:', url, error);
      })
    );
    
    await Promise.all(preloadPromises);
    console.log('[ServiceWorker] Media components preloaded');
  } catch (error) {
    console.error('[ServiceWorker] Preloading failed:', error);
  }
}

// Handle cache status request
async function handleGetCacheStatus() {
  try {
    const [mainCache, mediaCache, componentCache, apiCache] = await Promise.all([
      caches.open(CACHE_VERSION),
      caches.open(MEDIA_CACHE),
      caches.open(COMPONENT_CACHE),
      caches.open(API_CACHE)
    ]);
    
    const [mainKeys, mediaKeys, componentKeys, apiKeys] = await Promise.all([
      mainCache.keys(),
      mediaCache.keys(),
      componentCache.keys(),
      apiCache.keys()
    ]);
    
    return {
      version: CACHE_VERSION,
      caches: {
        main: { count: mainKeys.length, size: await getCacheSize(mainCache) },
        media: { count: mediaKeys.length, size: await getCacheSize(mediaCache) },
        components: { count: componentKeys.length, size: await getCacheSize(componentCache) },
        api: { count: apiKeys.length, size: await getCacheSize(apiCache) }
      },
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('[ServiceWorker] Cache status failed:', error);
    return { error: error.message };
  }
}

// Utility: Get approximate cache size
async function getCacheSize(cache) {
  try {
    const keys = await cache.keys();
    let totalSize = 0;
    
    // Sample first 10 items to estimate size
    const sampleKeys = keys.slice(0, Math.min(10, keys.length));
    
    for (const key of sampleKeys) {
      const response = await cache.match(key);
      if (response && response.body) {
        const arrayBuffer = await response.clone().arrayBuffer();
        totalSize += arrayBuffer.byteLength;
      }
    }
    
    // Estimate total size based on sample
    const averageSize = totalSize / sampleKeys.length;
    return Math.round(averageSize * keys.length);
  } catch (error) {
    console.warn('[ServiceWorker] Cache size estimation failed:', error);
    return 0;
  }
}

console.log('[ServiceWorker] BuildEase Service Worker loaded');