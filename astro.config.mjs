import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';

const matkladLight = {
  name: 'matklad-light',
  type: 'light',
  colors: {
    'editor.background': '#f5f5f5',
    'editor.foreground': 'rgba(0,0,0,0.9)',
  },
  tokenColors: [
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator'], settings: { foreground: '#000000', fontStyle: 'bold' } },
    { scope: ['entity.name.type', 'support.type', 'support.class', 'entity.name.class'], settings: { foreground: '#0086B3' } },
    { scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: '#d14' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#008000', fontStyle: 'italic' } },
    { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#009999' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#990000', fontStyle: 'bold' } },
    { scope: ['variable', 'identifier', 'entity.name.variable'], settings: { foreground: 'rgba(0,0,0,0.9)' } },
    { scope: ['entity.name.tag', 'support.tag'], settings: { foreground: '#000080' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#008080' } },
    { scope: ['meta.preprocessor', 'keyword.other'], settings: { foreground: '#3c5d5d', fontStyle: 'bold' } },
    { scope: ['constant.character', 'constant.other.symbol'], settings: { foreground: '#008080' } },
  ],
};

const processor = unified({
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [rehypeSlug, rehypeKatex],
});

export default defineConfig({
  outDir: './docs',
  site: 'https://YOUR-USERNAME.github.io',  // <-- change to your GitHub Pages URL or custom domain
  integrations: [mdx({ remarkPlugins: [remarkGfm, remarkMath], rehypePlugins: [rehypeSlug, rehypeKatex] }), sitemap()],
  markdown: {
    processor,
    shikiConfig: {
      themes: { light: matkladLight, dark: 'github-dark' },
      wrap: false,
    },
  },
});
