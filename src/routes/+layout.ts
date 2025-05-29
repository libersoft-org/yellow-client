export const ssr = false;

let p: boolean;
try {
  p = !!process.env.TAURI;
} catch (e) {
  p = false;
}
export const prerender = p;
