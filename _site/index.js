
import * as THREE from 'three';
import { uniform, varying, vec4, add, sub, max, dot, sin, mat3, uint, negate, cameraProjectionMatrix, cameraViewMatrix, positionLocal, modelWorldMatrix, sqrt, attribute, property, float, storage, storageObject, Fn, If, cos, Loop, Continue, normalize, instanceIndex, length } from 'three/tsl';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let container, stats;
let camera, scene, renderer;

let last = performance.now();

let pointer, raycaster;
let computeVelocity, computePosition, effectController;

let BIRDS = 6403;
const SPEED_LIMIT = 9.0;
const BOUNDS = 800, BOUNDS_HALF = BOUNDS / 2;
const IGNORE = "IGNORE";

// Custom Geometry - using 3 triangles each. No normals currently.
class BirdGeometry extends THREE.BufferGeometry {

    constructor() {

        super();

        const trianglesPerBird = 3;
        const triangles = BIRDS * trianglesPerBird;
        const points = triangles * 3;

        const vertices = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
        const references = new THREE.BufferAttribute( new Uint32Array( points ), 1 );
        const birdVertex = new THREE.BufferAttribute( new Uint32Array( points ), 1 );

        this.setAttribute( 'position', vertices );
        this.setAttribute( 'reference', references );
        this.setAttribute( 'birdVertex', birdVertex );

        let v = 0;

        function verts_push() {

            for ( let i = 0; i < arguments.length; i ++ ) {

                vertices.array[ v ++ ] = arguments[ i ];

            }

        }

        const wingsSpan = 20;

        for ( let f = 0; f < BIRDS; f ++ ) {

            // Body
            verts_push(
                0, 0, - 20,
                0, - 8, 10,
                0, 0, 30
            );

            // Wings
            verts_push(
                0, 0, - 15,
                - wingsSpan, 0, 5,
                0, 0, 15
            );

            verts_push(
                0, 0, 15,
                wingsSpan, 0, 5,
                0, 0, - 15
            );

        }

        for ( let v = 0; v < triangles * 3; v ++ ) {

            const triangleIndex = ~ ~ ( v / 3 );
            const birdIndex = ~ ~ ( triangleIndex / trianglesPerBird );

            references.array[ v ] = birdIndex;

            birdVertex.array[ v ] = v % 9;

        }

        this.scale( 0.2, 0.2, 0.2 );

    }

}

function generate2DArray(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // Set canvas size and text font
    canvas.width = text.length * 40;
    canvas.height = 50; // Adjust height based on text size
    ctx.font = '40px Arial'; // Specify font size and family
    ctx.fillStyle = 'black'; // Background color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the background
    ctx.fillStyle = 'white'; // Text color
    ctx.fillText(text, -2, 30); // Draw the text
    
    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let positionArray = [];
    // Convert the image data to a 2D array
    let cap = 10
    const array2D = [];
    for (let y = 0; y < canvas.height; y++) {
      const row = [];
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4; // RGBA index
        const grayscale = imageData[idx]; 
        if (grayscale > 0) {
            positionArray.push(x + (x * cap))
            positionArray.push(-(y + (y * cap)))
            positionArray.push(200.2733612060547)
        }
        row.push(grayscale > 0 ? 'x' : ' ');
      }
      array2D.push(row);
    }
    
    for (let y = 0; y < positionArray.length / 3; y++) {
        positionArray[y * 3 + 0] = positionArray[y * 3 + 0] - (positionArray.length / 3 / 3)
        positionArray[y * 3 + 1] = positionArray[y * 3 + 1] + 100
    }

    return positionArray
}

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.z = 1000;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xffffff, 700, 3000 );

    // Text
    const metrix  = generate2DArray("chan")
    BIRDS = metrix.length / 3;
    console.log(metrix, )
    // Pointer

    pointer = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    // Sky

    const geometry = new THREE.IcosahedronGeometry( 1, 6 );
    const material = new THREE.MeshBasicNodeMaterial( {
        // Use vertex positions to create atmosphere colors
        colorNode: varying(
            vec4(
                sub( 0.25, positionLocal.y ),
                sub( - 0.25, positionLocal.y ),
                add( 1.5, positionLocal.y ),
                1.0
            )
        ),
        side: THREE.BackSide
    } );

    const mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.z = 0.75;
    mesh.scale.setScalar( 1200 );
    scene.add( mesh );

    //

    renderer = new THREE.WebGPURenderer( { antialiasing: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    renderer.toneMapping = THREE.NeutralToneMapping;
    container.appendChild( renderer.domElement );

    // const controls = new OrbitControls( camera, renderer.domElement );
    // controls.connect( /* renderer.domElement */ );

    // Initialize position, velocity, and phase values

    // const positionArray =  metrix;
    const positionArray = new Float32Array( BIRDS * 3 );
    const velocityArray = new Float32Array( BIRDS * 3 );
    const phaseArray = new Float32Array( BIRDS );

    for ( let i = 0; i < BIRDS; i ++ ) {

        const posX = Math.random() * BOUNDS - BOUNDS_HALF;
        const posY = Math.random() * BOUNDS - BOUNDS_HALF;
        const posZ = Math.random() * BOUNDS - BOUNDS_HALF;

        // const posX =i * BOUNDS - BOUNDS_HALF;
        // const posY = i * BOUNDS - BOUNDS_HALF;
        // const posZ = i * BOUNDS - BOUNDS_HALF;
        
        positionArray[ i * 3 + 0 ] = metrix[ i * 3 + 0 ];
        positionArray[ i * 3 + 1 ] = metrix[ i * 3 + 1 ];
        positionArray[ i * 3 + 2 ] = metrix[ i * 3 + 2 ];


        const velX = Math.random() - 0.5;
        const velY = Math.random() - 0.5;
        const velZ = Math.random() - 0.5;

        // const velX = i;
        // const velY = i;
        // const velZ = i;

        velocityArray[ i * 3 + 0 ] = velX * 10;
        velocityArray[ i * 3 + 1 ] = velY * 10;
        velocityArray[ i * 3 + 2 ] = velZ * 10;

        phaseArray[ i ] = 1;

    }

    console.log(metrix)
    console.log(positionArray)
    // Create storage buffer attributes.

    const positionBufferAttribute = new THREE.StorageBufferAttribute( positionArray, 3 );
    const velocityBufferAttribute = new THREE.StorageBufferAttribute( velocityArray, 3 );
    const phaseBufferAttribute = new THREE.StorageBufferAttribute( phaseArray, 1 );

    // Labels applied to storage nodes and uniform nodes are reflected within the shader output,
    // and are useful for debugging purposes.

    // Access storage buffer attribute data from within shaders with a StorageNode.

    const positionStorage = storage( positionBufferAttribute, 'vec3', positionBufferAttribute.count ).label( 'positionStorage' );
    const velocityStorage = storage( velocityBufferAttribute, 'vec3', velocityBufferAttribute.count ).label( 'velocityStorage' );
    const phaseStorage = storage( phaseBufferAttribute, 'float', phaseBufferAttribute.count ).label( 'phaseStorage' );

    // Create read-only storage nodes. Storage nodes can only be accessed outside of compute shaders in a read-only state.

    const positionRead = storageObject( positionBufferAttribute, 'vec3', positionBufferAttribute.count ).toReadOnly();
    const velocityRead = storageObject( velocityBufferAttribute, 'vec3', velocityBufferAttribute.count ).toReadOnly();
    const phaseRead = storageObject( phaseBufferAttribute, 'float', phaseBufferAttribute.count ).toReadOnly();

    // Define Uniforms. Uniforms only need to be defined once rather than per shader.

    effectController = {
        separation: uniform( 15.0 ).label( 'separation' ),
        alignment: uniform( 20.0 ).label( 'alignment' ),
        cohesion: uniform( 20.0 ).label( 'cohesion' ),
        freedom: uniform( 0.75 ).label( 'freedom' ),
        now: uniform( 0.0 ),
        deltaTime: uniform( 0.0 ).label( 'deltaTime' ),
        rayOrigin: uniform( new THREE.Vector3() ).label( 'rayOrigin' ),
        rayDirection: uniform( new THREE.Vector3() ).label( 'rayDirection' )
    };

    // Create geometry

    const birdGeometry = new BirdGeometry();
    const birdMaterial = new THREE.NodeMaterial();

    // Animate bird mesh within vertex shader, then apply position offset to vertices.

    const birdVertexTSL = Fn( () => {

        const reference = attribute( 'reference' );
        const birdVertex = attribute( 'birdVertex' );

        const position = positionLocal.toVar();
        const newPhase = phaseRead.element( reference ).toVar();
        const newVelocity = normalize( velocityRead.element( reference ) ).toVar();

        If( birdVertex.equal( 4 ).or( birdVertex.equal( 7 ) ), () => {

            // flap wings
            position.y = sin( newPhase ).mul( 5.0 );

        } );


        const newPosition = modelWorldMatrix.mul( position );

        newVelocity.z.mulAssign( - 1.0 );
        const xz = length( newVelocity.xz );
        const xyz = float( 1.0 );
        const x = sqrt( ( newVelocity.y.mul( newVelocity.y ) ).oneMinus() );

        const cosry = newVelocity.x.div( xz ).toVar();
        const sinry = newVelocity.z.div( xz ).toVar();

        const cosrz = x.div( xyz );
        const sinrz = newVelocity.y.div( xyz ).toVar();

        // Nodes must be negated with negate(). Using '-', their values will resolve to NaN.
        const maty = mat3(
            cosry, 0, negate( sinry ),
            0, 1, 0,
            sinry, 0, cosry
        );

        const matz = mat3(
            cosrz, sinrz, 0,
            negate( sinrz ), cosrz, 0,
            0, 0, 1
        );
        
    
        const finalVert = maty.mul( matz ).mul( newPosition );
        finalVert.addAssign( positionRead.element( reference ) );

        return cameraProjectionMatrix.mul( cameraViewMatrix ).mul( finalVert );

    } );

    birdMaterial.vertexNode = birdVertexTSL();
    birdMaterial.side = THREE.DoubleSide;
    const birdMesh = new THREE.Mesh( birdGeometry, birdMaterial );
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.matrixAutoUpdate = false;
    birdMesh.updateMatrix();

    // Define GPU Compute shaders.
    // Shaders are computationally identical to their GLSL counterparts outside of texture destructuring.

    computeVelocity = Fn( () => {

        // Define consts
        const PI = float( 3.141592653589793 );
        const PI_2 = PI.mul( 2.0 );
        const limit = property( 'float', 'limit' ).assign( SPEED_LIMIT );

        // Destructure uniforms
        const { alignment, separation, cohesion, deltaTime, rayOrigin, rayDirection } = effectController;

        const zoneRadius = separation.add( alignment ).add( cohesion );
        const separationThresh = separation.div( zoneRadius );
        const alignmentThresh = ( separation.add( alignment ) ).div( zoneRadius );
        const zoneRadiusSq = zoneRadius.mul( zoneRadius );

        const position = positionStorage.element( instanceIndex );
        const velocity = velocityStorage.element( instanceIndex );

        // Add influence of pointer position to velocity.
        const directionToRay = rayOrigin.sub( position );
        const projectionLength = dot( directionToRay, rayDirection );

        const closestPoint = rayOrigin.sub( rayDirection.mul( projectionLength ) );

        const directionToClosestPoint = closestPoint.sub( position );
        const distanceToClosestPoint = length( directionToClosestPoint );
        const distanceToClosestPointSq = distanceToClosestPoint.mul( distanceToClosestPoint );

        const rayRadius = float( 150.0 );
        const rayRadiusSq = rayRadius.mul( rayRadius );

        If( distanceToClosestPointSq.lessThan( rayRadiusSq ), () => {

            // Scale bird velocity inversely with distance from prey radius center.
            const velocityAdjust = ( distanceToClosestPointSq.div( rayRadiusSq ).sub( 1.0 ) ).mul( deltaTime ).mul( 100.0 );
            velocity.addAssign( normalize( directionToClosestPoint ).mul( velocityAdjust ) );
            limit.addAssign( 5.0 );

        } );

        // Attract flocks to center
        const dirToCenter = position.toVar();
        dirToCenter.y.mulAssign( 2.5 );
        velocity.subAssign( normalize( dirToCenter ).mul( deltaTime ).mul( 5.0 ) );

        Loop( { start: uint( 0 ), end: uint( BIRDS ), type: 'uint', condition: '<' }, ( { i } ) => {

            const birdPosition = positionStorage.element( i );
            const dirToBird = birdPosition.sub( position );
            const distToBird = length( dirToBird );

            // Don't apply any changes to velocity if the distance to this bird is negligable.
            If( distToBird.lessThan( 0.0001 ), () => {

                Continue();

            } );

            const distToBirdSq = distToBird.mul( distToBird );

            // Don't apply any changes to velocity if changes if the bird is outsize the zone's radius.
            If( distToBirdSq.greaterThan( zoneRadiusSq ), () => {

                Continue();

            } );

            // Determine which threshold the bird is flying within and adjust its velocity accordingly

            const percent = distToBirdSq.div( zoneRadiusSq );

            If( percent.lessThan( separationThresh ), () => {

                // Separation - Move apart for comfort
                const velocityAdjust = ( separationThresh.div( percent ).sub( 1.0 ) ).mul( deltaTime );
                velocity.subAssign( normalize( dirToBird ).mul( velocityAdjust ) );

            } ).ElseIf( percent.lessThan( alignmentThresh ), () => {

                // Alignment - fly the same direction
                const threshDelta = alignmentThresh.sub( separationThresh );
                const adjustedPercent = ( percent.sub( separationThresh ) ).div( threshDelta );
                const birdVelocity = velocityStorage.element( i );

                const cosRange = cos( adjustedPercent.mul( PI_2 ) );
                const cosRangeAdjust = float( 0.5 ).sub( cosRange.mul( 0.5 ) ).add( 0.5 );
                const velocityAdjust = cosRangeAdjust.mul( deltaTime );
                velocity.addAssign( normalize( birdVelocity ).mul( velocityAdjust ) );

            } ).Else( () => {

                // Attraction / Cohesion - move closer
                const threshDelta = alignmentThresh.oneMinus();
                const adjustedPercent = threshDelta.equal( 0.0 ).select( 1.0, ( percent.sub( alignmentThresh ) ).div( threshDelta ) );

                const cosRange = cos( adjustedPercent.mul( PI_2 ) );
                const adj1 = cosRange.mul( - 0.5 );
                const adj2 = adj1.add( 0.5 );
                const adj3 = float( 0.5 ).sub( adj2 );

                const velocityAdjust = adj3.mul( deltaTime );
                velocity.addAssign( normalize( dirToBird ).mul( velocityAdjust ) );

            } );

        } );

        If( length( velocity ).greaterThan( limit ), () => {

            velocity.assign( normalize( velocity ).mul( limit ) );

        } );

    } )().compute( BIRDS );

    computePosition = Fn( () => {

        const { deltaTime } = effectController;

        positionStorage.element( instanceIndex ).addAssign( velocityStorage.element( instanceIndex ).mul( deltaTime ).mul( 15.0 ));

        const velocity = velocityStorage.element( instanceIndex );
        const phase = phaseStorage.element( instanceIndex );

        const modValue = phase.add( deltaTime ).add( length( velocity.xz ).mul( deltaTime ).mul( 3.0 ) ).add( max( velocity.y, 0.0 ).mul( deltaTime ).mul( 6.0 ) );
        phaseStorage.element( instanceIndex ).assign( modValue.mod( 62.83 ) );

    } )().compute( BIRDS );

    scene.add( birdMesh );

    stats = new Stats();
    container.appendChild( stats.dom );

    container.style.touchAction = 'none';
    container.addEventListener( 'pointermove', onPointerMove );

    window.addEventListener( 'resize', onWindowResize );

    const gui = new GUI();

    gui.add( effectController.separation, 'value', 0.0, 100.0, 1.0 ).name( 'Separation' );
    gui.add( effectController.alignment, 'value', 0.0, 100, 0.001 ).name( 'Alignment ' );
    gui.add( effectController.cohesion, 'value', 0.0, 100, 0.025 ).name( 'Cohesion' );
    gui.close();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onPointerMove( event ) {

    if ( event.isPrimary === false ) return;

    pointer.x = ( event.clientX / window.innerWidth ) * 2.0 - 1.0;
    pointer.y = 1.0 - ( event.clientY / window.innerHeight ) * 2.0;

}

function animate() {
    render();
    stats.update();

}

function render() {
    
    const now = performance.now();
    let deltaTime = ( now - last ) / 1000;

    if ( deltaTime > 1 ) deltaTime = 1; // safety cap on large deltas
    last = now;
    
    raycaster.setFromCamera( pointer, camera );

    effectController.now.value = now;
    effectController.deltaTime.value = deltaTime;
    effectController.rayOrigin.value.copy( raycaster.ray.origin );
    effectController.rayDirection.value.copy( raycaster.ray.direction );

    renderer.compute( computeVelocity );
    renderer.compute( computePosition );
    renderer.render( scene, camera );

    // Move pointer away so we only affect birds when moving the mouse
    pointer.y = 10;

}

init();