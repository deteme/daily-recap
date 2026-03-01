import os

print("🔍 Recherche du caractère interdit (0xe9) dans les variables Windows...")
for key, value in os.environ.items():
    try:
        # On teste si la valeur contient l'octet problématique
        value.encode('utf-8')
    except UnicodeEncodeError:
        # Si ça plante ici, c'est que la variable contient un caractère spécial
        print(f"❌ VARIABLE COUPABLE : {key} = {value}")
    except Exception:
        if '\xe9' in value or 'é' in value:
             print(f"❌ VARIABLE COUPABLE (accent trouvé) : {key} = {value}")

print("\n✅ Scan terminé.")