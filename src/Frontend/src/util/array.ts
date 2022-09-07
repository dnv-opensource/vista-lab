
export function nthIndex(str: string, pat: string, n: number){
    let L = str.length, i= -1;
    while(n-- && i++ < L) {
        i = str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}
