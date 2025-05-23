import { reactive, applyAndRegister, startReactiveDom } from './reactiveMinified.js';
// Créer des objets réactifs
let mediatheque = reactive({
  adherents: [],
  livresDisponibles: [],
  livresEmpruntes: []
}, "mediatheque");

// Appeler les fonctions pour charger les données lorsque la page se charge
getAllAdherents();
getAllLivresDisponibles();
getAllLivresEmpruntes();
function getAllAdherents() {
  fetch('/ProjetMediatheque/src/php/Controller/ControllerAdherent.php?action=readAll')
    .then(response => response.json())
    .then(data => {
      console.log('Adherents data:', data);
      mediatheque.adherents = data.map(adherent => {
       return `<div>
        <a href="#" onclick="afficherLivresAdherent(${adherent.idAdherent})">${adherent.nomAdherent}</a>
        <button onclick="deleteAdherent(${adherent.idAdherent})">Supprimer</button>
        </div>`;
      }).join('');
    });
}

window.afficherLivresAdherent = function(idAdherent) {
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

window.deleteAdherent = function(idAdherent) {
  fetch('/ProjetMediatheque/src/php/Controller/ControllerAdherent.php?action=delete&id=' + idAdherent)
    .then(response => response.text())
    .then(data => {
      console.log('Adherent deleted:', idAdherent);
      getAllAdherents(); // Actualiser la liste après la suppression
    });
}

function getAllLivresDisponibles() {
  fetch('/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=readAll')
    .then(response => response.json())
    .then(data => {
      console.log('Livres disponibles data:', data);
      mediatheque.livresDisponibles = data.map(livre => {
        return `<div>
         <a href="#" onclick="preterLivre(${livre.idLivre})">${livre.titreLivre}</a>
         <button onclick="deleteLivre(${livre.idLivre})">Supprimer</button>
         </div>`;
      }).join('');
    });
}

function preterLivre(idLivre) {
  console.log("preterLivre() called for livre ID: " + idLivre);
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
      getAllLivresDisponibles(); // Actualiser la liste après l'ajout
      getAllLivresEmpruntes();
    });
  }
}

function getAllLivresEmpruntes() {
  fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=readAll')
    .then(response => response.json())
    .then(data => {
      console.log('Livres empruntés data:', data);
      mediatheque.livresEmpruntes = data.map(emprunt => {
        return `<div>
         <a href="#" onclick="restituerLivre(${emprunt.idLivre})">Livre ID: ${emprunt.idLivre}, Adhérent ID: ${emprunt.idAdherent}</a>
         </div>`;
      }).join('');
    });
  }

  function restituerLivre(idLivre) {
   fetch('/ProjetMediatheque/src/php/Controller/ControllerEmprunt.php?action=delete&idLivre=' + idLivre)
     .then(response => response.text())
     .then(data => {
       console.log('Emprunt deleted:', idLivre);
       getAllLivresDisponibles(); // Actualiser la liste après la suppression
       getAllLivresEmpruntes();
     });
 }
  
  window.deleteLivre = function(idLivre) {
    fetch('/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=delete&id=' + idLivre)
      .then(response => response.text())
      .then(data => {
        console.log('Livre deleted:', idLivre);
        getAllLivresDisponibles(); // Actualiser la liste après la suppression
        getAllLivresEmpruntes();
      });
  }

// Fonction pour ajouter un nouvel Adhérent
function addAdherent() {
  const nomAdherent = document.getElementById('nomAdherent').value;
  const formData = new FormData();
  formData.append('nom', nomAdherent);

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

// Fonction pour ajouter un nouveau Livre
function addLivre() {
  const titreLivre = document.getElementById('titreLivre').value;
  const formData = new FormData();
  formData.append('titre', titreLivre);

  fetch('/ProjetMediatheque/src/php/Controller/ControllerLivre.php?action=create', {
    method: 'POST',
    body: formData
  })
  .then(response => response.text())
  .then(data => {
    console.log('New livre ID:', data);
    getAllLivresDisponibles(); // Actualiser la liste après l'ajout
  });
}

// Add event listeners to the buttons
document.getElementById('ajouterAdherent').addEventListener('click', addAdherent);
document.getElementById('ajouterLivre').addEventListener('click', addLivre);




startReactiveDom();
