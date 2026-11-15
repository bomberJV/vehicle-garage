// Fit the enlarged section mesh into the closed bonnet while preserving more
// of the oil-pan depth below the crank axis. The axial datum meets the gearbox.
export const m54EngineX=-2.725/2+.19;

export function m54InstalledHeight(x,z){
 const verticalScale=z < 0 ? .95 : .64;
 return .480+.020*(x-.49)+z*verticalScale;
}

export function m54InstalledPoint([x,y,z]){
 return [m54EngineX+x,y,m54InstalledHeight(x,z)];
}
