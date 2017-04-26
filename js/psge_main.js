//************************************************************************************************
// psge_main.js
// Copyright 2016 atom-i.
// Code for Paragliding Simulator, using Cesium Libraly.
//************************************************************************************************

//*引継パラメータ*********************************************************************************
//グライダーパラメータ
// PolarH[5]				// ポーラーカーブ　0:失速 1:失速前 2:最小沈下 3:最良滑空 4:フルグライド 5:フルアクセル
// PolarV[5]				// ポーラーカーブ　0:失速 1:失速前 2:最小沈下 3:最良滑空 4:フルグライド 5:フルアクセル
// Span						// スパン（不使用）
// Ratio					// アスペクト（不使用）
// WeightL					// 最小飛行重量（不使用）
// WeightH					// 最大飛行重量（不使用）
// Weight					// 飛行重量
// PARA_GLTF				// グライダーGLTFのURL

//エリアパラメータ
// TO_LAT					// テイクオフ位置　緯度
// TO_LON					// テイクオフ位置　経度
// TO_HEI					// テイクオフ位置　対地高度
// TO_DIR					// テイクオフ向き
// TO_WIN					// テイクオフ風速
// LP_N						// ランディングパラメータの数（最大10）
// LP_LAT[LP_N]				// ランディングパラメータ　緯度
// LP_LON[LP_N]				// ランディングパラメータ　経度
// AREA_GLTF				// エリアオプションGLTFのURL

// sound1					// PG
// sound2					// PPG
// sound3					// TakeOff
// sound4					// Landing
// sound5					// TreeLanding
// sound6					// lift1
// sound7					// lift2

//*グローバル変数（マウス、キー関連）*************************************************************
var viewer;						// Cesiumビュワー

var gmodel = new Array(9);		// グライダー
var windsock = new Array(9);	// ウインドソック
var kumo = new Array(9);		// 雲

var KM_LAT = new Array(20);
var KM_LON = new Array(20);
var KM_ALT = new Array(20);
var KM_TIM = new Array(20);

var TO_ALT = 0;					// テイクオフ高度
var LP_ALT = new Array(9);		// ランディング高度

var MyLat = 0;					// グライダー位置姿勢
var MyLon = 0;
var MyAlt = 0;
var MyDir = 0;
var MyPit = 0;
var MyRol = 0;

var GndAlt = 0;					// 現在地標高
var D30Alt = 0;					// 風上30m標高

var PCamLat = 0;				// 追跡カメラ位置
var PCamLon = 0;
var PCamAlt = 0;
var PCamDir = 0;
var PCamDis = 10;

var now = 0;					// 現在時刻
var tm = 0;						// 飛行時間
var dt = 0;						// 時間変分
var lt = 0;						// 前回時間

var rd = 0;						// 最長距離
var rh = 0;						// 最高高度

var Status = 0;					// ステータス　0:準備、1:TOアニメ、2:飛行、3:着陸アニメ、4:着陸、5:中断
var Flight = false;				// フライトフラグ
var TreeFlag = false;			// ツリーフラグ
var PopupFlag = false;			// ポップアップフラグ
var TakeoffButton;				// TAKE_OFFボタン
var Compass;					// コンパス

var CameraView = 1;				// 初期視界
var TargetNo = 0;				// ターゲット番号

var Home = true;				// 画面制御　当該視界を標準視野に戻す
var Tele = false;				// 画面制御　ズームアップ
var Wide = false;				// 画面制御　ズームダウン
var TilU = false;				// 画面制御　視野アップ
var TilD = false;				// 画面制御　視野ダウン
var PanL = false;				// 画面制御　視野レフト
var PanR = false;				// 画面制御　視野ライト
var Accel = false;				// アクセルキー
var Ctrl = false;				// CTRLキー
var Shift = false;				// SHIFTキー

var WindDir = 0;				// 風向
var WindSpd = 0;				// 風速
var WindRis = 0;				// 風速上昇成分

var BSpeed = 0;					// 左右速度差
var CSpeed = 8;					// 目標速度
var Brake = 0;					// ブレークコード操作量

var Omega = 0;					// 対気旋回角速度
var AirSpd = 8;					// 対気水平速度
var AirRis = 0;					// 対気垂直速度

var Speed = 0;
var Rise = 0;

var Pang = 0;					// ピッチ角
var Pacc = 0;					// ピッチ角加速度
var Pspd = 0;					// ピッチ角速度
var Racc = 0;					// ロール角加速度
var Rspd = 0;					// ロール角速度

var zoom1 = 0;
var tilt1 = 0;
var pan1 = 0;

var td = 0;						// 最後に計器表示してからの時間

//************************************************************************************************
// 初期処理
//************************************************************************************************
PSGE = function() {

// コンテナ設定
	viewer = new Cesium.Viewer('cesiumContainer',{
		infoBox : false,
		timeline : false,
		animation : false,
		geocoder : false,
		homeButton : false,
		sceneModePicker : false,
		baseLayerPicker : false,
		navigationHelpButton : false,
		fullscreenButton : false,
		shadows : true,
		terrainShadows : Cesium.ShadowMode.ENABLED,
		shadowMap : {
			size : 2048,
			softShadows : true,
			maxmimumDistance : 300.0,
			darkness : 0.1
		}
	});
	viewer.scene.globe.depthTestAgainstTerrain = true;	//地面の陰は非表示指定

// デフォルトマウスコントロール無効化
	var scene = viewer.scene;
	var canvas = viewer.canvas;
	canvas.setAttribute('tabindex', '0');
	canvas.onclick = function() {
		canvas.focus();
	};
	var ellipsoid = viewer.scene.globe.ellipsoid;
// disable the default event handlers
	scene.screenSpaceCameraController.enableRotate = false;
	scene.screenSpaceCameraController.enableTranslate = false;
	scene.screenSpaceCameraController.enableZoom = false;
	scene.screenSpaceCameraController.enableTilt = false;
	scene.screenSpaceCameraController.enableLook = false;

// 時刻設定
	viewer.clock.currentTime = new Cesium.JulianDate(2457534 - TO_LON / 360 - 2 / 24); //その経度の10:00に設定
	viewer.clock.multiplier = 1.0;

// 3D地図設定
	viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
		url : '//assets.agi.com/stk-terrain/world',
		requestWaterMask : true,
		requestVertexNormals : true
	});

// グライダーセット
	set_window();		// ウインドウ設定
	set_entity();		// 建物読込
	set_model();		// グライダー読込
	set_sock();			// ウインドソック読込
	set_kumo();			// 雲読込

// 音量初期化
	document.getElementById('volume').value = 20;

// シミュレーション開始
	setTimeout("tick()", 1000);
};


//************************************************************************************************
// 画面設定
set_window = function() {

	// マーカー読込、スクリーンオーバーレイ
	var Marker = document.createElement('img');
	Marker.src = 'model/marker.png';
	viewer.container.appendChild(Marker)

	Marker.style.width = '260px';
	Marker.style.position = 'absolute';
	Marker.style.top = 'calc(100% - 175px)';
	Marker.style.left = 'calc((100% - 240px) / 2 - 130px)';

	// テイクオフボタン読込、スクリーンオーバーレイ
	TakeoffButton = document.createElement('img');
	TakeoffButton.src = 'model/takeoff.png';
	viewer.container.appendChild(TakeoffButton)

	TakeoffButton.style.width = '100px';
	TakeoffButton.style.position = 'absolute';
	TakeoffButton.style.top = 'calc(100% - 165px)';
	TakeoffButton.style.left = 'calc((100% - 240px) / 2 - 50px)';

	// コンパス読込、スクリーンオーバーレイ
	Compass = document.createElement('img');
	Compass.src = 'model/compass.png';
	viewer.container.appendChild(Compass)

	Compass.style.width = '69px';
	Compass.style.position = 'absolute';
	Compass.style.top = '20px';
	Compass.style.left = 'calc(100% - 329px)';
};


//************************************************************************************************
// グライダー読込処理
set_model = function() {

	// グライダー読込、設定、Cesiumに組込
	gmodel[0] = viewer.entities.add({
		show : true,
		model : {
			uri : PARA_GLTF,
			scale : 0.7,
			shadows : Cesium.ShadowMode.ENABLED
		}
	});
	gmodel[1] = viewer.entities.add({
		show : true,
		model : {
			uri : 'glider/pilot.gltf',
			scale : 0.7,
			shadows : Cesium.ShadowMode.ENABLED
		}
	});
};


//************************************************************************************************
// ウインドソック読込、設定
set_sock = function() {
	for (var i = 0; i < 2; i++){
		windsock[i] = viewer.entities.add({
			show : true,
			model : {
				uri : 'model/windsock.glb',
				scale : 1,
				shadows : Cesium.ShadowMode.ENABLED
			}
		});
	}

	// テイクオフ・ランディングの高度取得
	var positions = new Array(LP_N);
	positions[0] = Cesium.Cartographic.fromDegrees(TO_LON, TO_LAT);
	for (i = 0; i < LP_N; i++) {
		positions[i + 1] = Cesium.Cartographic.fromDegrees(LP_LON[i], LP_LAT[i]);
	}
	var promise = Cesium.sampleTerrain(viewer.terrainProvider, 14, positions);
	Cesium.when(promise, function(updateAlt) {
		TO_ALT = updateAlt[0].height + TO_HEI;
		for (i = 0; i < LP_N; i++) {
			LP_ALT[i] = updateAlt[i + 1].height + 2;
		}
		sim_init();								// シミュレーション初期化
	});
};


//************************************************************************************************
// 雲読込、設定
set_kumo = function() {
	for (var i = 0; i < 20; i++){
		kumo[i] = viewer.entities.add({
			show : true,
			model : {
				uri : 'model/kumo.glb',
				scale : 10,
			}
		});
	}
};


//************************************************************************************************
// シミュレーション初期化
sim_init = function() {

	// 待機時処理
	standby();

	// 表示初期化
	CameraView = 1
	Home = true;

	// 風向風速初期化（±80°、±50%)
	WindDir = fixAngle(TO_DIR + (Math.random() - 0.5) * 120);
	WindSpd = TO_WIN * (Math.random() + 0.5);

	// サーマル初期化
	for (i=0; i < 20; i++) {
		KM_LAT[i] = MyLat + 0.06 * (Math.random() - 0.5);							// 約6.6km四方に20個
		KM_LON[i] = MyLon + 0.06 * (Math.random() - 0.5) / Math.cos(DtoR(MyLat));	//
		KM_ALT[i] = TO_ALT + 300 + 5000 * Math.pow(Math.random(), 3);				// テイクオフ＋300mから5300m
		KM_TIM[i] = Math.random() * 900 + 900;										// 15分から30分
	}

	// サウンド初期化
	sound_off();
}


//************************************************************************************************
// 待機時処理
standby = function() {

	// グライダー位置初期化
	MyLat = TO_LAT;
	MyLon = TO_LON;
	MyDir = TO_DIR;
	MyAlt = GndAlt + TO_HEI;
	MyPit = 70;
	MyRol = 0;

	// 追跡カメラ位置初期化
	PCamDis = 20;
	PCamLat = MyLat - RtoD(PCamDis * Math.cos(DtoR(MyDir)) / 6378100);
	PCamLon = MyLon - RtoD(PCamDis * Math.sin(DtoR(MyDir)) / 6378100) / Math.cos(DtoR(PCamLat));
	PCamAlt = 10;  //カメラ初期高度差
	PCamDir = MyDir;

	// シミュレーション時間初期化
	tm = 0;
	rd = 0;
	rh = 0;

	// ブレークコード初期化
	LSpeed = 8;
	RSpeed = 8;

	// グライダー速度、姿勢、初期化
	Omega = 0;					// 対気旋回角速度
	AirSpd = 8;					// 対気水平速度
	AirRis = 0;					// 対気垂直速度
	Speed = 0;					// 水平速度
	Rise = 0;					// 垂直速度

	// 運動パラメータ初期化
	Pang = 0;
	Pacc = 0;
	Pspd = 0;
	Racc = 0;
	Rspd = 0;

	// フライトフラグ
	Flight = false;
	// ツリーフラグ
	TreeFlag = false;

	document.getElementById('report').elements['rep_btn'].style = "visibility:hidden;";
}


//************************************************************************************************
//マウスムーブイベント
MouseMove = function(event) {
	var ecX = event.clientX - (document.documentElement.clientWidth - 240) / 2;
	if (ecX > 2) {ecX -= 2;} else if (ecX < -2) {ecX += 2;} else {ecX = 0;}
	var ecY = event.clientY + 200 - document.documentElement.clientHeight;

	if ((Math.abs(ecX) < ecY) && (ecY < 200) && (Status > 0)){
		document.body.style.cursor = "url(image/22.cur),move";
		if (ecX < 0) {
			if (ecY < 48)					{document.body.style.cursor = "url(image/21.cur),move";}
			else if (ecY < 110) {
				if (ecX < 40 - ecY)			{document.body.style.cursor = "url(image/31.cur),move";}
				else 						{document.body.style.cursor = "url(image/32.cur),move";}
			} else {
				if (ecX < 40 - ecY)			{document.body.style.cursor = "url(image/41.cur),move";}
				else if (ecX < 50 - ecY)	{document.body.style.cursor = "url(image/42.cur),move";}
				else 						{document.body.style.cursor = "url(image/43.cur),move";}
			}
		} else if (ecX > 0) {
			if (ecY < 48)					{document.body.style.cursor = "url(image/12.cur),move";}
			else if (ecY < 110) {
				if (ecX > ecY - 40)			{document.body.style.cursor = "url(image/13.cur),move";}
				else 						{document.body.style.cursor = "url(image/23.cur),move";}
			} else {
				if (ecX > ecY - 40)			{document.body.style.cursor = "url(image/14.cur),move";}
				else if (ecX > ecY - 50)	{document.body.style.cursor = "url(image/24.cur),move";}
				else 						{document.body.style.cursor = "url(image/34.cur),move";}
			}
		} else {
			if (ecY < 40)					{document.body.style.cursor = "url(image/11.cur),move";}
			else if (ecY < 56)				{document.body.style.cursor = "url(image/22.cur),move";}
			else if (ecY < 110)				{document.body.style.cursor = "url(image/33.cur),move";}
			else 							{document.body.style.cursor = "url(image/44.cur),move";}
		}
		Brake = ecY;
		BSpeed = ecX * 0.08;
	} else {
		Brake = 0;
		BSpeed = 0;
		document.body.style.cursor = "default";
	}
};


//************************************************************************************************
//マウスダウンイベント
MouseDown = function(event) {
	var ecX = event.clientX - (document.documentElement.clientWidth - 240)/ 2;
	var ecY = event.clientY + 150 - document.documentElement.clientHeight;
	if ((Math.abs(ecX) < 50) && (Math.abs(ecY) < 15)) {
		if (Status == 0) {
			Status = 1;
			TakeoffButton.style.visibility = 'hidden';
		}
		if (Status == 4) {
			sim_init();
			Status = 0;
			TakeoffButton.style.visibility == 'visible';
		}
	}
	document.getElementById("inst").elements['TimeBox'].focus();
	document.getElementById("inst").elements['TimeBox'].blur();
	window.f2ocus();
};


//************************************************************************************************
//キーダウンイベント
keyDown = function(event) {
  	if (!event) {event = window.event;}
	if (!PopupFlag) {
		// ステータス制御
	  	if (event.keyCode == 17) {									// Ctrl
			Ctrl = true;
			if (Status == 0) {
				Status = 1;
				TakeoffButton.style.visibility = 'hidden';
			}
			if (Status > 2) {
				sim_init();
				Status = 0;
				TakeoffButton.style.visibility = 'visible';
			}
	  	} else
		if (event.keyCode == 27) {									// Esc
			if (Status == 2) {
				Status = 5;
			} else
			if (Status == 5) {
				Status = 2;
			}
		}

		// カメラ選択
	  	if (event.keyCode == 49) {CameraView = 1; Home = true;} else 	// 1:back
		if (event.keyCode == 50) {CameraView = 2; Home = true;} else	// 2:Chaser
		if (event.keyCode == 51) {CameraView = 3; Home = true;} else	// 3:Pilot
		if (event.keyCode == 52) {CameraView = 4; Home = true;} else	// 4:Takeoff
		if (event.keyCode == 53) {
			if (CameraView == 5) {
				TargetNo += 1;
				if (TargetNo == LP_N) {TargetNo = 0;}
			}
			CameraView = 5; Home = true;
		} else															// 5:Landing
		if (event.keyCode == 54) {CameraView = 6; Home = true;}			// 6:Earth
		if (Status == 5) {display();}

		// カメラ制御
		Tele = false;
		Wide = false;
		TilU = false;
		TilD = false;
		PanL = false;
		PanR = false;
		if (event.keyCode == 36 || event.keyCode == 83) {Home = true;} else					// Home
		if (event.keyCode == 33 || event.keyCode == 69) {Tele = true; Home = false;} else	// PageUp
		if (event.keyCode == 34 || event.keyCode == 67) {Wide = true; Home = false;} else	// PageDown
		if (event.keyCode == 38 || event.keyCode == 87) {TilU = true; Home = false;} else	// Up
		if (event.keyCode == 40 || event.keyCode == 88) {TilD = true; Home = false;} else	// Down
		if (event.keyCode == 37 || event.keyCode == 65) {PanL = true; Home = false;} else	// Left
		if (event.keyCode == 39 || event.keyCode == 68) {PanR = true; Home = false;}		// Right

		// アクセル制御
		if (event.keyCode == 32) {Accel = true;} // Accel
	}
	return true;
};


//************************************************************************************************
//キーアップイベント
keyUp = function(event) {
  	if (!event) {event = window.event;}
	if (!PopupFlag) {
		// カメラ制御
		if (event.keyCode == 36 || event.keyCode == 83) {Home = false;} else	// Home
		if (event.keyCode == 33 || event.keyCode == 69) {Tele = false;} else	// PageUp
		if (event.keyCode == 34 || event.keyCode == 67) {Wide = false;} else  	// PageDown
		if (event.keyCode == 38 || event.keyCode == 87) {TilU = false;} else  	// Up
		if (event.keyCode == 40 || event.keyCode == 88) {TilD = false;} else	// Down
		if (event.keyCode == 37 || event.keyCode == 65) {PanL = false;} else	// Left
		if (event.keyCode == 39 || event.keyCode == 68) {PanR = false;}			// Right

		// ランニング制御
		if (event.keyCode == 17) {Ctrl = false;}								// Ctrl

		// アクセル制御
		if (event.keyCode == 32) {Accel = false;}	// Accel
	}
  	return false;
};


//************************************************************************************************
// シミュレーション処理
tick = function() {

	get_altitude();

	if (Status == 0) {		// 待機中
		standby();
	}

	if (Status == 1){		// テイクオフ中
		glider_takeoff();
	}

	if (Status == 2) {		// フライト中
		glider_renew();
		wind_effect();
	}

	if (Status == 3){		// ランディング中
		glider_landing();
	}

							// 復帰待ち中

	if (Status < 5) {		// 中断で無い時
		glider_setmodel();
		windsock_disp();
		kumo_disp();
		display();
	}

	sound();
	manage();
	setTimeout("tick()", 1);
}


//************************************************************************************************
// 高度取得
get_altitude = function() {
	var lat = MyLat + RtoD(30 * Math.cos(DtoR(WindDir)) / 6378100);
	var lon = MyLon + RtoD(30 * Math.sin(DtoR(WindDir)) / 6378100) / Math.cos(DtoR(MyLat));
	var positions = new Array(2);
	positions[0] = Cesium.Cartographic.fromDegrees(MyLon, MyLat);
	positions[1] = Cesium.Cartographic.fromDegrees(lon, lat);
	var promise = Cesium.sampleTerrain(viewer.terrainProvider, 14, positions);
	Cesium.when(promise, function(updateAlt) {
		GndAlt = updateAlt[0].height;				// 現在地標高
		D30Alt = updateAlt[1].height;				// 風上30m標高
	});
}


//************************************************************************************************
// グライダー、シャドウをGEにセット
glider_setmodel = function() {

	// グライダー位置・姿勢決定
	var position = Cesium.Cartesian3.fromDegrees(MyLon, MyLat, MyAlt);
	var heading = Cesium.Math.toRadians(MyDir);
	var pitch = Cesium.Math.toRadians(MyPit);

	var roll = Cesium.Math.toRadians(MyRol);
	var hpr = new Cesium.HeadingPitchRoll(heading, roll, pitch);
	var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
	gmodel[0].position = position;
	gmodel[0].orientation = orientation;
	if (Status != 2) {
		hpr = new Cesium.HeadingPitchRoll(heading, roll, -0.7);
		orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
	}
	gmodel[1].position = position;
	gmodel[1].orientation = orientation;
}


//************************************************************************************************
// ウインドソック
windsock_disp = function() {

	// ゆらぎ定数（幅、高、速度比）
	var Wspd = WindSpd;
	var YSpd = 1;
	if (WindSpd > 6){
		WSpd = 6;
		YSpd = WindSpd - 5;
	}
	var yuragiH = 5 * Math.sin(now / (200 / YSpd));
	var yuragiP = 5 * Math.sin(now / (300 / YSpd));

	// テイクオフ　ウインドソック
	var WS_Lat = TO_LAT;
	var WS_Lon = TO_LON;
	var WS_Alt = TO_ALT + 2;
	WS_Lat += 20 * RtoD(Math.cos(DtoR(20 - TO_DIR)) / 6378100);
	WS_Lon -= 20 * RtoD(Math.sin(DtoR(20 - TO_DIR)) / 6378100) / Math.cos(DtoR(WS_Lat));
	var position = Cesium.Cartesian3.fromDegrees(WS_Lon, WS_Lat, WS_Alt);
	var heading = Cesium.Math.toRadians(WindDir + yuragiH);
	var pitch = Cesium.Math.toRadians(-8 - WindSpd * 12 + yuragiP);
	var roll = Cesium.Math.toRadians(0);
	var hpr = new Cesium.HeadingPitchRoll(heading, roll, pitch);
	var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
	windsock[0].position = position;
	windsock[0].orientation = orientation;

	// ランディング　ウインドソック
	WS_Lat = LP_LAT[TargetNo];
	WS_Lon = LP_LON[TargetNo];
	WS_Alt = LP_ALT[TargetNo] + 5;
	position = Cesium.Cartesian3.fromDegrees(WS_Lon, WS_Lat, WS_Alt);
	heading = Cesium.Math.toRadians(WindDir + yuragiH);
	pitch = Cesium.Math.toRadians(-WindSpd * 15 + yuragiP);
	roll = Cesium.Math.toRadians(0);
	hpr = new Cesium.HeadingPitchRoll(heading, roll, pitch);
	orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
	windsock[1].position = position;
	windsock[1].orientation = orientation;
}


//************************************************************************************************
// サーマル雲
kumo_disp = function() {
	for (i = 0; i < 20; i++) {
		KM_LAT[i] -= RtoD(WindSpd * dt * Math.cos(DtoR(WindDir)) / 6378100);
		KM_LON[i] -= RtoD(WindSpd * dt * Math.sin(DtoR(WindDir)) / (6378100 * Math.cos(DtoR(MyLat))));
		KM_TIM[i] -= dt;
		if (KM_TIM[i] < 0){
			KM_LAT[i] = MyLat + 0.06 * (Math.random() - 0.5);							// 約6.6km四方に20個
			KM_LON[i] = MyLon + 0.06 * (Math.random() - 0.5) / Math.cos(DtoR(MyLat));						//
			KM_ALT[i] = TO_ALT + 300 + 5000 * Math.pow(Math.random(), 3);				// テイクオフ＋300mから5300m
			KM_TIM[i] = Math.random() * 900 + 900;										// 15分から30分
		}
		var position = Cesium.Cartesian3.fromDegrees(KM_LON[i], KM_LAT[i], KM_ALT[i]);
		var x = DtoR(KM_LAT[i] - MyLat) * 6378100;
		var y = DtoR(KM_LON[i] - MyLon) * 6378100 * Math.cos(DtoR(MyLat));
		var heading = fixAngleR(Math.atan2(y, x) - 3.14159265);
		var roll = Cesium.Math.toRadians(0);
		var pitch = fixAngleR(Math.atan2(Math.sqrt(x * x + y * y), KM_ALT[i] - MyAlt) + 1.57079633);
		var hpr = new Cesium.HeadingPitchRoll(heading, roll, pitch);
		var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
		kumo[i].position = position;
		kumo[i].orientation = orientation;
	}
}


//************************************************************************************************
// 時間管理
manage = function() {
  	now = (new Date()).getTime();
  	dt = (now - lt) / 1000;
  	if (dt > 0.25) { dt = 0.25;}
  	lt = now;
	if ((0 < Status) && (Status < 5)) {tm += dt;　td += dt;}
};


//************************************************************************************************
// サウンド
sound = function() {
	if ((PPG == 1) && ((Status == 1)||(Status == 2)||(Status == 3)) && (sound5.paused)) {
		sound5.loop = 'true'; sound5.play();		//PPG
	}

	if (Status == 1) {													// テイクオフ中
		if (sound1.paused) {sound1.play();}
	} else if (Status == 2) {											// フライト中
		if (sound2.paused) {sound2.loop = 'true'; sound2.play();}		// フライト
		if (Rise > 4.5) {
			sound6.pause();
			sound7.pause();
			sound8.pause();
			if (sound9.paused){sound9.loop = 'true'; sound9.play();}	// 上降3
		} else if (Rise > 2.5) {
			sound6.pause();
			sound7.pause();
			sound9.pause();
			if (sound8.paused){sound8.loop = 'true'; sound8.play();}	// 上昇2
		} else if (Rise > 0.5) {
			sound6.pause();
			sound8.pause();
			sound9.pause();
			if (sound7.paused){sound7.loop = 'true'; sound7.play();}	// 上昇1
		} else if (Rise < -2) {
			sound7.pause();
			sound8.pause();
			sound9.pause();
			if (sound6.paused){sound6.loop = 'true'; sound6.play();}	// 下昇
		} else {
			sound6.pause();
			sound7.pause();
			sound8.pause();
			sound9.pause();
		}
		sound1.pause();
	} else if (Status == 3) {											// ランディング中
		if (TreeFlag) {
			if (sound4.paused) {sound4.play();}							// ツリー
		} else {
			if (sound3.paused) {sound3.play();}							// ランディング
		}
		sound2.pause();
		sound5.pause();
		sound6.pause();
		sound7.pause();
		sound8.pause();
		sound9.pause();
	} else {
		sound_off();
	}

	// 速度によって音が変わる
	var sss = Math.pow(document.getElementById("volume").value / 100, 1);
	sound1.volume = sss;   												// PG テイクオフ
	sound2.volume = Math.min(sss * Math.pow((AirSpd / 10), 2) , 1);		// PG フライト
	sound3.volume = sss;												// PG ランディン
	sound4.volume = sss;												// PG ツリーラン
	sound5.volume = sss;												// PPG エンジン
	sound6.volume = sss;												// バリオ
	sound7.volume = sss;												// バリオ
	sound8.volume = sss;												// バリオ
	sound9.volume = sss;												// バリオ
}

//************************************************************************************************
// サウンド
sound_off = function() {
	sound1.pause();
	sound2.pause();
	sound3.pause();
	sound4.pause();
	sound5.pause();
	sound6.pause();
	sound7.pause();
	sound8.pause();
	sound9.pause();
	sound1.currentTime = 0;
	sound2.currentTime = 0;
	sound3.currentTime = 0;
	sound4.currentTime = 0;
	sound5.currentTime = 0;
	sound6.currentTime = 0;
	sound7.currentTime = 0;
	sound8.currentTime = 0;
	sound9.currentTime = 0;
}


//************************************************************************************************
// 表示
display = function() {

	// レーダー表示
	var x = DtoR(LP_LAT[TargetNo] - MyLat) * 6378100;
	var y = DtoR(LP_LON[TargetNo] - MyLon) * 6378100 * Math.cos(DtoR(MyLat));
	var d = Math.sqrt(x * x + y * y);
	var heading = fixAngle(MyDir - RtoD(Math.atan2(y, x)));
	document.getElementById("radar").src = "model/radar" + Math.floor((185 - heading) / 10) % 36 + ".png";

	// 計器表示
	document.getElementById("inst").elements['DistBox'].value =  fixDP(Math.floor(d / 100 + 0.5) / 10);
	if (Status == 0){
		document.getElementById("inst").elements['SpeedBox'].value =  0;
		document.getElementById("inst").elements['VarioBox'].value =  0;
		document.getElementById("inst").elements['TimeBox'].value =  "00:00:00";
	} else if (Status < 3) {
		if (td > 0.5){
			document.getElementById("inst").elements['SpeedBox'].value =  fixDP(Math.floor(Speed * 36) / 10);
			document.getElementById("inst").elements['VarioBox'].value =  fixDP(Math.floor(Rise * 10) / 10);
			document.getElementById("inst").elements['TimeBox'].value =  dispTM(Math.floor(tm));
			td = 0;
		}
	}
	document.getElementById("inst").elements['AltiBox'].value =  Math.floor(MyAlt);
	document.getElementById("inst").elements['HeightBox'].value =  Math.floor(MyAlt - GndAlt);

	// 記録
	x = DtoR(TO_LAT - MyLat) * 6378100;
	y = DtoR(TO_LON - MyLon) * 6378100 * Math.cos(DtoR(MyLat));
	d = Math.sqrt(x * x + y * y);
	rd = Math.max(rd, d);
	rh = Math.max(rh, MyAlt);

	//カメラ設定
	switch (CameraView) {
	case 1: CameraView1(); AutoZoom(); break;
	case 2: CameraView2(); AutoZoom(); break;
	case 3: CameraView3(); break;
	case 4: CameraView4(); AutoZoom(); break;
	case 5: CameraView5(); AutoZoom(); break;
	case 6: CameraView6();
	}
};

//************************************************************************************************
// 画面の縦横比に合わせてズーム
AutoZoom = function() {
	var w = parseInt(document.getElementById("cesiumContainer").style.width);
	var h = parseInt(document.getElementById("cesiumContainer").style.height);
	if (w > h) {
		viewer.camera.zoomOut((w / h - 1) * 30);
	}
}


//************************************************************************************************
// カメラ設定（背後）
CameraView2 = function() {

	// 視線の変更
	var sft;
	if (Shift) {sft = 0.1;} else {sft = 1;}
	if (Home) {zoom1 = 0; tilt1 = 0; pan1 = 0; Home = false;}
	if (Tele) {zoom1 -= 300 * dt * sft;}
	if (Wide) {zoom1 += 300 * dt * sft;}
	if (TilU) {tilt1 += 30 * dt * sft;}
	if (TilD) {tilt1 -= 30 * dt * sft;}
	if (PanL) {pan1 -= 30 * dt * sft;}
	if (PanR) {pan1 += 30 * dt * sft;}
	zoom1 = clamp(zoom1, -10000, 0);
	tilt1 = fixAngle(tilt1);
	pan1 = fixAngle(pan1);

	// グライダーとカメラ位置から方向を計算
	var x = DtoR(MyLat - PCamLat) * 6378100;
	var y = DtoR(MyLon - PCamLon) * 6378100 * Math.cos(DtoR(MyLat));
	var dir = fixAngle(RtoD(Math.atan2(y, x)) + pan1);

	// グライダーとカメラ位置から仰角を計算
	var ll = Math.sqrt(x * x + y * y);
	var hh = PCamAlt + 5;
	var tilt = fixAngle(RtoD(Math.atan2(ll, hh)) - 90 + tilt1);

	// カメラ設定
	viewer.camera.setView({
		destination : Cesium.Cartesian3.fromDegrees(PCamLon, PCamLat, MyAlt + PCamAlt + 5),
		orientation: {
			heading : Cesium.Math.toRadians(dir),
			pitch : Cesium.Math.toRadians(tilt),
			roll : Cesium.Math.toRadians(0)
		}
	});

	// カメラ位置更新
	if (Status < 3) {
		PCamDis += (40 - PCamDis) / 20 * dt;
		PCamLat = MyLat - RtoD(PCamDis * Math.cos(DtoR(MyDir)) / 6378100);
		PCamLon = MyLon - RtoD(PCamDis * Math.sin(DtoR(MyDir)) / 6378100) / Math.cos(DtoR(MyLat));
		PCamAlt -= PCamAlt / 10 * dt;
	}

	// コンパス表示
//	if ((tilt < -90)||(90 < tilt)) {dir = 180 - dir;}
	Compass.style.transform = 'rotate(' + (-dir) + 'deg)';
};


//************************************************************************************************
// カメラ設定（追跡）
CameraView1 = function() {

	// 視線の変更
	var sft;
	if (Shift) {sft = 0.1;} else {sft = 1;}
	if (Home) {zoom1 = 0; tilt1 = 0; pan1 = 0; Home = false;}
	if (Tele) {zoom1 -= 300 * dt * sft;}
	if (Wide) {zoom1 += 300 * dt * sft;}
	if (TilU) {tilt1 += 30 * dt * sft;}
	if (TilD) {tilt1 -= 30 * dt * sft;}
	if (PanL) {pan1 -= 30 * dt * sft;}
	if (PanR) {pan1 += 30 * dt * sft;}
	zoom1 = clamp(zoom1, -10000, 0);
	tilt1 = fixAngle(tilt1);
	pan1 = fixAngle(pan1);

	// グライダーとカメラ位置から方向を計算
	var x = DtoR(MyLat - PCamLat) * 6378100;
	var y = DtoR(MyLon - PCamLon) * 6378100 * Math.cos(DtoR(MyLat));
	var Cdir = RtoD(Math.atan2(y, x));
	var dir = fixAngle(Cdir + pan1);

	// グライダーとカメラ位置から仰角を計算
	var ll = Math.sqrt(x * x + y * y);
	var hh = PCamAlt + 5;
	var tilt = fixAngle(RtoD(Math.atan2(ll, hh)) - 90 + tilt1);

	// カメラ設定
	viewer.camera.setView({
		destination : Cesium.Cartesian3.fromDegrees(PCamLon, PCamLat, MyAlt + PCamAlt + 5),
		orientation: {
			heading : Cesium.Math.toRadians(dir),
			pitch : Cesium.Math.toRadians(tilt),
			roll : Cesium.Math.toRadians(0)
		}
	});

	// カメラ位置更新
	if (Status < 3) {
		PCamDis += (40 - PCamDis) / 20 * dt;
		PCamLat = MyLat - RtoD(PCamDis * Math.cos(DtoR(Cdir)) / 6378100);
		PCamLon = MyLon - RtoD(PCamDis * Math.sin(DtoR(Cdir)) / 6378100) / Math.cos(DtoR(MyLat));
		PCamAlt -= PCamAlt / 10 * dt;
	}

	// コンパス表示
	Compass.style.transform = 'rotate(' + (-dir) + 'deg)';
};


//************************************************************************************************
// カメラ設定（パイロット）
CameraView3 = function() {

	// 視線の変更
	var sft;
	if (Shift) {sft = 0.1;} else {sft = 1;}
	if (Home) {zoom1 = 0; tilt1 = 0; pan1 = 0; Home = false;}
	if (Tele) {zoom1 -= 300 * dt * sft;}
	if (Wide) {zoom1 += 300 * dt * sft;}
	if (TilU) {tilt1 += 30 * dt * sft;}
	if (TilD) {tilt1 -= 30 * dt * sft;}
	if (PanL) {pan1 -= 30 * dt * sft;}
	if (PanR) {pan1 += 30 * dt * sft;}
	zoom1 = clamp(zoom1, -10000, 0);
	tilt1 = fixAngle(tilt1);
	pan1 = fixAngle(pan1);

	// カメラ設定
	var pitch = 0;
	if ((Status == 2)||(TreeFlag)){pitch = MyPit;}

	var dir = fixAngle(MyDir + pan1);
	var pit = fixAngle(pitch - 10 + tilt1);

	viewer.camera.setView({
		destination : Cesium.Cartesian3.fromDegrees(MyLon, MyLat, MyAlt + 1),
		orientation: {
			heading : Cesium.Math.toRadians(dir),
			pitch : Cesium.Math.toRadians(pit),
			roll : Cesium.Math.toRadians(-MyRol)
		}
	});

	// コンパス表示
	Compass.style.transform = 'rotate(' + (-MyDir) + 'deg)';
};


//************************************************************************************************
// カメラ設定（テイクオフ）
CameraView4 = function() {

	// カメラ位置初期化
	var distance = 20;
	var CLat = TO_LAT - RtoD(distance * Math.cos(DtoR(TO_DIR)) / 6378100);
	var CLon = TO_LON - RtoD(distance * Math.sin(DtoR(TO_DIR)) / 6378100) / Math.cos(DtoR(TO_LAT));
	var CAlt = TO_ALT + 15;

	// グライダーとカメラ位置から方向を計算
	var x = DtoR(MyLat - CLat) * 6378100;
	var y = DtoR(MyLon - CLon) * 6378100 * Math.cos(DtoR(MyLat));
	var dir = RtoD(Math.atan2(y, x));

	// グライダーとカメラ位置から仰角を計算
	var ll = Math.sqrt(x * x + y * y);
	var hh = CAlt - MyAlt;
	var tilt = fixAngle(RtoD(Math.atan2(ll, hh))) - 90;

	// カメラ設定
	viewer.camera.setView({
		destination : Cesium.Cartesian3.fromDegrees(CLon, CLat, CAlt),
		orientation: {
			heading : Cesium.Math.toRadians(dir),
			pitch : Cesium.Math.toRadians(tilt),
			roll : Cesium.Math.toRadians(0)
		}
	});

	Compass.style.transform = 'rotate(' + (-dir) + 'deg)';
};


//************************************************************************************************
// カメラ設定（ランディング）
CameraView5 = function() {

	// カメラ位置初期化
	var CLat = LP_LAT[TargetNo];
	var CLon = LP_LON[TargetNo];
	var CAlt = LP_ALT[TargetNo];

	// グライダーとカメラ位置から方向を計算
	var x = DtoR(MyLat - CLat) * 6378100;
	var y = DtoR(MyLon - CLon) * 6378100 * Math.cos(DtoR(MyLat));
	var dir = RtoD(Math.atan2(y, x));

	// グライダーとカメラ位置から仰角を計算
	var ll = Math.sqrt(x * x + y * y);
	var hh = LP_ALT[TargetNo] - MyAlt;
	var tilt = fixAngle(RtoD(Math.atan2(ll, hh))) - 90;

	// カメラ設定
	viewer.camera.setView({
		destination : Cesium.Cartesian3.fromDegrees(CLon, CLat, CAlt),
		orientation: {
			heading : Cesium.Math.toRadians(dir),
			pitch : Cesium.Math.toRadians(tilt),
			roll : Cesium.Math.toRadians(0)
		}
	});
	Compass.style.transform = 'rotate(' + (-dir) + 'deg)';
};


//************************************************************************************************
// カメラ設定（上空）
CameraView6 = function() {
	if (Home) {zoom1 = 0; tilt1 = 0; pan1 = 0; Home = false;}
	if (Tele) {zoom1 -= 300 * dt;}
	if (Wide) {zoom1 += 300 * dt;}

	// カメラ設定
	viewer.camera.setView({
		destination : Cesium.Cartesian3.fromDegrees(MyLon, MyLat, MyAlt + 1000 + zoom1),
		orientation: {
			heading : Cesium.Math.toRadians(MyDir),
			pitch : Cesium.Math.toRadians(-90),
			roll : Cesium.Math.toRadians(0)
		}
	});
	Compass.style.transform = 'rotate(' + (-MyDir) + 'deg)';
};


//************************************************************************************************
//クランプ関数
clamp = function(val, min, max) {
  	if (val < min) {
		return min;
  	} else if (val > max) {
		return max;
  	}
  	return val;
};


//************************************************************************************************
//角度クランプ
fixAngle = function(a) {
  	while (a < -180) {
		a += 360;
  	}
  	while (a > 180) {
		a -= 360;
  	}
  	return a;
};


//************************************************************************************************
//角度クランプ
fixAngleR = function(a) {
  	while (a < -3.14159265) {
		a += 6.28318531;
  	}
  	while (a > 3.14159265) {
		a -= 6.28318531;
  	}
  	return a;
};


//************************************************************************************************
//小数点以下1桁表示
fixDP = function(a) {
	if (((a * 10) % 10) == 0){a = a + ".0";}
  	return a;
};


//************************************************************************************************
//時間表示
dispTM = function(a) {
	var a1 = a % 60;
	var a2 = ((a - a1) / 60) % 60;
	var a3 = (a - a1 -a2 * 60) / 3600;
	if (a3 < 10) { a3 = "0" + a3; }
	if (a2 < 10) { a2 = "0" + a2; }
	if (a1 < 10) { a1 = "0" + a1; }
	return a3+":"+ a2+":"+a1;
};


//************************************************************************************************
DtoR = function(angle) {
	return angle /180 * Math.PI;
}


//************************************************************************************************
RtoD = function(angle) {
	return angle *180 / Math.PI
}


//************************************************************************************************
showPopup = function() {
	sound_off();

	var ddd = new Date();
	var yy = ddd.getYear();
	var mm = ddd.getMonth() + 1;
	var dd = ddd.getDate();
	var hh =ddd.getHours();
	var mn =ddd.getMinutes();
	var ss =ddd.getSeconds();
	if (yy < 2000) { yy += 1900; }
	if (mm < 10) { mm = "0" + mm; }
	if (dd < 10) { dd = "0" + dd; }
	if (hh < 10) { hh = "0" + hh; }
	if (mn < 10) { mn = "0" + mn; }
	if (ss < 10) { ss = "0" + ss; }
	ddd = yy + "/" + mm + "/" + dd + " " + hh + ":" + mn +":" + ss;

	var params = ddd + '<>' + AREA_NAME +'<>'+ GLIDER_NAME +'<>'
		+ document.getElementById("inst").elements['DistBox'].value + '<>'
		+ document.getElementById("inst").elements['SpeedBox'].value + '<>'
		+ document.getElementById("inst").elements['VarioBox'].value + '<>'
		+ document.getElementById("inst").elements['AltiBox'].value + '<>'
		+ document.getElementById("inst").elements['HeightBox'].value + '<>'
		+ Math.floor(tm) + '<>'+ Math.floor(rd) + '<>' + Math.floor(rh - TO_ALT) +'<>'+ Math.floor(rh);
	document.getElementById("report").elements['param'].value = params;
	document.getElementById('report').elements['rep_btn'].style.visibility = 'visible';
};


//************************************************************************************************
SendRecord = function(f) {
	var options = "width=460, height=240, left=" + (document.body.clientWidth-700)/2 + ", toolbar=no, menubar=no, location=no, status=no, scrollbars=no";
	window.open("about:blank", f.target, options);
	document.getElementById('report').elements['rep_btn'].style.visibility = 'hidden';
};


//************************************************************************************************
//************************************************************************************************
test1 = function(mes) {document.getElementById("test1").value = mes;};
test2 = function(mes) {document.getElementById("test2").value = mes;};
test3 = function(mes) {document.getElementById("test3").value = mes;};
test4 = function(mes) {document.getElementById("test4").value = mes;};
test5 = function(mes) {document.getElementById("test5").value = mes;};
test6 = function(mes) {document.getElementById("test6").value = mes;};
test7 = function(mes) {document.getElementById("test7").value = mes;};
test8 = function(mes) {document.getElementById("test8").value = mes;};

