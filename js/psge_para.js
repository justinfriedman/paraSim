//*引継パラメータ*********************************************************************************
//グライダーパラメータ
// PolarH[5]			// ポーラーカーブ　0:失速 1:失速前 2:最小沈下 3:最良滑空 4:フルグライド 5:フルアクセル
// PolarV[5]			// ポーラーカーブ　0:失速 1:失速前 2:最小沈下 3:最良滑空 4:フルグライド 5:フルアクセル
// Span					// スパン（不使用）
// Ratio				// アスペクト（不使用）
// WeightL				// 最小飛行重量（不使用）
// WeightH				// 最大飛行重量（不使用）
// Weight				// 飛行重量
// PARA_GLTF			// グライダーGLTFのURL

// MyLat				// グライダー位置姿勢
// MyLon
// MyAlt
// MyDir
// MyPit
// MyRol

// dt = 0;				// 時間変分

// TreeFlag				// ツリーフラグ

// Omega = 0;			// 対気旋回角速度
// AirSpd = 8;			// 対気水平速度
// AirRis = 0;			// 対気垂直速度

// Pang = 0;			// ピッチ角
// Pacc = 0;			// ピッチ角加速度
// Pspd = 0;			// ピッチ角速度
// Racc = 0;			// ロール角加速度
// Rspd = 0;			// ロール角速度

//************************************************************************************************
// 課題
// テイクオフ、ランディング、ツリーラン、バリオ上昇下降音
// フライト特性
// スパイラル
// 


//************************************************************************************************
// テイクオフ姿勢
glider_takeoff = function() {
	var spd = 8;
	if (tm < 4) {spd = 2 * tm;}
	MyDir += BSpeed * dt;
	MyLat += RtoD(spd * dt * Math.cos(DtoR(MyDir)) / 6378100);
	MyLon += RtoD(spd * dt * Math.sin(DtoR(MyDir)) / (6378100 * Math.cos(DtoR(MyLat))));
	MyPit -= 60 * dt;
	if (MyPit < 0) {MyPit = 0;}

	Speed += (CSpeed - WindSpd -Speed) * 0.8 * dt;					// 速度
	Rise += (-1 - Rise) * 10 * dt;									// 昇降速度

	if (MyAlt > GndAlt + 2) {Status = 2;}
};


//************************************************************************************************
// フライト更新（スパイラル・SAT・タンブリング・フルストール・ヘリコプター）
glider_renew = function() {
	CSpeed = getPolarH(Brake);
	Omega += (-BSpeed * (6.5 + Math.abs(MyPit) * 0) - Omega) * dt;						// 角速度
	AirSpd += ((CSpeed + Math.abs(Omega) * 0.2) - AirSpd) * 0.8 * dt;					// 速度
	AirRis += (getPolarV(AirSpd) - AirRis) * 10 * dt;									// 昇降速度

	Pang = (MyPit + Math.pow(BSpeed, 2) * 0.9) * 18 * dt;								// 旋回時ピッチ角
	Pacc = ((CSpeed + Math.abs(Omega) * 0.000014) - AirSpd) * 5;							// 周期、振幅
	Pspd -= (0.6 * Pspd + Pang + Pacc) * dt;											// 減衰

	Racc = (BSpeed * AirSpd * 0.4 + MyRol) * 1;											// 周期、振幅
	Rspd -= (0.7 * Rspd - Racc) * dt;													// 減衰

	// htrからローカル姿勢マトリックスに変換
	var htr = [MyDir,MyRol,MyPit];
	var modelFrame = M33.headingTiltRollToLocalOrientationMatrix(htr);
	// ヨー
	modelFrame[0] = V3.rotate(modelFrame[0], modelFrame[2], DtoR(Omega) * dt);
	modelFrame[1] = V3.rotate(modelFrame[1], modelFrame[2], DtoR(Omega) * dt);
	// ロール
	modelFrame[1] = V3.rotate(modelFrame[1], modelFrame[0], DtoR(Rspd) * dt);
	modelFrame[2] = V3.rotate(modelFrame[2], modelFrame[0], DtoR(Rspd) * dt);
	// ピッチ
	modelFrame[2] = V3.rotate(modelFrame[2], modelFrame[1], DtoR(-Pspd) * dt);
	modelFrame[0] = V3.rotate(modelFrame[0], modelFrame[1], DtoR(-Pspd) * dt);
	// ローカル姿勢マトリックスからhtrに変換
	htr = M33.localOrientationMatrixToHeadingTiltRoll(modelFrame);
	MyDir = htr[0]; MyRol = htr[1]; MyPit = htr[2];

	AirRis += MyPit / 300;
	Vario = AirRis + WindRis;

	var xxx = AirSpd * Math.cos(DtoR(MyDir)) - WindSpd * Math.cos(DtoR(WindDir));
	var yyy = AirSpd * Math.sin(DtoR(MyDir)) - WindSpd * Math.sin(DtoR(WindDir));
	Speed = Math.sqrt(xxx * xxx + yyy * yyy);
	Rise = AirRis + WindRis;

	MyLat += RtoD(AirSpd * dt * Math.cos(DtoR(MyDir)) / 6378100);
	MyLon += RtoD(AirSpd * dt * Math.sin(DtoR(MyDir)) / (6378100 * Math.cos(DtoR(MyLat))));
	MyLat -= RtoD(WindSpd * dt * Math.cos(DtoR(WindDir)) / 6378100);
	MyLon -= RtoD(WindSpd * dt * Math.sin(DtoR(WindDir)) / (6378100 * Math.cos(DtoR(MyLat))));
	MyAlt += Rise * dt;

	if (MyAlt < GndAlt) {Status = 3;}
};


//************************************************************************************************
// ランディング姿勢
glider_landing = function() {
	if (tm < 10) {TreeFlag = true;}

	var spd = 1;
	MyDir -= BSpeed * dt;
	MyLat += RtoD(spd * dt * Math.cos(DtoR(MyDir)) / 6378100);
	MyLon += RtoD(spd * dt * Math.sin(DtoR(MyDir)) / (6378100 * Math.cos(DtoR(MyLat))));
	if (TreeFlag) {
		MyPit -= 90 * dt;
		MyAlt = GndAlt - 0.5;
	} else {
		MyPit += 30 * dt;
		MyAlt = GndAlt;
	}

	if((MyPit < -70)||(MyPit > 80)) {Status = 4; showPopup();}
};


//************************************************************************************************
// ブレークコードの位置とアクセルの状態から目標翼端速度を求める（bb = 0～180）
getPolarH = function(bb) {
	var TempSpeed = 1;
	if (bb > 150){
		TempSpeed = PolarH[0] + (PolarH[1] - PolarH[0]) * (180 - bb) / 30;
	} else if (bb > 100){
		TempSpeed = PolarH[1] + (PolarH[2] - PolarH[1]) * (150 - bb) / 50;
	} else if (bb > 50){
		TempSpeed = PolarH[2] + (PolarH[3] - PolarH[2]) * (100 - bb) / 50;
	} else {
		TempSpeed = PolarH[3] + (PolarH[4] - PolarH[3]) * (50 - bb) / 50;
	}
	if (Accel) {
		TempSpeed += (PolarH[5] - PolarH[4]) * (180 - bb) / 180;
	}
	return TempSpeed;
};


//************************************************************************************************
// 飛行速度から沈下速度を求める
getPolarV = function(sp) {
	var TempSpeed = 0;
	if (sp > PolarH[4]){
		TempSpeed = PolarV[4] + (PolarV[5] - PolarV[4]) * (sp - PolarH[4]) / (PolarH[5] - PolarH[4]);
	} else if (sp > PolarH[3]){
		TempSpeed = PolarV[3] + (PolarV[4] - PolarV[3]) * (sp - PolarH[3]) / (PolarH[4] - PolarH[3]);
	} else if (sp > PolarH[2]){
		TempSpeed = PolarV[2] + (PolarV[3] - PolarV[2]) * (sp - PolarH[2]) / (PolarH[3] - PolarH[2]);
	} else if (sp > PolarH[1]){
		TempSpeed = PolarV[1] + (PolarV[2] - PolarV[1]) * (sp - PolarH[1]) / (PolarH[2] - PolarH[1]);
	} else {
		TempSpeed = PolarV[0] + (PolarV[1] - PolarV[0]) * (sp - PolarH[0]) / (PolarH[1] - PolarH[0]);
	}
	return TempSpeed;
};


//************************************************************************************************
// 風の影響を反映
wind_effect = function() {

	// リッジ	
	WindRis = ((GndAlt - D30Alt) / 20) * WindSpd * clamp((MyAlt - GndAlt) / 10, 0, 1) * clamp((300 - (MyAlt - GndAlt)) / 50, 0, 1);

	// サーマル
	for (i=0; i < 20; i++){
		var alt = KM_ALT[i] - MyAlt;
		if ((0 < alt) && (alt < 2000)){
			var xxx = DtoR(KM_LAT[i] - MyLat) * 6378100;
			var yyy = DtoR(KM_LON[i] - MyLon) * 6378100 / Math.cos(DtoR(MyLat));
				xxx += alt * WindSpd / 3 * Math.cos(DtoR(WindDir));
				yyy += alt * WindSpd / 3 * Math.sin(DtoR(WindDir));
			var	rrr = Math.pow(xxx * xxx + yyy * yyy, 0.5);
			if (rrr < 100){
				WindRis += Math.pow(100 - rrr, 0.5)/4;
			}
		}
	}
};
