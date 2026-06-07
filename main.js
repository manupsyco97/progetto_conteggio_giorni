let inputDataPartenza = document.querySelector('#dataPartenza');
let inputDataRitorno = document.querySelector('#dataRitorno');
let btnSubmit = document.querySelector('#btnSubmit');
let dateWrapper = document.querySelector('#dateWrapper');
let btnShowDates = document.querySelector('#btnShowDates');

let counterOggiWrapper = document.querySelector('#counterOggiWrapper');
let counterFuturoWrapper = document.querySelector('#counterFuturoWrapper');

const DATE = {
    // Nota: I mesi nel costruttore standard di JS vanno da 0 (Gennaio) a 11 (Dicembre)
    dates: [
        { sharpnessId: 1, partenza: new Date(2025, 0, 8), ritorno: new Date(2025, 0, 10) },
        { sharpnessId: 2, partenza: new Date(2025, 11, 10), ritorno: new Date(2025, 11, 15) },
        { sharpnessId: 3, partenza: new Date(2025, 10, 20), ritorno: new Date(2025, 10, 30) },
        { sharpnessId: 4, partenza: new Date(2026, 4, 20), ritorno: new Date(2026, 4, 30) },
    ],

    // Genera un array con tutti i singoli giorni trascorsi all'estero (in formato stringa locale YYYY-MM-DD)
    generaTuttiIGiorniAllEstero: function () {
        let giorniUnici = new Set();
        
        this.dates.forEach(viaggio => {
            let dataCorrente = new Date(viaggio.partenza.getTime());
            let dataFine = new Date(viaggio.ritorno.getTime());

            while (dataCorrente <= dataFine) {
                let anno = dataCorrente.getFullYear();
                let mese = String(dataCorrente.getMonth() + 1).padStart(2, '0');
                let giorno = String(dataCorrente.getDate()).padStart(2, '0');
                let stringaGiorno = `${anno}-${mese}-${giorno}`;
                
                giorniUnici.add(stringaGiorno);
                dataCorrente.setDate(dataCorrente.getDate() + 1);
            }
        });
        
        return Array.from(giorniUnici);
    },

    // Conta quanti giorni cadono nei 180 giorni precedenti alla dataDiRiferimento inclusa
    contaGiorniInFinestra: function (dataDiRiferimento, tuttiIGiorniStringhe) {
        let limite180Giorni = new Date(dataDiRiferimento.getTime());
        limite180Giorni.setDate(limite180Giorni.getDate() - 179); // La finestra include il giorno stesso

        let conteggio = 0;

        tuttiIGiorniStringhe.forEach(giornoStr => {
            let parti = giornoStr.split('-');
            let giornoOggetto = new Date(parti[0], parti[1] - 1, parti[2]);
            
            if (giornoOggetto >= limite180Giorni && giornoOggetto <= dataDiRiferimento) {
                conteggio++;
            }
        });

        return conteggio;
    },

    // Calcola quanti giorni di un singolo viaggio (da_inizio a data_fine) durano complessivamente
    calcolaDurataViaggio: function(data_inizio, data_fine) {
        let diffTime = Math.abs(data_fine - data_inizio);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    },

    addDates: function (data_inizio, data_fine) {
        this.dates.push({ partenza: data_inizio, ritorno: data_fine });
        this.initCounter();
    },

    // NUOVA FUNZIONE: Elimina il viaggio usando il suo indice reale nell'array originale
    deleteDate: function (actualIndex) {
        this.dates.splice(actualIndex, 1);
        this.initCounter(); // Ricalcola immediatamente i contatori aggiornati
        this.showDates();   // Aggiorna la lista mostrata a schermo
    },

    initCounter: function () {
        let oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

        let tuttiIGiorniAllEstero = this.generaTuttiIGiorniAllEstero();

        // 1. Contatore Oggi
        let giorniAdOggi = this.contaGiorniInFinestra(oggi, tuttiIGiorniAllEstero);
        this.updateVisualCounter(counterOggiWrapper, giorniAdOggi, 'text-success');

        // 2. Contatore Futuro
        let piccoMassimoFuturo = 0;

        if (tuttiIGiorniAllEstero.length > 0) {
            tuttiIGiorniAllEstero.forEach(giornoStr => {
                let parti = giornoStr.split('-');
                let dataRiferimento = new Date(parti[0], parti[1] - 1, parti[2]);
                
                let giorniInFinestra = this.contaGiorniInFinestra(dataRiferimento, tuttiIGiorniAllEstero);
                if (giorniInFinestra > piccoMassimoFuturo) {
                    piccoMassimoFuturo = giorniInFinestra;
                }
            });
        }

        let visualFuturo = Math.max(giorniAdOggi, piccoMassimoFuturo);
        this.updateVisualCounter(counterFuturoWrapper, visualFuturo, 'text-primary');
    },

    updateVisualCounter: function (elementoWrapper, numeroGiorni, classeColoreDefault) {
        if (!elementoWrapper) return;
        
        elementoWrapper.innerText = `${numeroGiorni} / 90`;

        if (numeroGiorni > 90) {
            elementoWrapper.classList.remove(classeColoreDefault);
            elementoWrapper.classList.add('text-danger', 'fw-bold');
        } else {
            elementoWrapper.classList.remove('text-danger', 'fw-bold');
            elementoWrapper.classList.add(classeColoreDefault);
        }
    },

    render: function (daysList) {
        setTimeout(() => {
            dateWrapper.innerHTML = '';

            // Mappiamo l'array mantenendo traccia dell'indice originale per evitare problemi post-ordinamento
            let dateMappate = daysList.map((day, originalIndex) => {
                return { ...day, originalIndex: originalIndex };
            });

            // Ordina i viaggi dal più recente al più vecchio (basandosi sulla data di partenza)
            dateMappate.sort((a, b) => b.partenza - a.partenza);

            dateMappate.forEach((day) => {
                let partenzaFormattata = day.partenza.toLocaleDateString('it-IT');
                let ritornoFormattata = day.ritorno.toLocaleDateString('it-IT');
                let durata = this.calcolaDurataViaggio(day.partenza, day.ritorno);

                let div = document.createElement('div');
                div.classList.add('col-12', 'col-md-10', 'col-lg-8', 'my-2');
                
                // HTML aggiornato inserendo l'icona del cestino interattiva legata all'indice originale
                div.innerHTML = `
                    <div class="travel-card d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-3 gap-md-4">
                            <button class="btn btn-delete-trip" onclick="DATE.deleteDate(${day.originalIndex})" title="Elimina questo viaggio">
                                <i class="bi bi-trash3-fill"></i>
                            </button>
                            <div class="d-flex gap-4 gap-md-5">
                                <div>
                                    <p class="travel-card-label">Partenza</p>
                                    <p class="travel-card-date"><i class="bi bi-airplane-takeoff me-2 text-muted"></i>${partenzaFormattata}</p>
                                </div>
                                <div>
                                    <p class="travel-card-label">Ritorno</p>
                                    <p class="travel-card-date"><i class="bi bi-airplane-landing me-2 text-muted"></i>${ritornoFormattata}</p>
                                </div>
                            </div>
                        </div>
                        <div class="travel-duration-badge">
                            ${durata} ${durata === 1 ? 'giorno' : 'giorni'}
                        </div>
                    </div>
                `;
                dateWrapper.appendChild(div);
            });
        }, 50);
    },

    showDates: function () {
        if (this.dates.length === 0) {
            dateWrapper.innerHTML = `
                <div class="col-12 col-md-10 col-lg-8 text-center my-4 mx-auto">
                    <div class="p-4 rounded-3 border border-dashed border-secondary border-opacity-25 bg-card">
                        <p class="fs-5 text-muted m-0">
                            <i class="bi bi-exclamation-circle me-2 text-danger"></i>Nessun viaggio registrato nello storico.
                        </p>
                    </div>
                </div>
            `;
        } else {
            this.render(this.dates);
        }
    }
};

// Inizializzazione al caricamento della pagina
DATE.initCounter();

let isOpen = false;

btnShowDates.addEventListener('click', () => {
    if (isOpen == false) {
        isOpen = true;
        btnShowDates.innerHTML = '<i class="bi bi-eye-slash me-2"></i>Nascondi Storico Viaggi';
        DATE.showDates();
    } else {
        dateWrapper.innerHTML = '';
        isOpen = false;
        btnShowDates.innerHTML = '<i class="bi bi-eye me-2"></i>Mostra Storico Viaggi';
    }
});

btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();

    if (inputDataPartenza.value.trim() === "" || inputDataRitorno.value.trim() === "") {
        alert("Errore: Devi inserire sia la data di partenza che quella di ritorno!");
        return;
    }

    let partiPartenza = inputDataPartenza.value.split('-');
    let data_partenza = new Date(partiPartenza[0], partiPartenza[1] - 1, partiPartenza[2]);
    
    let partiRitorno = inputDataRitorno.value.split('-');
    let data_ritorno = new Date(partiRitorno[0], partiRitorno[1] - 1, partiRitorno[2]);

    if (data_ritorno < data_partenza) {
        alert('La tua data di partenza deve avvenire prima del tuo ritorno.');
        return;
    }

    if (isOpen == false) {
        isOpen = true;
        btnShowDates.innerHTML = '<i class="bi bi-eye-slash me-2"></i>Nascondi Storico Viaggi';
    }

    DATE.addDates(data_partenza, data_ritorno);
    DATE.showDates();

    inputDataPartenza.value = '';
    inputDataRitorno.value = '';
});