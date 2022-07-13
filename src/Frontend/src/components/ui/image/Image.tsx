import React from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  src: string;
}

const Image: React.FC<Props> = ({ alt, src, ...restProps }) => {
  return <img {...restProps} alt={alt} src={src} />;
};

export default Image;
