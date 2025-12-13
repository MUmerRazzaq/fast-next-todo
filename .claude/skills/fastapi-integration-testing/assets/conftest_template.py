import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

# Import your FastAPI app and database models/session management
# from my_app.main import app
# from my_app.database import Base, get_db

# --- Mock Database Setup ---
# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Fixture to override the `get_db` dependency in your app
# def override_get_db():
#     try:
#         db = TestingSessionLocal()
#         yield db
#     finally:
#         db.close()
#
# app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Fixture to create the test database and tables before any tests run,
    and drop them after all tests are done.
    """
    # Create the tables in the test database
    # Base.metadata.create_all(bind=engine)
    yield
    # Drop the tables after the test session finishes
    # Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """
    Fixture to provide a clean database session for each test function.
    It uses a transaction that is rolled back after the test.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    """
    Fixture for providing a TestClient for the FastAPI app.
    This client can be used to make requests to your application in tests.
    """
    # with TestClient(app) as c:
    #     yield c
    # This part is commented out as the user needs to provide their `app` object.
    yield
