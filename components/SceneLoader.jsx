'use client';
import dynamic from 'next/dynamic';
const Scene = dynamic(() => import('./Scene'), { ssr: false });
export default function SceneLoader() {
  return <div className="stage" aria-hidden="true"><Scene /></div>;
}
