import {reactive, applyAndRegister, startReactiveDom} from './reactiveMinified.js';

let mediatheque = reactive({
    adherents: [],
    livresDisponibles: [],
    livresEmpruntes: []
}, "mediatheque");

getAllAdherents();
getAllLivresDisponibles();
getAllLivresEmpruntes();

function getAllAdherents() {
    fetch('/ProjetMediatheque/src/php/Controller/ControllerAdherent.php?action=readAll')
        .then(response => response.json())
        .then(data => {
            console.log('Adherents data:', data);
            mediatheque.adherents = data.map(adherent => {
                // TODO : Ajouter info sur les livres empruntés par l’adhérent + img livre
                return `<div><img src="img/x.svg" onclick="deleteAdherent(${adherent.idAdherent})" alt="delete"> ${adherent.nomAdherent}</div>`;
            }).join('');
        });
}

function getAllLivresDisponibles() {
    fetch('/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=readAll')
        .then(response => response.json())
        .then(data => {
            console.log('Livres disponibles data:', data);
            mediatheque.livresDisponibles = data.map(livre => {
                return `<div><img src="img/x.svg" onclick="deleteLivre(${livre.idLivre})" alt="delete"><a href="#" onclick="preterLivre(${livre.idLivre})"> ${livre.titreLivre}</a></div>`;
            }).join('');
        });
}

function getAllLivresEmpruntes() {
    fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=readAll')
        .then(response => response.json())
        .then(data => {
            console.log('Livres empruntés data:', data);
            mediatheque.livresEmpruntes = data.map(emprunt => {
                return `<div><img src="img/x.svg" onclick="restituerLivre(${emprunt.idLivre})" alt="delete">Livre ID: ${emprunt.idLivre}, Adhérent ID: ${emprunt.idAdherent}</div>`;
            }).join('');
        });
}

window.afficherLivresAdherent = function (idAdherent) {
    // TODO :  par un clic sur le nom de l’adhérent, à la liste des livres qu’il a en sa possession en ce moment ;
    // voir img readme
    // dans un fenetre
    fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=readAll')
        .then(response => response.json())
        .then(data => {
            console.log('Livres empruntés data:', data);
            const listeLivresAdherent = document.getElementById('listeLivresAdherent');
            listeLivresAdherent.innerHTML = '';
            data.forEach(emprunt => {
                if (emprunt.idAdherent == idAdherent) {
                    const livreElement = document.createElement('div');
                    livreElement.textContent = "Livre ID: " + emprunt.idLivre;
                    listeLivresAdherent.appendChild(livreElement);
                }
            });
        });
}

function preterLivre(idLivre) {
    // TODO : par un clic sur le titre du livre disponible à l’emprunt, à une fenêtre qui permet de prêter le livre à un adhérent ;
    // voir img readme
    // utiliser les méthodes natives alert(), prompt() et confirm()
    const idAdherent = prompt("Entrez l'ID de l'adhérent à qui prêter le livre:");
    if (idAdherent) {
        const formData = new FormData();
        formData.append('idAdherent', idAdherent);
        formData.append('idLivre', idLivre);

        fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=create', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                console.log('New emprunt:', data);
                getAllLivresDisponibles();
                getAllLivresEmpruntes();
            });
    }
}

function restituerLivre(idLivre) {
    // TODO : par un clic sur le titre du livre prêté, à une fenêtre proposant la restitution du livre.
    // voir img readme
    // utiliser les méthodes natives alert(), prompt() et confirm()
    fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=delete&idLivre=' + idLivre)
        .then(response => response.text())
        .then(data => {
            console.log('Emprunt deleted:', idLivre);
            getAllLivresDisponibles(); // Actualiser la liste après la suppression
            getAllLivresEmpruntes();
        });
}

window.deleteLivre = function (idLivre) {
    fetch('/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=delete&id=' + idLivre)
        .then(response => response.text())
        .then(data => {
            getAllLivresDisponibles();
            getAllLivresEmpruntes();
        });
}

window.deleteAdherent = function (idAdherent) {
    fetch('/ProjetMediatheque/src/php/Controller/ControllerAdherent.php?action=delete&id=' + idAdherent)
        .then(response => response.text())
        .then(data => {
            console.log('Adherent deleted:', idAdherent);
            getAllAdherents(); // Actualiser la liste après la suppression
        });
}

function addAdherent() {
    const nomAdherent = document.getElementById('nomAdherent').value;
    const formData = new FormData();
    formData.append('nom', nomAdherent);
    document.getElementById('nomAdherent').value = '';

    fetch('/ProjetMediatheque/src/php/Controller/ControllerAdherent.php?action=create', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            console.log('New adherent ID:', data);
            getAllAdherents(); // Actualiser la liste après l'ajout
        });
}

function addLivre() {
    const titreLivre = document.getElementById('titreLivre').value;
    const formData = new FormData();
    formData.append('titre', titreLivre);
    document.getElementById('titreLivre').value = '';

    fetch('/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=create', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            console.log('New livre ID:', data);
            getAllLivresDisponibles();
        });
}

// Add event listeners to the buttons
document.getElementById('ajouterAdherent').addEventListener('click', addAdherent);
document.getElementById('ajouterLivre').addEventListener('click', addLivre);


startReactiveDom();
