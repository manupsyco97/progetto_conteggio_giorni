let inputDataPartenza = document.querySelector('#dataPartenza');
let inputDataRitorno = document.querySelector('#dataRitorno');
let btnSubmit = document.querySelector('#btnSubmit');
let dateWrapper = document.querySelector('#dateWrapper');
let btnShowDates = document.querySelector('#btnShowDates');

let dates = [];

const DATE = {

    dates: [],

    calcoloGiorniInEntrata: function (data_inizio, data_fine) {

        let differenzaInMillisecondi = data_fine - data_inizio;
        let millisecondiInUnGiorno = 1000 * 60 * 60 * 24;
        let giorniTotali = Math.round(differenzaInMillisecondi / millisecondiInUnGiorno);
        return giorniTotali;
    },

    addDates: function (data_inizio, data_fine) {
        this.dates.push({ partenza: data_inizio, ritorno: data_fine });
    },

    render: function (daysList) {
        dateWrapper.innerHTML = '';

        daysList.forEach((day) => {

            let partenzaFormattata = day.partenza.toLocaleDateString('it-IT');
            let ritornoFormattata = day.ritorno.toLocaleDateString('it-IT');

            let div = document.createElement('div');
            div.classList.add('col-12', 'col-md-7', 'my-3');
            div.innerHTML = `
                <div class="cardContact d-flex justify-content-evenly align-items-center mt-3">
                    <div class="d-flex flex-column gap-2"
                        <p class="fw-bold m-0">Data partenza</p>
                        <p class="fw-bold m-0">${partenzaFormattata}</p>
                    </div>
                    <div class="d-flex flex-column gap-2"
                        <p class="fw-bold m-0">Data Ritorno</p>
                        <p class="fw-bold m-0">${ritornoFormattata}</p>
                    </div>
                </div>
            `
            dateWrapper.appendChild(div);
        });
    },

    showDates: function () {
        if (this.dates.length === 0) {

            dateWrapper.innerHTML = `
                        <div class="col-12 col-md-7 text-center my-4">
                            <p class="fs-5 text-danger fw-bold m-0">
                            <i class="fa-solid fa-triangle-exclamation me-2"></i>
                            Nessuna data registrata.</p>
                        </div>
                    `
        } else {
            this.render(this.dates);
        }
    }

}


let isOpen = false;

btnShowDates.addEventListener('click', () => {
    if (isOpen == false) {
        isOpen = true;
        btnShowDates.innerHTML = 'Nascondi Date';
        DATE.showDates();
    } else {
        dateWrapper.innerHTML = '';
        isOpen = false;
        btnShowDates.innerHTML = 'Mostra Date';
    }
});

btnSubmit.addEventListener('click', (e) => {

    e.preventDefault();

    if (inputDataPartenza.value.trim() === "" || inputDataRitorno.value.trim() === "") {
        alert("Errore: Devi inserire sia la data di partenza che quella di ritorno!");
        return;
    }

    let dayCount = 0;
    let data_partenza = new Date(inputDataPartenza.value);
    let data_ritorno = new Date(inputDataRitorno.value);

    if (data_ritorno < data_partenza) {
        alert('La tua data di partenza deve avvenire prima del tuo ritorno.');
        return;
    }

    DATE.addDates(data_partenza, data_ritorno);
    dayCount += DATE.calcoloGiorniInEntrata(data_partenza, data_ritorno);
    console.log(`Giorni totali ${dayCount}`);

});

