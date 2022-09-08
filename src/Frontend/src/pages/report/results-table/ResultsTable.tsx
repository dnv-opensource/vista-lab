import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AggregatedQueryResultAsReport } from '../../../client';
import { toFormattedNumberString } from '../../../util/string';
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
      <h2 className={'report-title'}>Report</h2>
      <table className="results-table">
        <thead>
          {/* <link href="ResultsTable.css" rel="stylesheet" /> */}
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Value</th>
            <th>Unit</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {queryReport.queries.map(q => (
            <tr key={q.id}>
              <td>{q.name}</td>
              <td>{toFormattedNumberString(data.find(d => d.name === q.name)?.value) ?? 'No data found'}</td>
              <td>TBD</td>
              <td>Annual</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ResultsTable;
