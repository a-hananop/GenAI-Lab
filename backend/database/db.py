from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime, os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./genai_lab.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class HypothesisDB(Base):
    __tablename__ = "hypotheses"
    id = Column(String, primary_key=True)
    hypothesis = Column(Text)
    confidence = Column(Float, default=50.0)
    variables = Column(JSON)
    predicted_outcome = Column(Text)
    reasoning = Column(Text)
    risk_level = Column(String, default="medium")
    estimated_value = Column(String)
    domain = Column(String, default="general")
    status = Column(String, default="pending")
    prior_evidence = Column(Text)
    dependencies = Column(JSON)
    agent_votes = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class ExperimentDB(Base):
    __tablename__ = "experiments"
    id = Column(String, primary_key=True)
    hypothesis_id = Column(String)
    name = Column(String)
    methodology = Column(String)
    objective = Column(Text)
    control_group = Column(JSON)
    test_group = Column(JSON)
    variables = Column(JSON)
    metrics = Column(JSON)
    status = Column(String, default="designed")
    cost_estimate = Column(Float, default=0.0)
    ethical_score = Column(Float, default=0.9)
    reproducibility_score = Column(Float, default=0.8)
    success_threshold = Column(Float, default=0.8)
    failure_conditions = Column(JSON)
    time_horizon = Column(String)
    required_resources = Column(JSON)
    results = Column(JSON)
    agent_discussion = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class SimulationDB(Base):
    __tablename__ = "simulations"
    id = Column(String, primary_key=True)
    experiment_id = Column(String)
    sim_type = Column(String)
    parameters = Column(JSON)
    iterations = Column(Integer, default=1000)
    status = Column(String, default="pending")
    progress = Column(Float, default=0.0)
    results = Column(JSON)
    insights = Column(Text)
    convergence_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime)


class MemoryDB(Base):
    __tablename__ = "memory"
    id = Column(String, primary_key=True)
    memory_type = Column(String)
    title = Column(String)
    content = Column(Text)
    embedding_keywords = Column(JSON)
    related_ids = Column(JSON)
    confidence_at_time = Column(Float, default=0.5)
    outcome = Column(String, default="neutral")
    tags = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AgentLogDB(Base):
    __tablename__ = "agent_logs"
    id = Column(String, primary_key=True)
    agent_name = Column(String)
    action = Column(String)
    input_data = Column(JSON)
    output_data = Column(JSON)
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ResearchLoopDB(Base):
    __tablename__ = "research_loops"
    id = Column(String, primary_key=True)
    loop_number = Column(Integer)
    hypothesis_id = Column(String)
    experiment_id = Column(String)
    simulation_id = Column(String)
    outcome = Column(String)
    insights = Column(Text)
    improvement_suggestions = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class TokenUsageDB(Base):
    __tablename__ = "token_usage"
    id = Column(Integer, primary_key=True, autoincrement=True)
    endpoint = Column(String)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized")
