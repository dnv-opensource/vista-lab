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
/**
 * 
 * @export
 * @interface DataChannelType
 */
export interface DataChannelType {
    /**
     * 
     * @type {string}
     * @memberof DataChannelType
     */
    type?: string;
    /**
     * 
     * @type {string}
     * @memberof DataChannelType
     */
    updateCycle?: string | null;
    /**
     * 
     * @type {string}
     * @memberof DataChannelType
     */
    calculationPeriod?: string | null;
}

export function DataChannelTypeFromJSON(json: any): DataChannelType {
    return DataChannelTypeFromJSONTyped(json, false);
}

export function DataChannelTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): DataChannelType {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'type': !exists(json, 'Type') ? undefined : json['Type'],
        'updateCycle': !exists(json, 'UpdateCycle') ? undefined : json['UpdateCycle'],
        'calculationPeriod': !exists(json, 'CalculationPeriod') ? undefined : json['CalculationPeriod'],
    };
}

export function DataChannelTypeToJSON(value?: DataChannelType | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'Type': value.type,
        'UpdateCycle': value.updateCycle,
        'CalculationPeriod': value.calculationPeriod,
    };
}

