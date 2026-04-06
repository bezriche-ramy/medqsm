import json
import re
import io

def fix_accents():
    print("Démarrage de la correction des accents...")
    
    with io.open('src/data/questions.json', 'r', encoding='utf-8') as f:
        text = f.read()

    # Mots spécifiques (exact match insensible à la casse pour le pattern regex)
    # Remplacements précis pour è, à, ê, etc.
    specifics = {
        r'\btr\?s\b': 'très',
        r'\bprobl\?me(s?)\b': r'problème\1',
        r'\bart\?re(s?)\b': r'artère\1',
        r'\boxyg\?ne\b': 'oxygène',
        r'\br\?guli\?re(s?)\b': r'régulière\1',
        r'\bs\?v\?re(s?)\b': r'sévère\1',
        r'\bl\?g\?re(s?)\b': r'légère\1',
        r'\bd\?j\?\b': 'déjà',
        r'\bl\?vre(s?)\b': r'lèvre\1',
        r'\bmyocarde\?': 'myocarde', # correction d'une erreur
        r'\bapr\?s\b': 'après',
        r'\bpr\?s\b': 'près',
        r'\bcrit\?re(s?)\b': r'critère\1',
        r'\bbioproth\?se(s?)\b': r'bioprothèse\1',
        r'\bderni\?re(s?)\b': r'dernière\1',
        r'\bpremi\?re(s?)\b': r'première\1',
        r'\bni\?ce(s?)\b': r'nièce\1',
        r'\bcaract\?re(s?)\b': r'caractère\1',
        r'\bm\?tre(s?)\b': r'mètre\1',
        r'\bp\?rim\?tre(s?)\b': r'périmètre\1',
        r'\bdiam\?tre(s?)\b': r'diamètre\1',
        r'\bcompl\?te(s?)\b': r'complète\1',
        r'\bcompl\?tement\b': 'complètement',
        r'\b\?v\?nement(s?)\b': r'évènement\1', # ou événement
        r'\bfi\?vre(s?)\b': r'fièvre\1',
        r'\bellim\?tre(s?)\b': r'ellimètre\1', # millimètre
        r'\bmillim\?tre(s?)\b': r'millimètre\1',
        r'\bextr\?mement\b': 'extrêmement',
        r'\bextr\?mit\?(s?)\b': r'extrémité\1',
        r'\bo\?\b': 'où',
        r'\bm\?me(s?)\b': r'même\1',
        # Majuscules spécifiques
        r'\b\?chocardiograph\b': 'Échocardiograph',
        r'\b\?lectrocardiogramme(s?)\b': r'Électrocardiogramme\1',
        r'\b\?lectrocardiograph\b': 'Électrocardiograph',
        r'\b\?valua\b': 'Évalua',
        r'\b\?tat(s?)\b': r'état\1', # "état" ou "État"
    }

    # Appliquer les remplacements spécifiques d'abord
    for pattern, replacement in specifics.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    # Remplacer les " à " isolés au lieu de "?" (le vrai point d'interrogation vient souvent avec Espace dans le JSON ou en fin de chaîne)
    # Si on a " a " et ça se prononce "à", on ne peut pas le deviner facilement, mais " ? " au milieu d'une phrase est sûrement " à "
    text = re.sub(r' \? (?![A-Z])', ' à ', text)
    
    # Remplacer les points d'interrogations QUI SONT COLLÉS À DES LETTRES (ex: "l?sion" -> "lésion")
    def replace_e(m):
        return m.group(0).replace('?', 'é')
        
    text = re.sub(r'[a-zA-Z]+\?[a-zA-Z]+|\?[a-zA-Z]+', replace_e, text)
    
    # Il peut rester des majuscules au début
    def replace_E(m):
        return m.group(0).replace('?', 'É')
    # Pour le début de mot
    text = re.sub(r'\b\?[a-z]', replace_E, text)
    
    # Fixer quelques doubles "éé" qui auraient pu être accidentels
    text = text.replace('éé', 'ée')

    print("Vérification du format JSON...")
    # S'assurer que le JSON est toujours valide après le regex
    try:
        data = json.loads(text)
        print("JSON est valide après transformation.")
    except Exception as e:
        print("Erreur : Le remplacement a cassé le JSON !", e)
        # fallback safe
        return

    print("Sauvegarde...")
    with io.open('src/data/questions.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Terminé ! Les erreurs d'encodage (??) devraient être corrigées en français lisible.")

if __name__ == "__main__":
    fix_accents()
