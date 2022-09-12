import React, { useEffect, useMemo, useState } from 'react';
import { AggregatedQueryResultAsReport } from '../../../client';
import { useLabContext } from '../../../context/LabContext';
import { toFormattedNumberString } from '../../../util/string';
import { QueryReport } from './QueryReports';
import './ResultsTable.scss';

const ResultsTable: React.FC = () => {
  const { vessel } = useLabContext();
  const [data, setData] = useState<AggregatedQueryResultAsReport[]>([]);

  const queryReport = useMemo(() => new QueryReport(vessel.id), [vessel.id]);

  useEffect(() => {
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
