'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial, Sparkles, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { ui } from './store';

const V = (a) => a.map((v) => new THREE.Vector3(...v));
const PATH = new THREE.CatmullRomCurve3(V([[-34, 5, 44], [36, 9, 42], [16, 2.5, 26], [-8, 2.2, 22], [-20, 22, 50], [0, 32, 95]]));
const LOOK = new THREE.CatmullRomCurve3(V([[0, 24, 0], [0, 28, 0], [0, 9, 6], [0, 6, 8], [0, 26, 0], [0, 30, 0]]));
const DAY = new THREE.Color('#86a9c2'), DUSK = new THREE.Color('#c27d62'), NIGHT = new THREE.Color('#060b16');
const tmp = new THREE.Color();

// Procedural curtain-wall texture: glass cells, mullions, concrete spandrels (+ matching lit-window map)
function facadeTex(seed, lit) {
  const W = 512, H = 1024, C = 8, R = 16, cw = W / C, rh = H / R;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.fillStyle = lit ? '#000' : '#8d9aa3'; g.fillRect(0, 0, W, H);
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const x = c * cw + 5, y = r * rh + 6, w = cw - 10, h = rh - 24;
    if (lit) {
      if (rnd() < 0.42) { g.fillStyle = `rgba(255,${(170 + rnd() * 50) | 0},${(90 + rnd() * 60) | 0},${0.55 + rnd() * 0.45})`; g.fillRect(x, y, w, h); }
    } else {
      const t = rnd() * 0.15, gr = g.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, `rgb(${(150 + t * 80) | 0},${(185 + t * 60) | 0},205)`); gr.addColorStop(1, '#2f4656');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x, y, w * 0.12, h);
      g.fillStyle = '#53616b'; g.fillRect(x + w / 2 - 1, y, 2, h);
    }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

function Box({ p, s, mat, c = '#2a2f36', r = 0.7, m = 0.1 }) {
  return (
    <mesh position={p} castShadow receiveShadow material={mat}>
      <boxGeometry args={s} />
      {!mat && <meshStandardMaterial color={c} roughness={r} metalness={m} />}
    </mesh>
  );
}

function Tree({ x, z, h = 4 }) {
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, h / 2, 0]} s={[0.25, h, 0.25]} c="#3b2f26" />
      <mesh position={[0, h + 1, 0]} castShadow><icosahedronGeometry args={[1.8, 1]} /><meshStandardMaterial color="#2e4d3b" roughness={1} flatShading /></mesh>
    </group>
  );
}

function Car({ z, dir, speed, c, m, off }) {
  const g = useRef();
  useFrame((_, dt) => {
    g.current.position.x += dir * speed * dt;
    if (g.current.position.x > 85) g.current.position.x = -85;
    if (g.current.position.x < -85) g.current.position.x = 85;
  });
  return (
    <group ref={g} position={[off, 0.5, z]}>
      <Box p={[0, 0.3, 0]} s={[4.2, 0.9, 1.8]} c={c} r={0.3} m={0.7} />
      <Box p={[-0.2, 1, 0]} s={[2.2, 0.7, 1.6]} c="#10151b" r={0.1} m={0.9} />
      {[-0.6, 0.6].map((zz) => <Box key={zz} p={[dir * 2.12, 0.35, zz]} s={[0.08, 0.2, 0.4]} mat={m.head} />)}
      {[-0.6, 0.6].map((zz) => <Box key={zz} p={[-dir * 2.12, 0.35, zz]} s={[0.08, 0.2, 0.4]} mat={m.tail} />)}
    </group>
  );
}

const TOWER_MATS = (m) => [m.a, m.b, m.roof, m.roof, m.b, m.a];
const NEIGH = [[-26, -2, 14, 34, 14], [-42, 2, 12, 24, 12], [26, -4, 14, 40, 14], [43, 0, 12, 28, 12], [-12, -32, 16, 54, 16], [16, -36, 14, 46, 14], [-50, -30, 16, 36, 16], [44, -34, 16, 40, 16]];

function Building({ m }) {
  const fins = useMemo(() => Array.from({ length: 9 }, (_, i) => -6 + i * 1.5), []);
  const floors = useMemo(() => Array.from({ length: 15 }, (_, i) => 9 + i * 3), []);
  const lamps = useMemo(() => [-36, -24, -12, 0, 12, 24, 36], []);
  const dashes = useMemo(() => Array.from({ length: 22 }, (_, i) => -75 + i * 7), []);
  return (
    <group>
      {/* tower */}
      <mesh position={[0, 30, -1]} castShadow receiveShadow material={TOWER_MATS(m)}><boxGeometry args={[12, 48, 12]} /></mesh>
      {fins.map((x) => <Box key={x} p={[x, 30, 5.25]} s={[0.14, 48, 0.55]} mat={m.facade} />)}
      {fins.map((z) => <Box key={'l' + z} p={[-6.25, 30, z - 1]} s={[0.55, 48, 0.14]} mat={m.facade} />)}
      {fins.map((z) => <Box key={'r' + z} p={[6.25, 30, z - 1]} s={[0.55, 48, 0.14]} mat={m.facade} />)}
      {floors.map((y) => (
        <group key={y}>
          <Box p={[0, y - 1.5, 5.6]} s={[12.6, 0.18, 1.2]} mat={m.facade} />
          <Box p={[0, y - 0.95, 6.18]} s={[12.6, 0.9, 0.04]} mat={m.glass} />
        </group>
      ))}
      <Box p={[0, 56, -1]} s={[9, 4, 9]} mat={m.facade} />
      <Box p={[0, 58.3, -1]} s={[9.4, 0.3, 9.4]} c="#c9a66b" r={0.3} m={0.9} />
      <mesh position={[0, 63, -1]}><cylinderGeometry args={[0.1, 0.16, 9, 8]} /><meshStandardMaterial color="#aaa" metalness={0.8} /></mesh>
      <mesh position={[0, 67.7, -1]} material={m.beacon}><sphereGeometry args={[0.35, 12, 12]} /></mesh>
      {/* podium + storefront + canopy */}
      <Box p={[0, 3, 0]} s={[26, 6, 18]} mat={m.facade} />
      <Box p={[0, 3.2, 9.03]} s={[22, 3.8, 0.04]} mat={m.warm} />
      <Box p={[0, 3.2, 9.1]} s={[22, 3.8, 0.04]} mat={m.glass} />
      {[-10, -6, -2, 2, 6, 10].map((x) => <Box key={x} p={[x, 3, 9.2]} s={[0.3, 6, 0.3]} mat={m.facade} />)}
      <Box p={[0, 5.3, 9.3]} s={[9, 0.7, 0.12]} c="#c9a66b" r={0.3} m={0.9} />
      <Box p={[0, 4.4, 11.4]} s={[9, 0.25, 4.6]} c="#c9a66b" r={0.3} m={0.9} />
      {[-4, 4].map((x) => <Box key={x} p={[x, 2.2, 13.4]} s={[0.2, 4.4, 0.2]} c="#c9a66b" r={0.3} m={0.9} />)}
      {[-9, -4, 3, 9].map((x) => <Box key={x} p={[x, 6.5, 6]} s={[3, 1, 1.4]} c="#2f4d3a" r={1} m={0} />)}
      {/* neighbours */}
      {NEIGH.map(([x, z, w, h, d], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow receiveShadow material={[m.b, m.a, m.roof, m.roof, m.a, m.b]}><boxGeometry args={[w, h, d]} /></mesh>
      ))}
      {/* street */}
      <Box p={[0, 0.06, 12.5]} s={[200, 0.12, 7]} c="#6d7075" r={0.95} m={0} />
      <mesh position={[0, 0.03, 24]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[200, 16]} />
        <MeshReflectorMaterial resolution={512} blur={[300, 80]} mixBlur={1} mixStrength={1.6} mirror={0.7} color="#15181c" roughness={0.6} metalness={0.5} />
      </mesh>
      {dashes.map((x) => <Box key={x} p={[x, 0.07, 24]} s={[2.4, 0.02, 0.2]} c="#d8d8c8" r={1} m={0} />)}
      {lamps.map((x) => (
        <group key={x} position={[x, 0, 15.6]}>
          <Box p={[0, 3.5, 0]} s={[0.14, 7, 0.14]} c="#222" />
          <Box p={[0, 7, 0.7]} s={[0.12, 0.12, 1.5]} c="#222" />
          <mesh position={[0, 6.9, 1.4]} material={m.lamp}><sphereGeometry args={[0.28, 12, 12]} /></mesh>
        </group>
      ))}
      {[-20, -13, 13, 20].map((x) => <Tree key={x} x={x} z={14.6} />)}
      <Car z={21} dir={1} speed={9} c="#8c1d1d" m={m} off={-30} />
      <Car z={21.2} dir={1} speed={7} c="#d9d9d9" m={m} off={20} />
      <Car z={27} dir={-1} speed={10} c="#1b3a5c" m={m} off={40} />
      <Car z={27.2} dir={-1} speed={8} c="#222" m={m} off={-50} />
    </group>
  );
}

function Rig() {
  const sun = useRef(), hemi = useRef(), bloom = useRef(), stars = useRef(), glow = useRef();
  const m = useMemo(() => {
    const win = (seed) => new THREE.MeshStandardMaterial({ map: facadeTex(seed, false), emissiveMap: facadeTex(seed, true), emissive: '#ffffff', emissiveIntensity: 0.05, roughness: 0.18, metalness: 0.55, envMapIntensity: 1.3 });
    return {
      a: win(11), b: win(97),
      roof: new THREE.MeshStandardMaterial({ color: '#555b61', roughness: 0.9 }),
      facade: new THREE.MeshStandardMaterial({ color: '#ece9e3', roughness: 0.6 }),
      glass: new THREE.MeshStandardMaterial({ color: '#a9cfdc', transparent: true, opacity: 0.28, roughness: 0.04, metalness: 0.85, envMapIntensity: 1.6, depthWrite: false }),
      warm: new THREE.MeshStandardMaterial({ color: '#2a2018', emissive: '#ffae66', emissiveIntensity: 0 }),
      lamp: new THREE.MeshStandardMaterial({ color: '#222', emissive: '#ffe2b0', emissiveIntensity: 0 }),
      head: new THREE.MeshStandardMaterial({ color: '#222', emissive: '#fff4cc', emissiveIntensity: 0.3 }),
      tail: new THREE.MeshStandardMaterial({ color: '#300', emissive: '#ff2020', emissiveIntensity: 1 }),
      beacon: new THREE.MeshStandardMaterial({ color: '#400', emissive: '#ff2a2a', emissiveIntensity: 1 }),
    };
  }, []);
  const bg = useMemo(() => new THREE.Color(), []);
  const night = useRef(0);

  useFrame(({ camera, scene, clock }, dt) => {
    const k = Math.min(1, dt * 3);
    ui.value += (ui.target - ui.value) * k;
    ui.px += (ui.mx - ui.px) * k; ui.py += (ui.my - ui.py) * k;
    const p = ui.value;
    camera.position.copy(PATH.getPoint(p));
    camera.position.x += ui.px * 2.5; camera.position.y += ui.py * 1.2;
    camera.lookAt(LOOK.getPoint(p));

    const goal = ui.time ?? THREE.MathUtils.smoothstep(p, 0.2, 0.95);
    night.current += (goal - night.current) * Math.min(1, dt * 2.5);
    const n = night.current, d = 1 - n;
    if (n < 0.5) bg.copy(DAY).lerp(DUSK, n * 2); else bg.copy(DUSK).lerp(NIGHT, (n - 0.5) * 2);
    scene.background = bg; if (scene.fog) scene.fog.color.copy(bg);
    sun.current.intensity = 0.15 + 2.8 * d * d;
    sun.current.color.set('#fff1dc').lerp(tmp.set('#ff9a63'), Math.min(1, n * 2)).lerp(tmp.set('#7f9bff'), Math.max(0, n * 2 - 1));
    sun.current.position.set(50 - n * 80, 50 - n * 30, 40);
    hemi.current.intensity = 0.12 + 0.8 * d;
    stars.current.visible = n > 0.6;
    m.facade.color.lerp(tmp.set(ui.hover || ui.base), Math.min(1, dt * 5));
    m.a.emissiveIntensity = m.b.emissiveIntensity = 0.05 + n * n * 2.2;
    m.warm.emissiveIntensity = n * n * 2.4;
    m.lamp.emissiveIntensity = n * 6;
    m.head.emissiveIntensity = 0.3 + n * 5;
    m.beacon.emissiveIntensity = 1 + Math.sin(clock.elapsedTime * 3) * 1 + n * 2;
    glow.current.intensity = n * 140;
    if (bloom.current) bloom.current.intensity = 0.2 + n * 1.1;
  });

  return (
    <>
      <fog attach="fog" args={['#86a9c2', 70, 280]} />
      <hemisphereLight ref={hemi} args={['#dfeaf5', '#2a3a30', 0.9]} />
      <directionalLight ref={sun} castShadow shadow-bias={-0.0004} shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60} shadow-camera-right={60} shadow-camera-top={70} shadow-camera-bottom={-40} shadow-camera-far={220} />
      <pointLight ref={glow} position={[0, 3.5, 14]} color="#ffb877" intensity={0} distance={26} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.1} position={[0, 20, 20]} scale={[40, 12, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.6} position={[-20, 8, -6]} rotation-y={Math.PI / 2} scale={[20, 8, 1]} color="#a9c7ff" />
      </Environment>
      <Building m={m} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[500, 500]} /><meshStandardMaterial color="#2b2f33" roughness={0.95} /></mesh>
      <group ref={stars}><Stars radius={260} depth={40} count={2500} factor={6} fade speed={0.6} /></group>
      <Sparkles count={60} scale={[80, 30, 60]} size={2.2} speed={0.25} color="#ffd9a8" opacity={0.4} />
      <EffectComposer>
        <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.85} intensity={0.3} />
        <Vignette offset={0.3} darkness={0.65} />
      </EffectComposer>
    </>
  );
}

export default function Scene() {
  useEffect(() => {
    const onScroll = () => {
      const tour = document.getElementById('tour');
      const end = tour ? tour.offsetTop + tour.offsetHeight - window.innerHeight : 1;
      ui.target = Math.min(1, Math.max(0, window.scrollY / Math.max(1, end)));
    };
    const onMove = (e) => { ui.mx = e.clientX / window.innerWidth - 0.5; ui.my = -(e.clientY / window.innerHeight - 0.5); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('pointermove', onMove);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); window.removeEventListener('pointermove', onMove); };
  }, []);
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ fov: 42, near: 0.1, far: 600 }} gl={{ powerPreference: 'high-performance' }}>
      <Rig />
    </Canvas>
  );
}
