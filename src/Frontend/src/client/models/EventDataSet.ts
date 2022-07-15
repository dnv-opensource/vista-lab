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
 * @interface EventDataSet
 */
export interface EventDataSet {
    /**
     * 
     * @type {Date}
     * @memberof EventDataSet
     */
    timeStamp?: Date;
    /**
     * 
     * @type {string}
     * @memberof EventDataSet
     */
    dataChannelID?: string;
    /**
     * 
     * @type {string}
     * @memberof EventDataSet
     */
    value?: string;
    /**
     * 
     * @type {string}
     * @memberof EventDataSet
     */
    quality?: string | null;
}

export function EventDataSetFromJSON(json: any): EventDataSet {
    return EventDataSetFromJSONTyped(json, false);
}

export function EventDataSetFromJSONTyped(json: any, ignoreDiscriminator: boolean): EventDataSet {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'timeStamp': !exists(json, 'TimeStamp') ? undefined : (new Date(json['TimeStamp'])),
        'dataChannelID': !exists(json, 'DataChannelID') ? undefined : json['DataChannelID'],
        'value': !exists(json, 'Value') ? undefined : json['Value'],
        'quality': !exists(json, 'Quality') ? undefined : json['Quality'],
    };
}

export function EventDataSetToJSON(value?: EventDataSet | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'TimeStamp': value.timeStamp === undefined ? undefined : (value.timeStamp.toISOString()),
        'DataChannelID': value.dataChannelID,
        'Value': value.value,
        'Quality': value.quality,
    };
}
