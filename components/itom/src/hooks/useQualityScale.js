import { usePerformance, TIERS } from '../context/PerformanceContext';

/**
 * useQualityScale — maps the current performance tier to a 0..1 multiplier so
 * decorative layers (particles, sparkles) can scale density without touching
 * the core scene. HIGH = full detail, MEDIUM = 60%, LOW = 30%.
 */
export const useQualityScale = () => {
    const { tier } = usePerformance();
    if (tier === TIERS.HIGH) return 1.0;
    if (tier === TIERS.LOW) return 0.3;
    return 0.6; // MEDIUM
};
