# Grottammare isometrica

Data: 2026-11-23

## Intent

Un sito che le persone possono aprire e girare, da portare al sindaco di Grottammare come regalo di un grottammarese, e che il Comune possa usare per far vedere il paese a chi non c'è.

Il risultato da eguagliare è quello degli screenshot in `references/` (oggi nella radice del workspace): la Roma isometrica di Domenico Gagliardi, a sua volta costruita sul progetto Isometric World di Dmytro Krasun. Stesso tipo di oggetto: la città vera, edificio per edificio, dipinta in quello stile illustrato, spostabile e zoomabile, con la luce del giorno e qualcosa che si muove sulle strade.

Chi arriva deve riconoscere Grottammare senza didascalia. Un residente deve poter arrivare alla propria via. Il sindaco deve poter mandare il link.

## Goals

- Un sito in italiano, apribile da computer e da telefono, con pan e zoom.
- All'apertura, la veduta cartolina: mare Adriatico davanti, spiaggia e lungomare con le palme, ferrovia, paese basso, Paese Alto sulla collina con Torrione della Battaglia, Piazza Peretti, loggiato del Teatro dell'Arancio, San Giovanni Battista e Santa Lucia.
- Il paese abitato intero è dipinto e percorribile: dal Tesino a Ischia, dal mare alla collina, stazione compresa.
- Ora locale, meteo vero di Grottammare, scelta Giorno / Pomeriggio / Notte.
- Auto sulle strade vere, con sensi unici. Il treno sulla linea Adriatica, in corrispondenza della stazione.
- Di notte i lampioni e i fari delle auto si accendono.
- I monumenti elencati sotto si riconoscono. Se escono generici, il regalo non è pronto.
- In fondo alla pagina le fonti restano visibili, così il Comune può condividere mappa e immagini citandole.
- Prima si guarda un pezzo piccolo. Solo se quel pezzo convince si dipinge il resto.

## Non-goals

- Traffico TomTom e bus in tempo reale. Non sono la storia del regalo.
- Linee ATAC, tram di Roma, mura aureliane, carta tecnica del Lazio.
- Dipingere campagne, case sparse e zone industriali (Valtesino, Bore Tesino). Il bordo del paese abitato sfuma.
- Un modello 3D ufficiale degli edifici. Non ne è emerso uno aperto e usabile. I tetti si stimano dai dati OSM.
- Un filmato per i social nella prima consegna. Il sito è il regalo.
- Il modulo «Segnala un problema» di Roma, che apre issue sul repository di Domenico.
- Un accorciatore di link sul dominio di qualcun altro.
- Pubblicare online, creare bucket o comprare un dominio senza un sì esplicito dell'autore.
- Inglese nell'interfaccia. La presentazione al sindaco è in italiano. Il disegno si capisce anche senza testo.
- Cercare un nome e un cognome da mettere nel footer. Il sito si chiama Grottammare isometrica. Il nome di chi lo regala si aggiunge solo se l'autore lo chiede.

## Anti-goals

- Un paese generico con i tetti arancioni, in cui Torrione e Piazza Peretti non si riconoscono.
- Geometria o foto proprietarie (Google, Apple, Bing, Mapbox satellite) dentro la mappa o come riferimento di pittura. Vale anche «solo per controllare».
- Una pagina che il Comune non può mostrare perché mancano le attribuzioni o perché la licenza delle immagini non permette di condividerle citando la fonte.
- Cambiare origine della camera o angolo dopo che esistono delle tessere. Si sposterebbe tutta la pittura.

## Constraints

- Codice di partenza: [krasun/isometricworld](https://github.com/krasun/isometricworld), licenza MIT, Node 24. La guida per aggiungere una città è `AGENTS.md` di quel repository. Si segue quella guida. Non si riscrive la pipeline.
- I pezzi già fatti da copiare stanno in [dg996/mondoisometrico](https://github.com/dg996/mondoisometrico), anch'esso MIT, «basato su Isometric World». Si copiano solo i file nominati sotto, adattando coordinate e testi. Non si parte da quel repository: lì Roma è nel codice (CTRN Lazio, ATAC, TomTom, mura, monumenti).
- Dati aperti soltanto, con la frase di credito esatta in `ATTRIBUTION.md` e nel footer.
- Pittura con la Codex CLI già prevista dalla pipeline (`codex exec`, account ChatGPT). Se al momento di dipingere l'utente non è loggato, ci si ferma e si chiede. Non si apre un account fal.ai e non si spende nulla senza un sì.
- Render delle tessere: Chrome o Chromium, variabile `CHROME_PATH`.
- Estratto OSM: il più piccolo Geofabrik che contiene il comune (Italia centro), tramite osmium, come fa la pipeline. Non si scarica l'Italia intera se l'estratto regionale basta.
- Open-Meteo è gratuito per uso non commerciale, con attribuzione CC BY 4.0. Va bene per il regalo e per il link che l'autore manda in giro. Se un giorno il Comune ne fa un prodotto promozionale ufficiale, questa voce va ricontrollata: o un piano commerciale, o si toglie il meteo dal vivo e si tengono solo Giorno / Pomeriggio / Notte. Non blocca la prima versione.
- Il workspace oggi non è un repository. Contiene gli screenshot e questo documento. L'implementazione sposta gli screenshot in `references/` e ci mette il clone del codice senza cancellarli.
- Pubblicazione (Cloudflare R2 e sito, come da README di Isometric World) solo quando l'autore dice che il paese è presentabile. Fino ad allora si guarda in locale con `npm run dev`.

## Approaches

1. **Clone di Isometric World, e da Roma si copiano solo i pezzi che negli screenshot si vedono.** Aggiungere una città è già documentato. Auto, treni, pittura, monumenti a parte e il sito ci sono. Da Mondo Isometrico si copiano ora, meteo, pioggia e lampioni, che lì sono file separati. Scartati i moduli di Roma. **Scelta dell'autore:** la strada più semplice, e dove un pezzo esiste si copia e si adatta.

2. **Partire dal repository di Roma e sostituire la città.** L'interfaccia italiana c'è già. Il costo è smontare carta del Lazio, bus, traffico, mura e monumenti prima di disegnare Grottammare. Più rischio di lasciare un pezzo di Roma dentro. Scartata.

3. **Riscrivere il procedimento.** Scartata. La pipeline di Roma e di Tel Aviv è già questo lavoro.

## What was decided

Decisioni dell'autore:

- Il sito è un regalo da far guardare e poi portare al sindaco, utilizzabile anche come vetrina turistica.
- Dentro c'è il paese abitato intero, non solo la cartolina e non tutto il territorio comunale fino alle case sparse.

Chiamate di chi scrive il disegno, da poter correggere:

- Base: Isometric World. Copia mirata da Mondo Isometrico, elencata sotto.
- Niente TomTom, niente bus.
- Auto e treno sì. Il treno usa il disegnatore di treni già nel codice, con una livrea semplice già presente. Non si modella la flotta Trenitalia.
- I villini liberty sono una regola del prompt di pittura (stucco, colori chiari, primi Novecento) lungo il lungomare, non un ritaglio per ogni villa.
- Ritagli a parte, con il comando `landmark` già esistente, solo per: Torrione della Battaglia; il gruppo di Piazza Peretti (loggiato del Teatro dell'Arancio, torre civica / altana dell'orologio, chiesa di San Giovanni Battista); chiesa di Santa Lucia con il campanile; chiesa di San Pio V nel paese basso, per il campanile alto. Le foto di riferimento, se servono, sono solo a licenza aperta oppure scatti dell'autore. Niente Google.
- Prima versione dati: OpenStreetMap per edifici, strade, ferrovia, alberi e uso del suolo; Copernicus DEM per la collina. Niente importatore nuovo della Carta Tecnica Regionale Marche in questa versione. Quella carta è CC BY 4.0, ma l'edificato al 10.000 è fermo intorno al 1999-2000, e scrivere un lettore nuovo contraddice la copia semplice. Se nel render di prova il Paese Alto è un rialzo piatto, prima di dipingere si valuta il DTM regionale, che è aperto. Quella valutazione è un controllo, non lavoro anticipato.
- Gli alberi del lungomare (pini, palme, oleandri, aranci) stanno nel prompt di pittura della regione. Si usa il foglio alberi già in Isometric World. Se la prova dipinge abeti sul lungomare, si copia `pipeline/style/trees-roma.png` da Mondo Isometrico come foglio della regione e lo si cita.
- I lampioni non hanno un dataset aperto del comune. Si copia il modulo di Roma, che li mette lungo le strade OSM. La densità di partenza è quella del file copiato. Se di notte il lungomare sembra un viale di autostrada, si allarga solo la costante di spaziatura, prima di far vedere la prova.
- Footer: «Grottammare isometrica», crediti dei dati, «Painted with AI», Isometric World di Dmytro Krasun, e Mondo Isometrico di Domenico Gagliardi per i pezzi di luce e meteo adattati. Nessun nome di persona finché l'autore non lo chiede.
- Immagini della mappa in CC BY 4.0, come Roma, così si possono riusare citando la fonte. Il codice resta MIT, con le licenze originali intatte.
- Interfaccia in italiano, ripresa dai testi di Roma dove la frase esiste già.
- Vista iniziale larga circa 2,2 km, così nel primo schermo ci sono mare e borgo insieme. Poi si zooma fino alle vie. Il numero esatto si aggiusta sulla prova, prima di bloccarlo.
- La camera guarda verso l'interno, il mare in primo piano, la collina in alto, due facciate degli isolati visibili. L'angolo preciso si sceglie su una griglia di prove e si blocca solo dopo il sì dell'autore. Origine proposta, da correggere sulla prova e poi da non toccare più: il centro del paese abitato, intorno a 42.988 N, 13.868 E. L'origine è il municipio se su OSM è il punto che tiene mare e borgo nel primo schermo; altrimenti un punto fra lungomare e Paese Alto. Non si inventa una coordinata finta e definitiva in questo documento.

## What a visitor sees

All'apertura, `/grottammare`:

```
mare Adriatico, in primo piano
spiaggia, palme, lungomare
ferrovia e paese basso, campanile di San Pio V
Paese Alto sulla collina
  Torrione, Piazza Peretti, loggiato, San Giovanni, Santa Lucia
```

Sotto o sopra la mappa, come a Roma: orologio di Grottammare, temperatura e condizione in italiano, e tre modi più il tempo vero: Adesso, Giorno, Pomeriggio, Notte. Condividi copia il link della vista corrente (coordinate nell'URL, senza accorciatore). Da telefono si trascina e si zooma con due dita.

Spostandosi a nord si arriva al Tesino e alla stazione resta nel paese. A sud si arriva a Ischia, verso il confine con San Benedetto, e il dipinto finisce con una sfumatura. Oltre, niente campagne dipinte.

## How it is built

Si segue `AGENTS.md` di Isometric World, sezione «Adding a city». Grottammare è una regione nuova: dista centinaia di chilometri dalle regioni già nel progetto.

Configurazione, senza nuovi lettori di dati:

- Regione `grottammare` in `pipeline/src/places.ts`. `sources` non impostato: edifici e alberi da OSM, terreno Copernicus. `look` dipinto, come Zagabria nel progetto originale: ogni finestra da 1024 px viene ridipinta, e dove manca la pittura resta il render.
- Città `grottammare`, slug `/grottammare`, titolo «Grottammare». `DEFAULT_CITY` punta a questa. Le altre città del progetto originale restano nel codice (togliere Tel Aviv e Stoccarda non è necessario e rischia di rompere i controlli), ma la home apre Grottammare.
- Area di prova `peretti`, circa 1 km, che copra Piazza Peretti, il Torrione e più costa possibile. Se un chilometro non arriva al lungomare, si aggiunge un secondo riquadro di prova `lungomare` prima di dipingere il resto. Poi un'area `abitato` con il paese costruito, ben sotto il limite di memoria della pipeline (il comune intero è circa 17,7 km²).
- Contorno: relazione OSM `admin_level=8` di nome Grottammare. L'id lo legge il builder da OSM, non si indovina qui. Il dipinto è limitato al costruito (residenziale, borgo, lungomare, Ischia, stazione). Il confine comunale serve a non uscire dal comune.
- `headingDeg` e `origin` si bloccano solo dopo la griglia di prove descritta nei controlli.
- `heightBase` e ondulazione del geoide: li calcola il builder come da guida, così spiaggia (0 m) e collina (Paese Alto circa 170 m, punta comunale circa 287 m) ci stanno. Partenza Copernicus GLO-30.
- Ferrovia: il campo `rail` della regione, con il disegnatore già presente, sul binario OSM della stazione di Grottammare. Niente aeroporto, niente piccioni, niente insegne rotanti.
- Prompt di pittura: una voce per `grottammare` in `LOCAL` di `pipeline/src/paint.ts`. Descrive costa adriatica, tetti in coppi, intonaci del borgo, palme e pini sul lungomare, villini liberty, ferrovia fra il mare e il paese. Non nomina i monumenti nel prompt generale (la guida lo vieta: il modello li ripeterebbe in ogni finestra). I monumenti passano dal comando `landmark`.
- Crediti in `places.ts`, `ATTRIBUTION.md`, footer della mappa e pagina indice.

File da copiare da Mondo Isometrico e adattare, senza riscriverne la logica:

- `web/src/scripts/ambient.ts`: sole, meteo Open-Meteo, pioggia, nebbia, modi Giorno / Pomeriggio / Notte. Si cambiano latitudine e longitudine con quelle dell'origine di Grottammare, il fuso resta `Europe/Rome`, le etichette italiane restano. Il commento che dice «Roma» diventa «Grottammare».
- `web/src/scripts/lights.ts`: lampioni e fari. Si adatta solo se il tipo `Road` di Isometric World non coincide con quello di Roma. La matematica delle luci non si riscrive.
- Il markup del pannello ora/meteo e dei pulsanti del giorno, dalle pagine di Roma (`web/src/components/MapPage.astro` e la pagina città), innestato nella pagina di Isometric World. Non si copia l'interruttore del traffico TomTom.
- La parte di `web/src/scripts/share.ts` che mette la vista corrente nell'URL. Se il file dipende da `api/p.ts` (accorciatore sul loro dominio), si copia solo la costruzione dell'URL.

Non si copiano: `ctrn.ts`, `transit.ts`, `trams.ts`, `live-traffic.ts`, `api/traffic.ts`, `api/feedback.ts`, `api/p.ts`, `city-walls.ts`, `roma-style.ts`, i monumenti di Roma, i test il cui nome contiene `roma`.

Auto: il `traffic.ts` già in Isometric World. Non quello di Roma.

Ordine di lavoro, lo stesso della guida:

1. Spostare gli screenshot in `references/`. Clonare Isometric World nel workspace senza cancellare `docs/` e `references/`. Annotare nel README lo SHA del commit clonato.
2. `npm install`. Controllare che `npm run dev` apra ancora una città del progetto originale, così si sa che l'ambiente funziona prima di toccare Grottammare.
3. Aggiungere regione, città, area `peretti`, crediti, prompt vuoto o minimo.
4. `boundaries`, `fetch`, `ground`, `scene`, `render` sull'area di prova. Griglia di angoli. l'autore sceglie. Si blocca `origin` e `headingDeg`.
5. Innestare ambient e lights. In locale la prova si guarda di giorno, al pomeriggio e di notte, con `?ora=` e `?meteo=` come a Roma, solo sul dev server.
6. Dipingere l'area di prova. l'autore guarda Torrione, piazza e, se c'è, il lungomare.
7. Monumenti col comando `landmark`, uno alla volta, con il suo sì su ciascuno prima di comporlo sulla mappa.
8. Area `abitato`: fetch, ground, scene, render, paint, export. La pittura gira in background e si riesporta man mano, come da guida.
9. `npm run dev` su `/grottammare`. Controllo nel browser, elencato sotto.
10. Pubblicazione solo su richiesta.

## Review gates

l'autore vede e dice sì o no, prima di andare avanti, in due momenti:

- Il render non ancora dipinto della prova, con l'angolo scelto. Deve leggere: mare davanti, lungomare, borgo in alto, due facciate.
- La prova dipinta. Torrione e Piazza Peretti si riconoscono. Sul lungomare non ci sono alberi del nord al posto di palme e pini. I lampioni di notte non coprono la strada.

Senza questi due sì non si dipinge il resto del paese e non si parla di pubblicazione.

## Browser check prima di dire che funziona

Sul dev server, in una finestra larga e in una stretta da telefono:

- `/grottammare` si apre sulla veduta cartolina, senza errori in console.
- Adesso, Giorno, Pomeriggio e Notte cambiano la luce. Di notte si vedono lampioni e fari.
- Il meteo mostra una condizione in italiano, oppure «meteo non disponibile» se la rete fallisce, senza rompere la mappa.
- Si arriva trascinando alla stazione e a Ischia. Il bordo sfuma. Fuori dal costruito non c'è un secondo paese inventato.
- Un'auto percorre una via a senso unico nel verso giusto.
- Il treno sta sul binario della stazione, non in mezzo agli isolati.
- I quattro monumenti (Torrione, gruppo di Piazza Peretti, Santa Lucia, San Pio V) sono al loro posto.
- Il footer cita OpenStreetMap, Copernicus, Open-Meteo se il meteo c'è, «Painted with AI», Krasun e Gagliardi.
- Condividi produce un URL che riapre la stessa vista.

`tsc --noEmit` in `pipeline` e il check di Astro in `web`, come da guida. I test già presenti del progetto originale non si cancellano. Non si aggiunge un framework di test nuovo.

## What is left to the builder

- Lo SHA esatto da clonare (il `main` al momento del clone) e il modo pratico di copiare i file in un workspace non vuoto.
- L'id della relazione OSM del confine, il punto esatto dell'origine e il `headingDeg`, dentro i criteri sopra, bloccati solo dopo la prova.
- Geoide, `heightBase`, e se il DTM regionale serve dopo aver visto la collina.
- Se `Road` in `lights.ts` va adattato campo per campo.
- Se `share.ts` si può copiare intero o solo in parte.
- Quante finestre da 1024 px escono sull'abitato, e come spezzare la pittura in lotti. Non si stima qui un numero di Roma.
- La livrea del treno fra quelle già disegnate.
- La spaziatura dei lampioni, se la prova notturna è troppo fitta.
- Il percorso di Chrome su questa macchina Windows.

## Sources and credits to record

- © OpenStreetMap contributors (ODbL). La frase resta visibile su mappa e su ogni eventuale clip.
- Copernicus DEM. Testo di credito come già scritto in `ATTRIBUTION.md` di Isometric World.
- Open-Meteo, CC BY 4.0, solo se il pannello meteo è attivo.
- Painted with AI, su ogni regione dipinta.
- Codice MIT: Isometric World, Dmytro Krasun; pezzi adattati da Mondo Isometrico, Domenico Gagliardi.
- Immagini derivate della mappa: CC BY 4.0.
- Nessuna carta della Regione Marche nella prima versione. Se più avanti entra il DTM o la CTR, la voce «Regione Marche, CC BY 4.0, proprietà regionale esplicita» si aggiunge prima di pubblicare quel dato.
