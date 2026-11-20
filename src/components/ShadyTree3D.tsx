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

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export const ShadyTree3D: React.FC = () => {
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
    const skyTex = createSkyGradientTexture('#7DD1F7', '#C9F2DE', '#B0E8AC');
    scene.background = skyTex;
    scene.fog = new THREE.FogExp2(0xd4f4df, 0.032);

    const envTex = attachStudioEnvironment(renderer, scene);

    const camera = new THREE.PerspectiveCamera(
      42,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      80
    );
    camera.position.set(0, 3.2, 10.6);
    camera.lookAt(0, 2.35, 0);

    // Bright Morning Sun & Cool Grove Fill Lighting
    const hemi = new THREE.HemisphereLight(0xa3e4ff, 0x5ab560, 1.2);
    scene.add(hemi);

    const sunLight = new THREE.DirectionalLight(0xfff1c4, 2.4);
    sunLight.position.set(8, 14, 9);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.set(1024, 1024);
      sunLight.shadow.camera.near = 1;
      sunLight.shadow.camera.far = 35;
      const d = 8;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    // Glowing Sun & Cloud in Background
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.35, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xffe873 })
    );
    sunMesh.position.set(4.8, 7.2, -13);
    scene.add(sunMesh);

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      emissive: 0xffffff,
      emissiveIntensity: 0.25,
    });
    const cloudGeo = new THREE.SphereGeometry(0.85, 12, 12);
    const cloudGroup = new THREE.Group();
    [
      [-0.8, 0, 0, 0.85],
      [0, 0.25, 0, 1.05],
      [0.9, 0.05, 0, 0.78],
    ].forEach(([cx, cy, cz, cs]) => {
      const puff = new THREE.Mesh(cloudGeo, cloudMat);
      puff.position.set(cx, cy, cz);
      puff.scale.setScalar(cs);
      cloudGroup.add(puff);
    });
    cloudGroup.position.set(-4.2, 6.2, -12);
    scene.add(cloudGroup);

    // Sunlit Grassy Hilltop
    const hillGeo = new THREE.PlaneGeometry(36, 36, 40, 40);
    hillGeo.rotateX(-Math.PI / 2);
    const hPos = hillGeo.attributes.position;
    for (let i = 0; i < hPos.count; i++) {
      const x = hPos.getX(i);
      const z = hPos.getZ(i);
      const y = Math.cos(x * 0.22) * 0.45 + Math.cos(z * 0.22) * 0.35 - 0.65;
      hPos.setY(i, y);
    }
    hillGeo.computeVertexNormals();
    const hill = new THREE.Mesh(
      hillGeo,
      new THREE.MeshStandardMaterial({ color: 0x69c76a, roughness: 0.85 })
    );
    hill.receiveShadow = !isSoftwareGl;
    scene.add(hill);

    // Composite 3D Shady Tree Group (Rooted at hill surface y ≈ 0.15)
    const treeGroup = new THREE.Group();
    treeGroup.position.set(0, 0.08, 0);

    const barkMat = new THREE.MeshStandardMaterial({
      color: 0x876042,
      roughness: 0.88,
      metalness: 0,
    });

    // 1. Primary Trunk (TubeGeometry)
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.2, 0),
      new THREE.Vector3(-0.08, 1.1, 0.04),
      new THREE.Vector3(0.05, 2.35, -0.02),
    ]);
    const trunkMesh = new THREE.Mesh(
      new THREE.TubeGeometry(trunkCurve, 14, 0.34, 10, false),
      barkMat
    );
    trunkMesh.castShadow = !isSoftwareGl;
    trunkMesh.receiveShadow = !isSoftwareGl;
    treeGroup.add(trunkMesh);

    // 2. Root Buttresses grounding the trunk
    for (let r = 0; r < 4; r++) {
      const ang = (r / 4) * Math.PI * 2 + 0.4;
      const rootCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.45, 0),
        new THREE.Vector3(Math.cos(ang) * 0.45, 0.08, Math.sin(ang) * 0.45),
        new THREE.Vector3(Math.cos(ang) * 0.85, -0.18, Math.sin(ang) * 0.85),
      ]);
      const rootMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rootCurve, 8, 0.12, 7, false),
        barkMat
      );
      rootMesh.castShadow = !isSoftwareGl;
      treeGroup.add(rootMesh);
    }

    // 3. Spreading Boughs
    const boughSpecs = [
      new THREE.Vector3(-1.45, 3.25, 0.45),
      new THREE.Vector3(1.55, 3.15, 0.35),
      new THREE.Vector3(0.25, 3.65, -1.1),
      new THREE.Vector3(-0.35, 3.55, 1.05),
    ];
    boughSpecs.forEach((tip) => {
      const bCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.03, 2.1, 0),
        new THREE.Vector3(tip.x * 0.55, 2.85, tip.z * 0.55),
        tip,
      ]);
      const bough = new THREE.Mesh(
        new THREE.TubeGeometry(bCurve, 10, 0.14, 8, false),
        barkMat
      );
      bough.castShadow = !isSoftwareGl;
      treeGroup.add(bough);
    });

    // 4. Multi-Cluster Lush Leafy Canopy
    const canopyGroup = new THREE.Group();
    const foliageSpecs: [number, number, number, number, number][] = [
      [0, 4.15, 0, 1.48, 0x52b788],
      [-1.35, 3.45, 0.4, 1.18, 0x40a86f],
      [1.45, 3.35, 0.3, 1.22, 0x40a86f],
      [0.2, 3.8, -1.15, 1.12, 0x2d8a56],
      [-0.35, 3.7, 1.05, 1.14, 0x63c796],
      [-0.95, 4.35, -0.35, 0.96, 0x74d69d],
      [0.95, 4.3, 0.45, 0.98, 0x74d69d],
      [0, 4.85, 0.1, 0.92, 0x95e4b7],
      [-1.85, 3.15, -0.25, 0.85, 0x52b788],
      [1.92, 3.1, -0.15, 0.84, 0x52b788],
    ];

    const canopyMeshes: { mesh: THREE.Mesh; baseX: number; baseY: number; phase: number }[] = [];
    foliageSpecs.forEach(([cx, cy, cz, cr, hex], idx) => {
      const geo = new THREE.IcosahedronGeometry(cr, 2);
      const pos = geo.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const vx = pos.getX(v);
        const vy = pos.getY(v);
        const vz = pos.getZ(v);
        const bump = 1 + Math.sin(vx * 3.1 + vy * 2.7 + idx) * 0.08;
        pos.setXYZ(v, vx * bump, vy * bump * 0.84, vz * bump);
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: 0.55 + (idx % 3) * 0.08,
        metalness: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cx, cy, cz);
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      canopyGroup.add(mesh);
      canopyMeshes.push({ mesh, baseX: cx, baseY: cy, phase: idx * 0.7 });
    });

    // Joyful Canopy Blossoms
    const blossomGeo = new THREE.SphereGeometry(0.14, 10, 10);
    const blossomColors = [0xffe066, 0xff8fa3, 0xfffdf5, 0xffd166];
    const blossomCoords: [number, number, number][] = [
      [-1.1, 3.6, 1.35],
      [1.15, 3.5, 1.3],
      [0.3, 4.75, 0.85],
      [-0.6, 4.3, 0.92],
      [1.6, 3.45, 0.7],
      [-1.65, 3.2, 0.75],
    ];
    blossomCoords.forEach(([bx, by, bz], idx) => {
      const mat = new THREE.MeshStandardMaterial({
        color: blossomColors[idx % blossomColors.length],
        roughness: 0.35,
        emissive: blossomColors[idx % blossomColors.length],
        emissiveIntensity: 0.15,
      });
      const bMesh = new THREE.Mesh(blossomGeo, mat);
      bMesh.position.set(bx, by, bz);
      canopyGroup.add(bMesh);
    });

    treeGroup.add(canopyGroup);
    scene.add(treeGroup);

    // Instanced Falling Cool Leaves around the Shady Tree
    const leafCount = 28;
    const leafGeo = new THREE.CircleGeometry(0.085, 5);
    const leafMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const fallingLeaves = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
    const leafState = Array.from({ length: leafCount }, (_, i) => ({
      x: (Math.random() - 0.5) * 4.5,
      y: 0.6 + Math.random() * 3.4,
      z: (Math.random() - 0.5) * 3.2,
      speed: 0.35 + Math.random() * 0.4,
      phase: i * 0.8,
    }));
    const leafPalette = [0x95e4b7, 0x74d69d, 0xffe066, 0xff9ebb];
    leafState.forEach((_, i) => {
      fallingLeaves.setColorAt(i, _color.setHex(leafPalette[i % leafPalette.length]));
    });
    if (fallingLeaves.instanceColor) fallingLeaves.instanceColor.needsUpdate = true;
    fallingLeaves.frustumCulled = false;
    scene.add(fallingLeaves);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const handleResize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let frameId = 0;
    let isDisposed = false;

    const animate = () => {
      if (isDisposed) return;
      clock.getDelta();
      const t = prefersReducedMotion ? 0 : clock.getElapsedTime();

      // Gentle 3D camera orbit breathing
      camera.position.x = Math.sin(t * 0.28) * 1.15;
      camera.position.y = 3.15 + Math.cos(t * 0.32) * 0.2;
      camera.lookAt(0, 2.35, 0);

      // Cloud drift
      cloudGroup.position.x = ((t * 0.35 - 4.2 + 9) % 18) - 9;

      // Tree & canopy breeze sway
      treeGroup.rotation.z = Math.sin(t * 1.05) * 0.024;
      canopyGroup.rotation.y = Math.sin(t * 0.6) * 0.035;
      canopyMeshes.forEach((c) => {
        c.mesh.position.x = c.baseX + Math.sin(t * 1.4 + c.phase) * 0.04;
        c.mesh.position.y = c.baseY + Math.cos(t * 1.2 + c.phase) * 0.03;
      });

      // Falling leaves
      for (let i = 0; i < leafCount; i++) {
        const l = leafState[i];
        const lx = l.x + Math.sin(t * 1.1 + l.phase) * 0.45;
        const ly = ((l.y - t * l.speed + 4.0) % 3.6) + 0.3;
        const lz = l.z + Math.cos(t * 0.9 + l.phase) * 0.35;
        _dummy.position.set(lx, ly, lz);
        _dummy.rotation.set(t + l.phase, t * 1.3, l.phase);
        _dummy.scale.setScalar(1);
        _dummy.updateMatrix();
        fallingLeaves.setMatrixAt(i, _dummy.matrix);
      }
      fallingLeaves.instanceMatrix.needsUpdate = true;

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
