import socket
import sys
import selectors
import threading
# import os

def handle_client(conn, addr, clients):
    """Handle individual client connections"""
    print(f"New connection from {addr}")
    
    try:
        while True:
            data = conn.recv(1024).decode()
            if not data:
                break
                
            message = f"Client {addr}: {data}"
            print(message)
            
            # Broadcast message to all other clients
            for client in clients:
                if client != conn:
                    try:
                        client.sendall(f"{addr[1]}: {data}".encode())
                    except:
                        continue
                
    except:
        pass
    finally:
        clients.remove(conn)
        conn.close()
        print(f"Client {addr} disconnected. {len(clients)} clients remaining.")

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

# multiplexing
sel = selectors.DefaultSelector()

# HOST = os.getenv('HOST', '127.0.0.1')
HOST = get_local_ip()
print(f"HOST ip address is: {HOST}")
# PORT = int(os.getenv('PORT', 65432))
PORT = sys.argv[0] # run: python server.py {PORT}

with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as s:
    s.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
    s.bind((HOST,PORT))
    s.listen()
    conn ,addr = s.accept()
    with conn:
        while True:
            data = conn.recv(1024)
            if not data:
                break
            conn.sendall(data)

