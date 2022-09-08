import { VistaLabApi } from "../../../apiConfig";
import { AggregatedQueryResultAsReport, PanelQueryDto, Query, QueryOperator, TimeRange } from "../../../client";
import { units } from "../../../util/date";

export class QueryReport {

    private readonly _vesselId: string;
    public get vesselId(): string {
        return this._vesselId;
    }


    public constructor(vesselId: string) {

        this._vesselId = vesselId;
    }
    private queries: Query[] = [
        {
            id: 'this._vesselId',
            name: 'Fuel Consumption',
            operator: QueryOperator._0,
            subQueries: [],
            dataChannelIds: [
            `data.dnv.com/${this.vesselId}/dnv-v2/vis-3-4a/621.21/S90/sec/411.1/C101/meta/qty-mass/cnt-fuel.oil/pos-outlet`,
            `data.dnv.com/${this.vesselId}/dnv-v2/vis-3-4a/621.21/S90/sec/411.1/C101/meta/qty-mass/cnt-fuel.oil/pos-inlet`,
            ]
        }
    ];

    public async getReport() : Promise<AggregatedQueryResultAsReport[]> {
        const tr: TimeRange = {
            from: units.y,
            to: 0,
            interval: '10s',
          };

        const reportDto = {
            timeRange: tr,
            queries: this.queries
        } as PanelQueryDto;
        return VistaLabApi.dataChannelGetTimeSeriesDataByQueriesAsReport(reportDto);
    }

}


