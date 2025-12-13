# scripts/seed.py
import os
import random
from faker import Faker

# --- TODO: Database and ORM setup ---
# Replace this section with your actual database connection and ORM setup.
def get_db_session():
    """Placeholder for getting a database session."""
    print("INFO: Connecting to the database for seeding...")
    return "fake_session" # Replace with actual session object

def get_models():
    """Placeholder for importing your models."""
    class User: pass
    class Task: pass
    return {"User": User, "Task": Task}

# --- End of TODO section ---

# Initialize Faker
fake = Faker()

# --- TODO: Seeding Configuration ---
# Define how many of each model to create for each environment.
SEED_COUNTS = {
    "dev": {"users": 10, "tasks_per_user": 5},
    "test": {"users": 50, "tasks_per_user": 10},
    "demo": {"users": 5, "tasks_per_user": 3},
}
# --- End of TODO section ---

def get_or_create_user(session, models, user_data):
    """
    Idempotently gets or creates a user.
    Checks for existence based on email.
    """
    User = models["User"]
    # For SQLAlchemy:
    # existing_user = session.query(User).filter_by(email=user_data['email']).first()
    # if existing_user:
    #     return existing_user, False
    # new_user = User(**user_data)
    # session.add(new_user)
    # return new_user, True

    # Placeholder logic
    print(f"  - Ensuring user '{user_data['username']}' ({user_data['email']}) exists...")
    return User(), True # (object, created_boolean)

def generate_users(session, models, count):
    """Generates and bulk inserts users."""
    print(f"INFO: Generating {count} users...")
    users_to_create = []
    created_users = []
    for _ in range(count):
        user_data = {
            "username": fake.user_name(),
            "email": fake.unique.email(),
            "password_hash": fake.password(), # In a real app, hash this properly!
        }
        users_to_create.append(user_data)

    # Idempotency check and creation
    for user_data in users_to_create:
        user, created = get_or_create_user(session, models, user_data)
        if created:
            created_users.append(user)

    # For SQLAlchemy with bulk insert support:
    # session.bulk_save_objects(created_users)
    # session.commit()

    print(f"INFO: Created {len(created_users)} new users.")
    # To get IDs for relationships, you might need to query them back after commit
    # For now, we'll just return the list of objects.
    return created_users # This should be a list of user objects with IDs

def generate_tasks_for_users(session, models, users, tasks_per_user):
    """Generates tasks for a given list of users."""
    print(f"INFO: Generating {tasks_per_user} tasks for each of the {len(users)} users...")
    Task = models["Task"]
    tasks_to_create = []
    for user in users:
        for _ in range(tasks_per_user):
            task_data = {
                # "user_id": user.id, # Assumes user object has an ID
                "title": fake.sentence(nb_words=4),
                "description": fake.paragraph(),
                "completed": random.choice([True, False]),
                "due_date": fake.date_between(start_date='today', end_date='+90d'),
            }
            tasks_to_create.append(Task(**task_data))

    # Bulk insert for performance
    # For SQLAlchemy:
    # session.bulk_save_objects(tasks_to_create)
    # session.commit()
    print(f"INFO: Created {len(tasks_to_create)} new tasks.")

def main(environment):
    """Main function to seed the database."""
    print(f"--- Starting Database Seeding for '{environment}' environment ---")

    if environment not in SEED_COUNTS:
        print(f"ERROR: Environment '{environment}' not configured in SEED_COUNTS.")
        return

    config = SEED_COUNTS[environment]
    Faker.seed(0) # For reproducible data
    fake.unique.clear()

    session = get_db_session()
    models = get_models()

    if session is None:
        print("ERROR: DB session not configured in scripts/seed.py")
        return

    try:
        # Generate users
        users = generate_users(session, models, config["users"])

        # Generate tasks for those users
        if users and config["tasks_per_user"] > 0:
            generate_tasks_for_users(session, models, users, config["tasks_per_user"])

    finally:
        # session.close()
        print("INFO: Database connection closed.")

    print("--- Database Seeding Finished ---")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Seed the database with test data.")
    parser.add_argument("environment", type=str, choices=SEED_COUNTS.keys(),
                        help="The environment to seed for (dev, test, demo).")
    args = parser.parse_args()
    main(args.environment)
