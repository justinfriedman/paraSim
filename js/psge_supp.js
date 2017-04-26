var amodel = new Array(4);
var num = 0;
set_entity = function() {
amodel[0] = viewer.entities.add({show : true, model : {uri : 'area/entity/001.gltf',scale : 1,
shadows : Cesium.ShadowMode.ENABLED}});
var position = Cesium.Cartesian3.fromDegrees(139.18602, 35.99901, 917);
var hpr = new Cesium.HeadingPitchRoll(DtoR(	0), 0, 0);
var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
amodel[0].position = position;
amodel[0].orientation = orientation;
amodel[1] = viewer.entities.add({show : true, model : {uri : 'area/entity/001.gltf',scale : 1,
shadows : Cesium.ShadowMode.ENABLED}});
var position = Cesium.Cartesian3.fromDegrees(139.17651, 35.99759, 924);
var hpr = new Cesium.HeadingPitchRoll(DtoR(	0), 0, 0);
var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
amodel[1].position = position;
amodel[1].orientation = orientation;
amodel[2] = viewer.entities.add({show : true, model : {uri : 'area/entity/001.gltf',scale : 1,
shadows : Cesium.ShadowMode.ENABLED}});
var position = Cesium.Cartesian3.fromDegrees(139.21024, 35.95870, 854);
var hpr = new Cesium.HeadingPitchRoll(DtoR(	0), 0, 0);
var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
amodel[2].position = position;
amodel[2].orientation = orientation;
amodel[3] = viewer.entities.add({show : true, model : {uri : 'area/entity/010.gltf',scale : 1,
shadows : Cesium.ShadowMode.ENABLED}});
var position = Cesium.Cartesian3.fromDegrees(139.19035, 36.00610, 913);
var hpr = new Cesium.HeadingPitchRoll(DtoR(	0), 0, 0);
var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
amodel[3].position = position;
amodel[3].orientation = orientation;
amodel[4] = viewer.entities.add({show : true, model : {uri : 'area/entity/099.gltf',scale : 1,
shadows : Cesium.ShadowMode.ENABLED}});
var position = Cesium.Cartesian3.fromDegrees(136.25540, 35.29440, 120);
var hpr = new Cesium.HeadingPitchRoll(DtoR(	0), 0, 0);
var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
amodel[4].position = position;
amodel[4].orientation = orientation;
}
