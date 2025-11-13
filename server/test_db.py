#!/usr/bin/env python3
"""
Test script to verify database connection
"""
import db

print("Testing database connection...")
print("-" * 50)

try:
    users, dm_messages, group_messages, groups = db.connect_db()
    
    if users is None:
        print("FAILED: connect_db() returned None")
        print("Check your MongoDB connection string in .env file")
        print("Make sure MongoDB server is running")
    else:
        print("SUCCESS: Database connected!")
        print(f"   - users collection: {users.name}")
        print(f"   - dm_messages collection: {dm_messages.name}")
        print(f"   - group_messages collection: {group_messages.name}")
        print(f"   - groups collection: {groups.name}")
        
        # Try a simple query to verify it's actually working
        print("\nTesting a simple query...")
        count = users.count_documents({})
        print(f"Found {count} users in database")
        
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

print("-" * 50)
