import React from 'react';
import './FleetCard.scss';

type Vessel = {
  name: string;
  shipId: string;
  numDataChannels: number;
};

interface Props {
  ship: Vessel;
}

const FleetCard: React.FC<Props> = ({ ship }) => {
  return (
    <div className={'fleet-card'}>
      <div>{ship.name}</div>
      <div>{ship.shipId}</div>
      <div>{ship.numDataChannels}</div>
    </div>
  );
};

export default FleetCard;
