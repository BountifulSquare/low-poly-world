import * as THREE from './node_modules/three/build/three.module.js'
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js'
import Terrain from './src/terrain.js'
import Water from './src/water.js'

function setup(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 1, 2000)
    camera.position.set(0, 1200, 800)
    const controls = new OrbitControls(camera, canvas)
    controls.update()

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xE3FBFF)

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
    dirLight.position.set(-50, 300, -50)
    scene.add(dirLight)

    return {
        renderer,
        camera,
        scene
    }
};

(function main() {
    const canvas = document.getElementById('canvas')
    const { renderer, camera, scene } = setup(canvas)

    const terrain = new Terrain()
    scene.add(terrain.Mesh)
    const lp = new THREE.Vector3(-50, 300, -50)
    const water = new Water(lp, camera.position)
    scene.add(water.Mesh)

    function animate(dt) {
        renderer.render(scene, camera)
        requestAnimationFrame(animate)

        water.update(dt)
    }
    animate()
}())