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
export enum CRSType {
    NUMBER_0 = 0,
    NUMBER_1 = 1,
    NUMBER_2 = 2
}

export function CRSTypeFromJSON(json: any): CRSType {
    return CRSTypeFromJSONTyped(json, false);
}

export function CRSTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): CRSType {
    return json as CRSType;
}

export function CRSTypeToJSON(value?: CRSType | null): any {
    return value as any;
}

