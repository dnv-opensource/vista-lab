import clsx from 'clsx';
import React from 'react';
import './FlipCard.scss';

interface Props {
  className?: string;
  front: JSX.Element;
  back: JSX.Element;
}

const FlipCard: React.FC<Props> = ({ className, front, back }) => {
  return (
    <div className={clsx('flip-card', className)}>
      <div className="flip-card-inner">
        <div className="flip-card-front">{front}</div>
        <div className="flip-card-back">{back}</div>
      </div>
    </div>
  );
};

export default FlipCard;
