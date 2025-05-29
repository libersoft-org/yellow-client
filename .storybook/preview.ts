import type { Preview } from '@storybook/svelte';
import '../static/app.css';

const preview: Preview = {
 parameters: {
  controls: {
   matchers: {
    color: /(background|color)$/i,
    date: /Date$/i,
   },
  },
  viewport: {
   viewports: {
    messageList: {
     name: 'messageList 500px',
     styles: { width: '500px', height: '600px' },
     type: 'desktop',
    },
   },
  },
 },
};

export default preview;
