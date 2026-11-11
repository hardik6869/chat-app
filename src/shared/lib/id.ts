/** Unique, collision-safe id. Optional prefix keeps ids readable in devtools (`msg_…`). */
export function createId(prefix?: string): string {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}
