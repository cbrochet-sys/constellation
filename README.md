# Constellation · le portail de l'équipe Stella (application Vercel)

Portail interne des collaborateurs : applications du cabinet (Pennylane, Claude Team, Stella+, Stell'Academy,
JuriStella, Polaris), procédures internes, RH et congés, documents internes, ressources expert-comptable.

## Contenu
- `public/index.html` : l'interface (accueil, recherche, rubriques, mode administrateur). Les congés se font dans Éclipse (https://stella-conges.vercel.app), vers lequel renvoient l'onglet RH et l'accueil.
- `public/docs/` : charte IA, guide premiers pas et modèles de relance en pages web imprimables.
- `api/content.js` : lecture et enregistrement des liens, annonces et règles (enregistrement réservé à l'administrateur).
- `api/conges.js` : ancien formulaire de congés, plus utilisé par l'interface depuis le passage à Éclipse (gardé pour les données existantes).
- `api/admin.js` : vérification du mot de passe administrateur.
- `api/navette.js` : navette des variables de paie (fichier Blob séparé `portail/navettes.json`). Chaque collaborateur protège ses navettes par un code personnel (haché) ; l'administrateur voit toutes les navettes du mois, les marque « traitées » (verrouillées), réinitialise un code et exporte en CSV. Période : du 27 du mois précédent au 26 du mois (réglable via `content.rh.navetteJour`).
- `api/actus.js` : fil d'actualités (expertise comptable, fiscal, social, juridique, IA) agrégé depuis des flux RSS publics (Ordre, IFEC, BOSS, ministère du Travail, CNIL, Service-Public, presse spécialisée…), mis en cache 30 minutes, sans clé payante. La liste des flux est en tête du fichier.
- `lib/store.js`, `lib/seed.json` : stockage Vercel Blob privé et contenu de départ.
- `middleware.js` : mot de passe d'équipe sur tout le site.

## En ligne
Déployé le 17/10/2026 : https://constellation-stella.vercel.app (aussi https://stella-portail.vercel.app),
projet Vercel « stella-portail » (région Paris). Données : magasin Vercel Blob privé « stella-portail-donnees ».
Mots de passe : variables `APP_PASSWORD` (équipe) et `ADMIN_PASSWORD` (administrateur) du projet
(Settings → Environment Variables), à changer puis redéployer.

## Mettre à jour le contenu
Bas de page → « Mode administrateur » : crayon sur chaque lien, « + Ajouter un lien », annonces, règles des congés,
validation des demandes. Les liens sans adresse apparaissent en pointillés « Adresse à renseigner ».

## Bon à savoir
- Aucune donnée client ni donnée de paie n'est stockée : seulement des liens, des annonces et les demandes de congés (nom, dates, type).
- Le contenu de `lib/seed.json` ne sert qu'au premier lancement ; ensuite tout se modifie depuis le portail.
- Redéployer depuis un ordinateur : dans ce dossier, `npx vercel --prod`.


## Accès réservés

Un lien coché « Réservé aux administrateurs » (ex. Polaris) n'est envoyé au navigateur qu'en mode administrateur. Polaris est en plus protégé par son propre mot de passe (variable `APP_PASSWORD` du projet stella-pilotage-ia), aligné sur le mot de passe administrateur du portail depuis le 17/10/2026.

## Raccourcis de l'accueil

Rangés par sous-catégorie (Logiciels, IA, Nos applications, Paie et RH, Textes légaux et doctrine, Fiscal et social, Profession…). La catégorie est déduite de la rubrique, ou choisie dans le champ « Catégorie dans les raccourcis » de chaque lien.

## Ma boîte mail (tri Gmail en 4 niveaux, ajouté le 21/10/2026)

Onglet « Ma boîte mail », visible en mode administrateur et réservé au titulaire de la boîte (connexion Google personnelle, en plus du mot de passe d'équipe).
Toutes les heures en semaine (7h-19h, déclencheur Google Apps Script `tri-horaire.gs`, plus un tri de secours Vercel à 7h), les mails reçus depuis 2 jours et pas encore triés sont lus, classés par Claude et étiquetés dans Gmail :
`Stella/1 · Urgent`, `Stella/2 · À répondre`, `Stella/3 · À lire`, `Stella/4 · Bruit`. Rien n'est supprimé ni envoyé ; en option, le niveau 4 sort de la boîte de réception.
Un niveau changé dans l'onglet corrige l'étiquette Gmail et sert d'exemple pour les tris suivants. Les règles personnelles se saisissent dans « Mes règles ».

Fichiers : `lib/mail.js` (Gmail, Claude, tri), `api/mail.js` (connexion, état, tri manuel, corrections, règles), `api/mail-cron.js` (tri planifié),
`portail/mail.json` dans Vercel Blob (jeton Google chiffré, étiquettes, expéditeur/objet/niveau des 300 derniers mails, règles, corrections ; jamais le contenu des mails).
Envoyé à Claude pour chaque mail : expéditeur, destinataires, objet, noms des pièces jointes et les 1 200 premiers caractères du texte (pas les pièces jointes).

### Mise en route (une seule fois, environ 20 minutes)
1. **Google Cloud** (console.cloud.google.com, avec le compte du cabinet) : créer un projet « Constellation », activer l'API Gmail.
   Écran de consentement OAuth : type **Interne** (aucune validation Google nécessaire). Identifiants → Créer un ID client OAuth → Application Web,
   URI de redirection autorisée : `https://constellation-stella.vercel.app/api/mail?action=callback`.
2. **Anthropic** (console.anthropic.com) : créer une clé API pour le cabinet (l'abonnement Claude Team ne fournit pas de clé API).
3. **Vercel** → projet stella-portail → Settings → Environment Variables :
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MAIL_OWNER` (adresse Gmail du titulaire), `MAIL_SECRET` (longue phrase aléatoire, 32 caractères ou plus),
   `ANTHROPIC_API_KEY`, `CRON_SECRET` (autre phrase aléatoire). Facultatif : `ANTHROPIC_MODEL` (par défaut `claude-haiku-5-5`), `PUBLIC_URL`.
4. Redéployer (`npx vercel --prod`), ouvrir Constellation → Mode administrateur → Ma boîte mail → « Se connecter avec Google ».

### Bon à savoir
- **Tri horaire** : Vercel ne lance qu'un tri par jour (7h, compatible avec l'offre gratuite). Le tri toutes les heures vient du script Google Apps Script
  `tri-horaire.gs` (script.google.com → Nouveau projet → coller le script → exécuter `installer` une fois), qui appelle `/api/mail-cron`
  avec l'en-tête `Authorization: Bearer <CRON_SECRET>`. Le tri se lance aussi à l'ouverture de l'onglet (si le dernier date de plus de 15 minutes)
  et avec le bouton « Trier maintenant ».
- Si l'administrateur Google Workspace restreint les applications tierces, autoriser l'ID client dans admin.google.com → Sécurité → Contrôle des API.
- Révoquer l'accès : bouton « Déconnecter », ou myaccount.google.com → Sécurité → Applications tierces.
- Coût : un modèle léger, environ 60 mails maximum par passage, regroupés par 15 ; le nombre de mails triés du mois s'affiche dans l'onglet.

## Export Excel des navettes (ajouté le 25/10/2026)
- Navette ouverte (collaborateur ou administrateur) : bouton « Exporter en Excel » à côté d'« Imprimer » : un fichier .xlsx au format de la navette
  (un jour par ligne, week-ends et jours fériés grisés, sous-total par semaine avec alerte d'écart à l'horaire, total du mois en formules, commentaires, légende).
- Mode administrateur, « Navettes de l'équipe » : bouton « Exporter en Excel » : un onglet « Récapitulatif » (une ligne par collaborateur, totaux)
  puis un onglet par navette commencée du mois choisi. Les exports CSV restent disponibles.
- La bibliothèque ExcelJS 4.4.0 est chargée depuis cdn.jsdelivr.net uniquement au clic ; tout est généré dans le navigateur, rien ne transite par le serveur.

## Orbite · messagerie d'équipe (ajoutée le 27/10/2026)
Onglet « Orbite » : canaux publics et privés, messages directs (1 à 8 personnes), fils de discussion, mentions (@nom, @canal, @tous),
réactions, épingles, « Plus tard », Activité (mentions, réponses, réactions), statut personnel, recherche, notifications du navigateur,
mise en forme (*gras*, _italique_, ~barré~, `code`, > citation, liens), modification et suppression de ses messages.
- Identité : nom + code personnel, le même que celui de la navette (créé à la première connexion s'il n'existe pas). Session de 30 jours (cookie signé).
- Confidentialité : messages directs et canaux privés lisibles uniquement par leurs membres, administrateur compris. L'administrateur peut supprimer un message de canal public.
- Fichiers : `lib/chat.js`, `api/chat.js` ; stockage Vercel Blob `portail/chat/meta.json` (index léger) et `portail/chat/c-<id>.json` (un fichier par conversation, 5 000 messages max).
- Canaux créés au premier lancement : general, annonces, entraide-ia, paie-rh, pause-cafe.
- Synchronisation toutes les 4 s quand Orbite est ouvert, 30 s ailleurs dans Constellation, 45 s si l'onglet est caché.
- Variable facultative `CHAT_SECRET` pour signer les sessions (à défaut, dérivée de APP_PASSWORD : changer APP_PASSWORD déconnecte tout le monde d'Orbite).
- Hors périmètre : partage de fichiers, appels audio/vidéo, documents partagés, applications et intégrations.
