import { VistaLabApi } from '../../../apiConfig';
import { AggregatedQueryResultAsReport, PanelQueryDto, Query, QueryOperator, TimeRange } from '../../../client';
import { units } from '../../../util/date';

export class QueryReport {
  private readonly _vesselId: string;
  private _queries: Query[];

  public constructor(vesselId: string) {
    this._vesselId = vesselId;

    this._queries = [];
    // Add queries
    this._queries.push({
      id: this._vesselId + '1',
      name: 'Fuel Consumption',
      operator: QueryOperator._0,
      subQueries: [],
      dataChannelIds: [
        `/dnv-v2/vis-3-4a/621.21/S90/sec/411.1/C101/meta/qty-mass/cnt-fuel.oil/pos-outlet`,
        `/dnv-v2/vis-3-4a/621.21/S90/sec/411.1/C101/meta/qty-mass/cnt-fuel.oil/pos-inlet`,
      ],
    });
    this._queries.push({
      id: this._vesselId + 'fc2',
      name: 'Fuel Consumption division check',
      operator: QueryOperator._3,
      subQueries: [this._queries[0], this._queries[0]],
      dataChannelIds: [],
    });
  }
  public get vesselId(): string {
    return this._vesselId;
  }

  public get queries() {
    return this._queries;
  }

  public async getReport(): Promise<AggregatedQueryResultAsReport[]> {
    const tr: TimeRange = {
      from: units.y,
      to: 0,
      interval: '10s',
    };

    const reportDto: PanelQueryDto = {
      timeRange: tr,
      vesselId: this._vesselId,
      queries: this.queries,
    };
    return VistaLabApi.dataChannelGetTimeSeriesDataByQueriesAsReport(reportDto);
  }
}
