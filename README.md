# DesignerTool
DesignerTool est un module développé avec sur la base d'AngularJs 1.6.9 et dont l'objectif est de pouvoir personnaliser un produit publicitaire via une interface simple et intuitive.

## Getting Started
Pour utiliser **DesignerTool**, il faut avoir préalablement installé :
- Node.js : Tutorial d'installation à retrouver [ici](https://docs.angularjs.org/tutorial/)

A présent, il vous suffit de lancer le module via votre serveur préféré. 
Pendant le développement du projet, nous avons utilisé : 
- Browsersync : Tutorial d'installation à retrouver [ici](https://www.browsersync.io/)

## DesignerTool Overview
DesignerTool se présente en plusieurs parties : 
- La barre latérale gauche avec les options d'imports
- Le centre du module avec l'affiche du produit sélectionné et la possibilité d'édition
- La barre latérale droite pour la sélection des options types : couleurs, prix, etc... 

## Barre latérale gauche
La barre latérale gauche présente deux boutons. Ces boutons font appel à des modals. Ces modals permettent de sélectionner un produit et/ou une image que l'on souhaite appliquer sur le produit.
> La modal de sélection d'une image devra être modifiée lors de la connexion à un site marchand. En effet, l'upload se fait via un dossier en local.

## Barre latérale droite
La barre latérale droite reprend toutes les options associées à un produit lors de l'import de ce dernier. 
Exemple de la structure d'un produit : 
```
{
  "id": 2,
  "name": "PARAPLUIE STANDARD",
  "code_article": "FP4155",
  "colors": [
    {
      "id": 0,
      "name": "noir",
      "hex": "#000000",
      "images": [
        {
          "id": 1,
          "url": "img/p1.png",
          "view": "front",
          "zone": {
            "x": 205,
            "y": 200,
            "width": 140,
            "height": 86
          }
        },
        {
          "id": 2,
          "url": "img/p2.png",
          "view": "back",
          "zone": {
            "x": 205,
            "y": 200,
            "width": 140,
            "height": 86
          }
        }
      ]
    }
  ],
  "description": "Loin des circuits, ce parapluie standard à l'allure sportive vous rappelle que vous êtes un pilote ! Sa poignée argentée mat au design de pommeau de levier de vitesse fait son effet.",
  "prices": [
    {
      "id": 1,
      "nb_article": "1 article",
      "price": "Tarif"
    },
    ...
  ],
  "markers": [
    {
      "id": 1,
      "name": "Impression 1 à 4 couleurs sur pan"
    },
    ...
  ]
}
```

Lorsque vous sélectionnez une option, elle sera renvoyer au site par le biais du bouton "Calculer le prix". 

### L'affichage
L'affichage de la barre latérale droite est un accordeon. Il vous suffit de cliquer sur le titre d'une catégorie pour l'ouvrir. 

### Dimensions de l'image
Dans cette sous partie vous allez retrouver la dimensions de l'image que vous consulter à l'instant t. Exemple : 
```
Produit : T-shirt
Vue : front
Image : elf
```
**_Les champs ne permettent pas de personnaliser la dimension de l'objet actuellement._** 

## Partie centrale - Edition d'un produit
Lorsque vous avez sélectionné votre image à appliquer, vous avez différentes options. Vous pouvez : 
- Resizer l'image, 
- Déplacer l'image,
- Supprimer l'image

### Resizer & déplacer l'image
Il suffit de placer le curseur de la souris sur le petit point en bas à droite de l'image.
Pour déplacer l'image, cliquez sur l'image avec le click gauche de la souris et déplacez-vous pour faire bouger le cadre de l'image
![alt text](https://github.com/Cybelius/cybernecard/blob/master/img/screenshots/2.png)

### Supprimer l'image
Pour supprimer l'image sur le produit courant, cliquez sur la petite poubelle en bas à gauche du cadre de l'image. L'image sera alors supprimé de l'objet qui sera envoyé au site internet connecté. 
> L'image reste disponible dans la modal d'upload

### Gestion des erreurs
Lorsqu'un utilisateur place son image en dehors du cadre d'impression, le module propose deux alertes : 
- Un bandeau indiquant qu'il y a une erreur : **"! L'image sélectionnée est hors cadre d'impression"**
- Un point d'exclamation sur l'image de sélection des vues du produit. 
- Tant que des erreurs sont détectées : le bouton "Calculer le prix" ne sera pas accéssible.
![alt text](https://github.com/Cybelius/cybernecard/blob/master/img/screenshots/5.png)

> Note importante : pour le moment, le module ne supporte pas plusieurs images sur une même vue du produit ! Chaque nouvelle sélection remplacera inévitablement l'image courante. 

## La gestion de session
Pour ajouter un niveau de sécurité, le module gère la possibilité de vérifier si une session est active ou non. Pour ce faire, le logiciel ou site internet connecté doit envoyer un fichier JSON comme suit : 
```
{
  "user": {
    "authenticated": true,
    "email": "demo@demo.fr",
    "agreement": true,
    "role": "user"
  }
}
```
Ce fichier JSON permet de vérifier le type d'utilisateur, son consentement quant-à l'utilisation d'images dont il possède les droits, etc...

## Developpeur information
Module développé dans le cadre d'un projet pédagogique en partenariat avec CESI école d'ingénieurs

## Licence information 
Consultez le fichier LICENSE.txt pour plus d'informations sur les termes et conditions d'utilisation, et un DÉNI DE GARANTIE.
