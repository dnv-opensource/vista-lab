import clsx from 'clsx';
import React from 'react';
import './StatusIcon.scss';

export enum StatusVariant {
  Good = 'good',
  Warning = 'warning',
  Danger = 'danger',
}

interface Props {
  className?: string;
  variant: StatusVariant;
}

const StatusIcon: React.FC<Props> = ({ className, variant }) => {
  return <div className={clsx('status-icon', variant, className)} />;
};

export default StatusIcon;
