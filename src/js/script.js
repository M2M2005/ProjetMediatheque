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
        .then(adherentsData => {
            const promises = adherentsData.map(adherent => {
                return nblivre(adherent).then(count => {
                    adherent.nombreLivresEmpruntes = count !== null ? count : 'N/A';
                    return `<div>
                        <img src="img/x.svg" onclick="deleteAdherent(${adherent.idAdherent})" alt="delete"> 
                        ${adherent.idAdherent} - ${adherent.nomAdherent} 
                        (${adherent.nombreLivresEmpruntes} emprunt${adherent.nombreLivresEmpruntes > 1 ? 's' : ''} 
                        <img src="img/book.svg" alt="book" onclick="afficherLivresAdherent(${adherent.idAdherent})">)
                    </div>`;
                });
            });

            Promise.all(promises)
                .then(resolvedHtmlStrings => {
                    mediatheque.adherents = resolvedHtmlStrings.join('');
                })
        });
}

function getAllLivresDisponibles() {
    fetch('/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=readAllDisponible')
        .then(response => response.json())
        .then(data => {
            console.log('Livres disponibles data:', data);
            mediatheque.livresDisponibles = data.map(livre => {
                return `<div>
                    <img src="img/x.svg" onclick="deleteLivre(${livre.idLivre})" alt="delete"> 
                    ${livre.titreLivre}
                    <img src="img/book.svg" alt="book" onclick="preterLivre(${livre.idLivre})">
                    </a></div>`;
            }).join('');
        });
}

function getAllLivresEmpruntes() {
    fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=readAll')
        .then(response => {
            return response.json();
        })
        .then(empruntsData => {
            const empruntPromises = empruntsData.map(emprunt => {
                return fetch(`/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=select&id=${emprunt.idLivre}`)
                    .then(response => {
                        return response.json();
                    })
                    .then(livreData => {
                        emprunt.titreLivre = livreData && livreData.titreLivre ? livreData.titreLivre : `(ID ${emprunt.idLivre} - Titre inconnu)`;
                        return emprunt;
                    });
            });

            Promise.all(empruntPromises)
                .then(resolvedEmprunts => {
                    mediatheque.livresEmpruntes = resolvedEmprunts.map(emprunt => {
                        return `<div>
                            <img src="img/x.svg" onclick="window.restituerLivre(${emprunt.idLivre})" alt="delete">
                            ${emprunt.titreLivre}, Adhérent ID: ${emprunt.idAdherent}
                        </div>`;
                    }).join('');
                });
        });
}

window.afficherLivresAdherent = function (idAdherent) {
    let nomAdherent = "Adhérent inconnu";

    const modal = document.getElementById('modalLivresAdherent');
    const modalAdherentName = document.getElementById('modalAdherentName');
    const modalLivresList = document.getElementById('modalLivresList');
    const closeButton = document.querySelector('.close-button');

    modalAdherentName.textContent = "";
    modalLivresList.innerHTML = "";

    closeButton.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    fetch(`/ProjetMediatheque/src/php/Controller/ControllerAdherent.php?action=select&id=${idAdherent}`)
        .then(response => {
            return response.json();
        })
        .then(adherentData => {
            nomAdherent = adherentData.nomAdherent;
            modalAdherentName.textContent = `Livres empruntés par ${nomAdherent}`;

            fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=selectOf&idAdherent=' + idAdherent)
                .then(response => {
                    return response.json();
                })
                .then(livresEmpruntes => {
                    if (livresEmpruntes && livresEmpruntes.length > 0) {
                        livresEmpruntes.forEach(emprunt => {
                            const livreDiv = document.createElement('div');
                            livreDiv.textContent = `Livre ID: ${emprunt.idLivre}`;
                            modalLivresList.appendChild(livreDiv);
                        });
                    } else {
                        const noLivresDiv = document.createElement('div');
                        noLivresDiv.textContent = "Aucun livre emprunté.";
                        modalLivresList.appendChild(noLivresDiv);
                    }
                    modal.style.display = "flex";
                })
        })
};

window.preterLivre = function (idLivre) {
    const idAdherent = prompt("Entrez l'ID de l'adhérent à qui prêter le livre:");

    if (idAdherent) {
        const formData = new FormData();
        formData.append('idAdherent', idAdherent);
        formData.append('idLivre', idLivre);

        fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=create', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                return response.text();
            })
            .then(data => {
                console.log('Nouvel emprunt:', data);
                getAllLivresDisponibles();
                getAllLivresEmpruntes();
            })
    }
}

window.restituerLivre = function (idLivre) {
    const confirmation = confirm("Êtes-vous sûr de vouloir restituer ce livre ?");
    if (confirmation) {
        fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=delete&idLivre=' + idLivre)
            .then(response => {
                return response.text();
            })
            .then(data => {
                getAllLivresDisponibles();
                getAllLivresEmpruntes();
            });
    }
};

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

function nblivre(adherent) {
    return fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=nomberOfEmprunts&idAdherent=' + adherent.idAdherent)
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data.count; // Retourne le nombre
        })
}

document.getElementById('ajouterAdherent').addEventListener('click', addAdherent);
document.getElementById('ajouterLivre').addEventListener('click', addLivre);

startReactiveDom();