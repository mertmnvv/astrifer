import type { ComputeSkyResult } from "./computeSky";

export interface CosmicEventInfo {
  moonPhaseName: string;
  moonDescription: string;
  specialEvent?: string;
  specialEventDescription?: string;
}

export function getCosmicEvents(sky: ComputeSkyResult): CosmicEventInfo {
  const age = sky.moonAge;
  
  let moonPhaseName = "Hilal";
  let moonDescription = "Gökyüzünde incecik ve narin bir ışık saçıyor.";

  if (age < 0.03 || age > 0.97) {
    moonPhaseName = "Yeni Ay";
    moonDescription = "Gökyüzü tamamen karanlık, yıldızlar en parlak haliyle ışıldıyor.";
  } else if (age >= 0.03 && age < 0.22) {
    moonPhaseName = "Hilal (Büyüyen)";
    moonDescription = "Yeni başlangıçların müjdecisi olan zarif bir hilal parlıyor.";
  } else if (age >= 0.22 && age < 0.28) {
    moonPhaseName = "İlk Dördün";
    moonDescription = "Gökyüzünün tam yarısını aydınlatan dengeli bir ışık.";
  } else if (age >= 0.28 && age < 0.47) {
    moonPhaseName = "Şişkin Ay (Büyüyen)";
    moonDescription = "Işığı gün geçtikçe dolunaya yaklaşan görkemli bir evre.";
  } else if (age >= 0.47 && age < 0.53) {
    moonPhaseName = "Dolunay";
    moonDescription = "Kozmik bir fener gibi yeryüzünü gümüş bir ışıkla kaplıyor.";
  } else if (age >= 0.53 && age < 0.72) {
    moonPhaseName = "Şişkin Ay (Küçülen)";
    moonDescription = "Gökyüzünü sakince aydınlatmaya devam eden olgun bir ışık.";
  } else if (age >= 0.72 && age < 0.78) {
    moonPhaseName = "Son Dördün";
    moonDescription = "Gecenin ilerleyen saatlerinde göğü yarı yarıya bölen huzurlu bir ışık.";
  } else if (age >= 0.78 && age <= 0.97) {
    moonPhaseName = "Hilal (Küçülen)";
    moonDescription = "Kozmik döngünün tamamlanmakta olduğunu hatırlatan son hilal.";
  }

  // Detect recurring annual meteor showers
  const date = sky.time;
  const month = date.getUTCMonth() + 1; // 1-12
  const day = date.getUTCDate();

  let specialEvent: string | undefined;
  let specialEventDescription: string | undefined;

  // Perseid: August 10-14
  if (month === 8 && day >= 10 && day <= 14) {
    specialEvent = "Perseid Göktaşı Yağmuru";
    specialEventDescription = "Yılın en görkemli akan yıldız şöleni bu gecenin gökyüzündeydi.";
  }
  // Geminid: December 12-15
  else if (month === 12 && day >= 12 && day <= 15) {
    specialEvent = "Geminid Göktaşı Yağmuru";
    specialEventDescription = "Kozmik tozların gökyüzünde parlak izler bıraktığı İkizler yağmuru.";
  }
  // Quadrantid: January 2-5
  else if (month === 1 && day >= 2 && day <= 5) {
    specialEvent = "Quadrantid Göktaşı Yağmuru";
    specialEventDescription = "Yılın ilk günlerinde gökyüzünü süsleyen yoğun meteor akışı.";
  }
  // Lyrid: April 20-23
  else if (month === 4 && day >= 20 && day <= 23) {
    specialEvent = "Lyrid Göktaşı Yağmuru";
    specialEventDescription = "Çalgı takımyıldızından süzülen antik meteorların parıltısı.";
  }
  // Orionid: October 20-23
  else if (month === 10 && day >= 20 && day <= 23) {
    specialEvent = "Orionid Göktaşı Yağmuru";
    specialEventDescription = "Halley kuyruklu yıldızının arkasında bıraktığı tozların ışıltılı dansı.";
  }
  // Check if any planets are visible above the horizon (altitude > 10)
  else {
    const visiblePlanets = sky.bodies
      .filter((b) => b.kind === "planet" && b.altitude > 10)
      .map((b) => b.name);
    
    if (visiblePlanets.length >= 3) {
      specialEvent = "Gezegen Hizalanması";
      specialEventDescription = `Bu gece gökyüzünde ${visiblePlanets.slice(0, -1).join(", ")} ve ${visiblePlanets[visiblePlanets.length - 1]} gezegenleri yan yana dizilmişti.`;
    }
  }

  return {
    moonPhaseName,
    moonDescription,
    specialEvent,
    specialEventDescription,
  };
}
