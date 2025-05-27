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
        })
        .catch(error => {
            console.error('Erreur lors du chargement des adhérents:', error);
            mediatheque.adherents = '<div>Erreur lors du chargement des adhérents</div>';
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
                    <img src="img/image.svg" alt="image" onclick="window.afficherImageLivre(${livre.idLivre})">
                    </a></div>`;
            }).join('');
        })
        .catch(error => {
            console.error('Erreur lors du chargement des livres disponibles:', error);
            mediatheque.livresDisponibles = '<div>Erreur lors du chargement des livres</div>';
        });
}

async function getAllLivresEmpruntes() {
    try {
        const response = await fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=readAll');
        const empruntsData = await response.json();
        
        const empruntPromises = empruntsData.map(async (emprunt) => {
            try {
                const livreResponse = await fetch(`/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=select&id=${emprunt.idLivre}`);
                const livreData = await livreResponse.json();
                emprunt.titreLivre = livreData && livreData.titreLivre ? livreData.titreLivre : `(ID ${emprunt.idLivre} - Titre inconnu)`;
                return emprunt;
            } catch (error) {
                console.error(`Erreur lors de la récupération du livre ${emprunt.idLivre}:`, error);
                emprunt.titreLivre = `(ID ${emprunt.idLivre} - Erreur)`;
                return emprunt;
            }
        });
        
        const resolvedEmprunts = await Promise.all(empruntPromises);
        mediatheque.livresEmpruntes = resolvedEmprunts.map(emprunt => {
            return `<div>
                <img src="img/x.svg" onclick="window.restituerLivre(${emprunt.idLivre})" alt="delete">
                ${emprunt.titreLivre} 
                <img src="img/person.svg" alt="person" onclick="window.afficherLivresAdherent(${emprunt.idAdherent})">
                <img src="img/image.svg" alt="image" onclick="window.afficherImageLivre(${emprunt.idLivre})">
            </div>`;
        }).join('');
    } catch (error) {
        console.error('Erreur lors du chargement des emprunts:', error);
        mediatheque.livresEmpruntes = '<div>Erreur lors du chargement des emprunts</div>';
    }
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
                .then(empruntsData => {
                    const livrePromises = empruntsData.map(emprunt => {
                        return fetch(`/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=select&id=${emprunt.idLivre}`)
                            .then(response => {
                                return response.json();
                            })
                            .then(livreData => {
                                emprunt.titreLivre = livreData && livreData.titreLivre ? livreData.titreLivre : `Titre inconnu (ID: ${emprunt.idLivre})`;
                                return emprunt;
                            });
                    });

                    Promise.all(livrePromises)
                        .then(resolvedEmprunts => {
                            if (resolvedEmprunts && resolvedEmprunts.length > 0) {
                                resolvedEmprunts.forEach(emprunt => {
                                    const livreDiv = document.createElement('div');
                                    livreDiv.textContent = `Livre : ${emprunt.titreLivre}`;
                                    modalLivresList.appendChild(livreDiv);
                                });
                            } else {
                                const noLivresDiv = document.createElement('div');
                                noLivresDiv.textContent = "Aucun livre emprunté.";
                                modalLivresList.appendChild(noLivresDiv);
                            }
                            modal.style.display = "flex";
                        });
                });
        });
};

window.preterLivre = async function (idLivre) {
    const idAdherent = prompt("Entrez l'ID de l'adhérent à qui prêter le livre:");

    if (idAdherent) {
        try {
            const formData = new FormData();
            formData.append('idAdherent', idAdherent);
            formData.append('idLivre', idLivre);

            const response = await fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=create', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.text();
            console.log('Nouvel emprunt:', data);
            getAllLivresDisponibles();
            getAllLivresEmpruntes();
            getAllAdherents();
        } catch (error) {
            console.error('Erreur lors du prêt du livre:', error);
            alert('Erreur lors du prêt du livre');
        }
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
                getAllAdherents();
            })
            .catch(error => {
                console.error('Erreur lors de la restitution du livre:', error);
                alert('Erreur lors de la restitution du livre');
            });
    }
};

window.deleteLivre = function (idLivre) {
    fetch('/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=delete&id=' + idLivre)
        .then(response => response.text())
        .then(data => {
            getAllLivresDisponibles();
            getAllLivresEmpruntes();
        })
        .catch(error => {
            console.error('Erreur lors de la suppression du livre:', error);
            alert('Erreur lors de la suppression du livre');
        });
}

window.deleteAdherent = function (idAdherent) {
    fetch('/ProjetMediatheque/src/php/Controller/ControllerAdherent.php?action=delete&id=' + idAdherent)
        .then(response => response.text())
        .then(data => {
            console.log('Adherent deleted:', idAdherent);
            getAllAdherents(); // Actualiser la liste après la suppression
        })
        .catch(error => {
            console.error('Erreur lors de la suppression de l\'adhérent:', error);
            alert('Erreur lors de la suppression de l\'adhérent');
        });
}

async function addAdherent() {
    const nomAdherent = document.getElementById('nomAdherent').value;
    if (!nomAdherent.trim()) {
        alert('Veuillez entrer un nom d\'adhérent');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('nom', nomAdherent);
        document.getElementById('nomAdherent').value = '';

        const response = await fetch('/ProjetMediatheque/src/php/Controller/ControllerAdherent.php?action=create', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.text();
        console.log('New adherent ID:', data);
        getAllAdherents(); // Actualiser la liste après l'ajout
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'adhérent:', error);
        alert('Erreur lors de l\'ajout de l\'adhérent');
    }
}

async function addLivre() {
    const titreLivre = document.getElementById('titreLivre').value;
    if (!titreLivre.trim()) {
        alert('Veuillez entrer un titre de livre');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('titre', titreLivre);
        document.getElementById('titreLivre').value = '';

        const response = await fetch('/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=create', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.text();
        console.log('New livre ID:', data);
        getAllLivresDisponibles();
    } catch (error) {
        console.error('Erreur lors de l\'ajout du livre:', error);
        alert('Erreur lors de l\'ajout du livre');
    }
}

function nblivre(adherent) {
    return fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=nomberOfEmprunts&idAdherent=' + adherent.idAdherent)
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data.count; // Retourne le nombre
        })
        .catch(error => {
            console.error('Erreur lors du comptage des emprunts:', error);
            return 0;
        });
}

window.afficherImageLivre = async function (idLivre) {
    try {
        const response = await fetch(`/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=select&id=${idLivre}`);
        const livre = await response.json();
        
        if (livre && livre.titreLivre) {
            const modal = document.getElementById('modalImageLivre');
            const modalTitle = document.getElementById('modalLivreTitle');
            const modalImage = document.getElementById('modalLivreImage');
            const modalInfo = document.getElementById('modalLivreInfo');
            const closeButton = document.querySelector('.close-button-image');
            
            modalTitle.textContent = livre.titreLivre;
            modalImage.src = '';
            modalInfo.innerHTML = '<p>Recherche des informations...</p>';
            
            closeButton.onclick = function () {
                modal.style.display = "none";
            }
            
            window.onclick = function (event) {
                if (event.target == modal || event.target == document.getElementById('modalLivresAdherent')) {
                    event.target.style.display = "none";
                }
            }
            
            modal.style.display = "flex";
            
            try {
                const googleBooksResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(livre.titreLivre)}`);
                const data = await googleBooksResponse.json();
                
                if (data.items && data.items.length > 0) {
                    const bookInfo = data.items[0].volumeInfo;
                    const imageUrl = bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : null;
                    
                    if (imageUrl) {
                        modalImage.src = imageUrl;
                        modalImage.style.display = 'block';
                    } else {
                        modalImage.style.display = 'none';
                    }
                    
                    let infoHtml = '';
                    if (bookInfo.authors) {
                        infoHtml += `<p><strong>Auteur(s) :</strong> ${bookInfo.authors.join(', ')}</p>`;
                    }
                    if (bookInfo.publishedDate) {
                        infoHtml += `<p><strong>Date de publication :</strong> ${bookInfo.publishedDate}</p>`;
                    }
                    if (bookInfo.publisher) {
                        infoHtml += `<p><strong>Éditeur :</strong> ${bookInfo.publisher}</p>`;
                    }
                    if (bookInfo.pageCount) {
                        infoHtml += `<p><strong>Nombre de pages :</strong> ${bookInfo.pageCount}</p>`;
                    }
                    if (bookInfo.description) {
                        infoHtml += `<p><strong>Description :</strong><br>${bookInfo.description.substring(0, 300)}${bookInfo.description.length > 300 ? '...' : ''}</p>`;
                    }
                    
                    if (infoHtml === '') {
                        infoHtml = '<p>Aucune information supplémentaire disponible pour ce livre.</p>';
                    }
                    
                    modalInfo.innerHTML = infoHtml;
                } else {
                    modalImage.style.display = 'none';
                    modalInfo.innerHTML = '<p>Livre non trouvé dans Google Books.</p>';
                }
            } catch (googleError) {
                console.error('Erreur Google Books:', googleError);
                modalImage.style.display = 'none';
                modalInfo.innerHTML = '<p>Erreur lors de la recherche des informations du livre.</p>';
            }
        }
    } catch (error) {
        console.error('Erreur lors de la recherche du livre:', error);
        alert("Erreur lors de la recherche du livre");
    }
}

document.getElementById('ajouterAdherent').addEventListener('click', addAdherent);
document.getElementById('ajouterLivre').addEventListener('click', addLivre);

startReactiveDom();