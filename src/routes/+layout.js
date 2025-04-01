export const ssr = false;

let p;
try {
 p = !!process.env.TAURI;
} catch (e) {
 p = false;
}
export const prerender = p;
