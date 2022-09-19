import React from 'react';
import { useLabContext } from '../../../context/LabContext';
import CustomLink, { CustomLinkProps } from '../../ui/router/CustomLink';

const VesselLink: React.FC<CustomLinkProps> = ({ to, ...rest }) => {
  const { vessel } = useLabContext();
  return <CustomLink {...rest} to={`/${vessel.id}/${to}`}></CustomLink>;
};

export default VesselLink;
