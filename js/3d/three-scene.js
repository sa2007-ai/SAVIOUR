/**
 * 3D Interactive WebGL Experience for SAVIOUR
 * Renders the 3D SAVIOUR Shield, Location Pin, and floating ambient particles.
 * Supports mouse move and mobile gyroscope/device orientation tracking.
 */

export class ThreeSceneManager {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.shieldGroup = null;
    this.particles = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.animFrameId = null;

    if (this.container) {
      this.init();
    }
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded, using CSS 3D fallback.');
      return;
    }

    const width = this.container.clientWidth || 360;
    const height = this.container.clientHeight || 200;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 6.5;

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    
    // Clear container and append canvas
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const bluePointLight = new THREE.PointLight(0x3b82f6, 3, 20);
    bluePointLight.position.set(3, 4, 5);
    this.scene.add(bluePointLight);

    const amberPointLight = new THREE.PointLight(0xf59e0b, 2, 20);
    amberPointLight.position.set(-3, -2, 4);
    this.scene.add(amberPointLight);

    // 5. Build 3D SAVIOUR Shield & Emblem
    this.shieldGroup = new THREE.Group();

    // Outer Shield Geometry
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.8);
    shieldShape.quadraticCurveTo(1.4, 1.7, 1.5, 0.5);
    shieldShape.quadraticCurveTo(1.4, -1.0, 0, -1.8);
    shieldShape.quadraticCurveTo(-1.4, -1.0, -1.5, 0.5);
    shieldShape.quadraticCurveTo(-1.4, 1.7, 0, 1.8);

    const extrudeSettings = {
      depth: 0.25,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08
    };

    const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    const shieldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a8a,
      metalness: 0.7,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      transmission: 0.2,
      opacity: 0.95,
      transparent: true
    });
    const shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shieldMesh.position.set(0, 0, -0.1);
    this.shieldGroup.add(shieldMesh);

    // Gold Pin Center Emblem
    const pinGeometry = new THREE.SphereGeometry(0.35, 32, 32);
    const pinMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.2
    });
    const pinMesh = new THREE.Mesh(pinGeometry, pinMaterial);
    pinMesh.position.set(0, 0.35, 0.3);
    this.shieldGroup.add(pinMesh);

    // Glowing Concentric Ring
    const ringGeo = new THREE.TorusGeometry(0.55, 0.03, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 0.35, 0.25);
    this.shieldGroup.add(ringMesh);

    // Protective Arc / Helping Hand Base
    const arcGeo = new THREE.TorusGeometry(0.8, 0.06, 16, 32, Math.PI);
    const arcMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const arcMesh = new THREE.Mesh(arcGeo, arcMat);
    arcMesh.position.set(0, -0.2, 0.25);
    arcMesh.rotation.z = Math.PI;
    this.shieldGroup.add(arcMesh);

    this.scene.add(this.shieldGroup);

    // 6. Floating Particles Atmosphere
    const particleCount = 40;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 4;
      scales[i / 3] = Math.random() * 0.1 + 0.05;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.1,
      transparent: true,
      opacity: 0.7
    });

    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);

    // 7. Event Listeners for Interactivity
    this.setupInteractivity();

    // 8. Start Render Loop
    this.animate();
  }

  setupInteractivity() {
    window.addEventListener('resize', () => this.onResize());

    // Mouse Move
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.targetRotationY = x * 0.45;
      this.targetRotationX = -y * 0.35;
    });

    this.container.addEventListener('mouseleave', () => {
      this.targetRotationX = 0;
      this.targetRotationY = 0;
    });

    // Gyroscope / Device Tilt for Mobile
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          this.targetRotationY = (e.gamma / 45) * 0.4;
          this.targetRotationX = ((e.beta - 45) / 45) * 0.3;
        }
      });
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animFrameId = requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.0015;

    if (this.shieldGroup) {
      // Smooth interpolation towards mouse/gyro target
      this.shieldGroup.rotation.y += (this.targetRotationY - this.shieldGroup.rotation.y) * 0.08;
      this.shieldGroup.rotation.x += (this.targetRotationX - this.shieldGroup.rotation.x) * 0.08;

      // Gentle floating oscillation
      this.shieldGroup.position.y = Math.sin(time * 1.5) * 0.08;
      this.shieldGroup.rotation.z = Math.sin(time) * 0.03;
    }

    if (this.particles) {
      this.particles.rotation.y = time * 0.05;
      this.particles.rotation.x = time * 0.02;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
