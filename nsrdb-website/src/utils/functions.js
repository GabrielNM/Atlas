
function round2(num) {
    return +(Math.round(num + "e+2") + "e-2");
  }

  function round3(num) {
    return Math.round((num + Number.EPSILON) * 1000) / 1000;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  
  function dayToDate(year, day) {
    var date = new Date(year, 0);
    return new Date(date.setDate(day));
  }

  function getBasicPowerGenerationParam(
    latitude,
    data,
    temperature,
    wind,
    setup,
    N,
    gamma,
    beta,
    Pmp,
    n,
    PT
  ) {
    var a = -3.47;
    var b = -0.0594;
    var deltaT = 3;
    var PDCnom = (Pmp * N) / 1000;
    var Rref = 1000;
    var T0 = 25;
    var PAC_array = [];
    var sumCF = 0;
    var min = Infinity;
    var max = 0;
    const DC_AC_ratio = 1.1;
  
    if (setup === "ceiling") {
      a = -2.98;
      b = -0.0471;
      deltaT = 1;
    }
    const dataLength = data.Irradiacion.length;
    for (var i = 0; i < dataLength; i++) {
      var delta = 23.45 * Math.sin(deg2rad((360 / 365) * (284 + i + 1)));
      var alpha = 90 - latitude + delta;
      var Ri =
        data.Irradiacion[i] *
        (Math.sin(deg2rad(alpha + beta)) / Math.sin(deg2rad(alpha)));
  
      var Tp =
        Ri * Math.exp(a + b * parseFloat(wind["Velocidad de viento"][i])) +
        parseFloat(temperature.Temperatura[i]);
      var Tc = Tp + (Ri / 1000) * deltaT;
  
      var PDC = 0;
      PDC = 24*(Ri / Rref) * PDCnom * (1 + (gamma / 100) * (Tc - T0));
      var PAC = (n / 100) * PDC;
      PAC = PAC * (1 - PT / 100);
      sumCF += PAC;
      if (PAC >= max) {
        max = PAC;
      }
      if (PAC <= min) {
        min = PAC;
      }
  
      PAC_array.push({
        x: i,
        y: round2(PAC),
      });
    }
    const CF = sumCF  / (24*365*PDCnom / DC_AC_ratio);
    console.log(PAC_array)
    return { PAC_array, CF, min, max };
  }

  function getAdvancedPowerGenerationParam(
    latitude,
    data,
    temperature,
    wind,
    setup,
    s,
    N,
    beta,
    iscref,
    vocref,
    impref,
    vmpref,
    alphaisc,
    betavoc,
    n,
    PT
  ) {
    var a = -3.47;
    var b = -0.0594;
    var deltaT = 3;
    const deltaTc = 0.026;
    const T0 = 25;
    const DC_AC_ratio = 1.1;
    var PAC_array = [];
    var sumCF = 0;
    var min = Infinity;
    var max = 0;
    var PDCnom = (impref * vmpref * N) / 1000;
  
    if (setup === "ceiling") {
      a = -2.98;
      b = -0.0471;
      deltaT = 1;
    }
    const dataLength = data.Irradiacion.length;
    for (var i = 0; i < dataLength; i++) {
      var delta = 23.45 * Math.sin(deg2rad((360 / 365) * (284 + i + 1)));
      var alpha = 90 - latitude + delta;
      var Ri =
        data.Irradiacion[i] *
        (Math.sin(deg2rad(alpha + beta)) / Math.sin(deg2rad(alpha)));
  
      var Tp =
        Ri * Math.exp(a + b * parseFloat(wind["Velocidad de viento"][i])) +
        parseFloat(temperature.Temperatura[i]);
      var Tc = Tp + (Ri / 1000) * deltaT;
      var Isc = iscref * (Ri / 1000) * (1 + alphaisc * (Tc - T0));
      var Imp = impref * (Isc / iscref);
      var Ee = Isc / (iscref * (1 + alphaisc * (Tc - T0)));
      var Voc = vocref + s * deltaTc * Math.log(Ee) + betavoc * (Tc - T0);
      var Vmp = vmpref * (Voc / vocref);
  
      var PDC = Vmp * Imp;
      PDC = 24*(PDC * N) / 1000;
  
      var PAC = (n / 100) * PDC;
      PAC = PAC * (1 - PT / 100);
      sumCF += PAC || 0;
      if (PAC >= max) {
        max = PAC;
      }
      if (PAC <= min) {
        min = PAC;
      }
  
      PAC_array.push({
        x: i,
        y: round2(PAC) || 0,
      });
    }
  
    const capacity = PDCnom / DC_AC_ratio;
    const CF = sumCF  / (24*365*capacity);
    return { PAC_array, CF, min, max };
  }
  
  function getBasicPowerGeneration(
    latitude,
    data,
    setup,
    N,
    gamma,
    beta,
    Pmp,
    n,
    PT
  ) {
    var a = -3.47;
    var b = -0.0594;
    var deltaT = 3;
    var PDCnom = (Pmp * N) / 1000;
    var Rref = 1000;
    var T0 = 25;
    var PAC_array = [];
    var sumCF = 0;
    var min = Infinity;
    var max = 0;
    const DC_AC_ratio = 1.1;
  
    if (setup === "ceiling") {
      a = -2.98;
      b = -0.0471;
      deltaT = 1;
    }
    const dataLength = data.GHI.length;
    for (var i = 0; i < dataLength; i++) {
      var delta = 23.45 * Math.sin(deg2rad((360 / 365) * (284 + i + 1)));
      var alpha = 90 - latitude + delta;
      var Ri =
        data.GHI[i] *
        (Math.sin(deg2rad(alpha + beta)) / Math.sin(deg2rad(alpha)));
  
      var Tp =
        Ri * Math.exp(a + b * parseFloat(data["Wind Speed"][i])) +
        parseFloat(data.Temperature[i]);
      var Tc = Tp + (Ri / 1000) * deltaT;
  
      var PDC = 0;
      PDC = 10*(Ri / Rref) * PDCnom * (1 + (gamma / 100) * (Tc - T0));
      var PAC = (n / 100) * PDC;
      PAC = PAC * (1 - PT / 100);
      sumCF += PAC;
      if (PAC >= max) {
        max = PAC;
      }
      if (PAC <= min) {
        min = PAC;
      }
  
      PAC_array.push({
        x: i,
        y: round2(PAC),
      });
    }
    const CF = sumCF  / (24*365*PDCnom / DC_AC_ratio);
    return { PAC_array, CF, min, max };
  }
  
  function getAdvancedPowerGeneration(
    latitude,
    data,
    setup,
    s,
    N,
    beta,
    iscref,
    vocref,
    impref,
    vmpref,
    alphaisc,
    betavoc,
    n,
    PT
  ) {
    var a = -3.47;
    var b = -0.0594;
    var deltaT = 3;
    const deltaTc = 0.026;
    const T0 = 25;
    const DC_AC_ratio = 1.1;
    var PAC_array = [];
    var sumCF = 0;
    var min = Infinity;
    var max = 0;
    var PDCnom = (impref * vmpref * N) / 1000;
  
    if (setup === "ceiling") {
      a = -2.98;
      b = -0.0471;
      deltaT = 1;
    }
    const dataLength = data.GHI.length;
    for (var i = 0; i < dataLength; i++) {
      var delta = 23.45 * Math.sin(deg2rad((360 / 365) * (284 + i + 1)));
      var alpha = 90 - latitude + delta;
      var Ri =
        data.GHI[i] *
        (Math.sin(deg2rad(alpha + beta)) / Math.sin(deg2rad(alpha)));
  
      var Tp =
        Ri * Math.exp(a + b * parseFloat(data["Wind Speed"][i])) +
        parseFloat(data.Temperature[i]);
      var Tc = Tp + (Ri / 1000) * deltaT;
      var Isc = iscref * (Ri / 1000) * (1 + alphaisc * (Tc - T0));
      var Imp = impref * (Isc / iscref);
      var Ee = Isc / (iscref * (1 + alphaisc * (Tc - T0)));
      var Voc = vocref + s * deltaTc * Math.log(Ee) + betavoc * (Tc - T0);
      var Vmp = vmpref * (Voc / vocref);
  
      var PDC = Vmp * Imp;
      PDC = 10*(PDC * N) / 1000;
  
      var PAC = (n / 100) * PDC;
      PAC = PAC * (1 - PT / 100);
      sumCF += PAC || 0;
      if (PAC >= max) {
        max = PAC;
      }
      if (PAC <= min) {
        min = PAC;
      }
  
      PAC_array.push({
        x: i,
        y: round2(PAC) || 0,
      });
    }
  
    const capacity = PDCnom / DC_AC_ratio;
    const CF = sumCF / (24*365*capacity);
    return { PAC_array, CF, min, max };
  }
  
  const functions = {
    round2,
    dayToDate,
    getBasicPowerGeneration,
    getAdvancedPowerGeneration,
    round3, 
    getBasicPowerGenerationParam,
    getAdvancedPowerGenerationParam
  };
  
  export default functions;
  
