// Trim variants share the base vehicle's geometry, systems and studies. Each
// keeps its own ID for saved builds, deep links and catalog text; code that
// draws shared hardware asks for the base vehicle instead.
export const VARIANT_BASE={hrvlx:'hrv'};
export const baseVehicle=id=>VARIANT_BASE[id]||id;
// Copy a base vehicle's entry in a keyed table to each of its variants, merging
// any per-variant overrides. Tables without a base entry are left alone.
export function withVariants(table,overrides={}){
 for(const [variant,base] of Object.entries(VARIANT_BASE))
  if(Object.hasOwn(table,base)&&!Object.hasOwn(table,variant))table[variant]=overrides[variant]?{...table[base],...overrides[variant]}:table[base];
 return table;
}
