function Bounds( volume )
{
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial();

    var minx = volume.min_coord.x;
    var miny = volume.min_coord.y;
    var minz = volume.min_coord.z;

    var maxx = volume.max_coord.x;
    var maxy = volume.max_coord.y;
    var maxz = volume.max_coord.z;

    var v0 = new THREE.Vector3( minx, miny, minz );
    var v1 = new THREE.Vector3( maxx, miny, minz );
    var v2 = new THREE.Vector3( maxx, miny, maxz );
    var v3 = new THREE.Vector3( minx, miny, maxz );
    var v4 = new THREE.Vector3( minx, maxy, minz );
    var v5 = new THREE.Vector3( maxx, maxy, minz );
    var v6 = new THREE.Vector3( maxx, maxy, maxz );
    var v7 = new THREE.Vector3( minx, maxy, maxz );

    geometry.vertices.push( v0 ); geometry.vertices.push( v1 );
    geometry.vertices.push( v1 ); geometry.vertices.push( v2 );
    geometry.vertices.push( v2 ); geometry.vertices.push( v3 );
    geometry.vertices.push( v3 ); geometry.vertices.push( v0 );
    geometry.vertices.push( v4 ); geometry.vertices.push( v5 );
    geometry.vertices.push( v5 ); geometry.vertices.push( v6 );
    geometry.vertices.push( v6 ); geometry.vertices.push( v7 );
    geometry.vertices.push( v7 ); geometry.vertices.push( v4 );
    geometry.vertices.push( v0 ); geometry.vertices.push( v4 );
    geometry.vertices.push( v1 ); geometry.vertices.push( v5 );
    geometry.vertices.push( v2 ); geometry.vertices.push( v6 );
    geometry.vertices.push( v3 ); geometry.vertices.push( v7 );

    material.linewidth = 2;
    material.color = new THREE.Color( "black" );

    return new THREE.LineSegments( geometry, material );
//    return new THREE.Line( geometry, material, THREE.LinePieces );
}
