import { useEffect } from 'react';

/**
 * Disposes three.js resources (cloned textures, imperative materials,
 * geometries) when the component unmounts or when the resource identity
 * changes. This prevents GPU memory growth across segment mount/unmount
 * cycles in the infinite corridor.
 *
 * IMPORTANT: Only pass resources this component OWNS — i.e. textures you
 * `.clone()`d yourself, materials/geometries created imperatively in
 * useMemo/useRef. Never pass raw `useTexture()` results (they are shared,
 * cached module-level by drei and disposed copies would break other users).
 *
 * Usage:
 *   const tex = useMemo(() => src.clone(), [src]);
 *   useDispose(tex);
 */
export function useDispose(...resources) {
    useEffect(() => {
        return () => {
            resources.forEach((res) => {
                if (res && typeof res.dispose === 'function') {
                    res.dispose();
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, resources);
}

/**
 * Disposes a material together with its owned texture slots.
 * Use for materials whose maps were locally cloned/created — not shared
 * cache textures.
 */
export function useDisposeMaterials(...materials) {
    useEffect(() => {
        return () => {
            const slots = ['map', 'alphaMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'];
            materials.forEach((mat) => {
                if (!mat || typeof mat.dispose !== 'function') return;
                slots.forEach((slot) => {
                    // Only dispose maps that are NOT the same object as any
                    // still-alive source texture tracked elsewhere. Callers
                    // must ensure ownership.
                    if (mat[slot] && typeof mat[slot].dispose === 'function') {
                        mat[slot].dispose();
                    }
                });
                mat.dispose();
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, materials);
}

export default useDispose;
