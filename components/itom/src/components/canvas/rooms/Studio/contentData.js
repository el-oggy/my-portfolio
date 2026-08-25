/**
 * Studio Content Data
 *
 * Content shown on the Studio monitor tower.
 * Each item is displayed on a monitor in the tower.
 *
 * Platforms map to device shapes:
 *   'youtube' → CRT TV   (featured hardware builds / projects)
 *   'blog'    → monitor  (build logs & write-ups)
 *   'tiktok'  → phone    (quick lab notes)
 */

export const PLATFORM_CONFIG = {
    youtube: {
        color: '#FF0000',
        accentColor: '#cc0000',
        icon: '⚡',
        label: 'Featured Build',
        shape: 'tv', // Wide CRT style
    },
    blog: {
        color: '#4A90D9',
        accentColor: '#2d6cb5',
        icon: '📝',
        label: 'Build Log',
        shape: 'monitor', // Thin desktop monitor
    },
    tiktok: {
        color: '#00F2EA',
        accentColor: '#FF0050',
        icon: '🔧',
        label: 'Lab Note',
        shape: 'phone', // Vertical phone
    },
};

const GITHUB_PROFILE = 'https://github.com/el-oggy';

// NOTE: frontTexture/paintedFrontTexture intentionally left null — the
// enrichment step below assigns the existing hand-drawn screen art per
// platform, keeping the room's visuals intact.
const RAW_CONTENT_DATA = [
    // ============ Featured Builds ============
    {
        id: 'fb-001',
        platform: 'youtube',
        title: 'STM32 Hexacopter Flight Controller',
        description: 'A complete six-rotor flight controller built from scratch around an STM32 MCU — custom KiCad PCB, MPU6500 IMU and GPS telemetry.',
        thumbnail: null,
        url: 'https://github.com/el-oggy/Drone-hexcoptor-',
        date: '2026-01-15',
    },
    {
        id: 'fb-002',
        platform: 'youtube',
        title: 'IoT Weather Monitoring Station',
        description: 'Solar-powered station streaming environmental telemetry — BME280, BH1750 and DS18B20 sensors on an ESP32.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-12-28',
    },
    {
        id: 'fb-003',
        platform: 'youtube',
        title: 'ZMK Custom Keyboard Firmware',
        description: 'Zephyr-based ZMK keymap and configuration for a wireless split keyboard, wired up with GitHub Actions CI.',
        thumbnail: null,
        url: 'https://github.com/el-oggy/zmk-config',
        date: '2025-12-14',
    },
    {
        id: 'fb-004',
        platform: 'youtube',
        title: 'FlowOS — Offline-First Dashboard',
        description: 'A modular vanilla-JS productivity dashboard with IndexedDB persistence. No frameworks, no network required.',
        thumbnail: null,
        url: 'https://github.com/el-oggy/PersonalDashboard',
        date: '2025-11-30',
    },
    {
        id: 'fb-005',
        platform: 'youtube',
        title: '2D Systolic Array for INT8 Matrix Multiply',
        description: 'Hardware accelerator in Verilog — a systolic PE array for parallel matrix multiplication aimed at neural compute.',
        thumbnail: null,
        url: 'https://github.com/el-oggy/2D-systolic-array-',
        date: '2025-11-16',
    },
    {
        id: 'fb-006',
        platform: 'youtube',
        title: 'Home Automation & Smart Staircase Lighting',
        description: 'Blynk-controlled relays and motion-aware staircase lighting built on commodity hardware.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-10-22',
    },
    {
        id: 'fb-007',
        platform: 'youtube',
        title: 'This Interactive 3D Portfolio',
        description: 'An infinite hand-drawn corridor built with react-three-fiber — teleporting rooms, paint-reveal shaders and spatial audio.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-10-05',
    },
    {
        id: 'fb-008',
        platform: 'youtube',
        title: 'RTL → GDS-II VLSI Design Flow',
        description: 'Synthesis-to-layout practice with industry EDA tools during a VLSI design internship.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-09-18',
    },

    // ============ Build Logs ============
    {
        id: 'bl-001',
        platform: 'blog',
        title: 'Designing a Hexacopter Power Distribution PCB',
        description: 'Routing high-current paths, decoupling and brown-out safety in KiCad for a six-rotor build.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2026-01-08',
    },
    {
        id: 'bl-002',
        platform: 'blog',
        title: 'Calibrating the MPU6500 for Stable Flight',
        description: 'Gyro bias estimation, accel alignment and why your first PID tune will always be wrong.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-12-20',
    },
    {
        id: 'bl-003',
        platform: 'blog',
        title: 'GPS Telemetry over UART on STM32',
        description: 'Parsing NMEA sentences with DMA-backed ring buffers without starving the control loop.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-12-06',
    },
    {
        id: 'bl-004',
        platform: 'blog',
        title: 'CI for Embedded Firmware with GitHub Actions',
        description: 'Building Zephyr images in the cloud and flashing reports back into PRs.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-11-21',
    },
    {
        id: 'bl-005',
        platform: 'blog',
        title: 'Solar Power Budgeting for a Remote Station',
        description: 'Panel sizing, battery chemistry and duty-cycling a weather node through monsoon season.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-11-02',
    },
    {
        id: 'bl-006',
        platform: 'blog',
        title: 'From Breadboard to Custom PCB',
        description: 'Lessons learned moving sensor nodes from jumper wires to fabricated boards.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-10-12',
    },
    {
        id: 'bl-007',
        platform: 'blog',
        title: 'ZMK Keymap Layering That Sticks',
        description: 'Designing home-row mods and layers you can actually remember.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-09-27',
    },
    {
        id: 'bl-008',
        platform: 'blog',
        title: 'Verifying an INT8 Systolic Array',
        description: 'Testbenches, golden vectors and waveform triage for a Verilog PE array.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-09-10',
    },

    // ============ Lab Notes ============
    {
        id: 'ln-001',
        platform: 'tiktok',
        title: 'Why I²C needs pull-ups 📈',
        description: 'Open-drain lines explained in one sketch.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2026-01-05',
    },
    {
        id: 'ln-002',
        platform: 'tiktok',
        title: 'ESP32 vs STM32 — how I choose ⚖️',
        description: 'Radio features vs hard-real-time control.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-12-30',
    },
    {
        id: 'ln-003',
        platform: 'tiktok',
        title: 'Reading the BME280 over I²C 🌡️',
        description: 'Compensation formulas aren\'t optional.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-12-22',
    },
    {
        id: 'ln-004',
        platform: 'tiktok',
        title: 'Debouncing GPIO interrupts ⏱️',
        description: 'Software vs RC vs dedicated ICs.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-12-13',
    },
    {
        id: 'ln-005',
        platform: 'tiktok',
        title: 'PWM basics for motor control 🌀',
        description: 'Frequency trade-offs, dead-time and whine.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-12-02',
    },
    {
        id: 'ln-006',
        platform: 'tiktok',
        title: 'What is a systolic array? 🧮',
        description: 'Data flows like blood through muscle.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-11-19',
    },
    {
        id: 'ln-007',
        platform: 'tiktok',
        title: 'Zephyr west workspaces 101 🐙',
        description: 'Manifests, modules and reproducible builds.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-11-07',
    },
    {
        id: 'ln-008',
        platform: 'tiktok',
        title: 'Debugging UART with a logic analyzer 🔍',
        description: 'Baud mistakes visible in seconds.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-10-24',
    },
    {
        id: 'ln-009',
        platform: 'tiktok',
        title: 'ADC sampling done right 🎚️',
        description: 'Reference stability, sampling time, averaging.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-10-09',
    },
    {
        id: 'ln-010',
        platform: 'tiktok',
        title: 'Watchdog timers save lives 🐕',
        description: 'Your firmware will hang. Plan for it.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-09-25',
    },
    {
        id: 'ln-011',
        platform: 'tiktok',
        title: 'KiCad footprints that actually fit 📦',
        description: 'Courtyards, fab tolerances and rework space.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-09-12',
    },
    {
        id: 'ln-012',
        platform: 'tiktok',
        title: 'Battery chemistry cheat sheet 🔋',
        description: 'LiPo vs Li-ion vs NiMH for field nodes.',
        thumbnail: null,
        url: GITHUB_PROFILE,
        date: '2025-08-29',
    },
];

const ytTextures = ['/textures/studio/tvfront_filmikprojektdlamultiego.webp', '/textures/studio/tvfront_filmikedytowaniezdjec.webp'];
const ytPaintedTextures = ['/textures/studio/tvfront_filmikprojektdlamultiego_painted.webp', '/textures/studio/tvfront_filmikedytowaniezdjec_painted.webp'];
const blogTextures = ['/textures/studio/monitorfront_postnafbdoublewinner.webp'];
const blogPaintedTextures = ['/textures/studio/monitorfront_postnafbdoublewinner_painted.webp'];
const ttTextures = ['/textures/studio/phonefront_followmeontiktok.webp'];
const ttPaintedTextures = ['/textures/studio/phonefront_followmeontiktok_painted.webp'];

let ytIdx = 0, blogIdx = 0, ttIdx = 0;
let ytPIdx = 0, blogPIdx = 0, ttPIdx = 0;

export const CONTENT_DATA = RAW_CONTENT_DATA.map((item) => {
    return {
        ...item,
        frontTexture: item.frontTexture || (
            item.platform === 'youtube' ? ytTextures[ytIdx++ % ytTextures.length] :
                item.platform === 'blog' ? blogTextures[blogIdx++ % blogTextures.length] :
                    ttTextures[ttIdx++ % ttTextures.length]
        ),
        paintedFrontTexture: item.paintedFrontTexture || (
            item.platform === 'youtube' ? ytPaintedTextures[ytPIdx++ % ytPaintedTextures.length] :
                item.platform === 'blog' ? blogPaintedTextures[blogPIdx++ % blogPaintedTextures.length] :
                    ttPaintedTextures[ttPIdx++ % ttPaintedTextures.length]
        )
    };
});

// Helper to get content by platform
export const getContentByPlatform = (platform) => {
    if (platform === 'all') return CONTENT_DATA;
    return CONTENT_DATA.filter(item => item.platform === platform);
};

// Get latest content (for "On Air" indicator)
export const getLatestContent = () => {
    return [...CONTENT_DATA].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};
