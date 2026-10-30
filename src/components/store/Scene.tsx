import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, Text } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CATEGORIES, PRODUCTS, type Product } from "@/lib/products";
import { COUNTER, FACES, SHELF, UNIT_X, collide } from "@/lib/layout";

// Per-frame player state lives outside React.
export const player = { x: 0, z: 10, yaw: 0, pitch: -0.05, input: { f: 0, s: 0, turn: 0 } };
const SPEED = 3.2, TURN = 1.8, LOOK = 0.004;

function makeFloorTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    g.fillStyle = (i + j) % 2 ? "#eef0ea" : "#f8f9f5"; g.fillRect(i * 64, j * 64, 64, 64);
  }
  g.strokeStyle = "#dfe2da"; g.lineWidth = 2;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(20, 20);
  t.colorSpace = THREE.SRGBColorSpace; return t;
}

function makeLabelTexture(p: Product) {
  const c = document.createElement("canvas"); c.width = 128; c.height = 160;
  const g = c.getContext("2d")!;
  g.fillStyle = p.color; g.fillRect(0, 0, 128, 160);
  g.fillStyle = "rgba(255,255,255,0.9)"; g.fillRect(0, 56, 128, 48);
  g.fillStyle = "#222"; g.font = "bold 20px sans-serif"; g.textAlign = "center";
  g.fillText(p.brand.slice(0, 11), 64, 80);
  g.font = "13px sans-serif"; g.fillText(p.name.split(" ").slice(0, 2).join(" "), 64, 98);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const GEO = {
  box: new THREE.BoxGeometry(0.34, 0.44, 0.26),
  bottle: new THREE.CylinderGeometry(0.1, 0.12, 0.46, 12),
  round: new THREE.SphereGeometry(0.13, 12, 10),
};

function ProductInstances({ product, slots, selected, onPick }: {
  product: Product; slots: THREE.Vector3[]; selected: boolean; onPick: (p: Product) => void;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
    if (product.shape === "round") m.color.set(product.color); else m.map = makeLabelTexture(product);
    return m;
  }, [product]);
  useEffect(() => {
    const m = new THREE.Matrix4(); const yOff = product.shape === "round" ? 0.13 : 0.23;
    slots.forEach((s, i) => { m.makeTranslation(s.x, s.y + yOff, s.z); ref.current!.setMatrixAt(i, m); });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [slots, product.shape]);
  useEffect(() => { mat.emissive.set(selected ? "#ffd54f" : "#000"); mat.emissiveIntensity = selected ? 0.5 : 0; }, [selected, mat]);
  return (
    <instancedMesh
      ref={ref} args={[GEO[product.shape], mat, slots.length]} castShadow
      onClick={(e: ThreeEvent<MouseEvent>) => { if (e.delta < 6) { e.stopPropagation(); onPick(product); } }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    />
  );
}

function Shelves({ selectedId, onPick }: { selectedId?: string; onPick: (p: Product) => void }) {
  const { slotsById, tags } = useMemo(() => {
    const slotsById: Record<string, THREE.Vector3[]> = {};
    const tags: { p: Product; pos: [number, number, number]; rotY: number }[] = [];
    const len = SHELF.zMax - SHELF.zMin;
    for (const f of FACES) {
      const items = PRODUCTS.filter((p) => p.category === f.category);
      const faceX = f.x + f.side * (SHELF.depth / 2 + 0.2);
      for (let lvl = 0; lvl < SHELF.levels; lvl++) {
        const y = 0.15 + lvl * 0.58;
        const cols = 26;
        for (let c = 0; c < cols; c++) {
          const p = items[(lvl + Math.floor(c / (cols / items.length))) % items.length];
          const z = SHELF.zMin + 0.4 + (c * (len - 0.8)) / (cols - 1);
          (slotsById[p.id] ??= []).push(new THREE.Vector3(faceX, y, z));
        }
      }
      items.forEach((p, i) => {
        const z = SHELF.zMin + 0.8 + ((i + 0.5) * (len - 1.6)) / items.length;
        tags.push({ p, pos: [f.x + f.side * (SHELF.depth / 2 + 0.42), 0.1, z], rotY: f.side > 0 ? Math.PI / 2 : -Math.PI / 2 });
      });
    }
    return { slotsById, tags };
  }, []);

  return (
    <group>
      {UNIT_X.map((x) => (
        <group key={x} position={[x, 0, (SHELF.zMin + SHELF.zMax) / 2]}>
          <mesh position={[0, SHELF.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.15, SHELF.height, SHELF.zMax - SHELF.zMin]} />
            <meshStandardMaterial color="#e8ebe6" />
          </mesh>
          {Array.from({ length: SHELF.levels + 1 }).map((_, l) => (
            <mesh key={l} position={[0, 0.12 + l * 0.58, 0]} receiveShadow>
              <boxGeometry args={[SHELF.depth * 2 - 0.4, 0.05, SHELF.zMax - SHELF.zMin]} />
              <meshStandardMaterial color="#cfd5cc" metalness={0.3} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      {PRODUCTS.map((p) => slotsById[p.id] && (
        <ProductInstances key={p.id} product={p} slots={slotsById[p.id]} selected={selectedId === p.id} onPick={onPick} />
      ))}
      {tags.map(({ p, pos, rotY }) => (
        <Text key={p.id + pos[0]} position={pos} rotation={[0, rotY, 0]} fontSize={0.09} color="#1b3d2a" anchorX="center" outlineWidth={0.012} outlineColor="#fffde7">
          {`${p.brand} ₹${Math.round(p.price * (1 - p.discountPct / 100))}${p.discountPct ? `  -${p.discountPct}%` : ""}`}
        </Text>
      ))}
      {FACES.map((f) => {
        const cat = CATEGORIES.find((c) => c.id === f.category)!;
        const x = f.x + f.side * 1.6;
        return (
          <group key={f.category} position={[x, 3.3, SHELF.zMax + 0.3]}>
            <mesh><boxGeometry args={[2.6, 0.6, 0.06]} /><meshStandardMaterial color={cat.color} /></mesh>
            <Text position={[0, 0, 0.04]} fontSize={0.2} color="#ffffff" maxWidth={2.4} textAlign="center">{cat.name}</Text>
            <mesh position={[0, 0.6, 0]}><boxGeometry args={[0.02, 0.6, 0.02]} /><meshStandardMaterial color="#888" /></mesh>
          </group>
        );
      })}
    </group>
  );
}

function Counter() {
  return (
    <group position={[COUNTER.x, 0, COUNTER.z]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[COUNTER.w, 1, COUNTER.d]} /><meshStandardMaterial color="#2e7d4f" />
      </mesh>
      <mesh position={[0, 1.02, 0]}><boxGeometry args={[COUNTER.w + 0.1, 0.05, COUNTER.d + 0.1]} /><meshStandardMaterial color="#f1f1ee" /></mesh>
      <mesh position={[0.4, 1.02, 0]}><boxGeometry args={[2.2, 0.06, 0.6]} /><meshStandardMaterial color="#222" roughness={0.3} /></mesh>
      <group position={[-1.6, 1.35, 0]} rotation={[0, Math.PI, 0]}>
        <mesh><boxGeometry args={[0.7, 0.5, 0.05]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0, 0, 0.03]}><planeGeometry args={[0.62, 0.42]} /><meshStandardMaterial color="#0f3d22" emissive="#1db954" emissiveIntensity={0.35} /></mesh>
        <Text position={[0, 0.05, 0.035]} fontSize={0.07} color="#9dffb8">FreshMart POS</Text>
        <Text position={[0, -0.07, 0.035]} fontSize={0.045} color="#9dffb8">Walk up to pay</Text>
      </group>
      <group position={[0, 3, 0]}>
        <mesh><boxGeometry args={[3, 0.6, 0.06]} /><meshStandardMaterial color="#ffc107" /></mesh>
        <Text position={[0, 0, -0.04]} rotation={[0, Math.PI, 0]} fontSize={0.28} color="#3e2723">BILLING COUNTER</Text>
        <Text position={[0, 0, 0.04]} fontSize={0.28} color="#3e2723">BILLING COUNTER</Text>
      </group>
      {/* cart */}
      <group position={[3.5, 0, 1.5]}>
        <mesh position={[0, 0.7, 0]}><boxGeometry args={[0.6, 0.45, 0.9]} /><meshStandardMaterial color="#c62828" wireframe /></mesh>
        <mesh position={[0, 0.35, 0]}><boxGeometry args={[0.5, 0.04, 0.8]} /><meshStandardMaterial color="#666" metalness={0.8} /></mesh>
      </group>
    </group>
  );
}

function Room() {
  const floor = useMemo(makeFloorTexture, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, -5]}>
        <planeGeometry args={[42, 38]} /><meshStandardMaterial map={floor} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.5, -5]}><planeGeometry args={[42, 38]} /><meshStandardMaterial color="#fbfbf8" /></mesh>
      {[[0, -24, 0], [0, 14, Math.PI], [-21, -5, Math.PI / 2], [21, -5, -Math.PI / 2]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 2.25, z]} rotation={[0, r, 0]}>
          <planeGeometry args={[i < 2 ? 42 : 38, 4.5]} /><meshStandardMaterial color={i === 0 ? "#dff0e3" : "#f4f6f0"} />
        </mesh>
      ))}
      <Text position={[0, 3.2, -23.9]} fontSize={0.9} color="#2e7d4f">FreshMart</Text>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[(i - 2.5) * 7, 4.45, -8]}>
          <boxGeometry args={[0.4, 0.04, 24]} /><meshStandardMaterial color="#fff" emissive="#fffbe8" emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ onNearCounter }: { onNearCounter: (near: boolean) => void }) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const near = useRef(false);
  useEffect(() => {
    const kd = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.tagName === "INPUT") return; keys.current[e.code] = true; };
    const ku = (e: KeyboardEvent) => (keys.current[e.code] = false);
    let drag: { x: number; y: number } | null = null;
    const el = gl.domElement;
    const pd = (e: PointerEvent) => (drag = { x: e.clientX, y: e.clientY });
    const pm = (e: PointerEvent) => {
      if (!drag) return;
      player.yaw += (e.clientX - drag.x) * LOOK; player.pitch = Math.max(-0.8, Math.min(0.6, player.pitch + (e.clientY - drag.y) * LOOK));
      drag = { x: e.clientX, y: e.clientY };
    };
    const pu = () => (drag = null);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    el.addEventListener("pointerdown", pd); window.addEventListener("pointermove", pm); window.addEventListener("pointerup", pu);
    return () => {
      window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      el.removeEventListener("pointerdown", pd); window.removeEventListener("pointermove", pm); window.removeEventListener("pointerup", pu);
    };
  }, [gl]);

  useFrame((_, d) => {
    const dt = Math.min(d, 0.05), k = keys.current;
    const f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) + player.input.f;
    const s = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0) + player.input.s;
    const turn = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0) + player.input.turn;
    player.yaw += turn * TURN * dt;
    // yaw 0 looks toward -z; positive yaw turns right
    const fx = Math.sin(player.yaw), fz = -Math.cos(player.yaw);
    const nx = player.x + (fx * f - fz * s) * SPEED * dt;
    const nz = player.z + (fz * f + fx * s) * SPEED * dt;
    const c = collide(nx, nz); player.x = c.x; player.z = c.z;
    camera.position.set(player.x, 1.6, player.z);
    camera.rotation.set(player.pitch, -player.yaw, 0, "YXZ");
    const isNear = Math.abs(player.x - COUNTER.x) < 4 && Math.abs(player.z - COUNTER.z) < 2.6;
    if (isNear !== near.current) { near.current = isNear; onNearCounter(isNear); }
  });
  return null;
}

export function StoreScene({ selectedId, onPick, onNearCounter }: {
  selectedId?: string; onPick: (p: Product) => void; onNearCounter: (n: boolean) => void;
}) {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ fov: 70, near: 0.1, far: 80 }} onCreated={({ gl }) => gl.domElement.parentElement?.parentElement?.setAttribute("data-scene-ready", "1")}>
      <color attach="background" args={["#f4f7f1"]} />
      <hemisphereLight args={["#ffffff", "#d9e4d0", 0.9]} />
      <directionalLight position={[6, 12, 6]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[20, 20, 1]} />
        <Lightformer intensity={0.8} color="#e8ffe8" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>
      <Room />
      <Shelves selectedId={selectedId} onPick={onPick} />
      <Counter />
      <Rig onNearCounter={onNearCounter} />
    </Canvas>
  );
}
