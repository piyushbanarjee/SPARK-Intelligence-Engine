import json
from database import engine, SessionLocal, Base
import models

def seed_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("Seeding Case Info...")
        case_info = models.CaseInfo(
            id="NEW-CASE-01",
            code="NEW-CASE-01",
            name="Unassigned Case",
            type="General",
            unit="Central District Investigation Unit",
            lead="Unassigned",
            victim="Unknown",
            suspect="Unknown",
            scene="Unknown",
            dateOpened="2026-09-06T00:00:00Z",
            dateClosed=None,
            status="Active"
        )
        db.add(case_info)

        db.commit()
        print("Database seeding completed successfully.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
