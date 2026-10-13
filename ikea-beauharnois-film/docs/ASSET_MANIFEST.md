# ASSET_MANIFEST — inventaire des ressources

Date de consultation : 2026-10-13.

## 1. Ressources externes

| ID | Ressource | Origine / URL | Propriétaire | Licence / statut | Usage dans le film |
|---|---|---|---|---|---|
| A01 | Limites provinciales et étatiques 1:10M (`ne_10m_admin_1_states_provinces`) | https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_admin_1_states_provinces.zip | Natural Earth | Domaine public | Cartes S01, S03, S10 |
| A02 | Lacs 1:10M (`ne_10m_lakes`) | https://naturalearth.s3.amazonaws.com/10m_physical/ne_10m_lakes.zip | Natural Earth | Domaine public | Cartes |
| A03 | Rivières 1:10M (`ne_10m_rivers_lake_centerlines`) | https://naturalearth.s3.amazonaws.com/10m_physical/ne_10m_rivers_lake_centerlines.zip | Natural Earth | Domaine public | Cartes (fleuve Saint-Laurent) |
| A04 | Routes 1:10M (`ne_10m_roads`) | https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_roads.zip | Natural Earth | Domaine public | Carte locale S01 |
| A05 | Terres 1:50M (`ne_50m_land`) | https://naturalearth.s3.amazonaws.com/50m_physical/ne_50m_land.zip | Natural Earth | Domaine public | Téléchargé, non utilisé |
| A06 | Police Inter | Installée dans l’environnement de production (rsms.me/inter) | Rasmus Andersson | SIL Open Font License 1.1 | Toute la typographie |
| A07 | Moteur vocal espeak-ng + voix MBROLA fr4 | Paquets Ubuntu `espeak-ng`, `mbrola-fr4` | Projets espeak-ng / MBROLA | GPL v3 (espeak-ng); voix MBROLA : licence non commerciale | **Voix témoin uniquement. Interdite en diffusion commerciale.** |

Coordonnées des villes (Beauharnois, Montréal, Winnipeg, Halifax, Toronto) : coordonnées géographiques publiques des centres-villes, arrondies à 4 décimales. Le marqueur de Beauharnois indique la ville, pas l’emplacement exact du bâtiment.

## 2. Ressources créées pour le film (originales)

| ID | Ressource | Fichier | Statut | Mention à l’écran |
|---|---|---|---|---|
| B01 | Jeton (carré jaune à cœur bleu), élément récurrent | `src/film/core.js` → `token()` | Création originale | — |
| B02 | Bâtiment isométrique générique | `scenes.js` → `drawBuilding()` | Illustratif. Forme, proportions et nombre de portes ne reproduisent pas le bâtiment réel. | « Représentation illustrative » |
| B03 | Quai de réception en coupe, remorque, portique de lecture | `scenes.js` → `S04` | Illustratif | « Représentation illustrative » |
| B04 | Rayonnage et transstockeur en élévation | `scenes.js` → `S05` | Schéma de principe générique d’un ASRS à palettes | « Schéma de principe — ne reproduit pas l’équipement réel » |
| B05 | Stockage de bacs, convoyeur, poste de préparation | `scenes.js` → `S06` | Illustratif (principe goods-to-person) | « Représentation illustrative » |
| B06 | Emballage, aiguillage, camion | `scenes.js` → `S07` | Illustratif | « Représentation illustrative » |
| B07 | Personnages stylisés (sans visage) | `core.js` → `person()` | Illustratif | — |
| B08 | Stationnement et 20 bornes | `scenes.js` → `S09` | Illustratif (le nombre est sourcé, la disposition ne l’est pas) | « Représentation illustrative » |
| B09 | Patinoires LNH (comparaison d’échelle) | `scenes.js` → `S02` | Visualisation de calcul (C1) | Note de calcul en pied de page |
| B10 | Musique (pad + pulsation en ré majeur) | `src/audio.py` | Synthèse originale, libre de droits | — |
| B11 | Effets sonores (souffles, tics, bips, moteur, grondements) | `src/audio.py` | Synthèse originale, libre de droits | — |

## 3. Ressources non utilisées volontairement

| Ressource | Raison |
|---|---|
| Logo IKEA | Aucune autorisation d’utilisation dans ce contexte. Le carton final affiche le nom en texte. À remplacer par le logo officiel si IKEA Canada l’autorise. |
| Police IKEA (Noto IKEA) | Police propriétaire, non disponible sous licence. Remplacée par Inter. |
| Photos et vues aériennes du site | Non accessibles depuis l’environnement de production; aucune licence obtenue. |
| Photos d’autres entrepôts IKEA ou d’entrepôts génériques | Interdites par la règle de production : risque de faire croire qu’il s’agit de Beauharnois. |
| Logo LEED / USGBC | Marque déposée. Le film écrit seulement « LEED Argent ». |

## 4. Fichiers produits

| Fichier | Description |
|---|---|
| `render/IKEA_Beauharnois_master_1080p30.mp4` | Master : image + voix témoin + musique + effets |
| `render/IKEA_Beauharnois_sans-voix_1080p30.mp4` | Version sans voix (musique et effets remontés) |
| `render/IKEA_Beauharnois_sous-titres_1080p30.mp4` | Master avec sous-titres français incrustés |
| `render/IKEA_Beauharnois_fr-CA.srt` / `.ass` | Sous-titres (à recaler sur la voix définitive) |
| `audio/stems/vo.wav`, `music.wav`, `sfx.wav` | Stems 48 kHz / 24 bits |
| `audio/mix_master.wav`, `audio/mix_novo.wav` | Mixages stéréo 48 kHz / 24 bits |
