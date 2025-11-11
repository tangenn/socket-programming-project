import socketio
import os
import sys
import asyncio
from datetime import datetime, timezone
import db 

# ---------server setup--------------
# connect socketIO
sio = socketio.AsyncServer(async_mode = 'asgi' ,cors_allowed_origins='*')
app = socketio.ASGIApp(sio ,'')

# --- State Management ---
user_to_sid = {}
sid_to_user = {}

# ------Connect DB--------
# collections
users, dm_messages, group_messages, groups = db.connect_db()

@sio.event
async def connect(sid, environ) :
    print(f"{sid} connected")

@sio.event
async def register(sid,data):
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        await sio.emit('register_error', {'message': 'Username and password are required'} , to=sid)
        return
    
    is_existing = await asyncio.to_thread(db.add_user_to_db , users, username , password)

    if not is_existing:
        await sio.emit('register_error', {'message': 'Username has already been taken'}, to=sid)
        return
    
    await sio.emit('register_success', {'message': 'Registration successful! You can now log in.'}, to=sid)

    
@sio.event
async def login(sid,data):
    username = data.get('username')
    password = data.get('password')
    # VERIFY USER is not already online
    if not username:
        await sio.emit('login_error' , {'message':'Username is required'}, to=sid)
        return
    
    if username in user_to_sid:
        await sio.emit('login_error', {'message': 'Username already taken'}, to=sid)
        return
    
    is_valid = await asyncio.to_thread(db.check_credentials,users, username, password)

    # ------ Login Fail --------
    if not is_valid:
        await sio.emit('login_error', {'message': 'Invalid username or password'}, to=sid)
        return
    
    # ------ Login Success --------
    # JUST for tracking 
    user_to_sid[username] = sid
    sid_to_user[sid] = username

    print(f'User {username} logged in with sid {sid}')
    await sio.emit('connected', { 'message': f'{username} has connected' }, to=sid)

@sio.event
async def disconnected(sid) :
    if sid in sid_to_user:
        username = sid_to_user[sid]
        
        del user_to_sid[username]
        del sid_to_user[sid]

        print(f'Client disconnected: {username} ({sid})')

@sio.event
async def dm(sid ,data):
    sender = sid_to_user.get(sid)
    receiver = data.get('receiver')
    content = data.get('content')
    timestamp = datetime.now(timezone.utc)
    if not sender or not receiver or not content:
        await sio.emit('dm_error', {'message': 'Invalid DM data'}, to=sid)
        return
    await asyncio.to_thread(db.save_dm_message,dm_messages ,sender, receiver, content, timestamp)

    receiver_sid = user_to_sid.get(receiver)
    # receiver online
    if receiver_sid:
        await sio.emit('dm',{'from_user':sender ,'content':content,'timestamp':timestamp}, to=receiver_sid)
    # receiver offline
    else :
        await sio.emit('server_message',f'User {receiver} is offline. Message saved.', to=sid)
    # sender see their own msg being sent to receiver
    await sio.emit('dm',{'from': sender, 'to': receiver_sid ,'content': content,'timestamp': timestamp}, to=sid)

@sio.event
async def dm_history(sid, data) :
    sender = sid_to_user.get(sid)
    receiver = data.get('receiver')
    history = await asyncio.to_thread(db.get_dm_messages,dm_messages ,sender, receiver)
    await sio.emit('dm_history', {'history': history}, to=sid)

@sio.event
async def join_group(sid,data):
    username = sid_to_user.get(sid)
    group_name = data.get('group_name')

    if not username or not group_name: 
        return

    sio.enter_room(sid,group_name)
    
    await asyncio.to_thread(db.add_member_to_group,groups ,group_name, username)

    # Tell client to display chat box 
    await sio.emit('server_message', f'You joined group {group_name}', to=sid)
    # Tell member in the group that this username has join
    await sio.emit('server_message', f'{username} has joined the group', to=group_name)

@sio.event
async def leave_group(sid,data):
    username = sid_to_user.get(sid)
    group_name = data.get('group_name')

    if not username or not group_name: 
        return

    sio.leave_room(sid,group_name)

    await asyncio.to_thread(db.remove_member_from_group,groups ,group_name, username)

    # Tell client not to display chat box 
    await sio.emit('server_message', f'You left group {group_name}', to=sid)
    # Tell member in the group that this username has join
    await sio.emit('server_message', f'{username} has left the group', to=group_name)

@sio.event
async def create_group(sid,data):
    username = sid_to_user.get(sid)
    group_name = data.get('group_name')

    if not username or not group_name: 
        return
    
    await asyncio.to_thread(db.create_group_if_missing, groups ,group_name)

    sio.enter_room(sid,group_name)

    await asyncio.to_thread(db.add_member_to_group,groups ,group_name, username)

    # Tell client to display chat box 
    await sio.emit('server_message', f'You created group {group_name}', to=sid)
    # Tell member in the group that this username has join
    await sio.emit('server_message', f'{username} has joined the group', to=group_name)


@sio.event
async def group_message(sid,data):
    username = sid_to_user.get(sid)
    group_name = data.get('group_name')
    content = data.get('content')
    timestamp = datetime.now(timezone.utc)

    if not username or not group_name or not content:
        await sio.emit('group_message_error', {'message': 'Invalid group message data'}, to=sid)
        return
    await asyncio.to_thread(db.save_group_message, group_messages ,username, group_name, content, timestamp)

    await sio.emit('group_message',{'from': username, 'to': group_name ,'content': content,'timestamp': timestamp}, to=group_name)

@sio.event
async def group_history(sid, data):
    group_name = data.get('group_name')
    history = await asyncio.to_thread(db.get_group_messages, group_messages ,group_name)
    await sio.emit('group_history', {'history': history}, to=sid)