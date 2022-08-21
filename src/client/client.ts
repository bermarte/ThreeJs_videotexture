import * as THREE from 'three'
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls'
import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import {
    GUI
} from 'dat.gui'

const scene = new THREE.Scene()
let clock = new THREE.Clock()
let aniPause = true as Boolean
let clipPlay = null as any

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
const pos = new THREE.Vector3(-9.573628365513542, 7.180221274135149, 31.912094551711778)
camera.position.set(pos.x, pos.y, pos.z)

const renderer = new THREE.WebGLRenderer()
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const material = new THREE.MeshPhysicalMaterial({})
material.thickness = 3.0
material.roughness = 0.9
material.clearcoat = 0.1
material.clearcoatRoughness = 0
material.transmission = 0.91
material.ior = 1.25
material.envMapIntensity = 25

// see how it looks with a single image or with a video texture
// only one of the two should be used at a time
let debugGradientSingle = false
let debugVideo = true

if (debugGradientSingle) {
    const texture = new THREE.TextureLoader().load('img/grid.png')
    material.map = texture
}
if (debugVideo) {
    const video = document.getElementById('video') as any | null
    if (video != null) {
        video.muted = true
        video.play()
    }
    const videoTexture = new THREE.VideoTexture(video)
    const vid = new THREE.MeshBasicMaterial({
        map: videoTexture,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        transparent: true
    })

    material.map = vid.map
}

//HDRI environment map
const pmremGenerator = new THREE.PMREMGenerator(renderer)
const envTexture = new THREE.CubeTextureLoader().load(
    [
        'img/px_50.png',
        'img/nx_50.png',
        'img/py_50.png',
        'img/ny_50.png',
        'img/pz_50.png',
        'img/nz_50.png',
    ],
    () => {
        material.envMap = pmremGenerator.fromCubemap(envTexture).texture
        pmremGenerator.dispose()
    }
)

let objectMesh: THREE.Mesh
let hitboxGltf = null as any
let timeScale = 1 as number
let obj = null as any

let mixer = null as any
const loader = new GLTFLoader()
loader.load(
    'models/objects.glb',
    function (gltf) {
        gltf.scene.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh
                // name of the object in Blender
                if (m.name === 'desktop') {
                    m.material = material
                    objectMesh = m
                    // for the click event
                    hitboxGltf = gltf
                    //animation
                    mixer = new THREE.AnimationMixer(gltf.scene)
                    gltf.animations.forEach((clip: any) => {
                        const action = mixer.clipAction(clip)
                        clipPlay = clip
                        action.play()
                        action.setLoop(THREE.LoopPingPong)
                        action.timeScale = timeScale
                    })
                }
                m.receiveShadow = true
                m.castShadow = true
            }
            if ((child as THREE.Light).isLight) {
                const l = child as THREE.Light
                l.castShadow = true
                l.shadow.bias = -0.001
                l.shadow.mapSize.width = 2048
                l.shadow.mapSize.height = 2048
            }
        })
        scene.add(gltf.scene)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const options = {
    side: {
        FrontSide: THREE.FrontSide,
        BackSide: THREE.BackSide,
        DoubleSide: THREE.DoubleSide,
    },
}
const gui = new GUI()
const materialFolder = gui.addFolder('THREE.Material')
materialFolder.add(material, 'transparent')
materialFolder.add(material, 'opacity', 0, 1, 0.01)
materialFolder.add(material, 'depthTest')
materialFolder.add(material, 'depthWrite')
materialFolder
    .add(material, 'alphaTest', 0, 1, 0.01)
    .onChange(() => updateMaterial())
materialFolder.add(material, 'visible')
materialFolder
    .add(material, 'side', options.side)
    .onChange(() => updateMaterial())
const data = {
    color: material.color.getHex(),
    emissive: material.emissive.getHex(),
}

const meshPhysicalMaterialFolder = gui.addFolder('THREE.MeshPhysicalMaterial')

meshPhysicalMaterialFolder.addColor(data, 'color').onChange(() => {
    material.color.setHex(Number(data.color.toString().replace('#', '0x')))
})
meshPhysicalMaterialFolder.addColor(data, 'emissive').onChange(() => {
    material.emissive.setHex(
        Number(data.emissive.toString().replace('#', '0x'))
    )
})

meshPhysicalMaterialFolder.add(material, 'wireframe')
meshPhysicalMaterialFolder
    .add(material, 'flatShading')
    .onChange(() => updateMaterial())
meshPhysicalMaterialFolder.add(material, 'roughness', 0, 1)
meshPhysicalMaterialFolder.add(material, 'metalness', 0, 1)
meshPhysicalMaterialFolder.add(material, 'clearcoat', 0, 1, 0.01)
meshPhysicalMaterialFolder.add(material, 'clearcoatRoughness', 0, 1, 0.01)
meshPhysicalMaterialFolder.add(material, 'transmission', 0, 1, 0.01)
meshPhysicalMaterialFolder.add(material, 'ior', 1.0, 2.333)
meshPhysicalMaterialFolder.add(material, 'thickness', 0, 10.0)
meshPhysicalMaterialFolder.open()

function updateMaterial() {
    material.side = Number(material.side)
    material.needsUpdate = true
}

const stats = Stats()
document.body.appendChild(stats.dom)

// for mouseover and click events
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / window.innerWidth * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight * 2 - 1)
})

let currentIntersect = null as any
window.addEventListener('click', () => {
    if (currentIntersect) {
        const hitbox = currentIntersect.object.name
        if (hitbox === 'desktop') {
            aniPause === true ? aniPause = false : aniPause = true
        }
    }
})

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    if (objectMesh !== undefined) objectMesh.rotation.y += 0.01

    var delta = clock.getDelta()
    if (mixer) {
        mixer.update(delta)
        aniPause ? mixer.clipAction(clipPlay).paused = true : mixer.clipAction(clipPlay).paused = false
    }
    // click
    if (hitboxGltf) {
        const objectsToTest = hitboxGltf.scene.children
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(objectsToTest, true)
        if (intersects.length) {
            if (currentIntersect === null) {
                document.body.style.cursor = 'pointer'
            }
            currentIntersect = intersects[0]
        } else {
            if (currentIntersect && currentIntersect.object.name === 'desktop') {

                document.body.style.cursor = 'default'
            }
            currentIntersect = null
        }
    }






    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()