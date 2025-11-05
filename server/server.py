import socket
import sys
import threading
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import signal


# ++++++++ CONNECT DATABASE (MONGODB) .ENV ดูในดิส ยังไม่ได้เชื่อมกะตัวcode ++++++++
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
connection_string = os.getenv('MONGODB_URI')
if not connection_string:
    raise RuntimeError("MONGODB_URI not set in environment or server/.env")

clientMongo = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
try:
    # quick check that the server is reachable
    clientMongo.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print("Warning: cannot connect to MongoDB:", e)

# DATABASE and COLLECTIONS
db = clientMongo["SocketDB"]
users = db["users"]
messages = db["messages"]
groups = db["groups"]
# ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

# TODO : ADD FUNCTION TO GET THE HISTORY เพราะยังไม่ได้ทำ MONGO ขกคิด database คิดให้หน่อย
def save_message(sender, content, recipient=None, group=None):
    """Persist a message document for DM or group."""
    try:
        doc = {
            "sender": sender,
            "recipient": recipient,
            "group": group,
            "content": content,
            "timestamp": datetime.utcnow()
        }
        messages.insert_one(doc)
        print("Saved message to DB:", doc)
    except Exception as e:
        print("Failed to save message to DB:", e)

def create_group_if_missing(groupNo):
    try:
        groups.update_one(
            {"groupNo": groupNo},
            {"$setOnInsert": {"groupNo": groupNo, "members": [], "messages": []}},
            upsert=True
        )
    except Exception as e:
        print("create_group_if_missing error:", e)

def add_user_to_db(username, addr=None):
    try:
        doc = {
            "username": username,
            "connected_at": datetime.utcnow(),
            "online": True,
            "current_group": None
        }
        if addr:
            doc["address"] = f"{addr[0]}:{addr[1]}"
        users.update_one({"username": username}, {"$set": doc}, upsert=True)
        print("Added user to DB:", username)
    except Exception as e:
        print("add_user_to_db error:", e)

def add_user_to_group(username, groupNo):
    """Add user to groups collection and add group to user's doc."""
    try:
        if not groupNo:
            raise ValueError("groupNo required")
        create_group_if_missing(groupNo)
        groups.update_one({"groupNo": groupNo}, {"$addToSet": {"members": username}})
        # DO NOT keep an array of all groups on user — set their current group only
        users.update_one({"username": username}, {"$set": {"current_group": groupNo}}, upsert=True)
        print(f"Set user {username} current_group={groupNo} and added to group members")
    except Exception as e:
        print("add_user_to_group error:", e)

def remove_user_from_group(username, groupNo=None):
    """Remove user from group members and remove group from user's doc."""
    try:
        # determine which group to remove from if not provided
        if not groupNo:
            user_doc = users.find_one({"username": username}, {"current_group": 1})
            groupNo = user_doc.get("current_group") if user_doc else None
            if not groupNo:
                # nothing to remove
                return
        # remove from group members
        groups.update_one({"groupNo": groupNo}, {"$pull": {"members": username}})
        # only unset current_group if it equals the group removed
        users.update_one(
            {"username": username, "current_group": groupNo},
            {"$set": {"current_group": None}}
        )
        print(f"Removed user {username} from group {groupNo} and cleared current_group if matched")
    except Exception as e:
        print("remove_user_from_group error:", e)

def save_group_message(groupNo, sender, content):
    """Append a message object into the group's messages array (and also persist in messages coll)."""
    try:
        create_group_if_missing(groupNo)
        msg = {"from": sender, "time": datetime.utcnow(), "content": content}
        groups.update_one({"groupNo": groupNo}, {"$push": {"messages": msg}})
        # also keep a copy in messages collection for querying across groups/users
        save_message(sender, content, group=groupNo)
    except Exception as e:
        print("Failed to save group message in DB:", e)

def debug_list_collections():
    try:
        print("Collections:", db.list_collection_names())
        print("Sample group docs:", list(groups.find().limit(5)))
    except Exception as e:
        print("debug_list_collections error:", e)

# get local ip of the server computer
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # connect to a public IP and HTTP port, no packets sent, just to get local interface IP
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()
# SET PORT AND ADDRESS FOR SERVER
# option 1
# HOST = os.getenv('HOST', '127.0.0.1')

# option 2
HOST = get_local_ip()
print(f"HOST ip address is: {HOST}")


# option 1
# PORT = int(os.getenv('PORT', 65432))

# option 2
# run: python server.py {PORT}
PORT = int(sys.argv[1]) 
print(f"POST ip address is: {PORT}")


# DECLARE and BIND socket then set to listen
server = socket.socket(socket.AF_INET,socket.SOCK_STREAM) 
server.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
server.bind((HOST,PORT))
server.listen()

# DATABASE connection
# ***** MOCK ยังไม่ได้เชื่อม ********
# ***** update 5-11-2025 เชื่อมแล้ว ********
clients = {}  
# groups = {} 



# Broadcast บอกให้ทุกคนเห็นว่ามีใครมาใหม่ 
# **** change to display new user list in other client pages ******
def broadcast(message):
    try:
        # send to currently connected sockets (runtime clients map)
        for sock in list(clients.values()):
            try:
                sock.send(message)
            except:
                pass
    except Exception as e:
        print("broadcast error:", e)

# SEND IN CHAT GROUP TODO: CHANGE IN TO MONGO AND MSG FORMAT
def broadcast_to_group(group_name, message, sender=None, raw_content=None):
    try:
        doc = groups.find_one({"groupNo": group_name}, {"members": 1})
        if not doc:
            return
        members = doc.get("members", [])
        for username in members:
            if username == sender:
                continue
            sock = clients.get(username)
            if sock:
                try:
                    sock.send(message)
                except:
                    pass
    except Exception as e:
        print("broadcast_to_group error:", e)

    if raw_content is not None:
        save_group_message(group_name, sender, raw_content)

# SEND IN DIRECT CHAT  -> check recipient existence in DB, persist
def direct_message(sender, recipient, message):
    try:
        # persist DM regardless of recipient online state
        save_message(sender, message, recipient=recipient)
    except Exception as e:
        print("direct_message save error:", e)

    # only send over socket if recipient currently connected
    sock = clients.get(recipient)
    if sock:
        try:
            formatted_message = f"[DM from {sender}] {message}".encode('ascii')
            sock.send(formatted_message)
        except:
            pass

# ******** HANDLE CLIENT TODO: CHANGE MESSAGE FORMAT AND CONDITION FORMAT********
def handle(client, username):
    while True:
        try:
            message = client.recv(1024)
            if not message:
                break
            debug_list_collections()
            message = message.decode('ascii')
            if message.startswith('/dm '):
                # Format: /dm recipient message_content
                _, recipient, *content = message.split()
                content = ' '.join(content)
                direct_message(username, recipient, content)
                
            elif message.startswith('/group '):
                 # Format: /group group_name message_content
                _, group_name, *content = message.split()
                content = ' '.join(content)
                formatted = f"[{group_name}] {username}: {content}".encode('ascii')
                # use DB-driven broadcast and persist the group message
                broadcast_to_group(group_name, formatted, sender=username, raw_content=content)
            # ******** TODO: CONNECT TO MONGO AND CHANGE LOGIC TO ADD AND DELETE ***********
            elif message.startswith('/join '):
                # Format: /join group_name
                _, group_name = message.split()
                try:
                    add_user_to_group(username, group_name)
                except Exception as e:
                    print("join error:", e)
                try:
                    client.send(f"[SERVER] You joined group {group_name}".encode('ascii'))
                except:
                    pass

            elif message.startswith('/leave '):
                # Format: /leave group_name
                _, group_name = message.split()
                try:
                    remove_user_from_group(username, group_name)
                except Exception as e:
                    print("leave error:", e)
                try:
                    client.send(f"[SERVER] You left group {group_name}".encode('ascii'))
                except:
                    pass

            elif message == 'clear':
                # remove all users from DB (per previous behaviour)
                try:
                    for u in list(clients.keys()):
                        try:
                            remove_user_from_group(u)
                        except:
                            pass
                except Exception as e:
                    print("clear error:", e)
                clients.clear()
                print("Cleared all clients and groups")
        except:
            break
    try:
        if username in clients:
            del clients[username]
    except:
        pass
    try:
        client.close()
    except:
        pass
    # remove user from users collection and from any group membership
    try:
        # pull from all groups
        groups.update_many({}, {"$pull": {"members": username}})
    except Exception as e:
        print("Failed to remove user from groups on disconnect:", e)
    
    remove_user_from_group(username)

# *********MAIN FUNC TO RECEIVE THE CLIENT THEN CREATE THREAD TO HANDLE ***********
def receive():
    while True:
        # when someone connection to the server
        client, address = server.accept()
        print(f"Client address: {str(address)} has connected")

        client.send('USERNAME'.encode('ascii'))
        username = client.recv(1024).decode('ascii')

        # TODO : CHANGE LOGIC TO LOGIN
        if username in clients:
            client.send('USERNAME_TAKEN'.encode('ascii'))
            client.close()
            continue
        
        client.send('CONNECTED'.encode('ascii'))
        
        clients[username] = client
        add_user_to_group(username, None)
        add_user_to_db(username, addr=address)
        print(f'Username of the client is {username}')
        print(f'{username} joined the chat!'.encode('ascii'))
        client.send('Connected to the server!'.encode('ascii'))
        
        # THIS FOR NOW TODO : CHANGE TO
        help_message = """
            Available commands:
            /dm <username> <message> - Send direct message
            /group <group_name> <message> - Send message to group
            /join <group_name> - Join a group
            /leave <group_name> - Leave a group
        """.encode('ascii')
        client.send(help_message)

        thread = threading.Thread(target=handle, args=(client, username))
        thread.start()


# CALL RECEIVE
print("Server is listening")
receive()
        



# ********* OLD VERSION  *************
# def handle_client(conn, addr, clients):
#     """Handle individual client connections"""
#     print(f"New connection from {addr}")
    
#     try:
#         while True:
#             data = conn.recv(1024).decode()
#             if not data:
#                 break
                
#             message = f"Client {addr}: {data}"
#             print(message)
            
#             # Broadcast message to all other clients
#             for client in clients:
#                 if client != conn:
#                     try:
#                         client.sendall(f"{addr[1]}: {data}".encode())
#                     except:
#                         continue
                
#     except:
#         pass
#     finally:
#         clients.remove(conn)
#         conn.close()
#         print(f"Client {addr} disconnected. {len(clients)} clients remaining.")
