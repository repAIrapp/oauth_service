# Service OAuth – RepAIr   -IBRAHIMI Yasmine

Ce service gère l’**authentification via Google et Facebook** pour  **RepAIr**.  
Il s’appuie sur **Passport.js** pour simplifier l’intégration OAuth et génère un **token JWT** permettant d’accéder aux autres services.

---

## Fonctionnalités principales

-  Authentification OAuth 2.0 via **Google** et **Facebook**
-  Récupération des infos utilisateur 
-  Création automatique de l'utilisateur dans le **DB Service**
-  Génération et redirection avec un **token JWT**
-  Suivi des appels via **Prometheus**

---

##  Authentification Google

1. L’utilisateur clique sur **"Se connecter avec Google"**
2. Il est redirigé vers la page d’autorisation Google
3. Une fois connecté, Google renvoie un profil au service
4. Le service appelle le **DB Service** pour créer ou trouver l’utilisateur
5. Un **JWT** est généré avec les infos (id, nom, email, etc.)
6. L’utilisateur est redirigé vers le frontend avec ce token


---

##  Authentification Facebook (bêta)

Fonctionne sur le même principe que Google, mais actuellement :
- Redirige vers `/auth/profile` après succès
- Pas encore connecté au DB Service ni JWT

---

##  Technologies utilisées

- **Passport.js** avec les stratégies `openidconnect` (Google) et `facebook`
- **Axios** pour contacter le service de base de données
- **jsonwebtoken (JWT)** pour l’authentification centralisée
- **Prometheus (prom-client)** pour exposer les métriques

---

##  Routes principales

###  GET `/auth`  
Démarre l’authentification avec Google.

### GET `/auth/google/callback`  
Callback Google → génère un **JWT** et redirige vers le frontend.

###  GET `/auth/facebook`  
Démarre l’authentification avec Facebook.

###  GET `/auth/facebook/callback`  
Callback Facebook (redirige vers profil).

### GET `/auth/profile`  
Route protégée, affiche un message si l’utilisateur est connecté.

###  GET `/auth/logout`  
Déconnecte l’utilisateur et revient à la page d’accueil.

---

## JWT généré

Une fois connecté via Google, un token est signé contenant :

```json
{
  "id": "USER_ID",
  "email": "user@example.com",
  "first_name": "Prénom",
  "last_name": "Nom",
  "authType": "oauth"
}
