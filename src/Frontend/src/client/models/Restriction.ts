/* tslint:disable */
/* eslint-disable */
/**
 * QueryApi, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import {
    RestrictionWhiteSpace,
    RestrictionWhiteSpaceFromJSON,
    RestrictionWhiteSpaceFromJSONTyped,
    RestrictionWhiteSpaceToJSON,
} from './RestrictionWhiteSpace';

/**
 * 
 * @export
 * @interface Restriction
 */
export interface Restriction {
    /**
     * 
     * @type {Array<string>}
     * @memberof Restriction
     */
    enumeration?: Array<string> | null;
    /**
     * 
     * @type {string}
     * @memberof Restriction
     */
    fractionDigits?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Restriction
     */
    length?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Restriction
     */
    maxExclusive?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Restriction
     */
    maxInclusive?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Restriction
     */
    maxLength?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Restriction
     */
    minExclusive?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Restriction
     */
    minInclusive?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Restriction
     */
    minLength?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Restriction
     */
    pattern?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Restriction
     */
    totalDigits?: string | null;
    /**
     * 
     * @type {RestrictionWhiteSpace}
     * @memberof Restriction
     */
    whiteSpace?: RestrictionWhiteSpace;
}

export function RestrictionFromJSON(json: any): Restriction {
    return RestrictionFromJSONTyped(json, false);
}

export function RestrictionFromJSONTyped(json: any, ignoreDiscriminator: boolean): Restriction {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'enumeration': !exists(json, 'Enumeration') ? undefined : json['Enumeration'],
        'fractionDigits': !exists(json, 'FractionDigits') ? undefined : json['FractionDigits'],
        'length': !exists(json, 'Length') ? undefined : json['Length'],
        'maxExclusive': !exists(json, 'MaxExclusive') ? undefined : json['MaxExclusive'],
        'maxInclusive': !exists(json, 'MaxInclusive') ? undefined : json['MaxInclusive'],
        'maxLength': !exists(json, 'MaxLength') ? undefined : json['MaxLength'],
        'minExclusive': !exists(json, 'MinExclusive') ? undefined : json['MinExclusive'],
        'minInclusive': !exists(json, 'MinInclusive') ? undefined : json['MinInclusive'],
        'minLength': !exists(json, 'MinLength') ? undefined : json['MinLength'],
        'pattern': !exists(json, 'Pattern') ? undefined : json['Pattern'],
        'totalDigits': !exists(json, 'TotalDigits') ? undefined : json['TotalDigits'],
        'whiteSpace': !exists(json, 'WhiteSpace') ? undefined : RestrictionWhiteSpaceFromJSON(json['WhiteSpace']),
    };
}

export function RestrictionToJSON(value?: Restriction | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'Enumeration': value.enumeration,
        'FractionDigits': value.fractionDigits,
        'Length': value.length,
        'MaxExclusive': value.maxExclusive,
        'MaxInclusive': value.maxInclusive,
        'MaxLength': value.maxLength,
        'MinExclusive': value.minExclusive,
        'MinInclusive': value.minInclusive,
        'MinLength': value.minLength,
        'Pattern': value.pattern,
        'TotalDigits': value.totalDigits,
        'WhiteSpace': RestrictionWhiteSpaceToJSON(value.whiteSpace),
    };
}
