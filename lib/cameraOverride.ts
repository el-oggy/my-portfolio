let overridden = false;

export function setCameraOverride(active: boolean) {
  overridden = active;
}

export function isCameraOverridden() {
  return overridden;
}
