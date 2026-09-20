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
            fog: '#cbe6ff',
            background: '#a6d4fa',
            ambient: '#ffe8cc', // Warm sun
            directional: { color: '#ffffff', intensity: 2.0, position: [10, 20, -50] },
            gradientTop: '#7ebcff',
            gradientBottom: '#ffd5a3',
            // Colorful daydream-sky accents: sunset clouds + drifting petals
            cloudTint: '#ffb8c9',
            accents: ['#ff8fb3', '#ffb46b', '#7fd7ff', '#ffd94d', '#b79bff'],
        },
        density: 'high'
    },
    contact: {
        id: 'contact',
        palette: {
            fog: '#22344c',
            background: '#182740',
            ambient: '#33445e', // lifted so dusk colors read
            directional: { color: '#ff9a55', intensity: 3.0, position: [-20, 5, -20] }, // Sunset light
            gradientTop: '#122036',
            gradientBottom: '#ff9a55', // coastal peach dusk
            // Warm lighthouse + firefly accents over the dusk sea
            accents: ['#ffb46b', '#ffd94d', '#ff9a55', '#7fd7ff', '#ff8fb3'],
            beam: '#ffd27a',
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
            gradientTop: '#ff8fb0',
            gradientBottom: '#fff0d9',
            // Candy confetti / celebration accents
            accents: ['#ff5d8f', '#ffb46b', '#ffd94d', '#6fd3ff', '#a58bff', '#7fe0b2'],
        },
        density: 'high'
    },
    studio: {
        id: 'studio',
        palette: {
            fog: '#140a2b',
            background: '#0d0620',
            ambient: '#2e1c5c', // lifted deep violet so neon accents read
            directional: { color: '#7d5cff', intensity: 1.8, position: [10, 10, 10] }, // Cyberpunk/Nightlight directional
            gradientTop: '#180d33',
            gradientBottom: '#4a2a7d', // vivid dark violet
            // Neon firefly accents
            accents: ['#8b5cff', '#ff5d8f', '#4dd8ff', '#ffd94d', '#6bffb8'],
        },
        density: 'high'
    }
};

export const getRoomTheme = (roomId) => ROOM_THEMES[roomId] || ROOM_THEMES.hallway;
