from app.database import Base, engine
from app.models.conversation import Conversation
from app.models.call_summary import CallSummary
from app.models.lead import Lead

def init_db():
    Base.metadata.create_all(bind=engine)