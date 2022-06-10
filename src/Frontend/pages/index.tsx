import { VistaLabApi } from 'apiConfig';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect } from 'react';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  useEffect(() => {
    VistaLabApi.VesselApi.vesselGet({ vesselId: '6c420700-ef3d-41c6-ac4a-a989514e0014' }).then(res => {
      console.log('vessel response', res);
    });
  }, []);
  return (
    <div className={styles.container}>
      <Link href={'/discover'}>
        <button>Discover</button>
      </Link>
    </div>
  );
};

export default Home;
