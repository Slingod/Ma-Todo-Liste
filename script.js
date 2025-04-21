const STORAGE_KEY = "mesTaches";
const CORBEILLE_KEY = "tachesSupprimees";

let taches = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let corbeille = JSON.parse(localStorage.getItem(CORBEILLE_KEY)) || [];
let filtreActuel = "toutes";

function sauvegarderTaches() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(taches));
}

function sauvegarderCorbeille() {
  localStorage.setItem(CORBEILLE_KEY, JSON.stringify(corbeille));
}

function afficherTaches() {
  const ul = document.getElementById("taskList");
  ul.innerHTML = "";

  let tachesFiltrees = taches;
  if (filtreActuel === "faites") tachesFiltrees = taches.filter(t => t.fait);
  else if (filtreActuel === "afaire") tachesFiltrees = taches.filter(t => !t.fait);

  tachesFiltrees.forEach((tache, index) => {
    const li = document.createElement("li");
    li.setAttribute("draggable", "true");
    if (tache.fait) li.classList.add("completed");

    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index);
    });

    const nomSpan = document.createElement("span");
    nomSpan.textContent = tache.nom;
    li.appendChild(nomSpan);

    const spanDate = document.createElement("span");
    spanDate.className = "date";
    spanDate.textContent = ` (Ajoutée le ${new Date(tache.date).toLocaleDateString()})`;
    li.appendChild(spanDate);

    li.onclick = () => {
      taches[index].fait = !taches[index].fait;
      sauvegarderTaches();
      afficherTaches();
    };

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "✏️";
    btnEdit.onclick = (e) => {
      e.stopPropagation();
      const nouveauNom = prompt("Modifier la tâche :", tache.nom);
      if (nouveauNom !== null && nouveauNom.trim() !== "") {
        taches[index].nom = nouveauNom.trim();
        sauvegarderTaches();
        afficherTaches();
      }
    };

    const btnSuppr = document.createElement("button");
    btnSuppr.textContent = "❌";
    btnSuppr.onclick = (e) => {
      e.stopPropagation();
      li.classList.add("explode");

      setTimeout(() => {
        ajouterALaCorbeille(taches[index]);
        taches.splice(index, 1);
        sauvegarderTaches();
        afficherTaches();
        afficherCorbeille();
      }, 600);
    };

    li.appendChild(btnEdit);
    li.appendChild(btnSuppr);
    ul.appendChild(li);
  });
}

function ajouterTache() {
  const input = document.getElementById("taskInput");
  const nom = input.value.trim();
  if (nom === "") return;

  taches.push({
    nom: nom,
    fait: false,
    date: new Date().toISOString()
  });

  input.value = "";
  sauvegarderTaches();
  afficherTaches();
}

function ajouterALaCorbeille(tache) {
  corbeille.unshift(tache);
  if (corbeille.length > 5) corbeille.pop();
  sauvegarderCorbeille();
}

function afficherCorbeille() {
  const ul = document.getElementById("corbeilleList");
  ul.innerHTML = "";

  corbeille.forEach((tache, index) => {
    const li = document.createElement("li");
    li.textContent = tache.nom;

    const btnRestaurer = document.createElement("button");
    btnRestaurer.textContent = "🔁 Restaurer";
    btnRestaurer.onclick = () => {
      taches.push(tache);
      corbeille.splice(index, 1);
      sauvegarderTaches();
      sauvegarderCorbeille();
      afficherTaches();
      afficherCorbeille();
    };

    const btnSupprDef = document.createElement("button");
    btnSupprDef.textContent = "❌ Supprimer définitivement";
    btnSupprDef.onclick = () => {
      if (confirm("Supprimer cette tâche définitivement ?")) {
        const teteDeMort = document.createElement("span");
        teteDeMort.textContent = "💀";
        teteDeMort.classList.add("tete-de-mort");
        li.appendChild(teteDeMort);

        setTimeout(() => {
          corbeille.splice(index, 1);
          sauvegarderCorbeille();
          afficherCorbeille();
        }, 1000);
      }
    };

    li.appendChild(btnRestaurer);
    li.appendChild(btnSupprDef);
    ul.appendChild(li);
  });
}

function supprimerToutesLesTaches() {
  if (confirm("Es-tu sûr de vouloir tout supprimer ?")) {
    taches.forEach(t => ajouterALaCorbeille(t));
    taches = [];
    sauvegarderTaches();
    afficherTaches();
    afficherCorbeille();
  }
}

function changerFiltre(nouveauFiltre) {
  filtreActuel = nouveauFiltre;
  afficherTaches();
}

// Démarrage
document.addEventListener("DOMContentLoaded", () => {
  afficherTaches();
  afficherCorbeille();

  // Gestion du drag & drop (ordre)
  const list = document.getElementById("taskList");
  list.addEventListener("dragover", (e) => e.preventDefault());

  list.addEventListener("drop", (e) => {
    const draggedIndex = e.dataTransfer.getData("text/plain");
    const target = e.target.closest("li");
    const allLis = Array.from(list.children);
    const targetIndex = allLis.indexOf(target);

    if (target && draggedIndex !== "" && draggedIndex != targetIndex) {
      const [draggedItem] = taches.splice(draggedIndex, 1);
      taches.splice(targetIndex, 0, draggedItem);
      sauvegarderTaches();
      afficherTaches();
    }
  });
});