import { OrbitControls, Sphere, Stars, useTexture } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

function EarthMesh() {
  const earthMap = useTexture('/assets/earthmap1k3.jpg')
  return (
    <Sphere args={[1, 64, 64]} rotation={[0, Math.PI, 0]}>
      <meshStandardMaterial map={earthMap} />
    </Sphere>
  )
}

export default function Earth3D() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 2.5], fov: 50 }}
    >
      <hemisphereLight color={'#fff'} groundColor={'#bde0fe'} intensity={0.8} />
      <ambientLight intensity={1.0} color={'#fff'} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} color={'#fff'} />
      <Stars radius={150} depth={30} count={1000} factor={4} />
      <EarthMesh />
      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.7}
        enablePan={false}
      />
    </Canvas>
  )
}
