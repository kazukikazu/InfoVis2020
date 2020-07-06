function main()
{
	var volume = new KVS.LobsterData();
	var screen = new KVS.THREEScreen();

	screen.init( volume, {
		width: window.innerWidth*0.7,
		height: window.innerHeight,
		targetDom: document.getElementById('display'),
		enableAutoResize: true
	});

	setup();
	screen.loop();

	function setup()
	{
		var isovalue = 128;
		var color = 128;
		var shading = 0;
		var smin = volume.min_value;
		var smax = volume.max_value;
		var point = new THREE.Vector3(60,60,17); // point in plane
    var normal = new THREE.Vector3(1,0,4); // normal vector for plane
    var cmaping = 1;
		var bounds = Bounds( volume );
		var surfaces = Isosurfaces( volume, isovalue, color, screen, shading );
		var surface_plane = planeIsosurface( volume, point, normal, screen, cmaping );
		screen.scene.add( bounds );
		if(document.getElementById('onPlane').checked)
			screen.scene.add( surface_planee );
		else
			screen.scene.add( surfaces );

		document.getElementById('ilabel').innerHTML = Math.round( isovalue );
		document.getElementById('clabel').innerHTML = Math.round( isovalue );

		document.getElementById('isovalue').addEventListener('mousemove', function() {
			var value = +document.getElementById('isovalue').value;
			isovalue = KVS.Mix( 0, 255, value );
			document.getElementById('ilabel').innerHTML = Math.round( isovalue );
		});

		document.getElementById('color').addEventListener('mousemove', function() {
			var value = +document.getElementById('color').value;
			color = KVS.Mix( 0, 255, value );
			document.getElementById('clabel').innerHTML = Math.round( color );
		});

		document.getElementById('apply-button').addEventListener('click', function() {
			screen.scene.remove( surfaces );
			screen.scene.remove( surface_plane );
			if(document.getElementById('onPlane').checked){
				if(document.getElementById('cmapRed').checked){
					cmaping = 0;
				} else {
					cmaping = 1;
				}
				surface_plane = planeIsosurface( volume, point, normal, screen, cmaping );
				screen.scene.add( surface_plane );
			} else {
				var ivalue = +document.getElementById('isovalue').value;
				isovalue = KVS.Mix( 0, 255, ivalue );
				var cvalue = +document.getElementById('color').value;
				color = KVS.Mix( 0, 255, cvalue );
				if(document.getElementById('LR').checked){
					var reflection = 0;
				}
				else if(document.getElementById('PR').checked){
					var reflection = 1;
				}
				if(document.getElementById('GS').checked){
					if(reflection == 0){
						shading = 0;
					}
					else{
						shading = 1;
					}
				}
				else if(document.getElementById('PS').checked){
					if(reflection == 0){
						shading = 2;
					}
					else{
						shading = 3;
					}
				}
				surfaces = Isosurfaces( volume, parseInt(isovalue), parseInt(color),screen, shading );
				screen.scene.add( surfaces );
			}
			screen.scene.add( bounds );
		});

		document.addEventListener( 'mousemove', function() {
			screen.light.position.copy( screen.camera.position );
		});

		window.addEventListener( 'resize', function() {
			screen.resize( [ window.innerWidth*0.7, window.innerHeight ] );
		});
	}
}


