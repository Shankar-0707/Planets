import './style.css'
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { log } from 'three/webgpu';



// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
});

// Configure renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);


const loader = new RGBELoader();
loader.load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping
  // scene.background = texture
  scene.environment = texture
})


const radius = 1.3
const segments = 64
const orbitRadius = 4.5
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]
const textures = ['./csilla/color.png', './earth/map.jpg', './venus/map.jpg', './volcanic/color.png',]

const spheres = new THREE.Group()

// Create a large sphere for the skybox
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
// Flip the geometry inside out so we see the texture from inside


const starTextureLoader = new THREE.TextureLoader();
const starTexture = starTextureLoader.load('./stars.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace

const starMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  side: THREE.BackSide // Render the inside of the sphere
});

const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);


const spheresMesh = []


// // Create ambient light for base illumination
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);

// // Create main directional light (key light)
// const keyLight = new THREE.DirectionalLight(0xffffff, 1);
// keyLight.position.set(5, 5, 5);
// scene.add(keyLight);

// // Create fill light
// const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
// fillLight.position.set(-5, 3, 0);
// scene.add(fillLight);

// // Create back light for rim lighting
// const backLight = new THREE.DirectionalLight(0xffffff, 0.7);
// backLight.position.set(0, 3, -5);
// scene.add(backLight);





for (let i = 0; i < 4; i++) {


  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace


  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);

  spheresMesh.push(sphere)

  const angle = ((i / 4) * (Math.PI * 2))
  sphere.position.x = orbitRadius * Math.cos(angle)
  sphere.position.z = orbitRadius * Math.sin(angle)

  // equuation in 3D
  // x = r * Math.cos (theta)
  // z = r * Math.sin (theta)
  spheres.add(sphere);
}

spheres.rotation.x = 0.1
spheres.position.y = -0.8
scene.add(spheres)

// Add orbit controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00})
// const cube = new THREE.Mesh(geometry, material)
// scene.add(cube)

camera.position.z = 9

let lastScrollTime = 0;
const throttleDelay = 2000; // 2 seconds
let scrollCount = 0


window.addEventListener('wheel', (event) => {
  const currentTime = Date.now();
  
  if (currentTime - lastScrollTime >= throttleDelay) {
    // scrollCount++
    lastScrollTime = currentTime;
    const  direction = event.deltaY > 0 ? "down" : "up"

    scrollCount = (scrollCount + 1) % 4
    console.log(scrollCount)

    const headings = document.querySelectorAll("h1")
    gsap.to(headings,{
      duration:1,
      y:`-=${100}%`,
      ease:"power2.inOut"
    })

    gsap.to(spheres.rotation,{
      duration:1,
      y:`-=${Math.PI/2}%`,
      ease:"power2.inOut",
    })

    if(scrollCount == 0){
      gsap.to(headings,{
        duration:1,
        y:`0`,
        ease:"power2.inOut"
      })
    }
   
    
  }
  
});


// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// gsap.to(spheres.rotation, {
//   y : `+=${Math.PI/2}`,
//   duration: 2,
//   repeat:-1,
//   repeatDelay:1,
//   ease : "expo.easeinOut"
// })


// setInterval(()=>{
//   gsap.to(spheres.rotation, {
//     y : `+=${Math.PI/2}`,
//     duration: 2,
//      ease : "expo.easeinOut",
//     })
// }, 2500)

const clock = new THREE.Clock()
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  for(let i = 0 ; i< spheresMesh.length; i++){
    const sphere = spheresMesh[i];
    sphere.rotation.y = clock.getElapsedTime() * 0.02
  }
  renderer.render(scene, camera);
}

animate();
