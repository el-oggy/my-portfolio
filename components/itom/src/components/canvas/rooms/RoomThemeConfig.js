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
            ambient: '#0b131e',
            gradientTop: '#0a101a',
            gradientBottom: '#ff9a55' // coastal peach dusk
        },
        density: 'normal'
    },
    gallery: {
        id: 'gallery',
        palette: {
            fog: '#e6e8e6',
            background: '#d9dbd9',
            ambient: '#ffffff',
            gradientTop: '#b3c4d6',
            gradientBottom: '#e6e3df'
        },
        density: 'low'
    },
    studio: {
        id: 'studio',
        palette: {
            fog: '#0a0a14',
            background: '#05050a',
            ambient: '#1a1a2e',
            gradientTop: '#020205',
            gradientBottom: '#101026'
        },
        density: 'high'
    }
};

export const getRoomTheme = (roomId) => ROOM_THEMES[roomId] || ROOM_THEMES.hallway;
