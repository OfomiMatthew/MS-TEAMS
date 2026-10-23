import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshRoomConfig, User } from '../../types';

interface MeshSceneProps {
  roomConfig: MeshRoomConfig;
  currentUser: User;
  activeParticipants: User[];
  isMuted: boolean;
  isSpeaking: boolean;
  onToggleMic: () => void;
  onAdvanceSlide: (dir: 1 | -1) => void;
}

// Pre-allocated math objects to avoid garbage collection in render loop
const _vec3 = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _camTargetPos = new THREE.Vector3();

export const MeshScene: React.FC<MeshSceneProps> = ({
  roomConfig,
  currentUser,
  activeParticipants,
  isMuted,
  isSpeaking,
  onToggleMic,
  onAdvanceSlide,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<'table' | 'presenter' | 'screen' | 'orbit'>('table');
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);
  const [activeReactionNotice, setActiveReactionNotice] = useState<string | null>(null);
  const [seatedIndex, setSeatedIndex] = useState<number>(0);

  // References for scene update handlers
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarAuraMeshRef = useRef<THREE.Mesh | null>(null);
  const reactionParticlesRef = useRef<THREE.Group | null>(null);
  const isTransitioningCamera = useRef<boolean>(false);

  // Function to draw slide onto procedural CanvasTexture for the 3D presentation screen
  const updateScreenCanvas = useCallback(() => {
    const canvas = screenCanvasRef.current;
    const texture = screenTextureRef.current;
    if (!canvas || !texture) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentSlide = roomConfig.slides[roomConfig.currentSlide] || roomConfig.slides[0];

    // Background gradient with high-tech fluent aesthetic
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#101424');
    grad.addColorStop(0.5, '#1e2442');
    grad.addColorStop(1, '#0c101c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid accent lines
    ctx.strokeStyle = 'rgba(98, 100, 167, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Top status pill & header
    ctx.fillStyle = '#6264A7';
    ctx.beginPath();
    ctx.roundRect(50, 45, 210, 36, 18);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚡ MESH LIVE PRESENTATION', 68, 69);

    // Slide counter badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(canvas.width - 180, 45, 130, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Slide ${roomConfig.currentSlide + 1} of ${roomConfig.slides.length}`, canvas.width - 165, 69);

    // Slide Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(currentSlide.title, 50, 150);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(currentSlide.subtitle, 50, 195);

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 225);
    ctx.lineTo(canvas.width - 50, 225);
    ctx.stroke();

    // Bullets
    ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    currentSlide.bullets.forEach((bullet, idx) => {
      const yPos = 280 + idx * 52;
      // Bullet icon
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.arc(65, yPos - 6, 6, 0, Math.PI * 2);
      ctx.fill();

      // Bullet text
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(bullet, 88, yPos);
    });

    // Metric KPI card if available
    if (currentSlide.metric) {
      const cardX = canvas.width - 340;
      const cardY = 270;
      ctx.fillStyle = 'rgba(98, 100, 167, 0.25)';
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, 290, 160, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(currentSlide.metric.label.toUpperCase(), cardX + 24, cardY + 45);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(currentSlide.metric.value, cardX + 24, cardY + 115);
    }

    // Bottom progress indicator
    const progW = (canvas.width - 100) * ((roomConfig.currentSlide + 1) / roomConfig.slides.length);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, canvas.height - 28, canvas.width - 100, 6);
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(50, canvas.height - 28, progW, 6);

    texture.needsUpdate = true;
  }, [roomConfig]);

  // Update canvas when slide changes
  useEffect(() => {
    updateScreenCanvas();
  }, [updateScreenCanvas, roomConfig.currentSlide]);

  // Trigger floating 3D reaction
  const triggerReaction = (emoji: string) => {
    setActiveReactionNotice(emoji);
    setTimeout(() => setActiveReactionNotice(null), 2500);

    const particles = reactionParticlesRef.current;
    if (!particles) return;

    // Create 3D floating sprite for the emoji
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '72px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 64, 64);
    }

    const spriteTexture = new THREE.CanvasTexture(canvas);
    spriteTexture.colorSpace = THREE.SRGBColorSpace;
    const spriteMaterial = new THREE.SpriteMaterial({
      map: spriteTexture,
      transparent: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Position above active user chair
    sprite.position.set(0.8, 1.8, 1.4);
    sprite.scale.set(0.65, 0.65, 0.65);
    (sprite as any).userData = {
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.02, 0.04 + Math.random() * 0.02, (Math.random() - 0.5) * 0.02),
      life: 1.0,
    };

    particles.add(sprite);
  };

  // Change camera position preset with smooth damping
  const applyPreset = (preset: 'table' | 'presenter' | 'screen' | 'orbit') => {
    setCameraPreset(preset);
    isTransitioningCamera.current = true;

    if (preset === 'table') {
      _camTargetPos.set(0, 2.2, 3.8);
      _targetLookAt.set(0, 1.1, -1.0);
    } else if (preset === 'presenter') {
      _camTargetPos.set(0, 1.9, -3.2);
      _targetLookAt.set(0, 1.2, 1.5);
    } else if (preset === 'screen') {
      _camTargetPos.set(0, 1.8, 1.2);
      _targetLookAt.set(0, 2.1, -4.5);
    } else {
      _camTargetPos.set(4.5, 4.0, 5.5);
      _targetLookAt.set(0, 1.0, 0);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard detection
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Three.js Scene & Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0d111a');
    scene.fog = new THREE.FogExp2('#0d111a', 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 2.2, 3.8);
    _camTargetPos.copy(camera.position);
    _targetLookAt.set(0, 1.1, -1.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. OrbitControls with smooth damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.03; // Don't clip through floor
    controls.minDistance = 1.2;
    controls.maxDistance = 14;
    controls.target.copy(_targetLookAt);

    controls.addEventListener('start', () => {
      isTransitioningCamera.current = false;
    });

    // 4. Mandatory Studio PBR Lighting & RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Warm directional key light
    const keyLight = new THREE.DirectionalLight('#fff4e6', 2.2);
    keyLight.position.set(4, 6, 3);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 18;
      keyLight.shadow.camera.left = -5;
      keyLight.shadow.camera.right = 5;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Cool sky/ground HemisphereLight fill
    const hemiLight = new THREE.HemisphereLight('#5d7ea6', '#14171f', 1.3);
    hemiLight.position.set(0, 8, 0);
    scene.add(hemiLight);

    // Screen accent spotlight
    const screenSpot = new THREE.SpotLight('#6366f1', 3.0, 10, Math.PI / 4, 0.4);
    screenSpot.position.set(0, 4.2, -2.5);
    screenSpot.target.position.set(0, 2.0, -4.5);
    scene.add(screenSpot);
    scene.add(screenSpot.target);

    // 5. Materials library
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: '#1a1e28',
      roughness: 0.35,
      metalness: 0.15,
    });

    const walnutWoodMaterial = new THREE.MeshStandardMaterial({
      color: '#34261d',
      roughness: 0.45,
      metalness: 0.05,
    });

    const brushedMetalMaterial = new THREE.MeshStandardMaterial({
      color: '#bcc5d3',
      roughness: 0.22,
      metalness: 0.85,
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.1,
      metalness: 0.95,
    });

    const darkTrimMaterial = new THREE.MeshStandardMaterial({
      color: '#14171e',
      roughness: 0.5,
      metalness: 0.3,
    });

    const chairMeshMaterial = new THREE.MeshStandardMaterial({
      color: '#2d3345',
      roughness: 0.65,
      metalness: 0.1,
    });

    // 6. Architectural Room & Horizon Background
    // Floor
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // Soft contact shadow plane under boardroom zone
    const contactShadowGeo = new THREE.PlaneGeometry(7.5, 5.5);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.005;
    scene.add(contactShadow);

    // Architectural Perimeter: Back glass wall with procedural skyline vista
    const backWallGroup = new THREE.Group();
    // Glass panes
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#101726',
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.2,
      reflectivity: 0.8,
    });
    const glassPaneGeo = new THREE.BoxGeometry(18, 5.5, 0.1);
    const glassPane = new THREE.Mesh(glassPaneGeo, glassMaterial);
    glassPane.position.set(0, 2.75, -6.5);
    backWallGroup.add(glassPane);

    // Procedural distant skyline skyscrapers outside window
    const skylineGroup = new THREE.Group();
    const bldgMaterial = new THREE.MeshBasicMaterial({ color: '#090d16' });
    const windowGlowMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });

    for (let i = -7; i <= 7; i++) {
      const bldgH = 4 + Math.abs(Math.sin(i * 1.7)) * 7;
      const bldgW = 1.2 + Math.abs(Math.cos(i * 2.3)) * 0.8;
      const bldgZ = -9 - Math.abs(Math.sin(i)) * 4;
      const bldgGeo = new THREE.BoxGeometry(bldgW, bldgH, bldgW);
      const bldgMesh = new THREE.Mesh(bldgGeo, bldgMaterial);
      bldgMesh.position.set(i * 1.8, bldgH / 2, bldgZ);
      skylineGroup.add(bldgMesh);

      // Window grid specs
      const winGeo = new THREE.BoxGeometry(bldgW * 0.8, 0.08, 0.02);
      for (let w = 1; w < bldgH - 0.5; w += 0.9) {
        if (Math.sin(i * 3 + w) > -0.2) {
          const winMesh = new THREE.Mesh(winGeo, windowGlowMat);
          winMesh.position.set(i * 1.8, w, bldgZ + bldgW / 2 + 0.02);
          skylineGroup.add(winMesh);
        }
      }
    }
    scene.add(skylineGroup);
    scene.add(backWallGroup);

    // Ceiling acoustic baffles
    const ceilingGroup = new THREE.Group();
    for (let c = -4; c <= 4; c += 1.5) {
      const baffleGeo = new THREE.BoxGeometry(14, 0.15, 0.4);
      const baffle = new THREE.Mesh(baffleGeo, darkTrimMaterial);
      baffle.position.set(0, 4.8, c);
      ceilingGroup.add(baffle);
    }
    scene.add(ceilingGroup);

    // 7. COMPOSITE 3-12 PART PROCEDURAL MODELS:
    // (A) Boardroom Conference Table (Composite 7-part model)
    const tableGroup = new THREE.Group();
    // 1. Primary Tabletop slab with bevel-like profile
    const tabletopGeo = new THREE.BoxGeometry(4.2, 0.1, 1.8);
    const tabletop = new THREE.Mesh(tabletopGeo, walnutWoodMaterial);
    tabletop.position.y = 0.75;
    tabletop.castShadow = !isSoftwareGl;
    tabletop.receiveShadow = !isSoftwareGl;
    tableGroup.add(tabletop);

    // 2. Center cable management brushed metal trough
    const troughGeo = new THREE.BoxGeometry(2.4, 0.02, 0.22);
    const trough = new THREE.Mesh(troughGeo, brushedMetalMaterial);
    trough.position.set(0, 0.805, 0);
    tableGroup.add(trough);

    // 3. LED perimeter accent underglow
    const ledGlowGeo = new THREE.BoxGeometry(4.1, 0.02, 1.7);
    const ledGlowMat = new THREE.MeshBasicMaterial({ color: '#6366f1' });
    const ledGlow = new THREE.Mesh(ledGlowGeo, ledGlowMat);
    ledGlow.position.y = 0.69;
    tableGroup.add(ledGlow);

    // 4. Structural under-carriage chassis
    const chassisGeo = new THREE.BoxGeometry(3.6, 0.08, 1.3);
    const chassis = new THREE.Mesh(chassisGeo, darkTrimMaterial);
    chassis.position.y = 0.65;
    tableGroup.add(chassis);

    // 5. Left pedestal beveled support leg
    const legLeftGeo = new THREE.BoxGeometry(0.3, 0.62, 0.9);
    const legLeft = new THREE.Mesh(legLeftGeo, darkTrimMaterial);
    legLeft.position.set(-1.3, 0.31, 0);
    legLeft.castShadow = !isSoftwareGl;
    tableGroup.add(legLeft);

    // 6. Right pedestal beveled support leg
    const legRight = new THREE.Mesh(legLeftGeo, darkTrimMaterial);
    legRight.position.set(1.3, 0.31, 0);
    legRight.castShadow = !isSoftwareGl;
    tableGroup.add(legRight);

    // 7. Heavy floor stabilization base plates
    const basePlateGeo = new THREE.BoxGeometry(0.5, 0.03, 1.1);
    const basePlateLeft = new THREE.Mesh(basePlateGeo, brushedMetalMaterial);
    basePlateLeft.position.set(-1.3, 0.015, 0);
    const basePlateRight = new THREE.Mesh(basePlateGeo, brushedMetalMaterial);
    basePlateRight.position.set(1.3, 0.015, 0);
    tableGroup.add(basePlateLeft);
    tableGroup.add(basePlateRight);

    scene.add(tableGroup);

    // (B) Composite 8-Part Executive Ergonomic Mesh Chairs
    const createExecutiveChair = (x: number, z: number, rotY: number, chairIdx: number) => {
      const chairGroup = new THREE.Group();
      chairGroup.position.set(x, 0, z);
      chairGroup.rotation.y = rotY;

      // 1. 5-star wheeled base
      const starBaseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 5);
      const starBase = new THREE.Mesh(starBaseGeo, darkTrimMaterial);
      starBase.position.y = 0.06;
      chairGroup.add(starBase);

      // 2. Pneumatic chrome cylinder stem
      const cylinderGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
      const cylinder = new THREE.Mesh(cylinderGeo, chromeMaterial);
      cylinder.position.y = 0.24;
      chairGroup.add(cylinder);

      // 3. Swivel seat tilt bracket
      const bracketGeo = new THREE.BoxGeometry(0.2, 0.05, 0.2);
      const bracket = new THREE.Mesh(bracketGeo, darkTrimMaterial);
      bracket.position.y = 0.43;
      chairGroup.add(bracket);

      // 4. Contoured ergonomic seat cushion
      const seatCushionGeo = new THREE.BoxGeometry(0.48, 0.08, 0.46);
      const seatCushion = new THREE.Mesh(seatCushionGeo, chairMeshMaterial);
      seatCushion.position.y = 0.48;
      seatCushion.castShadow = !isSoftwareGl;
      chairGroup.add(seatCushion);

      // 5. Breathable mesh back frame
      const backGeo = new THREE.BoxGeometry(0.46, 0.52, 0.05);
      const backMesh = new THREE.Mesh(backGeo, chairMeshMaterial);
      backMesh.position.set(0, 0.76, -0.22);
      backMesh.rotation.x = -0.06;
      backMesh.castShadow = !isSoftwareGl;
      chairGroup.add(backMesh);

      // 6. Lumbar support pillow
      const lumbarGeo = new THREE.BoxGeometry(0.36, 0.09, 0.04);
      const lumbar = new THREE.Mesh(lumbarGeo, darkTrimMaterial);
      lumbar.position.set(0, 0.65, -0.19);
      chairGroup.add(lumbar);

      // 7. Left adjustable armrest
      const armStemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
      const armStemL = new THREE.Mesh(armStemGeo, brushedMetalMaterial);
      armStemL.position.set(-0.25, 0.58, 0);
      const armPadGeo = new THREE.BoxGeometry(0.08, 0.03, 0.24);
      const armPadL = new THREE.Mesh(armPadGeo, darkTrimMaterial);
      armPadL.position.set(-0.25, 0.68, 0);
      chairGroup.add(armStemL);
      chairGroup.add(armPadL);

      // 8. Right adjustable armrest
      const armStemR = new THREE.Mesh(armStemGeo, brushedMetalMaterial);
      armStemR.position.set(0.25, 0.58, 0);
      const armPadR = new THREE.Mesh(armPadGeo, darkTrimMaterial);
      armPadR.position.set(0.25, 0.68, 0);
      chairGroup.add(armStemR);
      chairGroup.add(armPadR);

      // Chair metadata for interactive raycasting
      chairGroup.userData = { isChair: true, chairIndex: chairIdx };
      return chairGroup;
    };

    // Place chairs around table: 3 on each long side, 1 at head, 1 presenter chair
    const chairPositions = [
      { x: -1.2, z: 1.35, rot: 0, idx: 0 },
      { x: 0.0, z: 1.35, rot: 0, idx: 1 },
      { x: 1.2, z: 1.35, rot: 0, idx: 2 },
      { x: -1.2, z: -1.35, rot: Math.PI, idx: 3 },
      { x: 0.0, z: -1.35, rot: Math.PI, idx: 4 },
      { x: 1.2, z: -1.35, rot: Math.PI, idx: 5 },
      { x: 2.5, z: 0.0, rot: -Math.PI / 2, idx: 6 }, // Head of table
    ];

    chairPositions.forEach((pos) => {
      scene.add(createExecutiveChair(pos.x, pos.z, pos.rot, pos.idx));
    });

    // (C) Composite 6-Part Procedural 3D Presentation Screen Stage
    const stageGroup = new THREE.Group();
    // 1. Stage riser platform
    const riserGeo = new THREE.BoxGeometry(5.4, 0.12, 1.8);
    const riser = new THREE.Mesh(riserGeo, darkTrimMaterial);
    riser.position.set(0, 0.06, -4.5);
    stageGroup.add(riser);

    // 2. Stage front LED step light
    const stepLightGeo = new THREE.BoxGeometry(5.3, 0.02, 0.04);
    const stepLight = new THREE.Mesh(stepLightGeo, ledGlowMat);
    stepLight.position.set(0, 0.11, -3.61);
    stageGroup.add(stepLight);

    // 3. Screen display backing casing
    const screenBackingGeo = new THREE.BoxGeometry(4.6, 2.7, 0.12);
    const screenBacking = new THREE.Mesh(screenBackingGeo, darkTrimMaterial);
    screenBacking.position.set(0, 2.1, -4.6);
    stageGroup.add(screenBacking);

    // 4. Brushed dark titanium display bezel
    const bezelGeo = new THREE.BoxGeometry(4.45, 2.55, 0.04);
    const bezel = new THREE.Mesh(bezelGeo, brushedMetalMaterial);
    bezel.position.set(0, 2.1, -4.54);
    stageGroup.add(bezel);

    // 5. Interactive Procedural Canvas Texture Screen
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 576;
    screenCanvasRef.current = screenCanvas;

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    screenTextureRef.current = screenTexture;

    const screenSurfaceGeo = new THREE.PlaneGeometry(4.35, 2.45);
    const screenSurfaceMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
    });
    const screenSurface = new THREE.Mesh(screenSurfaceGeo, screenSurfaceMat);
    screenSurface.position.set(0, 2.1, -4.51);
    screenSurface.userData = { isScreen: true };
    stageGroup.add(screenSurface);

    // 6. Presentation podium on stage right
    const podiumGeo = new THREE.BoxGeometry(0.65, 1.05, 0.5);
    const podium = new THREE.Mesh(podiumGeo, walnutWoodMaterial);
    podium.position.set(-2.0, 0.58, -4.2);
    podium.castShadow = !isSoftwareGl;
    stageGroup.add(podium);

    scene.add(stageGroup);

    // (D) Decorative Multi-Part Architectural Planters
    const createPlanter = (x: number, z: number) => {
      const planterGroup = new THREE.Group();
      planterGroup.position.set(x, 0, z);

      // Pot base
      const potGeo = new THREE.CylinderGeometry(0.35, 0.28, 0.65, 12);
      const pot = new THREE.Mesh(potGeo, darkTrimMaterial);
      pot.position.y = 0.325;
      planterGroup.add(pot);

      // Soil disk
      const soilGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.04, 12);
      const soilMat = new THREE.MeshStandardMaterial({ color: '#271d18', roughness: 0.9 });
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = 0.63;
      planterGroup.add(soil);

      // Broadleaf foliage (5-part procedural leaves)
      const leafMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.4 });
      for (let l = 0; l < 5; l++) {
        const leafAngle = (l / 5) * Math.PI * 2;
        const leafGeo = new THREE.BoxGeometry(0.18, 0.02, 0.45);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(Math.sin(leafAngle) * 0.15, 0.75 + l * 0.04, Math.cos(leafAngle) * 0.15);
        leaf.rotation.set(0.35, leafAngle, 0.4);
        planterGroup.add(leaf);
      }
      return planterGroup;
    };

    scene.add(createPlanter(-3.4, -4.0));
    scene.add(createPlanter(3.4, -4.0));

    // (E) Procedural 3D Avatars (Representing team participants in seats)
    const avatarsGroup = new THREE.Group();
    const createAvatar = (user: User, chairPos: { x: number; z: number; rot: number }, isUserSelf: boolean) => {
      const avatar = new THREE.Group();
      avatar.position.set(chairPos.x, 0.5, chairPos.z);
      avatar.rotation.y = chairPos.rot;

      // 1. Torso
      const torsoGeo = new THREE.CapsuleGeometry(0.2, 0.28, 6, 12);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: user.color || '#4f46e5',
        roughness: 0.4,
        metalness: 0.2,
      });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 0.35;
      avatar.add(torso);

      // 2. Collar & Corporate Lapel Badge
      const badgeGeo = new THREE.BoxGeometry(0.06, 0.08, 0.02);
      const badgeMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      badge.position.set(0.08, 0.42, 0.21);
      avatar.add(badge);

      // 3. Head & Articulated Neck
      const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.3,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.68;
      avatar.add(head);

      // 4. Holographic Visor glasses
      const visorGeo = new THREE.BoxGeometry(0.22, 0.06, 0.1);
      const visorMat = new THREE.MeshPhysicalMaterial({
        color: '#38bdf8',
        roughness: 0.1,
        metalness: 0.8,
        transmission: 0.5,
        transparent: true,
        opacity: 0.85,
      });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 0.70, 0.12);
      avatar.add(visor);

      // 5. Speaking Voice-Aura Ring (Pulsing ring when active)
      const auraRingGeo = new THREE.RingGeometry(0.28, 0.36, 24);
      const auraRingMat = new THREE.MeshBasicMaterial({
        color: isUserSelf ? '#38bdf8' : '#818cf8',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const auraRing = new THREE.Mesh(auraRingGeo, auraRingMat);
      auraRing.rotation.x = -Math.PI / 2;
      auraRing.position.y = -0.01;
      avatar.add(auraRing);

      if (isUserSelf) {
        avatarAuraMeshRef.current = auraRing;
      }

      // 6. 3D Floating Nameplate billboard
      const plateCanvas = document.createElement('canvas');
      plateCanvas.width = 256;
      plateCanvas.height = 64;
      const pctx = plateCanvas.getContext('2d');
      if (pctx) {
        pctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        pctx.beginPath();
        pctx.roundRect(4, 4, 248, 56, 12);
        pctx.fill();
        pctx.strokeStyle = user.color || '#6366f1';
        pctx.lineWidth = 2;
        pctx.stroke();

        pctx.fillStyle = '#ffffff';
        pctx.font = 'bold 20px -apple-system, sans-serif';
        pctx.textAlign = 'center';
        pctx.fillText(isUserSelf ? `${user.name} (You)` : user.name, 128, 30);

        pctx.fillStyle = '#94a3b8';
        pctx.font = '13px -apple-system, sans-serif';
        pctx.fillText(user.title.split(' ')[0] + ' • Active', 128, 48);
      }

      const plateTex = new THREE.CanvasTexture(plateCanvas);
      plateTex.colorSpace = THREE.SRGBColorSpace;
      const plateSpriteMat = new THREE.SpriteMaterial({ map: plateTex });
      const plateSprite = new THREE.Sprite(plateSpriteMat);
      plateSprite.position.set(0, 1.05, 0);
      plateSprite.scale.set(0.9, 0.22, 1);
      avatar.add(plateSprite);

      return avatar;
    };

    // Spawn avatars for current user and participants
    activeParticipants.slice(0, 6).forEach((participant, idx) => {
      const isSelf = participant.id === currentUser.id;
      const seatPos = chairPositions[idx] || chairPositions[0];
      avatarsGroup.add(createAvatar(participant, seatPos, isSelf));
    });
    scene.add(avatarsGroup);

    // 8. Reaction particles group for 3D emoji bursts
    const reactionParticles = new THREE.Group();
    reactionParticlesRef.current = reactionParticles;
    scene.add(reactionParticles);

    // Render the initial presentation slide
    updateScreenCanvas();

    // 9. Interactive Raycasting for clicking chairs or screen
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr) {
          if (curr.userData && curr.userData.isChair !== undefined) {
            const chairIdx = curr.userData.chairIndex;
            setSeatedIndex(chairIdx);
            const targetChair = chairPositions[chairIdx];
            if (targetChair) {
              _camTargetPos.set(targetChair.x, 1.6, targetChair.z + (targetChair.z > 0 ? 0.3 : -0.3));
              _targetLookAt.set(0, 1.2, -1.0);
              isTransitioningCamera.current = true;
            }
            return;
          }
          if (curr.userData && curr.userData.isScreen) {
            onAdvanceSlide(1);
            return;
          }
          curr = curr.parent;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 10. Animation render loop with frame pacing and smooth exponential damping
    let frameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Camera transition damping
      if (isTransitioningCamera.current) {
        camera.position.lerp(_camTargetPos, 1 - Math.exp(-6 * delta));
        controls.target.lerp(_targetLookAt, 1 - Math.exp(-6 * delta));
        if (camera.position.distanceTo(_camTargetPos) < 0.05) {
          isTransitioningCamera.current = false;
        }
      }

      // Update OrbitControls
      controls.update();

      // Speaking voice aura visual pulse
      if (avatarAuraMeshRef.current) {
        const pulse = isSpeaking ? 0.75 + Math.sin(time * 12) * 0.25 : 0.2;
        (avatarAuraMeshRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
        const scale = isSpeaking ? 1.0 + Math.sin(time * 10) * 0.12 : 1.0;
        avatarAuraMeshRef.current.scale.set(scale, scale, scale);
      }

      // Update 3D reaction particles
      if (reactionParticles.children.length > 0) {
        for (let i = reactionParticles.children.length - 1; i >= 0; i--) {
          const sprite = reactionParticles.children[i] as THREE.Sprite;
          const udata = (sprite as any).userData;
          if (udata) {
            sprite.position.add(udata.velocity);
            udata.life -= delta * 0.6;
            (sprite.material as THREE.SpriteMaterial).opacity = Math.max(0, udata.life);
            if (udata.life <= 0) {
              reactionParticles.remove(sprite);
              sprite.material.dispose();
            }
          }
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeParticipants, currentUser, updateScreenCanvas, onAdvanceSlide]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas isolated mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Top Header Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto flex items-center gap-3">
        <div className="bg-slate-900/90 text-white border border-slate-700/80 rounded-lg px-3.5 py-2 shadow-xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Mesh 3D Immersive Space
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{roomConfig.name}</span>
              <span className="text-xs font-normal text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                PBR Studio
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 text-slate-300 border border-slate-700/80 rounded-lg px-3 py-2 text-xs">
          <span>👥 {activeParticipants.length} present</span>
          <span className="text-slate-600">|</span>
          <span>🪑 Seat #{seatedIndex + 1}</span>
        </div>
      </div>

      {/* Floating Reaction Notice */}
      {activeReactionNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
          <div className="bg-slate-900/95 border border-indigo-500/50 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-sm font-medium">
            <span className="text-2xl">{activeReactionNotice}</span>
            <span>You reacted in the 3D space</span>
          </div>
        </div>
      )}

      {/* Viewport-First Collapsible Bottom Control Dock (<= 15% footprint, solid/rgba surfaces without backdrop-filter) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ease-in-out pointer-events-auto max-w-[94vw] w-max ${
          isHudCollapsed ? 'translate-y-[calc(100%+16px)]' : 'translate-y-0'
        }`}
      >
        {/* Cinema Mode Toggle Tab */}
        <button
          onClick={() => setIsHudCollapsed(!isHudCollapsed)}
          className="absolute -top-7 right-4 bg-slate-900 text-slate-300 hover:text-white border border-b-0 border-slate-700/80 rounded-t-lg px-3 py-1 text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
          title="Press H or click to toggle Zen Cinema View"
        >
          <span>{isHudCollapsed ? '▴ Show Controls' : '▾ Zen Mode'}</span>
        </button>

        {/* Unified Bottom Dock */}
        <div className="bg-slate-900 text-white border border-slate-700 rounded-xl px-4 py-3 shadow-2xl flex flex-wrap items-center gap-3 sm:gap-5">
          {/* Camera View Presets */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => applyPreset('table')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                cameraPreset === 'table' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => applyPreset('screen')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                cameraPreset === 'screen' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Presentation Screen
            </button>
            <button
              onClick={() => applyPreset('presenter')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                cameraPreset === 'presenter' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Presenter
            </button>
            <button
              onClick={() => applyPreset('orbit')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                cameraPreset === 'orbit' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Free Orbit
            </button>
          </div>

          <div className="h-5 w-px bg-slate-700 hidden sm:block" />

          {/* Slide Deck Controller */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 hidden md:inline">Deck:</span>
            <button
              onClick={() => onAdvanceSlide(-1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
              title="Previous Slide"
            >
              ◀ Prev
            </button>
            <span className="text-xs font-semibold px-2 text-indigo-300">
              {roomConfig.currentSlide + 1} / {roomConfig.slides.length}
            </span>
            <button
              onClick={() => onAdvanceSlide(1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
              title="Next Slide"
            >
              Next ▶
            </button>
          </div>

          <div className="h-5 w-px bg-slate-700 hidden sm:block" />

          {/* Mic Toggle with Voice Aura indicator */}
          <button
            onClick={onToggleMic}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-950/80 border border-rose-800 text-rose-200 hover:bg-rose-900'
                : 'bg-emerald-950/80 border border-emerald-700 text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            <span>{isMuted ? '🔇 Muted' : '🎙️ Mic Active'}</span>
            {!isMuted && isSpeaking && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* 3D Reaction Burst Buttons */}
          <div className="flex items-center gap-1">
            {['👏', '❤️', '🎉', '💡', '🚀'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => triggerReaction(emoji)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-indigo-600 text-base flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                title={`Send ${emoji} reaction to 3D space`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Zen Mode Re-open Button when fully collapsed */}
      {isHudCollapsed && (
        <button
          onClick={() => setIsHudCollapsed(false)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white border border-slate-700 rounded-full px-4 py-2 text-xs font-semibold shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-indigo-600 transition-colors"
        >
          <span>▴ Open Controls</span>
        </button>
      )}
    </div>
  );
};
