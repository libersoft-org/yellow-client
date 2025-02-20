export function longpress(node, threshold = 300) {
 const handle_mousedown = e => {
  let start = Date.now();
  node.dispatchEvent(new CustomEvent('mymousedown', { detail: e }));

  const timeout = setTimeout(() => {
   node.dispatchEvent(new CustomEvent('longpress', { detail: e }));
  }, threshold);

  const cancel = e => {
   clearTimeout(timeout);
   node.removeEventListener('mousemove', cancel);
   node.removeEventListener('mouseup', cancel);
   e.preventDefault();
   e.stopPropagation();
  };

  node.addEventListener('mousemove', cancel);
  node.addEventListener('mouseup', cancel);
  node.addEventListener('click', cancel);
 };

 node.addEventListener('mousedown', handle_mousedown);

 return {
  destroy() {
   node.removeEventListener('mousedown', handle_mousedown);
  },
 };
}
