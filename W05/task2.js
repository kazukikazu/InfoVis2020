function main(number)
{
    var width = 500;
    var height = 500;

    var scene = new THREE.Scene();

    var fov = 45;
    var aspect = width / height;
    var near = 1;
    var far = 1000;
    var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( 0, 0, 5 );
    scene.add( camera );

    var light = new THREE.PointLight();
    light.position.set( 5, 5, 5 );
    scene.add( light );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );

    var geometry = new THREE.TorusKnotGeometry( 1, 0.3, 100, 20 );

    if(number == 0) {
      var material = new THREE.ShaderMaterial({
          vertexColors: THREE.VertexColors,
          vertexShader: document.getElementById('phong.vert').text,
          fragmentShader: document.getElementById('phong_lambertRef.frag').text,
          uniforms: {
              light_position: { type: 'v3', value: light.position }
          }
        });
    } else if(number == 1) {
        var material = new THREE.ShaderMaterial({
            vertexColors: THREE.VertexColors,
            vertexShader: document.getElementById('phong.vert').text,
            fragmentShader: document.getElementById('phong_phongRef.frag').text,
            uniforms: {
                light_position: { type: 'v3', value: light.position }
            }
        });
    }

    var torus_knot = new THREE.Mesh( geometry, material );
    scene.add( torus_knot );

    loop();

    function loop()
    {
        requestAnimationFrame( loop );
        torus_knot.rotation.x += 0.01;
        torus_knot.rotation.y += 0.01;
        renderer.render( scene, camera );
    }
}
