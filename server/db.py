import sys
import os
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from dotenv import load_dotenv
from datetime import datetime

def connect_db() :
    # ++++++++ CONNECT DATABASE (MONGODB) .ENV ++++++++
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
    connection_string = os.getenv('MONGODB_URI')
    if not connection_string:
        raise RuntimeError("MONGODB_URI not set in environment or server/.env")

    # Fix SSL certificate verification issue on macOS
    clientMongo = MongoClient(
        connection_string, 
        serverSelectionTimeoutMS=5000,
        tlsAllowInvalidCertificates=True  # Disable SSL certificate verification
    )
    try:
        # quick check that the server is reachable
        clientMongo.admin.command('ping')
        # ++++++++++++++++++++++++++++++++++++++++++++++++
        # DATABASE and COLLECTIONS
        db = clientMongo["SocketDB"]
        users = db["users"]
        # {username(unique), password(plain text)}
        dm_messages = db["dm_messages"]
        # {sender, receiver, content, timestamp}
        group_messages = db["group_messages"]
        # {sender, group_name, content, timestamp}
        groups = db["groups"]
        # {group_name, members: [username1, username2, ...]}
        # Ensure username and group_name are unique
        users.create_index("username", unique=True)
        groups.create_index("group_name", unique=True)
        group_messages.create_index("group_name", unique=True)
        # +++++++++++++++++++++++++++++++++++++++++++++++++
        print("Pinged your deployment. You successfully connected to MongoDB!")
        return users, dm_messages, group_messages, groups
    except Exception as e:
        print("Warning: cannot connect to MongoDB:", e)
        return None, None, None, None
    
def add_user_to_db(users, username, password, avatarId, online):
    try:
        doc = {
            "username": username,
            "password": password,
            "avatar_id": avatarId
        }
        users.update_one({"username": username}, {"$set": doc}, upsert=True)
        print("Added user to DB:", username)
        return True
    except DuplicateKeyError:
        print(f"User '{username}' already exists.")
        return False
    except Exception as e:
        print("add_user_to_db error:", e)
        return False

def update_user_avatar(users, username, avatarId):
    try:
        users.update_one(
            {"username": username},
            {"$set": {"avatar_id": avatarId}}
        )
        print(f"Updated avatar for user '{username}' to '{avatarId}'.")
    except Exception as e:
        print("update_user_avatar error:", e)

def check_credentials(users,username,password):
        user = users.find_one({"username": username})
        if not user:
            return False  # User not found

        verify_password = user.get('password')
        if not verify_password:
            return False # Account has no password (old data?)

        # This check is also CPU-intensive
        return password == verify_password

def save_dm_message(dm_messages, sender, receiver, content, timestamp):
    """Persist a message document for DM."""
    try:
        doc = {
            "sender": sender,
            "receiver": receiver,
            "content": content,
            "timestamp": timestamp
        }
        dm_messages.insert_one(doc)
        print("Saved message to DB:", doc)
    except Exception as e:
        print("Failed to save message to DB:", e)

def get_dm_messages(dm_messages, sender, receiver):
    """Retrieve message documents for DM between sender and receiver."""
    try:
        docs = dm_messages.find({
            "$or": [
                {"sender": sender, "receiver": receiver},
                {"sender": receiver, "receiver": sender}
            ]
            },{
            '_id': 0,
            'sender': 1,
            'receiver': 1,
            'content': 1,
            'timestamp': 1
            }).sort("timestamp", 1)  # Sort by timestamp ascending
        return list(docs)
    except Exception as e:
        print("Failed to retrieve messages from DB:", e)
        return []


def save_group_message(group_messages, group_name, id ,sender, avatarId, timestamp, type, text):
    """Persist a message document for group."""
    try:
        doc = {
            "id": id,
            "sender": sender,
            "avatarId": avatarId,
            "timestamp": timestamp,
            "type": type, #"text" | "challenge" | "challenge_accepted" | "challenge_result"
            "text": text
        }
        group_messages.update_one(
            {"group_name": group_name},
            {"$push": {"message_data": doc}},
            upsert=True
        )
        print("Saved message to DB:", doc)
    except Exception as e:
        print("Failed to save message to DB:", e)

def get_group_messages(group_messages, group_name):
    """Retrieve message documents for a group."""
    try:
        doc = group_messages.find_one({"group_name": group_name})
        if doc and "message_data" in doc:
            return doc["message_data"]  # Return array of messages
        return []
    except Exception as e:
        print("Failed to retrieve messages from DB:", e)
        return []

def create_group_if_missing(groups, groups_message, group_name):
    try:
        groups.update_one(
            {"group_name": group_name},
            {"$setOnInsert": {"group_name": group_name, "members": []}},
            upsert=True
        )

        groups_message.update_one(
            {"group_name": group_name},
            {"$setOnInsert": {"group_name": group_name, "message_data": []}},
            upsert=True
        )

        print(f"Group '{group_name}' created or already exists.")
    except DuplicateKeyError:
        print(f"Group '{group_name}' already exists.")
        return False
    except Exception as e:
        print("create_group_if_missing error:", e)

def add_member_to_group(groups, group_name, username):
    try:
        groups.update_one(
            {"group_name": group_name},
            {"$addToSet": {"members": username}}  # add only if not already in list
        )
        print(f"Added '{username}' to group '{group_name}'.")
    except Exception as e:
        print("add_member_to_group error:", e)

def remove_member_from_group(groups, group_name, username):
    try:
        groups.update_one(
            {"group_name": group_name},
            {"$pull": {"members": username}}  # remove from list if exists
        )
        print(f"Removed '{username}' from group '{group_name}'.")
    except Exception as e:
        print("remove_member_from_group error:", e)

def get_all_groups(groups):
    try:
        return list(groups.find({}, {"_id": 0, "group_name": 1}))
    except Exception as e:
        print("get_all_groups error:", e)
        return []

def debug_list_collections(groups, db):
    try:
        print("Collections:", db.list_collection_names())
        print("Sample group docs:", list(groups.find().limit(5)))
    except Exception as e:
        print("debug_list_collections error:", e)

