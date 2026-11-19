// Fizik çözücüsünü ve delik dünyalarını Node'da çalışacak tek dosyaya derler (deneme ve arama için).
// Kullanım: node scripts/derle-fizik.mjs <çıktı.mjs>
import { build } from 'esbuild';
const cikti = process.argv[2] ?? '/tmp/minigolf-fizik.mjs';
await build({
  stdin: {
    contents: `export * from './src/oyun/fizik'; export * from './src/oyun/dunya'; export * from './src/oyun/ayarlar'; export * from './src/maket/ornekDelikler'; export { MODEL } from './src/maket/olculer';`,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: cikti,
  logLevel: 'warning',
});
console.log(cikti);
