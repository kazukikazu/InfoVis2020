function Isosurfaces( volume, isovalue, color, screen, shading)
{
    var geometry = new THREE.Geometry();
    if(shading == 0){
	var material = new THREE.ShaderMaterial({
            vertexColors: THREE.VertexColors,
            vertexShader: document.getElementById('gouraud_lambertian.vert').text,
            fragmentShader: document.getElementById('gouraud.frag').text,
	    uniforms: {
		light_position: {type: 'v3', value: screen.light.position }
	    }
	});
    }
    else if(shading == 1){
	var material = new THREE.ShaderMaterial({
            vertexColors: THREE.VertexColors,
            vertexShader: document.getElementById('gouraud_phong.vert').text,
            fragmentShader: document.getElementById('gouraud.frag').text,
	    uniforms: {
		light_position: {type: 'v3', value: screen.light.position }
	    }
	});
    }
    else if(shading == 2){
	var material = new THREE.ShaderMaterial({
            vertexColors: THREE.VertexColors,
            vertexShader: document.getElementById('phong.vert').text,
            fragmentShader: document.getElementById('phong_lambertian.frag').text,
	    uniforms: {
		light_position: {type: 'v3', value: screen.light.position }
	    }
	});
    }
    else if(shading == 3){
	var material = new THREE.ShaderMaterial({
            vertexColors: THREE.VertexColors,
            vertexShader: document.getElementById('phong.vert').text,
            fragmentShader: document.getElementById('phong_phong.frag').text,
	    uniforms: {
		light_position: {type: 'v3', value: screen.light.position }
	    }
	});
    }

    var smin = volume.min_value;
    var smax = volume.max_value;
    isovalue = KVS.Clamp( isovalue, smin, smax );

    // Create color map
    var cmap = [];
    for ( var i = 0; i < 256; i++ )
    {
        var S = i / 255.0; // [0,1]
        var R = Math.max( Math.cos( ( S - 1.0 ) * Math.PI ), 0.0 );
        var G = Math.max( Math.cos( ( S - 0.5 ) * Math.PI ), 0.0 );
        var B = Math.max( Math.cos( S * Math.PI ), 0.0 );
        var colors = new THREE.Color( R, G, B );
        cmap.push( [ S, '0x' + colors.getHexString() ] );
    }

    var lut = new KVS.MarchingCubesTable();
    var cell_index = 0;
    var counter = 0;
    var counter2 = 0;
    material.vertexColors = THREE.FaceColors;
    for ( var z = 0; z < volume.resolution.z - 1; z++ )
    {
        for ( var y = 0; y < volume.resolution.y - 1; y++ )
        {
            for ( var x = 0; x < volume.resolution.x - 1; x++ )
            {
                var indices = cell_node_indices( cell_index++ );
                var index = table_index( indices );
                if ( index == 0 ) { continue; }
                if ( index == 255 ) { continue; }

                for ( var j = 0; lut.edgeID[index][j] != -1; j += 3 )
                {
                    var eid0 = lut.edgeID[index][j];
                    var eid1 = lut.edgeID[index][j+2];
                    var eid2 = lut.edgeID[index][j+1];

                    var vid0 = lut.vertexID[eid0][0];
                    var vid1 = lut.vertexID[eid0][1];
                    var vid2 = lut.vertexID[eid1][0];
                    var vid3 = lut.vertexID[eid1][1];
                    var vid4 = lut.vertexID[eid2][0];
                    var vid5 = lut.vertexID[eid2][1];

                    var v0 = new THREE.Vector3( x + vid0[0], y + vid0[1], z + vid0[2] );
                    var v1 = new THREE.Vector3( x + vid1[0], y + vid1[1], z + vid1[2] );
                    var v2 = new THREE.Vector3( x + vid2[0], y + vid2[1], z + vid2[2] );
                    var v3 = new THREE.Vector3( x + vid3[0], y + vid3[1], z + vid3[2] );
                    var v4 = new THREE.Vector3( x + vid4[0], y + vid4[1], z + vid4[2] );
                    var v5 = new THREE.Vector3( x + vid5[0], y + vid5[1], z + vid5[2] );

                    var v01 = interpolated_vertex( v0, v1, isovalue );
                    var v23 = interpolated_vertex( v2, v3, isovalue );
                    var v45 = interpolated_vertex( v4, v5, isovalue );

                    geometry.vertices.push( v01 );
                    geometry.vertices.push( v23 );
                    geometry.vertices.push( v45 );

                    var id0 = counter++;
                    var id1 = counter++;
                    var id2 = counter++;

                    geometry.faces.push( new THREE.Face3( id0, id1, id2 ) );

                    var C = new THREE.Color().setHex( cmap[ color ][1] );
                    geometry.faces[counter2].color = C;
                    counter2++;
                }
            }
            cell_index++;
        }
        cell_index += volume.resolution.x;
    }

    geometry.computeVertexNormals();

    return new THREE.Mesh( geometry, material );


    function cell_node_indices( cell_index )
    {
        var lines = volume.resolution.x;
        var slices = volume.resolution.x * volume.resolution.y;

        var id0 = cell_index;
        var id1 = id0 + 1;
        var id2 = id1 + lines;
        var id3 = id0 + lines;
        var id4 = id0 + slices;
        var id5 = id1 + slices;
        var id6 = id2 + slices;
        var id7 = id3 + slices;

        return [ id0, id1, id2, id3, id4, id5, id6, id7 ];
    }

    function table_index( indices )
    {
        var s0 = volume.values[ indices[0] ][0];
        var s1 = volume.values[ indices[1] ][0];
        var s2 = volume.values[ indices[2] ][0];
        var s3 = volume.values[ indices[3] ][0];
        var s4 = volume.values[ indices[4] ][0];
        var s5 = volume.values[ indices[5] ][0];
        var s6 = volume.values[ indices[6] ][0];
        var s7 = volume.values[ indices[7] ][0];

        var index = 0;
        if ( s0 > isovalue ) { index |=   1; }
        if ( s1 > isovalue ) { index |=   2; }
        if ( s2 > isovalue ) { index |=   4; }
        if ( s3 > isovalue ) { index |=   8; }
        if ( s4 > isovalue ) { index |=  16; }
        if ( s5 > isovalue ) { index |=  32; }
        if ( s6 > isovalue ) { index |=  64; }
        if ( s7 > isovalue ) { index |= 128; }

        return index;
    }

    function interpolated_vertex( v0, v1, s )
    {
        var lines = volume.resolution.x;
        var slices = volume.resolution.x * volume.resolution.y;
        var s0 = volume.values[v0.x + v0.y*lines + v0.z*slices];
        var s1 = volume.values[v1.x + v1.y*lines  +v1.z*slices]
        var r = ( s - s0 )/( s1 - s0 )
        var v =  new THREE.Vector3().subVectors( v1, v0 ).multiplyScalar( r );
        return new THREE.Vector3().addVectors( v, v0 );
    }
}

function planeIsosurface( volume, point, normal, screen, cmaping )
{
    var d = - normal.x * point.x - normal.y * point.y - normal.z * point.z;
    var coef = new THREE.Vector4( normal.x, normal.y, normal.z, d );
    var geometry = new THREE.Geometry();
    var material = new THREE.MeshBasicMaterial();
    material.vertexColors = THREE.VertexColors;
    material.side = THREE.DoubleSide;

    var lut = new KVS.MarchingCubesTable();
    var counter = 0;

    // Create color map
    var cmap = [];
    for ( var i = 0; i < 256; i++ )
    {
        var S = i / 255.0; // [0,1]
        if( cmaping == 0 ) {
            var R = 1;
            var G = Math.max( Math.cos( S * Math.PI / 2 ), 0.0 );
            var B = Math.max( Math.cos( S * Math.PI / 2 ), 0.0 );
        } else if( cmaping == 1 ) {
            var R = Math.max( Math.cos( ( S - 1.0 ) * Math.PI ), 0.0 );
            var G = Math.max( Math.cos( ( S - 0.5 ) * Math.PI ), 0.0 );
            var B = Math.max( Math.cos( S * Math.PI ), 0.0 );
        }
        var color = new THREE.Color( R, G, B );
        cmap.push( color );
    }

    for ( var z = 0; z < volume.resolution.z - 1; z++ )
    {
        for ( var y = 0; y < volume.resolution.y - 1; y++ )
        {
            for ( var x = 0; x < volume.resolution.x - 1; x++ )
            {

                var index = table_index( x, y, z );
                if ( index == 0 ) { continue; }
                if ( index == 255 ) { continue; }

                for ( var j = 0; lut.edgeID[index][j] != -1; j += 3 )
                {
                    var eid0 = lut.edgeID[index][j];
                    var eid1 = lut.edgeID[index][j+2];
                    var eid2 = lut.edgeID[index][j+1];

                    var vid0 = lut.vertexID[eid0][0];
                    var vid1 = lut.vertexID[eid0][1];
                    var vid2 = lut.vertexID[eid1][0];
                    var vid3 = lut.vertexID[eid1][1];
                    var vid4 = lut.vertexID[eid2][0];
                    var vid5 = lut.vertexID[eid2][1];

                    var v0 = new THREE.Vector3( x + vid0[0], y + vid0[1], z + vid0[2] );
                    var v1 = new THREE.Vector3( x + vid1[0], y + vid1[1], z + vid1[2] );
                    var v2 = new THREE.Vector3( x + vid2[0], y + vid2[1], z + vid2[2] );
                    var v3 = new THREE.Vector3( x + vid3[0], y + vid3[1], z + vid3[2] );
                    var v4 = new THREE.Vector3( x + vid4[0], y + vid4[1], z + vid4[2] );
                    var v5 = new THREE.Vector3( x + vid5[0], y + vid5[1], z + vid5[2] );

                    var v01 = interpolated_vertex( v0, v1 );
                    var v23 = interpolated_vertex( v2, v3 );
                    var v45 = interpolated_vertex( v4, v5 );

                    geometry.vertices.push( v01 );
                    geometry.vertices.push( v23 );
                    geometry.vertices.push( v45 );

                    var id0 = counter++;
                    var id1 = counter++;
                    var id2 = counter++;

                    var face = new THREE.Face3( id0, id1, id2 );
                    face.vertexColors.push( cmap[interpolated_value( v0, v1 )] );
                    face.vertexColors.push( cmap[interpolated_value( v2, v3 )] );
                    face.vertexColors.push( cmap[interpolated_value( v4, v5 )] );
                    geometry.faces.push( face );
                }
            }
        }
    }

    return new THREE.Mesh( geometry, material );

    function table_index( x, y, z )
    {
        var s0 = plane_function( x,     y,     z     );
        var s1 = plane_function( x + 1, y,     z     );
        var s2 = plane_function( x + 1, y + 1, z     );
        var s3 = plane_function( x,     y + 1, z     );
        var s4 = plane_function( x,     y,     z + 1 );
        var s5 = plane_function( x + 1, y,     z + 1 );
        var s6 = plane_function( x + 1, y + 1, z + 1 );
        var s7 = plane_function( x,     y + 1, z + 1 );

        var index = 0;
        if ( s0 > 0 ) { index |=   1; }
        if ( s1 > 0 ) { index |=   2; }
        if ( s2 > 0 ) { index |=   4; }
        if ( s3 > 0 ) { index |=   8; }
        if ( s4 > 0 ) { index |=  16; }
        if ( s5 > 0 ) { index |=  32; }
        if ( s6 > 0 ) { index |=  64; }
        if ( s7 > 0 ) { index |= 128; }

        return index;
    }

    //linear interpolation for plane
    function interpolated_vertex( v0, v1 )
    {
        if( v0.x != v1.x )
        {
            var s =  (-coef.y * v0.y - coef.z * v0.z -coef.w) / coef.x;
            return new THREE.Vector3( s , v0.y , v0.z );
        }
        if( v0.y != v1.y )
        {
            var s =   (-coef.x * v0.x - coef.z * v0.z -coef.w) / coef.y;
            return new THREE.Vector3( v0.x , s , v0.z );
        }
        if( v0.z != v1.z )
        {
            var s =  (-coef.x * v0.x - coef.y * v0.y -coef.w) / coef.z;
            return new THREE.Vector3( v0.x , v0.y , s );
        }
    }

    function interpolated_value( v0, v1 )
    {
        var lines = volume.resolution.x;
        var slices = volume.resolution.x * volume.resolution.y;
        var s0 = volume.values[ v0.x + v0.y*lines + v0.z*slices ][0];
        var s1 = volume.values[ v1.x + v1.y*lines + v1.z*slices ][0];
        var v01 = interpolated_vertex( v0, v1 );

        if( v0.x != v1.x)
        {
            var p = ( 2*v01.x - ( v0.x + v1.x ) )/( v1.x - v0.x );
            var s_result = ( s1 - s0 )*p/2 + ( s0 + s1 )/2;
        }

        if( v0.y != v1.y)
        {
            var p = ( 2*v01.y - ( v0.y + v1.y ) )/( v1.y - v0.y );
            var s_result = ( s1 - s0 )*p/2 + ( s0 + s1 )/2;
        }

        if( v0.z != v1.z)
        {
            var p = ( 2*v01.z - ( v0.z + v1.z ) )/( v1.z - v0.z );
            var s_result = ( s1 - s0 )*p/2 + ( s0 + s1 )/2;
        }

        return Math.round( s_result );
    }

    function plane_function( x, y, z )
    {
        return coef.x * x + coef.y * y + coef.z * z + coef.w;
    }
}
