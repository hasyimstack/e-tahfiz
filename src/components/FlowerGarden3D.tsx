import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  attachStudioEnvironment,
  createBrightRenderer,
  createSkyGradientTexture,
  detectSoftwareWebGL,
  disposeSceneResources,
  scheduleSoftwareFrame,
} from './threeUtils';

// Pre-allocated helpers to prevent GC in the render loop
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

function groundHeightAt(x: number, z: number): number {
  return (
    Math.sin(x * 0.16) * 0.65 +
    Math.cos(z * 0.18 + 0.4) * 0.55 +
    Math.sin((x + z) * 0.09) * 0.45
  );
}

function createPetalGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.14, 0.12, 0.18, 0.42, 0, 0.58);
  shape.bezierCurveTo(-0.18, 0.42, -0.14, 0.12, 0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createLeafGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.16, 0.18, 0.14, 0.52, 0, 0.72);
  shape.bezierCurveTo(-0.14, 0.52, -0.16, 0.18, 0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.rotateX(-Math.PI / 2 + 0.35);
  return geo;
}

function createButterflyWingGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.18, 0.28, 0.42, 0.25, 0.36, 0.04);
  shape.bezierCurveTo(0.4, -0.15, 0.22, -0.26, 0, -0.08);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.01,
    bevelEnabled: false,
    curveSegments: 8,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export const FlowerGarden3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = createBrightRenderer(container, isSoftwareGl);

    const scene = new THREE.Scene();
    const skyTexture = createSkyGradientTexture('#68C5F2', '#BDEAFB', '#E8F9D9');
    scene.background = skyTexture;
    scene.fog = new THREE.FogExp2(0xdff5e6, 0.021);

    const envTex = attachStudioEnvironment(renderer, scene);

    const camera = new THREE.PerspectiveCamera(
      46,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      120
    );
    camera.position.set(0, 3.6, 12.2);
    camera.lookAt(0, 1.35, 0);

    // Warm/Cool Bright Daylight Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x9be2ff, 0x64b95d, 1.15);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff1c9, 2.35);
    sunLight.position.set(12, 18, 10);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.set(1024, 1024);
      sunLight.shadow.camera.near = 1;
      sunLight.shadow.camera.far = 45;
      const d = 14;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xffe29a, 0.75);
    rimLight.position.set(-10, 8, -12);
    scene.add(rimLight);

    // Glowing Sun & Soft Halo in Sky
    const sunGroup = new THREE.Group();
    sunGroup.position.set(14, 11.5, -24);
    const sunSphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.3, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffe875 })
    );
    const sunHalo = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xfff5bd,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      })
    );
    sunGroup.add(sunSphere, sunHalo);
    scene.add(sunGroup);

    // Fluffy 3D Clouds
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0,
      emissive: 0xfffdf5,
      emissiveIntensity: 0.25,
    });
    const cloudGeo = new THREE.SphereGeometry(1, 14, 14);
    const clouds: { group: THREE.Group; baseX: number; speed: number }[] = [];
    const cloudSpecs = [
      { x: -13, y: 8.6, z: -20, s: 1.4, speed: 0.35 },
      { x: 0, y: 9.8, z: -25, s: 1.75, speed: 0.24 },
      { x: 11, y: 7.9, z: -18, s: 1.15, speed: 0.42 },
    ];
    cloudSpecs.forEach((spec) => {
      const g = new THREE.Group();
      const puffs = [
        [0, 0, 0, 1.0],
        [1.1, -0.15, 0.1, 0.82],
        [-1.05, -0.2, 0.05, 0.78],
        [0.45, 0.45, -0.1, 0.75],
      ];
      puffs.forEach(([px, py, pz, ps]) => {
        const m = new THREE.Mesh(cloudGeo, cloudMat);
        m.position.set(px, py, pz);
        m.scale.setScalar(ps);
        g.add(m);
      });
      g.position.set(spec.x, spec.y, spec.z);
      g.scale.setScalar(spec.s);
      scene.add(g);
      clouds.push({ group: g, baseX: spec.x, speed: spec.speed });
    });

    // Sculpted Rolling Green Meadow Terrain
    const terrainGeo = new THREE.PlaneGeometry(76, 68, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const vy = groundHeightAt(vx, vz);
      posAttr.setY(i, vy);

      // Sunlit meadow gradient
      const tint = THREE.MathUtils.clamp((vy + 1.4) / 2.8, 0, 1);
      _color.setHex(0x52b658).lerp(new THREE.Color(0x8ee07a), tint);
      colors[i * 3] = _color.r;
      colors[i * 3 + 1] = _color.g;
      colors[i * 3 + 2] = _color.b;
    }
    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = !isSoftwareGl;
    scene.add(terrain);

    // Shared Geometries & Materials for Composite 3D Flowers
    const petalGeo = createPetalGeometry();
    const leafGeo = createLeafGeometry();
    const calyxGeo = new THREE.ConeGeometry(0.18, 0.24, 10);
    calyxGeo.rotateX(Math.PI);
    const centerGeo = new THREE.SphereGeometry(0.24, 14, 12);
    centerGeo.scale(1, 0.55, 1);

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x3b964c,
      roughness: 0.65,
      metalness: 0,
    });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x52b788,
      roughness: 0.42,
      metalness: 0,
    });

    const flowerPalettes = [
      { petal: 0xff758f, center: 0xffd166 }, // Coral Pink
      { petal: 0xffd166, center: 0xf48c06 }, // Marigold Gold
      { petal: 0xfffdf5, center: 0xffb703 }, // Sunny Daisy
      { petal: 0xc79bff, center: 0xfff3b0 }, // Lavender
      { petal: 0xffa07a, center: 0xffe66d }, // Peach Blossom
      { petal: 0x72b5ff, center: 0xfffdf5 }, // Sky Periwinkle
    ];

    const petalMaterials = flowerPalettes.map(
      (p) =>
        new THREE.MeshPhysicalMaterial({
          color: p.petal,
          roughness: 0.32,
          metalness: 0,
          clearcoat: 0.35,
          clearcoatRoughness: 0.35,
        })
    );
    const centerMaterials = flowerPalettes.map(
      (p) =>
        new THREE.MeshStandardMaterial({
          color: p.center,
          roughness: 0.35,
          metalness: 0.05,
          emissive: p.center,
          emissiveIntensity: 0.14,
        })
    );

    interface FlowerActor {
      group: THREE.Group;
      headGroup: THREE.Group;
      phase: number;
      swayAmp: number;
      baseRotY: number;
    }
    const flowers: FlowerActor[] = [];

    const flowerPlacements: [number, number, number, number][] = [
      [-6.8, 3.2, 1.05, 0],
      [-5.2, 1.4, 1.25, 1],
      [-4.1, 4.6, 0.92, 2],
      [-3.1, -0.4, 1.18, 3],
      [-2.0, 3.5, 1.08, 4],
      [-1.1, 1.8, 1.3, 0],
      [0.3, 4.4, 0.96, 1],
      [1.2, 0.8, 1.24, 2],
      [2.4, 3.2, 1.12, 5],
      [3.5, 1.6, 1.28, 0],
      [4.7, 4.2, 0.95, 3],
      [5.8, 0.4, 1.2, 1],
      [6.9, 3.1, 1.05, 4],
      [-6.2, -2.8, 1.15, 2],
      [-2.4, -3.5, 1.32, 5],
      [0.8, -3.1, 1.26, 0],
      [4.2, -2.7, 1.22, 3],
      [7.4, -1.8, 1.14, 2],
    ];

    flowerPlacements.forEach(([fx, fz, fScale, paletteIdx], idx) => {
      const gy = groundHeightAt(fx, fz);
      const group = new THREE.Group();
      group.position.set(fx, gy - 0.04, fz);
      group.scale.setScalar(fScale);

      const height = 1.65 + (idx % 4) * 0.28;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.06, height * 0.45, 0.04),
        new THREE.Vector3(0.02, height, 0),
      ]);
      const stemGeo = new THREE.TubeGeometry(curve, 12, 0.045, 7, false);
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.castShadow = !isSoftwareGl;
      group.add(stemMesh);

      // 2 Opposite Sculpted Leaves
      const leaf1 = new THREE.Mesh(leafGeo, leafMat);
      leaf1.position.set(0.03, height * 0.36, 0);
      leaf1.rotation.y = 0.6;
      leaf1.scale.setScalar(0.85);
      group.add(leaf1);

      const leaf2 = new THREE.Mesh(leafGeo, leafMat);
      leaf2.position.set(0.02, height * 0.56, 0);
      leaf2.rotation.y = -2.4;
      leaf2.scale.setScalar(0.72);
      group.add(leaf2);

      // Blossom Head Group
      const headGroup = new THREE.Group();
      headGroup.position.set(0.02, height, 0);
      headGroup.rotation.x = 0.38; // Tilted slightly toward viewer

      const calyx = new THREE.Mesh(calyxGeo, leafMat);
      calyx.position.y = -0.08;
      headGroup.add(calyx);

      const pCount = 8 + (idx % 3);
      const pMat = petalMaterials[paletteIdx];
      for (let p = 0; p < pCount; p++) {
        const angle = (p / pCount) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeo, pMat);
        petal.rotation.y = angle;
        petal.rotation.x = 0.18;
        petal.position.set(Math.sin(angle) * 0.12, 0, Math.cos(angle) * 0.12);
        petal.castShadow = !isSoftwareGl;
        headGroup.add(petal);
      }

      const center = new THREE.Mesh(centerGeo, centerMaterials[paletteIdx]);
      center.position.y = 0.06;
      headGroup.add(center);

      group.add(headGroup);
      scene.add(group);

      flowers.push({
        group,
        headGroup,
        phase: idx * 0.75,
        swayAmp: 0.055 + (idx % 3) * 0.015,
        baseRotY: (idx * 1.1) % (Math.PI * 2),
      });
    });

    // Instanced Meadow Grass Blades & Mini Blooms
    const bladeCount = 260;
    const bladeGeo = new THREE.ConeGeometry(0.06, 0.55, 4);
    bladeGeo.translate(0, 0.275, 0);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0,
    });
    const blades = new THREE.InstancedMesh(bladeGeo, bladeMat, bladeCount);
    const bladeData: { x: number; z: number; s: number; phase: number }[] = [];
    for (let i = 0; i < bladeCount; i++) {
      const bx = (Math.sin(i * 19.7) * 0.5 + (Math.random() - 0.5) * 0.5) * 26;
      const bz = (Math.cos(i * 13.3) * 0.5 + (Math.random() - 0.5) * 0.5) * 16 - 1;
      const bs = 0.7 + Math.random() * 0.9;
      bladeData.push({ x: bx, z: bz, s: bs, phase: i * 0.35 });

      _dummy.position.set(bx, groundHeightAt(bx, bz) - 0.03, bz);
      _dummy.rotation.set(0, Math.random() * Math.PI, 0);
      _dummy.scale.set(bs, bs, bs);
      _dummy.updateMatrix();
      blades.setMatrixAt(i, _dummy.matrix);

      _color.setHSL(0.32 + (Math.random() - 0.5) * 0.05, 0.58, 0.45 + Math.random() * 0.16);
      blades.setColorAt(i, _color);
    }
    blades.instanceMatrix.needsUpdate = true;
    if (blades.instanceColor) blades.instanceColor.needsUpdate = true;
    blades.frustumCulled = false;
    scene.add(blades);

    // 3D Composite Butterflies
    const wingGeo = createButterflyWingGeometry();
    const bodyGeo = new THREE.CapsuleGeometry(0.03, 0.22, 4, 6);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3d3024, roughness: 0.6 });
    const butterflyColors = [0xffb703, 0xff758f, 0x72b5ff, 0xc79bff, 0xfffdf5, 0x95d5b2];

    interface ButterflyActor {
      root: THREE.Group;
      leftWing: THREE.Mesh;
      rightWing: THREE.Mesh;
      cx: number;
      cz: number;
      cy: number;
      speed: number;
      phase: number;
      radius: number;
    }
    const butterflies: ButterflyActor[] = [];
    for (let i = 0; i < 6; i++) {
      const root = new THREE.Group();
      const wingMat = new THREE.MeshStandardMaterial({
        color: butterflyColors[i % butterflyColors.length],
        roughness: 0.35,
        side: THREE.DoubleSide,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.scale.x = -1;
      root.add(body, leftWing, rightWing);
      root.scale.setScalar(0.82);
      scene.add(root);

      butterflies.push({
        root,
        leftWing,
        rightWing,
        cx: (i - 2.5) * 2.4,
        cz: -1 + (i % 3) * 1.8,
        cy: 2.3 + (i % 3) * 0.55,
        speed: 0.55 + (i % 3) * 0.18,
        phase: i * 1.3,
        radius: 1.5 + (i % 2) * 0.8,
      });
    }

    // Instanced Floating Sunlit Petals
    const floatingCount = 42;
    const floatPetalGeo = new THREE.CircleGeometry(0.09, 6);
    const floatPetalMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const floatingPetals = new THREE.InstancedMesh(
      floatPetalGeo,
      floatPetalMat,
      floatingCount
    );
    const floatState = Array.from({ length: floatingCount }, (_, i) => ({
      x: (Math.random() - 0.5) * 20,
      y: 0.8 + Math.random() * 5.5,
      z: (Math.random() - 0.5) * 12,
      speed: 0.4 + Math.random() * 0.5,
      phase: i * 0.9,
    }));
    floatState.forEach((_, i) => {
      const hex = flowerPalettes[i % flowerPalettes.length].petal;
      floatingPetals.setColorAt(i, _color.setHex(hex));
    });
    if (floatingPetals.instanceColor) floatingPetals.instanceColor.needsUpdate = true;
    floatingPetals.frustumCulled = false;
    scene.add(floatingPetals);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer Parallax (smoothly damped)
    let targetPtrX = 0;
    let targetPtrY = 0;
    let curPtrX = 0;
    let curPtrY = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetPtrX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetPtrY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener('pointermove', onPointerMove, { passive: true });

    // Resize Observer
    const handleResize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    const clock = new THREE.Clock();
    let frameId = 0;
    let isDisposed = false;

    const animate = () => {
      if (isDisposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const t = prefersReducedMotion ? 0 : clock.getElapsedTime();

      // Smooth damped camera parallax
      curPtrX = THREE.MathUtils.damp(curPtrX, targetPtrX, 4.5, delta);
      curPtrY = THREE.MathUtils.damp(curPtrY, targetPtrY, 4.5, delta);
      camera.position.x = curPtrX * 0.85 + Math.sin(t * 0.18) * 0.35;
      camera.position.y = 3.55 - curPtrY * 0.35 + Math.cos(t * 0.22) * 0.12;
      camera.lookAt(0, 1.35, 0);

      // Gentle sun halo pulse
      const haloScale = 1 + Math.sin(t * 1.4) * 0.06;
      sunHalo.scale.setScalar(haloScale);

      // Clouds drifting smoothly
      clouds.forEach((c) => {
        const span = 34;
        const offset = ((c.baseX + t * c.speed + span / 2) % span) - span / 2;
        c.group.position.x = offset;
      });

      // Flowers swaying in morning breeze
      flowers.forEach((f) => {
        f.group.rotation.z = Math.sin(t * 1.25 + f.phase) * f.swayAmp;
        f.group.rotation.x = Math.cos(t * 0.95 + f.phase) * (f.swayAmp * 0.65);
        f.headGroup.rotation.y = f.baseRotY + Math.sin(t * 0.8 + f.phase) * 0.18;
      });

      // Butterflies gliding and flapping
      butterflies.forEach((b) => {
        const angle = t * b.speed + b.phase;
        const nx = b.cx + Math.sin(angle) * b.radius;
        const nz = b.cz + Math.sin(angle * 2) * (b.radius * 0.45);
        const ny = b.cy + Math.sin(t * 2.2 + b.phase) * 0.35;

        const dx = Math.cos(angle) * b.radius * b.speed;
        const dz = Math.cos(angle * 2) * (b.radius * 0.9) * b.speed;
        b.root.position.set(nx, ny, nz);
        b.root.rotation.y = Math.atan2(dx, dz);

        const flap = Math.sin(t * 12 + b.phase) * 0.85;
        b.leftWing.rotation.z = -flap;
        b.rightWing.rotation.z = flap;
      });

      // Floating sunlit petals
      for (let i = 0; i < floatingCount; i++) {
        const p = floatState[i];
        const px = p.x + Math.sin(t * 0.7 + p.phase) * 0.8 + ((t * 0.35) % 4) - 2;
        const py = ((p.y - t * p.speed * 0.45 + 6) % 5.5) + 0.6;
        const pz = p.z + Math.cos(t * 0.6 + p.phase) * 0.6;
        _dummy.position.set(px, py, pz);
        _dummy.rotation.set(t + p.phase, t * 1.2, p.phase);
        _dummy.scale.setScalar(1);
        _dummy.updateMatrix();
        floatingPetals.setMatrixAt(i, _dummy.matrix);
      }
      floatingPetals.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (!prefersReducedMotion) {
        if (isSoftwareGl) {
          scheduleSoftwareFrame(renderer, animate, (id) => {
            frameId = id;
          });
        } else {
          frameId = requestAnimationFrame(animate);
        }
      }
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      disposeSceneResources(scene, envTex);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
    />
  );
};
