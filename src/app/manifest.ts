import type { MetadataRoute } from 'next'
import { basePath } from './env.config'

export default function manifest(): MetadataRoute.Manifest {
    return {
        "name": "Scan Shelf",
        "short_name": "ScanShelf",
        "description": "Simple EPub Reader with OCR scanning.",
        "icons": [
            {
                "src": `${basePath}/icons/icon-192x192.png`,
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": `${basePath}/icons/icon-512x512.png`,
                "sizes": "512x512",
                "type": "image/png"
            }
        ],
        "start_url": `${basePath}/`,
        "display": "standalone"
    }
}