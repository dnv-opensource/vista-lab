/* tslint:disable */
/* eslint-disable */
//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v13.15.5.0 (NJsonSchema v10.6.6.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------
// ReSharper disable InconsistentNaming

export class IConfig {
  constructor(private getToken?: { (): Promise<string> }) {}

  async getAuthorization() {
    if (!this.getToken) return null;
    const token = await this.getToken();
    return `Bearer ${token}`;
  }
}

export class AuthorizedApiBase {
  private readonly config: IConfig;

  protected constructor(config: IConfig) {
    this.config = config;
  }

  protected transformOptions = async (options: RequestInit): Promise<RequestInit> => {
    const token = await this.config.getAuthorization();
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: token,
      };
    } else {
      options.headers = {
        ...options.headers,
      };
    }
    return options;
  };
}

export class Client extends AuthorizedApiBase {
    private http: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> };
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(configuration: IConfig, baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) {
        super(configuration);
        this.http = http ? http : <any>window;
        this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";
    }

    /**
     * Import datachannels file and simulate
     * @param file (optional) 
     * @return Success
     */
    dataChannelPostImportFileAndSimulate(file: FileParameter | undefined): Promise<void> {
        let url_ = this.baseUrl + "/api/data-channel/import-file-and-simulate";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = new FormData();
        if (file === null || file === undefined)
            throw new Error("The parameter 'file' cannot be null.");
        else
            content_.append("file", file.data, file.fileName ? file.fileName : "file");

        let options_ = <RequestInit>{
            body: content_,
            method: "POST",
            headers: {
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processDataChannelPostImportFileAndSimulate(_response);
        });
    }

    protected processDataChannelPostImportFileAndSimulate(response: Response): Promise<void> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            return;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<void>(<any>null);
    }

    /**
     * Get distinct vessels with info
     * @return Success
     */
    dataChannelGetVessels(): Promise<Vessel[]> {
        let url_ = this.baseUrl + "/api/data-channel/vessels";
        url_ = url_.replace(/[?&]$/, "");

        let options_ = <RequestInit>{
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processDataChannelGetVessels(_response);
        });
    }

    protected processDataChannelGetVessels(response: Response): Promise<Vessel[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <Vessel[]>JSON.parse(_responseText, this.jsonParseReviver);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<Vessel[]>(<any>null);
    }

    /**
     * Search for time series given a data channel internalId
     * @param body (optional) 
     * @return Success
     */
    dataChannelGetLatestTimeSeriesValue(body: TimeSeriesRequestDto | undefined): Promise<TimeSeriesDataWithProps> {
        let url_ = this.baseUrl + "/api/data-channel/time-series/latest";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_ = <RequestInit>{
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/plain"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processDataChannelGetLatestTimeSeriesValue(_response);
        });
    }

    protected processDataChannelGetLatestTimeSeriesValue(response: Response): Promise<TimeSeriesDataWithProps> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <TimeSeriesDataWithProps>JSON.parse(_responseText, this.jsonParseReviver);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<TimeSeriesDataWithProps>(<any>null);
    }

    /**
     * Retreives the latest vessel positions
     * @return Success
     */
    dataChannelGetVesselPositions(): Promise<Feature[]> {
        let url_ = this.baseUrl + "/api/data-channel/time-series/position/latest";
        url_ = url_.replace(/[?&]$/, "");

        let options_ = <RequestInit>{
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processDataChannelGetVesselPositions(_response);
        });
    }

    protected processDataChannelGetVesselPositions(response: Response): Promise<Feature[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <Feature[]>JSON.parse(_responseText, this.jsonParseReviver);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<Feature[]>(<any>null);
    }

    /**
     * Get timeseries by queries
     * @param body (optional) 
     * @return Success
     */
    dataChannelGetTimeSeriesDataByQueries(body: PanelQueryDto | undefined): Promise<AggregatedQueryResult[]> {
        let url_ = this.baseUrl + "/api/data-channel/time-series/query";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_ = <RequestInit>{
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/plain"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processDataChannelGetTimeSeriesDataByQueries(_response);
        });
    }

    protected processDataChannelGetTimeSeriesDataByQueries(response: Response): Promise<AggregatedQueryResult[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <AggregatedQueryResult[]>JSON.parse(_responseText, this.jsonParseReviver);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<AggregatedQueryResult[]>(<any>null);
    }

    /**
     * Get aggregated values from timeseries as report
     * @param body (optional) 
     * @return Success
     */
    dataChannelGetTimeSeriesDataByQueriesAsReport(body: PanelQueryDto | undefined): Promise<AggregatedQueryResultAsReport[]> {
        let url_ = this.baseUrl + "/api/data-channel/time-series/query/report";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_ = <RequestInit>{
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/plain"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processDataChannelGetTimeSeriesDataByQueriesAsReport(_response);
        });
    }

    protected processDataChannelGetTimeSeriesDataByQueriesAsReport(response: Response): Promise<AggregatedQueryResultAsReport[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <AggregatedQueryResultAsReport[]>JSON.parse(_responseText, this.jsonParseReviver);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<AggregatedQueryResultAsReport[]>(<any>null);
    }

    /**
     * Search for gmod paths.
     * @param body (optional) 
     * @return Success
     */
    searchSearch(visVersion: VisVersion, body: SearchRequestDto | undefined): Promise<DataChannelListPackage[]> {
        let url_ = this.baseUrl + "/api/search/{visVersion}";
        if (visVersion === undefined || visVersion === null)
            throw new Error("The parameter 'visVersion' must be defined.");
        url_ = url_.replace("{visVersion}", encodeURIComponent("" + visVersion));
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_ = <RequestInit>{
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/plain"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processSearchSearch(_response);
        });
    }

    protected processSearchSearch(response: Response): Promise<DataChannelListPackage[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <DataChannelListPackage[]>JSON.parse(_responseText, this.jsonParseReviver);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<DataChannelListPackage[]>(<any>null);
    }
}

export interface AdditionalTimeSeriesProperties {
    unitSymbol: string | undefined;
    quantityName: string | undefined;
    rangeHigh: number | undefined;
    rangeLow: number | undefined;
    name: string | undefined;
    vesselId: string | undefined;
}

export interface AggregatedQueryResult {
    timeseries: AggregatedTimeseries[];
    id: string;
    name: string;
}

export interface AggregatedQueryResultAsReport {
    value: number;
    id: string;
    name: string;
}

export interface AggregatedTimeseries {
    value: number;
    timestamp: Date;
}

export interface ConfigurationReference {
    ID: string;
    Version: string | undefined;
    TimeStamp: Date;
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface DataChannel {
    DataChannelID: DataChannelID;
    Property: Property;
}

export interface DataChannelID {
    LocalID: string;
    ShortID: string | undefined;
    NameObject: NameObject;
}

export interface DataChannelList {
    DataChannel: DataChannel[];
}

export interface DataChannelListPackage {
    Package: Package;
}

export interface DataChannelType {
    Type: string;
    UpdateCycle: string | undefined;
    CalculationPeriod: string | undefined;
}

export interface EventDataSet {
    TimeStamp: Date;
    DataChannelID: string;
    Value: string;
    Quality: string | undefined;
}

export interface Feature {
    geometry: Geometry;
    properties: FeatureProps;
    type: string;
}

export interface FeatureProps {
    vesselId: string;
    timestamp: Date;
}

export interface Format {
    Type: string;
    Restriction: Restriction;
}

export interface Geometry {
    type: string;
    coordinates: Coordinates;
}

export interface Header {
    ShipID: string;
    DataChannelListID: ConfigurationReference;
    VersionInformation: VersionInformation;
    Author: string | undefined;
    DateCreated: Date | undefined;
}

export interface NameObject {
    NamingRule: string;
}

export interface Package {
    Header: Header;
    DataChannelList: DataChannelList;
}

export interface PanelQueryDto {
    timeRange: TimeRange;
    queries: Query[];
}

export interface Property {
    DataChannelType: DataChannelType;
    Format: Format;
    Range: Range;
    Unit: Unit;
    QualityCoding: string | undefined;
    AlertPriority: string | undefined;
    Name: string | undefined;
    Remarks: string | undefined;
}

export interface Query {
    id: string;
    name: string;
    operator: QueryOperator;
    subQueries: Query[] | undefined;
    dataChannelIds: string[] | undefined;
}

export enum QueryOperator {
    _0 = 0,
    _1 = 1,
    _2 = 2,
    _3 = 3,
    _4 = 4,
}

export interface Range {
    High: string;
    Low: string;
}

export interface Restriction {
    Enumeration: string[] | undefined;
    FractionDigits: string | undefined;
    Length: string | undefined;
    MaxExclusive: string | undefined;
    MaxInclusive: string | undefined;
    MaxLength: string | undefined;
    MinExclusive: string | undefined;
    MinInclusive: string | undefined;
    MinLength: string | undefined;
    Pattern: string | undefined;
    TotalDigits: string | undefined;
    WhiteSpace: RestrictionWhiteSpace;
}

export enum RestrictionWhiteSpace {
    _0 = 0,
    _1 = 1,
    _2 = 2,
}

export interface SearchRequestDto {
    vesselId: string | undefined;
    phrase: string | undefined;
    scope: SearchScope;
}

export enum SearchScope {
    _0 = 0,
    _1 = 1,
    _2 = 2,
}

export interface TimeRange {
    from: number;
    to: number;
    interval: string;
}

export interface TimeSeriesDataWithProps {
    eventData: EventDataSet;
    additionalProps: AdditionalTimeSeriesProperties;
}

export interface TimeSeriesRequestDto {
    localId: string;
    vesselId: string | undefined;
}

export interface Unit {
    UnitSymbol: string;
    QuantityName: string | undefined;
}

export interface VersionInformation {
    NamingRule: string;
    NamingSchemeVersion: string;
    ReferenceURL: string | undefined;
}

export interface Vessel {
    vesselId: string;
    numberOfDataChannels: number;
    name: string | undefined;
}

export enum VisVersion {
    _0 = 0,
    _1 = 1,
}

export interface FileParameter {
    data: any;
    fileName: string;
}

export class SwaggerException extends Error {
    message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isSwaggerException = true;

    static isSwaggerException(obj: any): obj is SwaggerException {
        return obj.isSwaggerException === true;
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): any {
    if (result !== null && result !== undefined)
        throw result;
    else
        throw new SwaggerException(message, status, response, headers, null);
}