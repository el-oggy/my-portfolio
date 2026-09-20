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
            fog: '#1a293d',
            background: '#131e2d',
            ambient: '#2a3a52', // lifted so dusk colors read
            directional: { color: '#ff9a55', intensity: 3.0, position: [-20, 5, -20] }, // Sunset light
            gradientTop: '#0a101a',
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
            gradientTop: '#ff9ebb',
            gradientBottom: '#ffe1ea',
            // Candy confetti / celebration accents
            accents: ['#ff5d8f', '#ffb46b', '#ffd94d', '#6fd3ff', '#a58bff', '#7fe0b2'],
        },
        density: 'high'
    },
    studio: {
        id: 'studio',
        palette: {
            fog: '#0a0514',
            background: '#07030f',
            ambient: '#241647', // lifted deep violet so neon accents read
            directional: { color: '#6d4cff', intensity: 1.5, position: [10, 10, 10] }, // Cyberpunk/Nightlight directional
            gradientTop: '#100826',
            gradientBottom: '#2d1b4e', // dark violet
            // Neon firefly accents
            accents: ['#8b5cff', '#ff5d8f', '#4dd8ff', '#ffd94d', '#6bffb8'],
        },
        density: 'high'
    }
};

export const getRoomTheme = (roomId) => ROOM_THEMES[roomId] || ROOM_THEMES.hallway;
