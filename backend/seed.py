from app.core.database import SessionLocal
from app.models import User, Project, ProjectMember
from app.core.security import get_password_hash
from datetime import datetime

db = SessionLocal()

# Créer des utilisateurs
admin = User(
    email="admin@example.com",
    username="admin",
    display_name="Admin Super",
    password_hash=get_password_hash("admin123"),
    role="admin",
    is_active=True
)

manager = User(
    email="manager@example.com",
    username="manager",
    display_name="Manager Man",
    password_hash=get_password_hash("manager123"),
    role="manager",
    is_active=True
)

user1 = User(
    email="user1@example.com",
    username="user1",
    display_name="User One",
    password_hash=get_password_hash("user123"),
    role="user",
    is_active=True
)

user2 = User(
    email="user2@example.com",
    username="user2",
    display_name="User Two",
    password_hash=get_password_hash("user123"),
    role="user"
)

db.add_all([admin, manager, user1, user2])
db.commit()

# Créer un projet
project = Project(
    name="SiteWeb",
    description="Refonte du site corporate",
    created_by=manager.id
)
db.add(project)
db.commit()

# Ajouter des membres au projet
members = [
    ProjectMember(project_id=project.id, user_id=user1.id),
    ProjectMember(project_id=project.id, user_id=user2.id)
]
db.add_all(members)
db.commit()

print("Données de test insérées !")
db.close()