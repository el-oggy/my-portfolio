import { useEffect, useRef } from 'react';
import { useScene } from '../context/SceneContext';

/**
 * useDocumentMeta — Dynamic Meta Tags & Virtual Routing (History API)
 * 
 * Updates the browser URL, page title, and meta description
 * whenever the user enters/exits a 3D room. Also handles the
 * browser back/forward buttons for seamless navigation.
 */

const SITE_URL = 'https://adarsh-vlsi.vercel.app';

const ROOM_META = {
    null: {
        path: '/',
        title: 'Adarsh Swarup Maharana — Embedded Systems · IoT · Electronics',
        description: 'Immersive 3D portfolio of Adarsh Swarup Maharana — embedded systems, IoT and electronics engineer. Explore microcontrollers, sensors, drones and firmware in a hand-drawn world.',
    },
    about: {
        path: '/about',
        title: 'About Me — Adarsh Swarup Maharana',
        description: 'Learn about Adarsh Swarup Maharana — an embedded systems and IoT engineer working with STM32, ESP32, sensors, drones and digital hardware design.',
    },
    gallery: {
        path: '/gallery',
        title: 'Projects Gallery — Adarsh Swarup Maharana',
        description: 'Browse verified hardware and firmware projects by Adarsh Swarup Maharana — hexacopter flight controllers, ZMK keyboard firmware, systolic arrays and more.',
    },
    studio: {
        path: '/studio',
        title: 'The Studio — Adarsh Swarup Maharana',
        description: 'Behind-the-scenes builds, experiments and write-ups displayed on floating monitors in an immersive 3D space.',
    },
    contact: {
        path: '/contact',
        title: 'Contact — Adarsh Swarup Maharana',
        description: 'Get in touch with Adarsh Swarup Maharana for embedded systems, IoT hardware design and robotics collaborations.',
    },
};

// Map URL paths back to room IDs for deep linking
const PATH_TO_ROOM = {
    '/': null,
    '/about': 'about',
    '/gallery': 'gallery',
    '/studio': 'studio',
    '/contact': 'contact',
};

/**
 * Returns the room ID that the initial URL points to (for deep linking).
 * Call this once at app startup to determine if we need to auto-teleport.
 */
export function getInitialRoomFromUrl() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    return PATH_TO_ROOM[path] !== undefined ? PATH_TO_ROOM[path] : null;
}

export function useDocumentMeta() {
    const { currentRoom, teleportTo, hasEntered, requestExit } = useScene();
    const isHandlingPopState = useRef(false);
    const lastPushedRoom = useRef(undefined); // Track what we last pushed to avoid duplicates

    // Update document meta and URL when room changes
    useEffect(() => {
        const roomKey = currentRoom === null ? 'null' : currentRoom;
        const meta = ROOM_META[roomKey] || ROOM_META['null'];

        // Update the page title
        document.title = meta.title;

        // Update meta description
        const descTag = document.querySelector('meta[name="description"]');
        if (descTag) {
            descTag.setAttribute('content', meta.description);
        }

        // Update OG meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', meta.title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', meta.description);

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `${SITE_URL}${meta.path}`);

        // Update canonical link to ensure virtual routes are correctly indexable as separate pages
        const canonicalTag = document.querySelector('link[rel="canonical"]');
        if (canonicalTag) {
            canonicalTag.setAttribute('href', `${SITE_URL}${meta.path}`);
        }

        // Push to browser history (only if not handling a popstate event and room actually changed)
        if (!isHandlingPopState.current && lastPushedRoom.current !== currentRoom) {
            // Use replaceState for the very first load, pushState for subsequent navigations
            if (lastPushedRoom.current === undefined) {
                window.history.replaceState({ room: currentRoom }, '', meta.path);
            } else {
                window.history.pushState({ room: currentRoom }, '', meta.path);
            }
            lastPushedRoom.current = currentRoom;
        }

        isHandlingPopState.current = false;
    }, [currentRoom]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopstate = (event) => {
            isHandlingPopState.current = true;
            const targetRoom = event.state?.room ?? null;
            lastPushedRoom.current = targetRoom;

            if (targetRoom === null) {
                // Going back to corridor — trigger the room exit flow so the
                // camera actually leaves (previously this only re-titled the
                // tab, leaving the user stuck inside the room).
                if (currentRoom) {
                    requestExit();
                }
                const meta = ROOM_META['null'];
                document.title = meta.title;
            } else if (hasEntered) {
                // Teleport to the target room
                teleportTo(targetRoom);
            }
        };

        window.addEventListener('popstate', handlePopstate);
        return () => window.removeEventListener('popstate', handlePopstate);
    }, [teleportTo, hasEntered, currentRoom, requestExit]);
}
