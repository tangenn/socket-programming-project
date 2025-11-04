import socket
import os
import threading

# SET PORT AND ADDRESS FOR CLIENT
HOST = os.getenv('HOST', '127.0.0.1')
PORT = int(os.getenv('PORT', 65432))

# TODO:CHANGE THE INPUT 
username = input("ENTER a username: ")

# CONNECT CLIENT TO SERVER
client =  socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect((HOST, PORT))

# RECEIVE MESSAGE *******TODO :CHANGE TO MULTIPLE CHAT********
def receive():
    while True:
        try:
            message = client.recv(1024).decode('ascii')
             # TODO : CHANGE LOGIC TO LOGIN
            if message == 'USERNAME':
                client.send(username.encode('ascii'))
            elif message == 'USERNAME_TAKEN':
                print("Username already taken! Try another one.")
                client.close()
                sys.exit()
            else:
                print(message)
        except:
            print("An error occurred!")
            client.close()
            break

# WRITE MESSAGE *******TODO :CHANGE TO MULTIPLE CHAT********
def write():
    print("""
Commands:
/dm <username> <message> - Send direct message
/group <group_name> <message> - Send message to group
/join <group_name> - Join a group
/leave <group_name> - Leave a group
    """)
    while True:
        # TODO: CHANGE LOGIC LATER
        message = input("")
        if message.startswith('/'):
            # Send command as is
            client.send(message.encode('ascii'))

receive_thread = threading.Thread(target=receive)
receive_thread.start()

write_thread  = threading.Thread(target=write)
write_thread.start()