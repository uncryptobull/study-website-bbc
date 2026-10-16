import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'production-privacy-policy',
      apply: 'build',
      transformIndexHtml() {
        return [
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content: [
                "default-src 'none'",
                "script-src 'unsafe-inline'",
                "style-src 'unsafe-inline'",
                'font-src data:',
                'img-src data: blob:',
                "connect-src 'none'",
                "frame-src 'none'",
                "object-src 'none'",
                "base-uri 'none'",
                "form-action 'none'",
              ].join('; '),
            },
            injectTo: 'head-prepend',
          },
        ];
      },
    },
  ],
});
