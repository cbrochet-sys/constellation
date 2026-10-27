// Constellation · tri horaire de la boîte Gmail (à coller dans script.google.com, avec le compte du cabinet).
// 1. Nouveau projet → collez ce fichier → Enregistrer.  2. Choisissez la fonction « installer » → Exécuter → autorisez.
// Ensuite le tri tourne seul toutes les heures, du lundi au vendredi, de 7h à 19h. Pour l'arrêter : exécutez « arreter ».
// Le secret ci-dessous doit rester identique à la variable CRON_SECRET de Vercel. Script confidentiel : ne le partagez pas.
const URL_TRI = "https://constellation-stella.vercel.app/api/mail-cron";
const CRON_SECRET = "COLLER_ICI_LA_VALEUR_DE_CRON_SECRET";

function trier() {
  const maintenant = new Date(), heure = Number(Utilities.formatDate(maintenant, "Europe/Paris", "H")), jour = Number(Utilities.formatDate(maintenant, "Europe/Paris", "u"));
  if (jour > 5 || heure < 7 || heure > 19) return;
  const r = UrlFetchApp.fetch(URL_TRI, { headers: { Authorization: "Bearer " + CRON_SECRET }, muteHttpExceptions: true });
  console.log(r.getResponseCode() + " " + r.getContentText());
}

function installer() {
  arreter();
  ScriptApp.newTrigger("trier").timeBased().everyHours(1).create();
  trier();
}

function arreter() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
}
