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

/**
 * 
 * @export
 * @enum {string}
 */
export enum GeoJSONObjectType {
    NUMBER_0 = 0,
    NUMBER_1 = 1,
    NUMBER_2 = 2,
    NUMBER_3 = 3,
    NUMBER_4 = 4,
    NUMBER_5 = 5,
    NUMBER_6 = 6,
    NUMBER_7 = 7,
    NUMBER_8 = 8
}

export function GeoJSONObjectTypeFromJSON(json: any): GeoJSONObjectType {
    return GeoJSONObjectTypeFromJSONTyped(json, false);
}

export function GeoJSONObjectTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): GeoJSONObjectType {
    return json as GeoJSONObjectType;
}

export function GeoJSONObjectTypeToJSON(value?: GeoJSONObjectType | null): any {
    return value as any;
}

