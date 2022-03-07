var budgetController = (function(){
	
})();




var UIController = (function(){
	
	var gotowyCover = document.querySelector('.gotowy-cover');
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, gotowyCover.offsetWidth / gotowyCover.offsetWidth, 0.1, 100);
	var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setSize(gotowyCover.offsetWidth, gotowyCover.offsetWidth);
	gotowyCover.appendChild(renderer.domElement);

	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enablePan = false;

	var geometry = new THREE.BoxGeometry(1,1,1);
	camera.position.z = 1;


	var szerOkl = 0;
	var wysOkl = 0;
	var grGrzb = 0;

	var okladkaInput = document.querySelector('#okladka');
	var grzbietInput = document.querySelector('#grzbiet');

	var okladkaSrc, grzbietSrc, textureOkladka, textureGrzbiet;

	
function wczytajObrazek(obrazek, typ) {
		
	var reader = new FileReader();
	
	
	reader.onload = function (e) {
		var obrazek = new Image();	
		obrazek.src = e.target.result;
		
		obrazek.onload = function() {	
			if (typ === 'okladka'){
				okladkaSrc = obrazek.src;
				szerOkl = this.width;
				wysOkl = this.height;
				narysujCover(szerOkl, wysOkl, okladkaSrc, '', '');
			} else if (typ === 'grzbiet'){
				grzbietSrc = obrazek.src;
				grGrzb = this.width;
				narysujCover(szerOkl, wysOkl, okladkaSrc, grGrzb, grzbietSrc);
			}
		};	
	};
	
	
	reader.readAsDataURL(obrazek.files[0]);
}


function wyczyscScene(){
	//czyszczenie sceny
	while(scene.children.length > 0){ 
		scene.remove(scene.children[0]); 
	}
}


function narysujCover(szer, wys, okladka, grGrzb, grzbiet){
	
	if (szer === '') szer = szerOkl;
	if (wys === '') szer = wysOkl;
	if (okladka == '') okladka = okladkaSrc;
	if (grzbiet == '') grzbiet = grzbietSrc;
	
	
	var prop = szer/wys;
	var grubosc = '';
	var loaderO = new THREE.TextureLoader();
	var loaderG = new THREE.TextureLoader();
	textureOkladka = okladka;
				
	if (grGrzb){
		grubosc = grGrzb/wys;
	} else {
		grubosc = 0.2;
	};
				
	if (grzbiet){
		textureGrzbiet = grzbietSrc;
	} else {
		textureGrzbiet = okladkaSrc;
	}
				
	var wczytanaOkladka = loaderO.load(textureOkladka);
	var wczytanyGrzbiet = loaderG.load(textureGrzbiet);

	//dla mniej rozmytych tekstur
	wczytanaOkladka.anisotropy = renderer.capabilities.getMaxAnisotropy();	
	wczytanyGrzbiet.anisotropy = renderer.capabilities.getMaxAnisotropy();
	
	const cubeMaterials = [
		new THREE.MeshBasicMaterial({color: 0xffffff}),
		new THREE.MeshBasicMaterial({map: wczytanyGrzbiet}),
		new THREE.MeshBasicMaterial({color: 0xffffff}),
		new THREE.MeshBasicMaterial({color: 0xffffff}),
		new THREE.MeshBasicMaterial({map: wczytanaOkladka}),
		new THREE.MeshBasicMaterial({map: wczytanaOkladka}),
	];			
	
	const materialsCienia = new THREE.MeshBasicMaterial({color: 0x000000});

				
	var geometry = new THREE.BoxGeometry(prop,1,grubosc);
	var geometryCienia = new THREE.BoxGeometry(prop+0.002, grubosc+0.002, 0.005);
	wyczyscScene();
	mesh = new THREE.Mesh(geometry, cubeMaterials);
	meshCienia = new THREE.Mesh(geometryCienia, materialsCienia);
	scene.add(mesh);
	scene.add(meshCienia);
	meshCienia.position.set(0,-0.5,0);
	meshCienia.rotation.set(1.5707963268,0,0);
}
	  
	
	function takeScreenshot() {
		//https://jsfiddle.net/2pha/art388yv/

		var a = document.createElement('a');
		renderer.render(scene, camera);
		a.href = renderer.domElement.toDataURL().replace("image/png", "image/octet-stream");
		a.download = 'okladka.png'
		a.click();
	}

	function resetCamera(){
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 1;
		camera.rotation.set(0, 0, 0);
		camera.up.set(0, 1, 0);
		camera.lookAt(new THREE.Vector3(0,0,0));
	}


	function zmianaMinFilter(){
		narysujCover(szerOkl, wysOkl, okladkaSrc, grGrzb, grzbietSrc, selectMinFilterVal, selectMagFilterVal);
	}


	function zmianaMagFilter(){
		narysujCover(szerOkl, wysOkl, okladkaSrc, grGrzb, grzbietSrc, selectMinFilterVal, selectMagFilterVal);
	}


	//game logic

	var update = function(){
		//cube.rotation.x += 0.01;
		//cube.rotation.y += 0.01;
	};


	var render = function(){
		//draw.scene
		renderer.render(scene, camera);
	};


	//run game loop (update, render, repeat)
	var gameLoop = function(){
		requestAnimationFrame (gameLoop);
		update();
		render();
	};

	gameLoop();
	
	
	return{
		gotowyCover: gotowyCover,
		renderer: renderer,
		okladkaInput: okladkaInput,
		grzbietInput: grzbietInput,
		wczytajObrazek: wczytajObrazek,
		takeScreenshot: takeScreenshot,
		resetCamera: resetCamera
	}
	
	
})();






//między dwoma powyszymi modułami nie będzie żadnych interakcji, więc trzeba stworzyć trzeci moduł, który będzie je ze sobą komunikował

var controller = (function(budgetCtrl, UICtrl){
	
	//tu ustawiamy, co się ma wydarzyć po każdym evencie i delegujemy zadania do pozostałych modułów
	
	window.addEventListener('resize', function(){
		var width = UICtrl.gotowyCover.offsetWidth;
		var height = UICtrl.gotowyCover.offsetHeight;
		UICtrl.renderer.setSize(width, height);
		UICtrl.camera.aspect = width / height;
		UICtrl.camera.updateProjectionMatrix();
	});
	
	
	UICtrl.okladkaInput.addEventListener('change', function(){
	
		if (UICtrl.okladkaInput.files && UICtrl.okladkaInput.files[0]){
			UICtrl.wczytajObrazek(UICtrl.okladkaInput, 'okladka');
		}
	});


	UICtrl.grzbietInput.addEventListener('change', function(){
		
		if (UICtrl.grzbietInput.files && UICtrl.grzbietInput.files[0]){
			UICtrl.wczytajObrazek(UICtrl.grzbietInput, 'grzbiet');
		}
		
	});
	
})(budgetController, UIController);