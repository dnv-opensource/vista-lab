import { DataChannelList } from 'dnv-vista-sdk';
import React, { useEffect, useState } from 'react';
import { AggregatedQueryResultAsReport } from '../../../client';
import Typeahead from '../../../components/ui/typeahead/Typeahead';
import { Query, toQueryDto } from '../../../context/ExperimentContext';
import { useLabContext } from '../../../context/LabContext';
import { toFormattedNumberString } from '../../../util/string';
import { QueryReport } from './QueryReports';
import './ResultsTable.scss';

const ResultsTable: React.FC = () => {
  const { vessel, currentDataChannelListPackage } = useLabContext();
  const [data, setData] = useState<AggregatedQueryResultAsReport[]>([]);

  const [reportQueries, setReportQueries] = useState<Query[]>([]);

  useEffect(() => {
    QueryReport.getReport(vessel.id, reportQueries.map(toQueryDto)).then(setData);
  }, [reportQueries, vessel]);

  return (
    <>
      <h2 className={'report-title'}>Report</h2>
      {currentDataChannelListPackage ? (
        <>
          <Typeahead
            className={'report-data-channel-typeahead'}
            placeholder="Add field from data channels"
            options={Array.from(
              currentDataChannelListPackage?.package.dataChannelList.dataChannel
                .reduce((prev, next) => {
                  if (prev.has(next.dataChannelId.localId.toString())) return prev;
                  prev.set(next.dataChannelId.localId.toString(), next);
                  return prev;
                }, new Map<string, DataChannelList.DataChannel>())
                .values()
            )}
            formatter={o => ({ option: o, value: o.dataChannelId.localId.toString() })}
            onSelectedOption={o =>
              setReportQueries(prev => {
                if (prev.some(q => q.items.includes(o))) return prev;
                return [...prev, QueryReport.createReportFor(o)];
              })
            }
          />
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
              {reportQueries.map(q => (
                <tr key={q.id}>
                  <td>{q.name}</td>
                  <td>{toFormattedNumberString(data.find(d => d.name === q.name)?.value) ?? 'No data found'}</td>
                  <td>
                    {
                      currentDataChannelListPackage.package.dataChannelList.dataChannel.find(
                        dc => dc.dataChannelId.localId.toString() === q.id
                      )?.property.unit?.unitSymbol
                    }
                  </td>
                  <td>Annual</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>Failed to find available datachannels</p>
      )}
    </>
  );
};

export default ResultsTable;
