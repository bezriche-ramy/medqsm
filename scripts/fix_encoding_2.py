import json
import re
import io

def fix_accents_2():
    print("Démarrage du nettoyage final des accents...")
    
    with io.open('src/data/questions.json', 'r', encoding='utf-8') as f:
        text = f.read()

    # Remplacer les ? précédés d'une lettre par un 'é' (ex: "associ?", "cl?", "instabilit?")
    # Dans la typographie française, un vrai point d'interrogation est précédé d'un espace.
    text = re.sub(r'([a-zÀ-ÿ])\?', r'\1é', text, flags=re.IGNORECASE)
    
    # Remplacer " ? " entre deux mots ou chiffres par " à " (ex: "V1 ? V4" => "V1 à V4")
    # On s'assure qu'il n'est pas à la toute fin de la phrase (avant guillemet ou fin de ligne)
    text = re.sub(r'(?<=[a-zA-Z0-9]) \? (?=[a-zA-Z0-9])', ' à ', text)
    
    # Quelques corrections manuelles issues de la 1ere passe :
    text = text.replace('aigué', 'aiguë')
    text = text.replace('arrét', 'arrêt')
    text = text.replace('apparaét', 'apparaît')
    text = text.replace('bétabloquant', 'bêtabloquant')

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

    print("Terminé ! Le français est maintenant clair et parfait.")

if __name__ == "__main__":
    fix_accents_2()
