# ThreeJs_videotexture
a test using video as material in ThreeJs, based on https://sbcode.net/threejs/glass-transmission/

## Table of contents

- [General info](#general-info)
- [Screenshots](#screenshots)
- [Technologies](#technologies)
- [Setup](#setup)
- [Features](#features)
- [Status](#status)
- [Inspiration](#inspiration)
- [Contact](#contact)

## General info

- the clip is taken from https://www.vecteezy.com/free-videos/color-gradient
- How to apply video as texture in ThreeJS https://www.youtube.com/watch?v=OM5kgBvAj2c
- How to unwrap a texture in Blender https://www.youtube.com/watch?v=6F5M0ZuL-eg&t=48s
- Create a gradient animation in After Effects https://www.youtube.com/watch?v=ESdyPJhSbUU

## Screenshots

![Example screenshot](./planning/screenshot.jpg)

## Technologies

- Node
- VSC code
- JavaScript
- Typescript
- ThreeJs
- ...

## Setup

- `npm run dev`

## Code Examples

```js
const video = document.getElementById('video') as any | null;
if (video != null) {
    video.muted = true;
    video.play();
}
const videoTexture = new THREE.VideoTexture(video);
const vid = new THREE.MeshBasicMaterial({
    map: videoTexture,
    blending: THREE.AdditiveBlending,
    depthTest: true,
     transparent: true
});
```

## Features

List of features ready and Todos for future development

- a glass material is applied on the surface of the 3D object
- a video is also applied on the surface of the 3D object
- a controller is created to tweak the look of the glass material
- HRDI textures are used
- A morphing animation made in Blender is created

To-do list:

- Stop the animation automatically at the end (loop only once)
- Being able to restart the animation
- Play the animation back and forth

## Status

Project is: _in progress_

## Inspiration

https://sbcode.net/threejs/glass-transmission/

## Contact

By Bermarte

