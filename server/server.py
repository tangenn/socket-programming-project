import socket
import sys
import threading
import os
from pymongo import MongoClient


# TODO : ADD FUNCTION TO GET THE HISTORY เพราะยังไม่ได้ทำ MONGO ขกคิด database คิดให้หน่อย


# get local ip of the that server computer
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # connect to a public IP, no packets sent, just to get local interface IP
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
PORT = sys.argv[0] 
print(f"POST ip address is: {PORT}")


# DECLARE and BIND socket then set to listen
server = socket.socket(socket.AF_INET,socket.SOCK_STREAM) 
server.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
server.bind((HOST,PORT))
server.listen()
# print("Server is waiting for connection...")

# DATABASE connection
# ***** MOCK ยังไม่ได้เชื่อม ********
usernames = []
clients = {}  
groups = {} 

# ++++++++ CONNECT DATABASE (MONGODB) .ENV ดูในดิส ยังไม่ได้เชื่อมกะตัวcode ++++++++
connection_string = os.getenv('MONGODB_URI')
clientMongo = MongoClient(connection_string)
# DATABASE
db = clientMongo["my_database"]
# COLLECTION
users = db["users"]
messages = db["messages"]
# ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


# Broadcast บอกให้ทุกคนเห็นว่ามีใครมาใหม่ 
# **** change to display new user list in other client pages ******
def broadcast(message):
    for client in clients:
        client.send(message)

# SEND IN CHAT GROUP TODO: CHANGE IN TO MONGO AND MSG FORMAT
def broadcast_to_group(group_name, message, sender=None):
    if group_name in groups:
        for username in groups[group_name]:
            if username in clients and username != sender:
                try:
                    clients[username].send(message)
                except:
                    pass

# SEND IN DIRECT CHAT  TODO: ADD MONGODB AND MSG FORMAT
def direct_message(sender, recipient, message):
    if recipient in clients:
        try:
            formatted_message = f"[DM from {sender}] {message}".encode('ascii')
            clients[recipient].send(formatted_message)
        except:
            pass

# ******** HANDLE CLIENT TODO: CHANGE MESSAGE FORMAT AND CONDITION FORMAT********
def handle(client, username):
    while True:
        try:
            message = client.recv(1024).decode('ascii')
            if message.startswith('/dm '):
                # Format: /dm recipient message_content
                _, recipient, *content = message.split()
                content = ' '.join(content)
                direct_message(username, recipient, content)
            
            elif message.startswith('/group '):
                # Format: /group group_name message_content
                _, group_name, *content = message.split()
                content = ' '.join(content)
                message = f"[{group_name}] {username}: {content}".encode('ascii')
                broadcast_to_group(group_name, message, username)
            
            # ******** TODO: CONNECT TO MONGO AND CHANGE LOGIC TO ADD AND DELETE ***********
            elif message.startswith('/join '):
                # Format: /join group_name
                _, group_name = message.split()
                if group_name not in groups:
                    groups[group_name] = []
                if username not in groups[group_name]:
                    groups[group_name].append(username)
                    notify = f"[SERVER] You joined group {group_name}".encode('ascii')
                    client.send(notify)
            
            elif message.startswith('/leave '):
                # Format: /leave group_name
                _, group_name = message.split()
                if group_name in groups and username in groups[group_name]:
                    groups[group_name].remove(username)
                    notify = f"[SERVER] You left group {group_name}".encode('ascii')
                    client.send(notify)
        except:
            break

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
