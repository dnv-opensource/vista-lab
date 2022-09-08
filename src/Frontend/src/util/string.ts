import { ImoNumber } from 'dnv-vista-sdk';
import { InputTypes } from '../components/ui/input/Input';

export const isNullOrWhitespace = (s?: InputTypes) => {
  return s === undefined || (typeof s === 'string' && s.trim() === '');
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const nextChar = (c: string) => {
  return String.fromCharCode(c.charCodeAt(0) + 1);
};

const imoCache: { [key: string]: ImoNumber | undefined } = { };
export function getImoNumberFromString(vesselId: string) {
    const cachedImo = imoCache[vesselId];
    if (cachedImo)
        return cachedImo;

    const vesselImoNr = +(/\d+/.exec(vesselId)?.[0] ?? '');
    if (isNaN(vesselImoNr)) throw new Error('Invalid vesselId');
    const imo = new ImoNumber(vesselImoNr);
    imoCache[vesselId] = imo;
    return imo;
}
