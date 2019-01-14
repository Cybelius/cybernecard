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
- Le contre du module avec l'affiche du produit sélectionné et la possibilité d'édition
- La barre latérale droite pour la sélection des options types : couleurs, prix, etc... 

## Barre latérale gauche
La barre latérale gauche présente des boutons. Ces boutons font appel à des modals. Ces modals permettent de sélectionner un produit et/ou une image que l'on souhaite appliquer sur le produit.
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

## 
