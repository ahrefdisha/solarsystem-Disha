// Scene, camera, renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("solarCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);

// Light and sun
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(0, 0, 0);
scene.add(light);

const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet data
const rawPlanets = [
  { name: 'Mercury', size: 0.3, distance: 4, speed: 0.02, color: 0xaaaaff },
  { name: 'Venus', size: 0.5, distance: 6, speed: 0.015, color: 0xffcc99 },
  { name: 'Earth', size: 0.5, distance: 8, speed: 0.01, color: 0x3399ff },
  { name: 'Mars', size: 0.4, distance: 10, speed: 0.008, color: 0xff6633 },
  { name: 'Jupiter', size: 1, distance: 13, speed: 0.006, color: 0xffcc66 },
  { name: 'Saturn', size: 0.9, distance: 16, speed: 0.004, color: 0xffff99 },
  { name: 'Uranus', size: 0.7, distance: 18, speed: 0.003, color: 0x66ffff },
  { name: 'Neptune', size: 0.7, distance: 20, speed: 0.002, color: 0x6666ff }
];

// Store planets and angles
const planets = [];
const planetAngles = {};

// Create planets and sliders
rawPlanets.forEach(planet => {
  const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: planet.color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = planet.distance;

  scene.add(mesh);

  planets.push({
    name: planet.name,
    mesh,
    distance: planet.distance,
    speed: planet.speed
  });

  planetAngles[planet.name] = 0;

  // Create slider
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0.001;
  slider.max = 0.05;
  slider.step = 0.001;
  slider.value = planet.speed;

  slider.addEventListener("input", () => {
    const planetObj = planets.find(p => p.name === planet.name);
    if (planetObj) {
      planetObj.speed = parseFloat(slider.value);
    }
  });

  const label = document.createElement("label");
  label.textContent = `${planet.name}: `;
  label.style.color = "white";

  const slidersDiv = document.getElementById("sliders");
  slidersDiv.appendChild(label);
  slidersDiv.appendChild(slider);
  slidersDiv.appendChild(document.createElement("br"));
});

camera.position.z = 30;

// Stars
function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

  const starVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
addStars();

// Pause/Resume
let isPaused = false;
document.getElementById("toggleBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("toggleBtn").textContent = isPaused ? "Resume" : "Pause";
});

// Tooltips
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
document.body.appendChild(tooltip);

window.addEventListener("mousemove", event => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const matched = planets.find(p => p.mesh === intersects[0].object);
    tooltip.style.display = "block";
    tooltip.style.left = event.clientX + 10 + "px";
    tooltip.style.top = event.clientY + 10 + "px";
    tooltip.innerText = matched.name;
  } else {
    tooltip.style.display = "none";
  }
});

// Animate
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    planets.forEach(p => {
      planetAngles[p.name] += p.speed;
      p.mesh.position.x = Math.cos(planetAngles[p.name]) * p.distance;
      p.mesh.position.z = Math.sin(planetAngles[p.name]) * p.distance;
    });
  }

  renderer.render(scene, camera);
}
animate();