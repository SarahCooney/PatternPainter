//****
//WebGL checks and canvas setup
//****
var webglExists = ( function () { try { var canvas = document.createElement( 'canvas' ); return !!window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )(); // jscs:ignore

if (!webglExists) {
  alert('Your browser does not appear to support WebGL. You can try viewing this page anyway, but it may be slow and some things may not look as intended. Please try viewing on desktop Firefox or Chrome.');
}

if (/&?webgl=0\b/g.test(location.hash)) {
  webglExists = !confirm('Are you sure you want to disable WebGL on this page?');
  if (webglExists) {
    location.hash = '#';
  }
}

// Workaround: in Chrome, if a page is opened with window.open(),
// window.innerWidth and window.innerHeight will be zero.
if ( window.innerWidth === 0 ) {
  window.innerWidth = parent.innerWidth;
  window.innerHeight = parent.innerHeight;
}

//****
//Global Variables
//****
//TODO: Check for Use
var camera, 
scene, 
renderer, 
clock, 
player,  
lastOptions, 
controls = {}, 
fpsCamera, 
skyDome, skyLight, road;

var INV_MAX_FPS = 1 / 100,
    frameDelta = 0,
    paused = true,
    mouseX = 0,
    mouseY = 0,
    useFPS = false;

//Terrain
var terrainScene;

//****
//MAYBE NOT USED??
//****
var objects; //TODO - this will be a 2D array the size of terrainMain, to tell if a spot has an object. - MAYBE 
var p1 = true, //Toggle
p1Scene;  //Scene for objects
var p2 = false, p2Scene;
var p3Scene, p4Scene;
var building;

//BACKGROUND Variables
var scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8; //Scenes for adding background details
var scene9, scene10, scene11, scene12, scene13, scene14;
var building1, building2; //Right side building
var fence;
var tree, tree2;
var trash;


//Real Pattern Variables
var sceneDict = {};
//Tree Places (171)
var p171 = false, p171Scene;
var tree_1, tree_2, tree_3, tree_4;
//Seat Spots (241)
var p241 = false;
var bench;
//Raised Flowers(245)
var p245 = false;
var flowerbed;
//Food Stands (93)
var p93 = false;
var foodstand;
//Animals (74)
var p74 = false;
var animals;
//Adventure Park (73)
var p73 = false;
var adventurePark;
//Carnival (58)
var p58 = false;
var tent;
//Compost (178)
var p178 = false;
var compost;

//****
//Animation Functions
//****
function animate() {
  
  frameDelta = clock.getDelta();
  requestAnimationFrame(animate );
  update(frameDelta);
  __printCameraData();
  draw();
  
  
}

function startAnimating() {
  if (paused) {
    paused = false
    controls.freeze = false
    clock.start();
    requestAnimationFrame(animate);
  }
}

function stopAnimating() {
  paused = true;
  controls.freeze = true;
  clock.stop();
}

//****
//Setup - calls all the setup methods 
//****
function setup() { //TODO Add and edit all these methods
  setupThreeJS();
  setupControls();
  setupWorld();
  watchFocus();
  setupDatGui();
  startAnimating();
}

//****
//SetupThreeJS - sets up a blank canvas and scene with a perspective camera. 
//****
function setupThreeJS() {
	scene = new THREE.Scene();
	
	//Creates a blank Canvas
	renderer = webglExists ? new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	renderer.domElement.setAttribute('tabindex', -1);

	//Setup Camera
	//TODO change position and rotation for new scene 
	camera = new THREE.PerspectiveCamera(60, renderer.domElement.width / renderer.domElement.height, 1, 10000);
	scene.add(camera);
	/*camera.position.x = 2000;
	camera.position.y = 1500;
	camera.position.z = 700;
	camera.rotation.x = -60 * Math.PI / 180;
	camera.rotation.y = 55 * Math.PI / 180;
	camera.rotation.z = 70 * Math.PI / 180; */
	
  camera.position.x = 2010;
  camera.position.y = 843;
  camera.position.z = 105;
  camera.rotation.x = -88 * Math.PI / 180;
  camera.rotation.y = 67 * Math.PI / 180;
  camera.rotation.z = 88 * Math.PI / 180;
	
	clock = new THREE.Clock(false);
}

//****
//SetupControls - sets first person camera and controls for it
//****
function setupControls() {
  fpsCamera = new THREE.PerspectiveCamera(60, renderer.domElement.width / renderer.domElement.height, 1, 10000);
  scene.add(fpsCamera);
  controls = new THREE.FirstPersonControls(fpsCamera, renderer.domElement);
  controls.freeze = true;
  controls.movementSpeed = 25; //TODO Change movement speed - slower
  controls.lookSpeed = 0.075;
}

//****
//SetupWorld - sets up the background, skybox, and lighting. 
//****
function setupWorld() {
	/*new THREE.TextureLoader().load('./images/sky.jpg', function(t1) { //Setup skybox 
    t1.minFilter = THREE.LinearFilter; // Texture is not a power-of-two size; use smoother interpolation.
    skyDome = new THREE.Mesh(
	  new THREE.BoxGeometry(8192, 8192, 8192, 16, 16, 16),
      new THREE.MeshBasicMaterial({map: t1, side: THREE.BackSide, fog: false})
    );
    skyDome.position.y = -99;
	//SkyDome.rotation.z = 0;
	//skyDome.rotation.x = 0;
	skyDome.rotation.y = 0
    scene.add(skyDome);  //ADD skyDome
  }); */
  
 
    var path = "./images/cityscape/",
		extension = '.png',
        dimension = 4096,
        mesh,
        urls = [ path + 'posx' + extension, path + 'negx' + extension,
                    path + 'posy' + extension, path + 'negy' + extension,
                    path + 'posz' + extension, path + 'negz' + extension],
        textureCube = THREE.ImageUtils.loadTextureCube(urls);

    var shader = THREE.ShaderLib['cube'];
    shader.uniforms['tCube'].value = textureCube;

    var material = new THREE.ShaderMaterial( {
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    skyDome = new THREE.Mesh(
        new THREE.CubeGeometry(dimension, dimension, dimension),
        material
    );
    skyDome.matrixAutoUpdate = false;
    skyDome.updateMatrix();
	skyDome.position.y = -75;
    scene.add(skyDome);  
  
	skyLight = new THREE.DirectionalLight(0xede9e7, 1.5);
	skyLight.position.set(2950, 2625, -160); // Sun on the sky texture
	scene.add(skyLight);
	var light = new THREE.DirectionalLight(0xc3eaff, 0.75);
	light.position.set(-1, -0.5, -1);
	scene.add(light);
}

//****
//watchFocus - helps with animation
//****
function watchFocus() {
  var _blurred = false;
  window.addEventListener('focus', function() {
    if (_blurred) {
      _blurred = false;
      // startAnimating();
      // controls.freeze = false;
    }
  });
  window.addEventListener('blur', function() {
    // stopAnimating();
    _blurred = true;
    controls.freeze = true;
  });
}

//****
//setupDatGui - sets up everything. "Floor", terrain, options, GUI
//****
function setupDatGui() {
	var heightmapImage = new Image(); //in case ever want to use heightmap
	
	//Sets up pretty much everything
	function Settings() {
		var that = this; 
		//Color Settings
		//TODO - possibly get rid of wireframe and grayscale?
		var mat = new THREE.MeshBasicMaterial({color: 0x5566aa, wireframe: true});  //Wireframe
		var gray = new THREE.MeshPhongMaterial({ color: 0x88aaaa, specular: 0x444455, shininess: 10 });  //Grayscale
		var blend;
		
		var loader = new THREE.TextureLoader(); //for creating base and terrain 
		loader.load('./images/road.jpg', function(t1) {
			t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
			road = new THREE.Mesh(
				new THREE.PlaneBufferGeometry(4096, 4096, 64, 64),
				new THREE.MeshLambertMaterial({map: t1})
			);
			road.position.y = -101;
			road.rotation.x = -0.5 * Math.PI;
			scene.add(road);
			
			//GENERATE MATERIAL FOR THE TERRAIN
			 loader.load('./images/ground.jpg', function(t2) {
				//t2.repeat.x = t2.repeat.y = 2;
				blend = THREE.Terrain.generateBlendedMaterial([
					{texture: t2},
					//{texture: t2, levels: [-80, -35, 20, 50]},
                ]); //end Blend
				that.Regenerate();  //Reloads 
			}); //end loader (t2)
		}); //end Loader
		
		//Default Terrain (and Scatter) settings
		this.easing = 'Linear';
		this.heightmap = 'PerlinDiamond'; 
		this.smoothing = 'None';
		this.maxHeight = 15;  //Changed
		this.segments = webglExists ? 63 : 31;
		this.steps = 1;
		this.turbulent = false;
		this.size = 2048;
		this.sky = true;
		this.texture = webglExists ? 'Blended' : 'Wireframe';
		this.edgeDirection = 'Normal';
		this.edgeType = 'Linear'; //Changed
		this.edgeDistance = 256;
		this.edgeCurve = 'EaseInOut';
		this['width:length ratio'] = 2.0;
		this['Flight mode'] = useFPS;
		this['Light color'] = '#' + skyLight.color.getHexString();
		this.spread = 60; //MAY NOT NEED 
		this.scattering = 'PerlinAltitude';  //Scattering of trees  - MAY NOT NEED 
		this.after = function(vertices, options) {
			if (that.edgeDirection !== 'Normal') {
				(that.edgeType === 'Box' ? THREE.Terrain.Edges : THREE.Terrain.RadialEdges)(
				vertices,
				options,
				that.edgeDirection === 'Up' ? true : false,
				that.edgeType === 'Box' ? that.edgeDistance : Math.min(options.xSize, options.ySize) * 0.5 - that.edgeDistance,
				THREE.Terrain[that.edgeCurve]
				);
			}
		};
		
		//Builds the actual terrain based on current options
		window.rebuild = this.Regenerate = function() {
			var s = parseInt(that.segments, 10), //Parse # segments in base 10
			h = that.heightmap === 'heightmap.png';
			
			var o = {
				after: that.after,
				easing: THREE.Terrain[that.easing],
				heightmap: h ? heightmapImage : (that.heightmap === 'influences' ? customInfluences : THREE.Terrain[that.heightmap]),
				material: that.texture == 'Wireframe' ? mat : (that.texture == 'Blended' ? blend : gray),
				maxHeight: that.maxHeight - 100,
				minHeight: -100,
				steps: that.steps,
				stretch: true,
				turbulent: that.turbulent,
				useBufferGeometry: false,
				xSize: that.size,
				ySize: Math.round(that.size * that['width:length ratio']),
				xSegments: s,
				ySegments: Math.round(s * that['width:length ratio']),
				_mesh: typeof terrainScene === 'undefined' ? null : terrainScene.children[0], // internal only
			};
			
			scene.remove(terrainScene);
			terrainScene = THREE.Terrain(o);
			terrainScene.position.x = 100;
			console.log(terrainScene.position.x);
			console.log(terrainScene.position.y);
			console.log(terrainScene.position.z);
			
			terrainScene.rotation.x = -0.5 * Math.PI;
			applySmoothing(that.smoothing, o);
			scene.add(terrainScene);
			skyDome.visible = road.visible = that.texture != 'Wireframe'; 
			
			//Heightmap Stuff
			var he = document.getElementById('heightmap');
			if (he) {
				o.heightmap = he;
				THREE.Terrain.toHeightmap(terrainScene.children[0].geometry.vertices, o);
			}
			
			lastOptions = o;
			
			//How to handle adding the patterns
		//	that['Scatter meshes']();
			//that['Pattern 1']();
			that['City Block']();
			if (p171) { that['Tree Places'](); } 
			if (p241) { that['Seat Spots'](); }
			if (p245) { that['Raised Flowers'](); }
			if (p93) { that['Foodstands'](); }
			if (p74) { that['Animals'](); }
			if (p73) { that['Adventure Park'](); }
			if (p58) { that['Carnival'](); }
			if (p178) { that['Compost'](); }
 		
		}; //end Regnerate 
		
		//Functions to place objects
		this['Tree Places'] = function() {
			var s = parseInt(that.segments, 10);
			var types = ['grove', 'avenue', 'umbrellaTree'];
			//Math.floor((Math.random() * 10) + 1); //Random num 1-10
			var numScenes = Math.floor((Math.random() * 4) + 1);
			var k; 
			for(k=0; k< 4; k++) {
				var key = 'scene171-' + (k+1);
				terrainScene.remove(sceneDict[key]);	//Remove leftover scenes from last click
				if(k < numScenes) {
					var type = Math.floor(Math.random() * 3);
					var loader171 = new THREE.ObjectLoader();
					var param = './models/' + types[type] + '.json';
					console.log(param);
					
					//Repeat the load and place code for each case. 
					if(k == 1) {
						loader171.load(param, function (object) {
							tree_1 = object;
						}); 
						console.log(tree_1);
						//var tempscene;
						//sceneDict[key] = tempscene;					
						var x = Math.floor((Math.random() * 126)); 
						var y = Math.floor((Math.random() * 42) + 42); 
						var rot = Math.random();
						
						geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
						terrainScene.remove(sceneDict[key]);
						sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: tree_1, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
					} //k = 1
					else if(k == 2) {
						loader171.load(param, function (object) {
							tree_2 = object;
						}); 
						console.log(tree_2);
						//var tempscene;
						//sceneDict[key] = tempscene;					
						var x = Math.floor((Math.random() * 126)); 
						var y = Math.floor((Math.random() * 42) + 42); 
						var rot = Math.random();
						
						geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
						terrainScene.remove(sceneDict[key]);
						sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: tree_2, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
					} //k = 2
					
					else if(k == 3) {
						loader171.load(param, function (object) {
							tree_3 = object;
						}); 
						console.log(tree_3);
						//var tempscene;
						//sceneDict[key] = tempscene;					
						var x = Math.floor((Math.random() * 126)); 
						var y = Math.floor((Math.random() * 42) + 42); 
						var rot = Math.random();
						
						geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
						terrainScene.remove(sceneDict[key]);
						sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: tree_3, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
					} //k = 3
					
					else  {
						loader171.load(param, function (object) {
							tree_4 = object;
						}); 
						console.log(tree_4);
						//var tempscene;
						//sceneDict[key] = tempscene;					
						var x = Math.floor((Math.random() * 84)); 
						var y = Math.floor((Math.random() * 42) + 42); 
						var rot = Math.random();
						
						geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
						terrainScene.remove(sceneDict[key]);
						sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: tree_4, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
					} //k = 4
					
				} //end if k < numScenes
			}
		}; //End Tree Places (171)
		
		this['Seat Spots'] = function() {
			var s = parseInt(that.segments, 10);
			var numScenes = Math.floor((Math.random() * 8) + 1);
			var k; 
			for(k=0; k< 8; k++) {
				var key = 'scene241-' + (k+1);
				terrainScene.remove(sceneDict[key]);	//Remove leftover scenes from last click
				if(k < numScenes) {
					var loader241 = new THREE.ObjectLoader();
					loader241.load('./models/bench.json', function (object) {
							bench = object;
					}); 					
					var x = Math.floor((Math.random() * 126)); 
					var y = Math.floor((Math.random() * 42) + 42); 
					var rot = Math.random();
						
					geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
					terrainScene.remove(sceneDict[key]);
					sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: bench, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
				} //end if
			} //end for
			
		} //end seat spots
		
		this['Raised Flowers'] = function() {
			var s = parseInt(that.segments, 10);
			var numScenes = Math.floor((Math.random() * 5) + 1);
			var k; 
			for(k=0; k< 5; k++) {
				var key = 'scene245-' + (k+1);
				terrainScene.remove(sceneDict[key]);	//Remove leftover scenes from last click
				if(k < numScenes) {
					var loader245 = new THREE.ObjectLoader();
					loader245.load('./models/flowers.json', function (object) {
							flowerbed = object;
					}); 					
					var x = Math.floor((Math.random() * 126)); 
					var y = Math.floor((Math.random() * 42) + 42); 
					var rot = Math.random();
						
					geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
					terrainScene.remove(sceneDict[key]);
					sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: flowerbed, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
				} //end if
			} //end for
			
		} //end Raised Flowers
		
		this['Foodstands'] = function() {
			var s = parseInt(that.segments, 10);
			var numScenes = Math.floor((Math.random() * 3) + 1);
			var loader93 = new THREE.ObjectLoader();
					loader93.load('./models/food3.json', function (object) {
							foodstand = object;
					}); 
			var k; 
			for(k=0; k< 3; k++) {
				var key = 'scene93-' + (k+1);
				terrainScene.remove(sceneDict[key]);	//Remove leftover scenes from last click
				if(k < numScenes) {					
					var x = Math.floor((Math.random() * 126)); 
					var y = Math.floor((Math.random() * 42) + 42); 
					var rot = Math.random();
						
					geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
					terrainScene.remove(sceneDict[key]);
					sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: foodstand, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
				} //end if
			} //end for
			
		} //end foodstands
			
		this['Animals'] = function() {
			var s = parseInt(that.segments, 10);
			var numScenes = Math.floor((Math.random() * 3) + 1);
			var loader74 = new THREE.ObjectLoader();
					loader74.load('./models/animals.json', function (object) {
							animals = object;
					}); 
			var k; 
			for(k=0; k< 3; k++) {
				var key = 'scene74-' + (k+1);
				terrainScene.remove(sceneDict[key]);	//Remove leftover scenes from last click
				if(k < numScenes) {					
					var x = Math.floor((Math.random() * 126)); 
					var y = Math.floor((Math.random() * 42) + 42); 
					var rot = Math.random();
						
					geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
					terrainScene.remove(sceneDict[key]);
					sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: animals, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
				} //end if
			} //end for
			
		} //end animals
		
		this['Adventure Park'] = function() {
			var s = parseInt(that.segments, 10);
			var loader73 = new THREE.ObjectLoader();
					loader73.load('./models/adventurepark.json', function (object) {
							adventurePark = object;
					}); 
			
				var key = 'scene73-1';
				terrainScene.remove(sceneDict[key]);	//Remove leftover scenes from last click				
				var x = Math.floor((Math.random() * 126)); //CHANGE ALL
				var y = Math.floor((Math.random() * 42) + 42); 
				var rot = Math.random();
						
				geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
				terrainScene.remove(sceneDict[key]);
				sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: adventurePark, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
			
		} //end Adventure Park
		
		this['Carnival'] = function() {
			var s = parseInt(that.segments, 10);
			var loader58 = new THREE.ObjectLoader();
					loader58.load('./models/tent.json', function (object) {
							tent = object;
					}); 
			
				var key = 'scene58-1';
				terrainScene.remove(sceneDict[key]);	//Remove leftover scenes from last click				
				var x = Math.floor((Math.random() * 126)); //CHANGE ALL
				var y = Math.floor((Math.random() * 42) + 42); 
				var rot = Math.random();
						
				geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
				terrainScene.remove(sceneDict[key]);
				sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: tent, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
			
		} //end carnival
		
		this['Compost'] = function() {
			var s = parseInt(that.segments, 10);
			var loader58 = new THREE.ObjectLoader();
					loader58.load('./models/compost.json', function (object) {
							compost = object;
					}); 
			
				var key = 'scene178-1';
				terrainScene.remove(sceneDict[key]);	//Remove leftover scenes from last click				
				var x = Math.floor((Math.random() * 126)); //CHANGE ALL
				var y = Math.floor((Math.random() * 42) + 42); 
				var rot = Math.random();
						
				geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
				terrainScene.remove(sceneDict[key]);
				sceneDict[key] = THREE.Terrain.PlaceMeshes(geo, { //Options
							mesh: compost, //The object 
							//sizeVariance: 5,
							w: s, //width = # segments
							h: Math.round(s * that['width:length ratio']), //height 
							i: x,
							j: y,
							maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
							maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
							rotation: rot,
						});
						if (sceneDict[key]) {
							terrainScene.add(sceneDict[key]);
						}
			
		} //end carnival
		
		//BACKGROUND SCENERY
		this['City Block'] = function() {
			var s = parseInt(that.segments, 10);			 
			geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
			//LOAD OBJECTS
			//Right Side Building
			var loader2 = new THREE.ObjectLoader(); 
				loader2.load('./models/scene.json', function (object) {
				building1 = object	
			});
			//Left Side Buildings
			var loader4 = new THREE.ObjectLoader(); 
				loader4.load('./models/building3.json', function (object) {
				building2 = object	
			});
			
			//Fence
			var loader3 = new THREE.ObjectLoader();
				loader3.load('./models/fence4.json', function (object) {
				fence = object	
			});
			
			//Trees
			var loader5 = new THREE.ObjectLoader();
				loader5.load('./models/umbrellaTree.json', function (object) {
				tree = object	
			});
			
			var loader6 = new THREE.ObjectLoader();
				loader6.load('./models/grove.json', function (object) {
				tree2 = object	
			});
			
			var loader7 = new THREE.ObjectLoader();
				loader7.load('./models/dumpster.json', function (object) {
				trash = object	
			});
			
			//PLACE OBJECTS
			//Right Side Building
			terrainScene.remove(scene1); 
			scene1 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: building1, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 110,
				j: 40,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene1) {
				terrainScene.add(scene1);
			}
			//Left Side Building
			terrainScene.remove(scene8); 
			scene8 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: building2, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 100,
				j: 110,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene8) {
				terrainScene.add(scene8);
			}
		
			//Fence
			terrainScene.remove(scene2); //Back Right
			scene2 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: fence, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 70,
				j: 42,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene2) {
				terrainScene.add(scene2);
			}
			
			terrainScene.remove(scene3); //Front Right
			scene3 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: fence, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 125,
				j: 42,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene3) {
				terrainScene.add(scene3);
			}
			terrainScene.remove(scene4); //Back Left
			scene4 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: fence, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 70,
				j: 84,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene4) {
				terrainScene.add(scene4);
			}
			terrainScene.remove(scene5); //Front Left
			scene5 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: fence, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 125,
				j: 84,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene5) {
				terrainScene.add(scene5);
			}
			terrainScene.remove(scene6); //Back
			scene6 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: fence, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 0,
				j: 42,
				rotation: 0.25,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene6) {
				terrainScene.add(scene6);
			}
			terrainScene.remove(scene7); //Back2
			scene7 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: fence, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 0,
				j: 50,
				rotation: 0.25,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene7) {
				terrainScene.add(scene7);
			}
			
			//Trees 
			terrainScene.remove(scene9); 
			scene9 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: tree, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 120,
				j: 40,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene9) {
				terrainScene.add(scene9);
			}
			terrainScene.remove(scene10); 
			scene10 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: tree, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 10,
				j: 90,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene10) {
				terrainScene.add(scene10);
			}
			terrainScene.remove(scene11); 
			scene11 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: tree, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 50,
				j: 88,
				rotation: 0.3657,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene11) {
				terrainScene.add(scene11);
			}
			
			terrainScene.remove(scene13); 
			scene13 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: tree, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 50,
				j: 124,
				rotation: 0.74596,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene13) {
				terrainScene.add(scene13);
			}
			
			terrainScene.remove(scene12); 
			scene12 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: tree2, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 95,
				j: 95,
				rotation: 0.666,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene12) {
				terrainScene.add(scene12);
			}
			
			//Trash
			terrainScene.remove(scene14); 
			scene14 = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: trash, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 10,
				j: 35,
				rotation: 0.5,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (scene14) {
				terrainScene.add(scene14);
			}
			
		}; //End background
		
		
		//Extraneous
		this['Pattern 1'] = function() {
		//Objects to Place
			var mesh_1 = buildTree();
			var decoMat_1 = mesh_1.material.map(  //Setup the material of the mesh 
			function(mat) {
				return mat.clone();
			}); // new THREE.MeshBasicMaterial({color: 0x229966, wireframe: true});	  
			decoMat_1[0].wireframe = true;
			decoMat_1[1].wireframe = true;
		
		//BRICK BUILDING
			 var loader2 = new THREE.ObjectLoader();
				loader2.load('./models/scene.json', function (object) {
				building = object	
			});
			
			 var loader3 = new THREE.ObjectLoader();
				loader3.load('./models/fence4.json', function (object) {
				fence = object	
				
				
				
				
			});
			
			
			var s = parseInt(that.segments, 10);
			//TODO Add code to randomly define i and j
			//TODO Add code to keep track of objects in the scene 
			 
			geo = terrainScene.children[0].geometry; //The geometry of the terrain - needed for scatter meshes. 
			terrainScene.remove(p1Scene);
			p1Scene = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: mesh_1, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 0,
				j: 0,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (p1Scene) {
				terrainScene.add(p1Scene);
			}
				terrainScene.remove(p2Scene);
				p2Scene = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: fence, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 70,
				j: 42,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			
			p2Scene = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: fence, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 70,
				j: 42,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			
			if (p2Scene) {
				terrainScene.add(p2Scene);
			}

			terrainScene.remove(p4Scene);
				p4Scene = THREE.Terrain.PlaceMeshes(geo, { //Options
				mesh: building, //The object 
				//sizeVariance: 5,
				w: s, //width = # segments
				h: Math.round(s * that['width:length ratio']), //height 
				i: 110,
				j: 40,
				maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
				maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
			});
			if (p4Scene) {
				terrainScene.add(p4Scene);
			}
			
			
		}; //end Place Function
		
			
	} //end Settings
	
		
	var gui = new dat.GUI();
	var settings = new Settings();
	gui.add(settings, 'Regenerate');
	
	 var PatternFolder = gui.addFolder('Patterns');
	
	PatternFolder.add(settings, 'Tree Places').onChange(function(val) {
		p171 = val;
		if(p171) {
			p171 = false;
			that['Tree Places']();
		}
	});
	
	PatternFolder.add(settings, 'Seat Spots').onChange(function(val) {
		p241 = val;
		if(p241) {
			p241 = false;
			that['Seat Spots']();
		}
	});
	
	PatternFolder.add(settings, 'Raised Flowers').onChange(function(val) {
		p245 = val;
		if(p245) {
			p245 = false;
			that['Raised Flowers']();
		}
	});
	
	PatternFolder.add(settings, 'Foodstands').onChange(function(val) {
		p93 = val;
		if(p93) {
			p93 = false;
			that['Foodstands']();
		}
	});
	
	PatternFolder.add(settings, 'Animals').onChange(function(val) {
		p74 = val;
		if(p74) {
			p74 = false;
			that['Animals']();
		}
	});
	
	PatternFolder.add(settings, 'Adventure Park').onChange(function(val) {
		p73 = val;
		if(p73) {
			p73 = false;
			that['Adventure Park']();
		}
	});
	
	PatternFolder.add(settings, 'Carnival').onChange(function(val) {
		p58 = val;
		if(p58) {
			p58 = false;
			that['Carnival']();
		}
	});
	
	PatternFolder.add(settings, 'Compost').onChange(function(val) {
		p178 = val;
		if(p178) {
			p178 = false;
			that['Compost']();
		}
	});
	
	gui.add(settings, 'Flight mode').onChange(function(val) {
    useFPS = val;
    fpsCamera.position.x = 2010;
    fpsCamera.position.y = 843;
    fpsCamera.position.z = 105;
    controls.lat = -23;
    controls.lon = -179;
    controls.update(0);
    controls.freeze = true;
    if (useFPS) {
      document.getElementById('fpscontrols').className = 'visible';
      setTimeout(function() {
        controls.freeze = false;
      }, 1000);
    }
    else {
      document.getElementById('fpscontrols').className = '';
    }
  });
} //End setupDatGui

window.addEventListener('resize', function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = renderer.domElement.width / renderer.domElement.height;
  camera.updateProjectionMatrix();
  fpsCamera.aspect = renderer.domElement.width / renderer.domElement.height;
  fpsCamera.updateProjectionMatrix();
  draw();
}, false);

function draw() {
  renderer.render(scene, useFPS ? fpsCamera : camera);
}

function update(delta) {
  //if (terrainScene) terrainScene.rotation.z = Date.now() * 0.00001;
  if (controls.update) controls.update(delta);
}

document.addEventListener('mousemove', function(event) {
  if (!paused) {
    mouseX = event.pageX;
    mouseY = event.pageY;
  }
}, false);

function __printCameraData() {
  var s = '';
  s += 'camera.position.x = ' + Math.round(fpsCamera.position.x) + ';\n';
  s += 'camera.position.y = ' + Math.round(fpsCamera.position.y) + ';\n';
  s += 'camera.position.z = ' + Math.round(fpsCamera.position.z) + ';\n';
  s += 'camera.rotation.x = ' + Math.round(fpsCamera.rotation.x * 180 / Math.PI) + ' * Math.PI / 180;\n';
  s += 'camera.rotation.y = ' + Math.round(fpsCamera.rotation.y * 180 / Math.PI) + ' * Math.PI / 180;\n';
  s += 'camera.rotation.z = ' + Math.round(fpsCamera.rotation.z * 180 / Math.PI) + ' * Math.PI / 180;\n';
  s += 'controls.lat = ' + Math.round(controls.lat) + ';\n';
  s += 'controls.lon = ' + Math.round(controls.lon) + ';\n';
  console.log(s);
}

function applySmoothing(smoothing, o) {
  var m = terrainScene.children[0];
  var g = m.geometry.vertices;
  if (smoothing === 'Conservative (0.5)') THREE.Terrain.SmoothConservative(g, o, 0.5);
  if (smoothing === 'Conservative (1)') THREE.Terrain.SmoothConservative(g, o, 1);
  if (smoothing === 'Conservative (10)') THREE.Terrain.SmoothConservative(g, o, 10);
  else if (smoothing === 'Gaussian (0.5, 7)') THREE.Terrain.Gaussian(g, o, 0.5, 7);
  else if (smoothing === 'Gaussian (1.0, 7)') THREE.Terrain.Gaussian(g, o, 1, 7);
  else if (smoothing === 'Gaussian (1.5, 7)') THREE.Terrain.Gaussian(g, o, 1.5, 7);
  else if (smoothing === 'Gaussian (1.0, 5)') THREE.Terrain.Gaussian(g, o, 1, 5);
  else if (smoothing === 'Gaussian (1.0, 11)') THREE.Terrain.Gaussian(g, o, 1, 11);
  else if (smoothing === 'GaussianBox') THREE.Terrain.GaussianBoxBlur(g, o, 1, 3);
  else if (smoothing === 'Mean (0)') THREE.Terrain.Smooth(g, o, 0);
  else if (smoothing === 'Mean (1)') THREE.Terrain.Smooth(g, o, 1);
  else if (smoothing === 'Mean (8)') THREE.Terrain.Smooth(g, o, 8);
  else if (smoothing === 'Median') THREE.Terrain.SmoothMedian(g, o);
  THREE.Terrain.Normalize(m, o);
}

function buildTree() {
  var material = [
    new THREE.MeshLambertMaterial({ color: 0x3d2817 }), // brown
    new THREE.MeshLambertMaterial({ color: 0x2d4c1e }), // green
  ];

  var c0 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6, 1, true));
  c0.position.y = 6;
  var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8));
  c1.position.y = 18;
  var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8));
  c2.position.y = 25;
  var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8));
  c3.position.y = 32;

  var g = new THREE.Geometry();
  c0.updateMatrix();
  c1.updateMatrix();
  c2.updateMatrix();
  c3.updateMatrix();
  g.merge(c0.geometry, c0.matrix);
  g.merge(c1.geometry, c1.matrix);
  g.merge(c2.geometry, c2.matrix);
  g.merge(c3.geometry, c3.matrix);

  var b = c0.geometry.faces.length;
  for (var i = 0, l = g.faces.length; i < l; i++) {
    g.faces[i].materialIndex = i < b ? 0 : 1;
  }

  var m = new THREE.Mesh(g, material);

  m.scale.x = m.scale.z = 5;
  m.scale.y = 1.25;
  return m;
}

function customInfluences(g, options) {
  var clonedOptions = {};
  for (var opt in options) {
      if (options.hasOwnProperty(opt)) {
          clonedOptions[opt] = options[opt];
      }
  }
  clonedOptions.maxHeight = options.maxHeight * 0.67;
  clonedOptions.minHeight = options.minHeight * 0.67;
  THREE.Terrain.DiamondSquare(g, clonedOptions);

  var radius = Math.min(options.xSize, options.ySize) * 0.21,
      height = options.maxHeight * 0.8;
  THREE.Terrain.Influence(
    g, options,
    THREE.Terrain.Influences.Hill,
    0.25, 0.25,
    radius, height,
    THREE.AdditiveBlending,
    THREE.Terrain.Linear
  );
  THREE.Terrain.Influence(
    g, options,
    THREE.Terrain.Influences.Mesa,
    0.75, 0.75,
    radius, height,
    THREE.SubtractiveBlending,
    THREE.Terrain.EaseInStrong
  );
  THREE.Terrain.Influence(
    g, options,
    THREE.Terrain.Influences.Flat,
    0.75, 0.25,
    radius, options.maxHeight,
    THREE.NormalBlending,
    THREE.Terrain.EaseIn
  );
  THREE.Terrain.Influence(
    g, options,
    THREE.Terrain.Influences.Volcano,
    0.25, 0.75,
    radius, options.maxHeight,
    THREE.NormalBlending,
    THREE.Terrain.EaseInStrong
  );
}

/**
 * Classify a numeric input.
 *
 * @param {Number} value
 *   The number to classify.
 * @param {Object/Number[]} [buckets=[-2, -2/3, 2/3, 2]]
 *   An object or numeric array used to classify `value`. If `buckets` is an
 *   array, the returned category will be the first of "very low," "low,"
 *   "medium," and "high," in that order, where the correspondingly ordered
 *   bucket value is higher than the `value` being classified, or "very high"
 *   if all bucket values are smaller than the `value` being classified. If
 *   `buckets` is an object, its values will be sorted, and the returned
 *   category will be the key of the first bucket value that is higher than the
 *   `value` being classified, or the key of the highest bucket value if the
 *   `value` being classified is higher than all the values in `buckets`.
 *
 * @return {String}
 *   The category into which the numeric input was classified.
 */
function numberToCategory(value, buckets) {
    if (!buckets) {
        buckets = [-2, -2/3, 2/3, 2];
    }
    if (typeof buckets.length === 'number' && buckets.length > 3) {
        if (value <  buckets[0]) return 'very low';
        if (value <  buckets[1]) return 'low';
        if (value <  buckets[2]) return 'medium';
        if (value <  buckets[3]) return 'high';
        if (value >= buckets[3]) return 'very high';
    }
    var keys = Object.keys(buckets).sort(function(a, b) {
            return buckets[a] - buckets[b];
        }),
        l = keys.length;
    for (var i = 0; i < l; i++) {
        if (value < buckets[keys[i]]) {
            return keys[i];
        }
    }
    return keys[l-1];
}

/**
 * Utility method to round numbers to a given number of decimal places.
 *
 * Usage:
 *   3.5.round(0) // 4
 *   Math.random().round(4) // 0.8179
 *   var a = 5532; a.round(-2) // 5500
 *   Number.prototype.round(12345.6, -1) // 12350
 *   32..round(-1) // 30 (two dots required since the first one is a decimal)
 */
Number.prototype.round = function(v, a) {
  if (typeof a === 'undefined') {
    a = v;
    v = this;
  }
  if (!a) a = 0;
  var m = Math.pow(10, a|0);
  return Math.round(v*m)/m;
};



//TODO Method for creating a 2D array

