import { useState, useEffect } from 'react';
import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// Asset manifest mapping roomId to required texture URLs.
// Populated with placeholders/future textures.
export const ROOM_ASSETS = {
    about: [
        // '/textures/about/sky_gradient.png',
        // '/textures/about/clouds.png'
    ],
    contact: [
        // '/textures/contact/water_normals.jpg'
    ],
    gallery: [
        // '/textures/gallery/concrete.jpg'
    ],
    studio: [
        // '/textures/studio/grid.png'
    ]
};

// Global cache to prevent re-fetching
const textureCache = new Map();

/**
 * Hook to asynchronously preload room assets in the background.
 * Prevents blocking the main hallway experience.
 */
export const useRoomAssets = (roomId) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!roomId || !ROOM_ASSETS[roomId]) {
            setIsReady(true);
            return;
        }

        const assetsToLoad = ROOM_ASSETS[roomId];
        
        if (assetsToLoad.length === 0) {
            setIsReady(true);
            return;
        }

        let isMounted = true;
        let loadedCount = 0;

        const checkReady = () => {
            if (loadedCount === assetsToLoad.length && isMounted) {
                setIsReady(true);
            }
        };

        assetsToLoad.forEach(url => {
            if (textureCache.has(url)) {
                loadedCount++;
                checkReady();
                return;
            }

            textureLoader.load(
                url,
                (texture) => {
                    textureCache.set(url, texture);
                    loadedCount++;
                    checkReady();
                },
                undefined,
                (err) => {
                    console.warn(`Failed to load texture: ${url}`, err);
                    loadedCount++; // Proceed anyway so we don't block forever
                    checkReady();
                }
            );
        });

        return () => {
            isMounted = false;
        };
    }, [roomId]);

    return { isReady, getTexture: (url) => textureCache.get(url) };
};
