import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VistaLabApi } from '../../../apiConfig';
import { AggregatedQueryResultAsReport, PanelQueryDto, QueryOperator, TimeRange } from '../../../client';

import { useExploreContext } from '../../../context/ExploreContext';
import { units } from '../../../util/date';
import { RoutePath } from '../../Routes';
import { QueryReport } from './QueryReports';
import './ResultsTable.scss';

const ResultsTable: React.FC = () => {
  const { vesselId } = useParams();
  const navigate = useNavigate();
  //   const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AggregatedQueryResultAsReport[]>([]);

  if (!vesselId) navigate(RoutePath.Report);
  const queryReport = useMemo(() => new QueryReport(vesselId!), [vesselId]);

  useEffect(() => {
    console.info(queryReport);
    queryReport.getReport().then(setData);
  }, [queryReport]);

  //new QueryReport(vesselId);

  return (
    <>
      <h1>Annual Report</h1>
      <table className="results-table">
        <thead>
          {/* <link href="ResultsTable.css" rel="stylesheet" /> */}
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data.map(d => d.name)}</td>
            <td> {data.map(d => d.value.toFixed(2))}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default ResultsTable;
