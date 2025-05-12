import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

// إعداد الـ Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

// إعداد المشهد
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

// إعداد الكاميرا
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.7, 4);
scene.add(camera);

// إضاءة
scene.add(new THREE.AmbientLight('white', 1));
const light = new THREE.DirectionalLight('white', 0.5);
light.position.set(1, 2, 2);
scene.add(light);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false; // سيتم تفعيله لاحقًا

// تحميل المجسم
let model;
const loader = new GLTFLoader();
loader.load('./models/earth.glb', gltf => {
  model = gltf.scene;
  model.position.set(0, 0, 0);
  scene.add(model);
}, undefined, err => console.error('Error loading model:', err));

// تحريك الكاميرا في البداية
let transitionProgress = 0;
let isCameraMoving = true;
const initialPos = new THREE.Vector3(0, 0.7, 4);
const cameraEndPosition = new THREE.Vector3(0, 0.7, 3);

// إعداد مواقع الكاميرا واتجاهاتها لكل سكشن
const sections = [
  { pos: new THREE.Vector3(0, 0.7, 3), look: new THREE.Vector3(0, 0, 0) },
  { pos: new THREE.Vector3(2, 0.5, 0), look: new THREE.Vector3(0, 1, 0) },
  { pos: new THREE.Vector3(0, 3, 0), look: new THREE.Vector3(0, 2, 0) }
];


// لتتبع الكاميرا حسب الاسكرول
let currentSection = 0;
let targetCameraPos = camera.position.clone();
let targetLookAt = new THREE.Vector3(0, 0, 0);

// عند تمرير الصفحة، نحدد السكشن ونحدث الاتجاه
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;

  // نحدد السكشن الحالي بناءً على نسبة الاسكرول
  const index = Math.round(scrollY / windowHeight);
  if (index !== currentSection) {
    currentSection = index;
    if (sections[currentSection]) {
      targetCameraPos = sections[currentSection].pos.clone();
      targetLookAt = sections[currentSection].look.clone();
    }
  }
});

    function introAnimation() {
      var introTL = gsap_1.default.timeline();
      introTL.to('.loader', {
        x: '150%',
        duration: 0.8,
        ease: "power4.inOut",
        delay: 1
      }).fromTo(position, {
        x: 3.6,
        y: -0.04,
        z: -3.93
      }, {
        x: -3.6,
        y: -0.04,
        z: -3.93,
        duration: 4,
        onUpdate: onUpdate
      }, '-=0.8').fromTo(target, {
        x: 3.16,
        y: -0.13,
        z: 0.51
      }, {
        x: isMobile ? -0.1 : 0.86,
        y: -0.13,
        z: 0.51,
        duration: 4,
        onUpdate: onUpdate
      }, '-=4').fromTo('.header--container', {
        opacity: 0,
        y: '-100%'
      }, {
        opacity: 1,
        y: '0%',
        ease: "power1.inOut",
        duration: 0.8
      }, '-=1').fromTo('.hero--scroller', {
        opacity: 0,
        y: '150%'
      }, {
        opacity: 1,
        y: '0%',
        ease: "power4.inOut",
        duration: 1
      }, '-=1').fromTo('.hero--content', {
        opacity: 0,
        x: '-50%'
      }, {
        opacity: 1,
        x: '0%',
        ease: "power4.inOut",
        duration: 1.8,
        onComplete: setupScrollAnimation
      }, '-=1');
    }

// التحديث المستمر
const clock = new THREE.Clock();
function draw() {
  const delta = clock.getDelta();

  // الحركة الأولى (عند تحميل الصفحة)
  if (isCameraMoving) {
    transitionProgress += delta * 0.3;
    if (transitionProgress >= 1) {
      transitionProgress = 1;
      isCameraMoving = false;
      controls.enabled = true;
    }
    const newPos = new THREE.Vector3().lerpVectors(initialPos, cameraEndPosition, transitionProgress);
    camera.position.copy(newPos);
    camera.lookAt(0, 0, 0);
  } else {
    // تحريك الكاميرا حسب الاسكرول
    camera.position.lerp(targetCameraPos, delta * 2); // سرعة التحريك
    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    const newLook = new THREE.Vector3().lerpVectors(currentLook, targetLookAt.clone().sub(camera.position), delta * 1.5);
    camera.lookAt(camera.position.clone().add(newLook));
  }

  // تدوير المجسم بعد انتهاء الحركة
  if (model && !isCameraMoving) {
    model.rotation.y += delta * 0.1;
  }

  renderer.render(scene, camera);
  renderer.setAnimationLoop(draw);
}

// ضبط الحجم
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

draw();
