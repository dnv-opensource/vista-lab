import { VistaLabApi } from 'apiConfig';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect } from 'react';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  useEffect(() => {
    VistaLabApi.QueryApi.dataChannelPost({ dataChannelFilter: { primaryItem: ['C101'] } });
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
