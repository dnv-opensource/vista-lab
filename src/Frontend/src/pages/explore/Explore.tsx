import React from 'react';
import { IconName } from '../../components/ui/icons/icons';
import Input from '../../components/ui/input/Input';

interface Props {}

const Explore: React.FC<Props> = () => {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        console.log('sub');
      }}
    >
      <Input icon={IconName.Search} placeholder="Search" />
    </form>
  );
};

export default Explore;
