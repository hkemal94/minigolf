import { m, seciliDil } from '../metinler';

// Ölçüyü seçili dilin sayı yazımıyla metre olarak yazar (6,25 m).
export const metre = (n: number) => m('maket.sema.metre', n.toLocaleString(seciliDil(), { maximumFractionDigits: 2 }));
