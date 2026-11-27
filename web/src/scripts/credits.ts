/** Footer source lines and the made-by line, one branch per region. Unknown regions keep the Tel Aviv line. */
export function regionSourceLines(region: string): string[] {
  if (region === "grottammare") {
    return [
      `<a href="https://open-meteo.com/">Open-Meteo</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>`,
      // AGEA orthophoto (CC BY 4.0): source, licence, changes noted
      `<a href="https://geoportale.agea.gov.it/">Ortofoto AGEA 2022</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> (modificata)`,
    ];
  }
  if (region === "stuttgart") {
    return [
      `Datenquelle: <a href="https://www.lgl-bw.de">LGL</a>, <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a> (verändert)`,
      `<a href="https://opendata.stuttgart.de/dataset/luftbilder-2021">Luftbilder: Landeshauptstadt Stuttgart</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> (verändert)`,
      // the painted landmarks' reference photos (CC BY authors named; all of them in ATTRIBUTION.md)
      `Landmarks after <a href="https://github.com/krasun/isometricworld/blob/main/ATTRIBUTION.md">Wikimedia Commons photos</a> by J. Herzog, A. Praefcke, F. König, Enslin et al. (CC BY, verändert)`,
    ];
  }
  if (region === "zagreb") {
    // Otvorena dozvola: source, date of its last change, link, change notice
    return [
      `<a href="https://data.zagreb.hr/dataset/zg3d-2022-3d-model-gz">Grad Zagreb, ZG3D 2022</a> (7. 5. 2025.)`,
      `<a href="https://data.gov.hr/otvorena-dozvola">Otvorena dozvola</a>, izmijenjeno`,
    ];
  }
  if (region === "wieliczka") {
    // GUGiK (PZGiK material, CC BY 4.0) requires this notice: "prepared from the national geodetic and cartographic resource"
    return [
      `Opracowano na podstawie materiałów państwowego zasobu geodezyjnego i kartograficznego (<a href="https://www.geoportal.gov.pl/">GUGiK</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>)`,
    ];
  }
  return [`<a href="https://opendatasource.tel-aviv.gov.il/">Tel Aviv-Yafo Municipality</a>`];
}

export function madeByLine(region: string): string {
  if (region === "grottammare") {
    return `Grottammare isometrica · <a href="https://dmytrokrasun.com">Dmytro Krasun</a> (Isometric World) · luce e meteo adattati da <a href="https://github.com/dg996/mondoisometrico">Domenico Gagliardi</a> (Mondo Isometrico)`;
  }
  if (region === "stuttgart") {
    // the Stuttgart region was built by Lukas Hermann
    return `Made by <a href="https://lukashermann.dev/">Lukas Hermann</a> with <a href="https://dmytrokrasun.com">Dmytro Krasun</a>`;
  }
  if (region === "zagreb") {
    // the Zagreb region was built by Andrej Šimunaj (ZeroPointStudio)
    return `Made by <a href="https://zeropointstudio.io">Andrej Šimunaj</a> with <a href="https://dmytrokrasun.com">Dmytro Krasun</a>`;
  }
  if (region === "wieliczka") {
    // the Wieliczka region was built by Maciek Chmura
    return `Made by <a href="https://maciek.cloud/">Maciek Chmura</a> with <a href="https://dmytrokrasun.com">Dmytro Krasun</a>`;
  }
  return `Made by <a href="https://dmytrokrasun.com">Dmytro Krasun</a>`;
}
