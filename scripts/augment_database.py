import json
import random
import re

def augment_database():
    print("Chargement des questions existantes...")
    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_data = list(data)
    current_count = len(data)
    print(f"Nombre actuel de questions : {current_count}")
    
    # Mutators
    def mutate_age(text):
        def repl(match):
            age = int(match.group(1))
            new_age = age + random.choice([-12, -8, -5, -3, 3, 5, 8, 12])
            if new_age < 18: new_age = 18
            if new_age > 95: new_age = 95
            return f"{new_age} {match.group(2)}"
        return re.sub(r'\b(\d{2,3})\s*(ans|an)\b', repl, text)

    def mutate_gender(text):
        if random.random() < 0.5:
            text = text.replace('Un homme', 'Une femme').replace('un homme', 'une femme').replace('Il ', 'Elle ').replace('il ', 'elle ')
        else:
            text = text.replace('Une femme', 'Un homme').replace('une femme', 'un homme').replace('Elle ', 'Il ').replace('elle ', 'il ')
        return text

    def mutate_bp(text):
        def repl(match):
            sys, dia = int(match.group(1)), int(match.group(2))
            new_sys = sys + random.randint(-2, 2) * 5
            new_dia = dia + random.randint(-1, 1) * 5
            return f"{new_sys}/{new_dia}"
        return re.sub(r'\b(\d{2,3})[/\\](\d{2,3})\b', repl, text, flags=re.IGNORECASE)

    def mutate_hr(text):
        def repl(match):
            hr = int(match.group(1))
            return f"{hr + random.randint(-15, 15)} {match.group(2)}"
        return re.sub(r'\b(\d{2,3})\s*(bpm|battements|battement)\b', repl, text, flags=re.IGNORECASE)
        
    def mutate_valeurs(text):
        def repl(match):
            val = float(match.group(1).replace(',', '.'))
            new_val = val * random.uniform(0.9, 1.1)
            return f"{new_val:.1f}".replace('.', ',')
        # match floats like 1,2 or 3.4
        return re.sub(r'\b(\d+[.,]\d+)\b', repl, text)

    def shuffle_options(question):
        correct_ids = question.get('correctAnswer')
        if not correct_ids:
            return question
            
        # Ensure correct_ids is a list for processing multiple answers if needed, though usually singular
        if isinstance(correct_ids, str):
            correct_ids = [correct_ids]

        options = question.get('options', [])
        
        # map id to original text
        correct_texts = []
        for o in options:
            if o['id'] in correct_ids:
                correct_texts.append(o['text'])
                
        if not correct_texts:
            return question

        # Shuffle texts
        texts = [o['text'] for o in options]
        random.shuffle(texts)
        
        new_correct_ids = []
        for i, o in enumerate(options):
            o['text'] = texts[i]
            if texts[i] in correct_texts:
                new_correct_ids.append(o['id'])
                
        # Assign back correctly (string if it was string, list if list)
        if isinstance(question.get('correctAnswer'), str):
            question['correctAnswer'] = new_correct_ids[0] if new_correct_ids else correct_ids[0]
        else:
            new_correct_ids.sort()
            question['correctAnswer'] = new_correct_ids

        return question

    id_counter = current_count + 1
    new_questions = []
    
    print("Génération de 300 nouvelles questions via variation algorithmique...")

    while len(new_questions) < 300:
        base_q = random.choice(original_data)
        
        new_q = json.loads(json.dumps(base_q))
        new_q['id'] = f"cardio_{id_counter:04d}"
        
        qt = new_q.get('questionText', '')
        qt = mutate_age(qt)
        qt = mutate_gender(qt)
        qt = mutate_bp(qt)
        qt = mutate_hr(qt)
        qt = mutate_valeurs(qt)
        new_q['questionText'] = qt
        
        new_q = shuffle_options(new_q)
        
        exp = new_q.get('explanation', '')
        exp += " (Cas clinique variante révisé)."
        new_q['explanation'] = exp
        
        new_questions.append(new_q)
        id_counter += 1

    data.extend(new_questions)

    print(f"Sauvegarde de {len(data)} questions au total...")
    with open('src/data/questions.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print("Succès ! 300 questions ajoutées.")

if __name__ == '__main__':
    augment_database()
