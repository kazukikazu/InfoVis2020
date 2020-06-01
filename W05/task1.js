function main()
{
    var width = 1000;
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

    var lambert = new THREE.ShaderMaterial({
        vertexColors: THREE.VertexColors,
        vertexShader: document.getElementById('gouraud_lambertRef.vert').text,
        fragmentShader: document.getElementById('gouraud.frag').text,
        uniforms: {
            light_position: { type: 'v3', value: light.position }
        }
    });

    var phong = new THREE.ShaderMaterial({
        vertexColors: THREE.VertexColors,
        vertexShader: document.getElementById('gouraud_phongRef.vert').text,
        fragmentShader: document.getElementById('gouraud.frag').text,
        uniforms: {
            light_position: { type: 'v3', value: light.position }
        }
    });

    var torus_knot1 = new THREE.Mesh( geometry, lambert );
    torus_knot1.position.x = -2;
    scene.add( torus_knot1 );
    var torus_knot2 = new THREE.Mesh( geometry, phong );
    torus_knot2.position.x = 2;
    scene.add( torus_knot2 );

    loop();

    function loop()
    {
        requestAnimationFrame( loop );
        torus_knot1.rotation.x += 0.01;
        torus_knot1.rotation.y += 0.01;
        torus_knot2.rotation.x += 0.01;
        torus_knot2.rotation.y += 0.01;
        renderer.render( scene, camera );
    }
}
