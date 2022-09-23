import { DataChannelList } from 'dnv-vista-sdk';
import { VistaLabApi } from '../../../apiConfig';
import { AggregatedQueryResultAsReport, Query as QueryDto, TimeRange } from '../../../client';
import { Operator } from '../../../components/view-and-build/query-generator/operator-selection/OperatorSelection';
import { Query } from '../../../context/ExperimentContext';
import { units } from '../../../util/date';

export enum ReportPeriod {
  Daily,
  Monthly,
  Annual,
}

export class QueryReport {
  public static async getReport(vesselId: string, queries: QueryDto[]): Promise<AggregatedQueryResultAsReport[]> {
    const tr: TimeRange = {
      from: units.y,
      to: 0,
      interval: '10s',
    };

    return VistaLabApi.dataChannelGetTimeSeriesDataByQueriesAsReport({
      timeRange: tr,
      vesselId,
      queries,
    });
  }

  public static createReportFor(dataChannel: DataChannelList.DataChannel): Query {
    const localIdStr = dataChannel.dataChannelId.localId.toString();

    return {
      items: [dataChannel],
      id: localIdStr,
      name: dataChannel.property.name ?? localIdStr,
      operator: Operator.Sum,
    };
  }
}
