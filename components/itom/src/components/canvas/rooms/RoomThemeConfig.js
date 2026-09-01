export const ROOM_THEMES = {
    hallway: {
        id: 'hallway',
        palette: {
            fog: '#fafafa',
            background: '#fafafa',
            ambient: '#ffffff'
        },
        density: 'normal'
    },
    about: {
        id: 'about',
        palette: {
            fog: '#bfe0ff',
            background: '#a6d4fa',
            ambient: '#ffe8cc', // Warm sun
            directional: { color: '#ffffff', intensity: 2.0, position: [10, 20, -50] },
            gradientTop: '#7ebcff',
            gradientBottom: '#ffd5a3'
        },
        density: 'high'
    },
    contact: {
        id: 'contact',
        palette: {
            fog: '#1a293d',
            background: '#131e2d',
            ambient: '#1a2233', // Slightly brighter ambient
            directional: { color: '#ff9a55', intensity: 3.0, position: [-20, 5, -20] }, // Sunset light
            gradientTop: '#0a101a',
            gradientBottom: '#ff9a55' // coastal peach dusk
        },
        density: 'normal'
    },
    gallery: {
        id: 'gallery',
        palette: {
            fog: '#ffe1ea',
            background: '#ffc2d4',
            ambient: '#ffffff', // Bright daylight
            directional: { color: '#fff0f5', intensity: 2.5, position: [0, 50, -20] }, // Sun from above
            gradientTop: '#ff9ebb',
            gradientBottom: '#ffe1ea'
        },
        density: 'high'
    },
    studio: {
        id: 'studio',
        palette: {
            fog: '#0a0514',
            background: '#07030f',
            ambient: '#1a103c', // Deep dark violet ambient
            directional: { color: '#6d4cff', intensity: 1.5, position: [10, 10, 10] }, // Cyberpunk/Nightlight directional
            gradientTop: '#100826',
            gradientBottom: '#2d1b4e' // dark violet
        },
        density: 'high'
    }
};

export const getRoomTheme = (roomId) => ROOM_THEMES[roomId] || ROOM_THEMES.hallway;
