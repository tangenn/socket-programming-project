import socketio
import os
import sys
import asyncio
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import db 

# ---------server setup--------------
# connect socketIO
sio = socketio.AsyncServer(async_mode = 'asgi' ,cors_allowed_origins='*')
app = socketio.ASGIApp(sio)

# --- State Management ---
user_to_sid = {}
sid_to_user = {}
# เก็บว่าผู่เล่นในเกมเลือกออกอะไรยัง
active_games = {}

# ------Connect DB--------
# collections
users, dm_messages, group_messages, groups = db.connect_db()

# Validate database connection
if users is None:
    print("ERROR: Failed to connect to database. 'users' collection is None!")
    print("Please check your MongoDB connection and ensure the database is running.")
    sys.exit(1)

print(f"Database connected successfully. Collections: {users.name}, {dm_messages.name}, {group_messages.name}, {groups.name}")

@sio.event
async def connect(sid, environ) :
    print(f"{sid} connected")


@sio.event
async def disconnect(sid) :
    if sid in sid_to_user:
        username = sid_to_user[sid]
        
        del user_to_sid[username]
        del sid_to_user[sid]

        print(f'Client disconnected: {username} ({sid})')

    if sid in active_games:
        del active_games[sid]
        print(f"Cleaned up stale challenge for disconnected user {sid}")


@sio.event
async def register(sid,data):
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        await sio.emit('register_error', {'message': 'Username and password are required'} , to=sid)
        return
    
    is_existing = await asyncio.to_thread(db.add_user_to_db , users, username , password, avatarId=1, online=False)

    if not is_existing:
        await sio.emit('register_error', {'message': 'Username has already been taken'}, to=sid)
        return
    
    await sio.emit('register_success', {'message': 'Registration successful! You can now log in.'}, to=sid)

    
@sio.event
async def login(sid,data):
    try:
        username = data.get('username')
        password = data.get('password')

        if not username:
            await sio.emit('login_error', {'message': 'Username is required'}, to=sid)
            return
        
        if username in user_to_sid:
            await sio.emit('login_error', {'message': 'Username already taken'}, to=sid)
            return
        
        # --- BYPASS ---
        # Comment out the database call and hardcode success
        is_valid = await asyncio.to_thread(db.check_credentials, users, username, password)
        # is_valid = True 
        # --- END BYPASS ---

        if not is_valid:
            await sio.emit('login_error', {'message': 'Invalid username or password'}, to=sid)
            return
        
        # ------ Login Success --------
        user_to_sid[username] = sid
        sid_to_user[sid] = username

        print(f'User {username} logged in with sid {sid}')
        await sio.emit('login_success', {'username': username}, to=sid)

    except Exception as e:
        # --- THIS IS THE CRASH-PROOFING ---
        # 1. Print the real error to your server console for debugging
        print(f"!!! LOGIN HANDLER CRASHED: {e}")
        
        # 2. Send a generic, safe error to the client
        await sio.emit('login_error', {'message': 'A server error occurred. Please try again.'}, to=sid)

@sio.event
async def select_avatar(sid,data):
    username = sid_to_user.get(sid)
    avatarId = data.get('avatarId')

    if not username or avatarId is None: 
        return
    await asyncio.to_thread(db.update_user_avatar,users ,username, avatarId)
    await sio.emit('avatar_selected', {'avatarId': avatarId}, to=sid)

@sio.event
async def dm(sid ,data):
    sender = sid_to_user.get(sid)
    receiver = data.get('receiver')
    text = data.get('text') or data.get('content')  # Support both for backward compatibility
    timestamp = datetime.now(timezone.utc)
    
    if not sender or not receiver or not text:
        await sio.emit('dm_error', {'message': 'Invalid DM data'}, to=sid)
        return
    
    # Get sender's avatar
    sender_avatar = await asyncio.to_thread(db.get_user_avatar, users, sender)
    
    # Get message type (default to "text")
    msg_type = data.get('type', 'text')
    msg_id = data.get('id')
    
    # Only save to DB if it's a new message (not already saved)
    if msg_id is None:
        await asyncio.to_thread(db.save_dm_message, dm_messages, sender, receiver, text, timestamp, msg_type, None, sender_avatar)

    receiver_sid = user_to_sid.get(receiver)
    message_payload = {
        'sender': sender,
        'receiver': receiver,
        'text': text,
        'timestamp': timestamp.isoformat(),
        'avatarId': sender_avatar,
        'type': msg_type
    }
    
    # Add optional fields
    if msg_id:
        message_payload['id'] = msg_id
    if 'challenger_sid' in data:
        message_payload['challenger_sid'] = data['challenger_sid']
    if 'participants' in data:
        message_payload['participants'] = data['participants']
    if 'opponent' in data:
        message_payload['opponent'] = data['opponent']

    # receiver online
    if receiver_sid:
        await sio.emit('dm', message_payload, to=receiver_sid)
    # receiver offline
    else:
        await sio.emit('server_message', f'User {receiver} is offline. Message saved.', to=sid)
    # sender see their own msg being sent to receiver
    await sio.emit('dm', message_payload, to=sid)

@sio.event
async def dm_history(sid, data):
    sender = sid_to_user.get(sid)
    receiver = data.get('receiver')
    history = await asyncio.to_thread(db.get_dm_messages, dm_messages, sender, receiver)

    sender_avatar = await asyncio.to_thread(db.get_user_avatar, users, sender)

    for msg in history:
        # Only set sender_avatar if avatarId is not already in the message
        if 'avatarId' not in msg or msg['avatarId'] is None:
            msg['sender_avatar'] = sender_avatar
            msg['avatarId'] = sender_avatar
        else:
            msg['sender_avatar'] = msg['avatarId']
        # Ensure type is included (default to "text" if not present)
        if 'type' not in msg:
            msg['type'] = 'text'
    
    serializable_history = []
    for msg in history:
        serializable_msg = msg.copy()

        ts = serializable_msg.get('timestamp')

        if isinstance(ts, datetime):
            # If timestamp is naive, assume it's UTC
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)

            # Convert to Bangkok local time
            ts = ts.astimezone(ZoneInfo("Asia/Bangkok"))

            serializable_msg['timestamp'] = ts.isoformat()

        serializable_history.append(serializable_msg)

    await sio.emit('dm_history', {'history': serializable_history}, to=sid)

@sio.event
async def join_group(sid,data):
    username = sid_to_user.get(sid)
    group_name = data.get('group_name')

    if not username or not group_name: 
        return

    await sio.enter_room(sid,group_name)
    
    # --- BYPASS ---
    await asyncio.to_thread(db.add_member_to_group,groups ,group_name, username)
    # --- END BYPASS ---

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

    # Validate user is logged in
    if not username:
        await sio.emit('create_group_error', {'message': 'You must be logged in to create a group'}, to=sid)
        return
    
    if not group_name or not group_name.strip():
        await sio.emit('create_group_error', {'message': 'Group name cannot be empty'}, to=sid)
        return
    
    # Check if group already exists
    try:
        await asyncio.to_thread(db.create_group_if_missing, groups, group_messages, group_name)
    except Exception as e:
        # If your create_group_if_missing raises an error when group exists
        await sio.emit('create_group_error', {'message': f'Group "{group_name}" already exists'}, to=sid)
        return
    
    
        # Create the group
    await asyncio.to_thread(db.create_group_if_missing, groups, group_messages, group_name)
    
    # Add creator as member
    sio.enter_room(sid, group_name)
    await asyncio.to_thread(db.add_member_to_group, groups, group_name, username)

    await sio.emit('create_group_success', {
        'message': f'Group "{group_name}" created successfully',
        'group_name': group_name
    }, to=sid)
    
    # Notify the group (just the creator at this point)
    await sio.emit('server_message', f'{username} created the group', to=group_name)


@sio.event
async def group_message(sid,data):
    group_name = data.get('group_name')
    id = data.get('id')
    sender = sid_to_user.get(sid)
    avatarId = data.get('avatarId')
    timestamp = datetime.now(timezone.utc)
    type = "text"
    text = data.get("text")

    message_payload = {
        "id": id,
        "sender": sender,
        "avatarId": avatarId,
        "timestamp": timestamp.isoformat(),
        "type": type,
        "text": text
    }

    print(f"Received group {group_name} +message: {message_payload}")

    if not sender or not group_name or not text:
        await sio.emit('group_message_error', {'message': 'Invalid group message data'}, to=sid)
        return
    
    # --- BYPASS ---
    # Comment out the database call
    await asyncio.to_thread(db.save_group_message, group_messages, group_name, id ,sender, avatarId, timestamp, type, text)
    # print("BYPASS: Skipped saving message to DB")
    # --- END BYPASS ---

    await sio.emit('group_message', message_payload, to=group_name)
    
@sio.event
async def group_history(sid, data):
    group_name = data.get('group_name')
    history = await asyncio.to_thread(db.get_group_messages, group_messages ,group_name)

    senders = {msg.get('sender') for msg in history if msg.get('sender')}
    if senders:
        avatars_list = await asyncio.to_thread(db.get_users_with_avatars, users, list(senders))
        avatar_map = {u['username']: u.get('avatarId') for u in avatars_list}
    else:
        avatar_map = {}
    
    for msg in history:
        sender = msg.get('sender')
        if sender:
            msg['sender_avatar'] = avatar_map.get(sender)

    serializable_history = []
    for msg in history:
        serializable_msg = msg.copy()

        ts = serializable_msg.get('timestamp')

        if isinstance(ts, datetime):
            # If timestamp is naive, assume it's UTC
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)

            # Convert to Bangkok local time
            ts = ts.astimezone(ZoneInfo("Asia/Bangkok"))

            serializable_msg['timestamp'] = ts.isoformat()

        serializable_history.append(serializable_msg)

    await sio.emit('group_history', {'history': serializable_history}, to=sid)\

@sio.event
async def get_group_members(sid, data):
    group_name = data.get('group_name')
    members = await asyncio.to_thread(db.get_group_members, groups, group_name)

    # fetch avatar ids for everyone in the group (online or not)
    members_with_avatars = await asyncio.to_thread(
        db.get_users_with_avatars,
        users,
        members
    )

    await sio.emit(
        'group_members',
        {
            'group_name': group_name,
            'members': members_with_avatars  # [{username, avatarId}, ...]
        },
        to=sid
    )

@sio.event
async def online_users(sid):
    online_users_list = list(user_to_sid.keys())
    # Get avatar information for all online users
    users_with_avatars = await asyncio.to_thread(
        db.get_users_with_avatars, 
        users, 
        online_users_list
    )
    
    await sio.emit('online_users', {'users': users_with_avatars}, to=sid)

@sio.event
async def get_available_groups(sid):
    group_list = await asyncio.to_thread(db.get_all_groups, groups)
    await sio.emit('available_groups', {'groups': group_list}, to=sid)

@sio.event
async def getMe(sid):
    username = sid_to_user.get(sid)
    avatarId = None
    
    if username:
        # Get the user's avatar from database
        avatarId = await asyncio.to_thread(db.get_user_avatar, users, username)
    
    await sio.emit('me', {'username': username, 'avatarId': avatarId}, to=sid)

# ---- mini game rock paper scissor ------
# JUST 1 VS 1 version multiplayer not yet implement

def calculate_rps_winner(p1_id, p1_move, p2_id, p2_move):
    if p1_move == p2_move:
        return {'draw': True, 'winner': None, 'loser': None}

    winning_moves = {
        'rock': 'scissors',
        'scissors': 'paper',
        'paper': 'rock'
    }

    if winning_moves[p1_move] == p2_move:
        # Player 1 wins
        return {'draw': False, 'winner': p1_id, 'loser': p2_id}
    else:
        # Player 2 wins
        return {'draw': False, 'winner': p2_id, 'loser': p1_id}
    
# ตั้งเวลาหมดอายุ
async def expire_challenge(challenger_sid, group_name, message_id):
    await asyncio.sleep(120) #วินาที

    if challenger_sid in active_games:
        print(f"Challenge {message_id} from {challenger_sid} has expired.")
        
        del active_games[challenger_sid]
        
        await sio.emit('challenge_expired', {'id': message_id}, to=group_name)

@sio.event 
async def group_challengeV2(sid,data):
    challenger_name = sid_to_user.get(sid)
    group_name = data.get('group_name')
    id = data.get('id')
    avatarId = data.get('avatarId')
    selectedRPS = data.get('selectedRPS')
    timestamp = datetime.now(timezone.utc).isoformat()
    type = "challenge"
    text = f"{challenger_name} has challenged you to a game of Rock-Paper-Scissors!"

    active_games[sid] = {
        'selected': selectedRPS,
        'haveOpponent':False
    }

    message_payload = {
        "id": id,
        "sender": challenger_name,
        "challenger_sid": sid,
        "avatarId": avatarId,
        "timestamp": timestamp,
        "type": type,
        "text": text
    }

    await asyncio.to_thread(db.save_group_message, group_messages, group_name, id ,challenger_name, avatarId, timestamp, type, text)

    await sio.emit('challenge_message',{'message': message_payload}, to=group_name)

    sio.start_background_task(expire_challenge, sid, group_name, id)

@sio.event
async def group_challenge_responseV2(sid,data):
    challenger_id = data.get('challenger_id')
    id = data.get('id')
    avatarId = data.get('avatarId')
    selectedRPS = data.get('selectedRPS')
    opponent_name = sid_to_user.get(sid)
    group_name = data.get('group_name')
    timestamp = datetime.now(timezone.utc).isoformat()
    if challenger_id and challenger_id not in sid_to_user:
        # It's a username, use it directly and look up the socket ID
        challenger_name = challenger_id
        challenger_id = user_to_sid.get(challenger_id)
    else:
        # It's a socket ID, get the username
        challenger_name = sid_to_user.get(challenger_id) if challenger_id else None
    
    game = active_games.get(challenger_id) if challenger_id else None
    if not game:
        print(f"Game {challenger_id} not found (expired or challenger left).")
        return

    # Check if already accepted
    if game['haveOpponent']:
        print(f"This Challenger has already been accepted by someone else.")
        # Send error message to the user trying to accept
        error_payload = {
            "id": id,
            "sender": "Server",
            "avatarId": 21,
            "timestamp": timestamp,
            "type": "text",
            "text": f"Challenge from {challenger_name} has already been accepted by someone else."
        }
        await sio.emit('challenge_message', {'message': error_payload}, to=sid)
        return
    
    # LOCK THE GAME IMMEDIATELY
    game['haveOpponent'] = True
    
    if not challenger_id or not challenger_name:
        print(f"Challenger {challenger_id} is no longer online.")
        return
    
    challenger_selected = game['selected']
    
    result = calculate_rps_winner(challenger_id, challenger_selected, sid, selectedRPS)
    
    # Determine winner name
    if result['draw']:
        winner_name = None
        loser_name = None
        text = "It's a draw!"
        participants = []
    else:
        winner_sid = result['winner']
        loser_sid = result['loser']
        winner_name = sid_to_user.get(winner_sid, "Unknown")
        loser_name = sid_to_user.get(loser_sid, "Unknown")
        text = f"{winner_name} wins! {loser_name} loses."
        participants = [winner_name, loser_name]

    # Send challenge accepted message first
    accepted_payload = {
        "id": f"{id}-accepted",
        "sender": opponent_name,
        "avatarId": avatarId,
        "timestamp": timestamp,
        "type": "challenge_accepted",
        "text": f"{opponent_name} accepted {challenger_name}'s challenge!",
        "participants": [opponent_name, challenger_name]
    }
    await asyncio.to_thread(db.save_group_message, group_messages, group_name, f"{id}-accepted", opponent_name, avatarId, timestamp, "challenge_accepted", accepted_payload["text"])
    await sio.emit('challenge_message', {'message': accepted_payload}, to=group_name)

    # Send result message
    result_payload = {
        "id": f"{id}-result",
        "sender": "System",
        "avatarId": 21,
        "timestamp": timestamp,
        "type": "challenge_result",
        "text": text,
        "participants": participants
    }
    await asyncio.to_thread(db.save_group_message, group_messages, group_name, f"{id}-result", "System", 21, timestamp, "challenge_result", text)
    await sio.emit('challenge_message', {'message': result_payload}, to=group_name)

    # Clean up
    if challenger_id in active_games:
        del active_games[challenger_id]



# selected rock paper scissor

@sio.event
async def selectedRPS(sid,data):
    try:
         # data = { 'game_room_id': 'game_room_id', 'selected': Rock / Paper / Scissor }
        username = sid_to_user.get(sid)
        game_room_id = data.get('game_room_id')
        selectedRPS = data.get('selected')
        
        # Find the game
        game = active_games[game_room_id]
        
    except KeyError:
        print("Invalid game or session")
        return
    
    if sid not in game['selected']:
        game['selected'][sid] = selectedRPS
        print(f"User {sid} played {selectedRPS} in {game_room_id}")

        # find opponent id
        opponent_sid = game['players'][0] if game['players'][1] == sid else game['players'][1]
        # Tell them "Opponent has selected"
        sio.emit('opponent_selected', {}, to=opponent_sid)
            
    # Both player selected
    if len(game['selected']) == 2:
        print(f"Both players have selected in {game_room_id}. Calculating result.")
        
        # We have both moves, time to calculate the result
        p1_id = game['players'][0]
        p2_id = game['players'][1]
        
        p1_selected = game['selected'][p1_id]
        p2_selected = game['selected'][p2_id]
        
        # Calculate the winner
        result = calculate_rps_winner(p1_id, p1_selected, p2_id, p2_selected)
        
        # Send the final result to BOTH players in the room
        sio.emit('game_result', {
            'result': result,
            'player_one_selected': p1_selected,
            'player_two_selected': p2_selected
        }, to=game_room_id)

        #if want to store log 
        # timestamp = datetime.now(timezone.utc)
        # await asyncio.to_thread(db.save_game_result,  ,result, p1_id, p2_id, timestamp)

@sio.event
async def private_challengeV2(sid, data):
    challenger_name = sid_to_user.get(sid)
    receiver = data.get('receiver')
    id = data.get('id')
    avatarId = data.get('avatarId')
    selectedRPS = data.get('selectedRPS')
    timestamp = datetime.now(timezone.utc)
    type = "challenge"
    text = f"{challenger_name} has challenged you to a game of Rock-Paper-Scissors!"

    if not challenger_name or not receiver:
        await sio.emit('dm_error', {'message': 'Invalid challenge data'}, to=sid)
        return

    # Store the challenge
    active_games[sid] = {
        'selected': selectedRPS,
        'haveOpponent': False,
        'receiver': receiver,
        'is_private': True
    }

    message_payload = {
        "id": id,
        "sender": challenger_name,
        "receiver": receiver,
        "opponent": receiver,
        "challenger_sid": sid,
        "avatarId": avatarId,
        "timestamp": timestamp.isoformat(),
        "type": type,
        "text": text
    }

    # Save with avatarId
    await asyncio.to_thread(db.save_dm_message, dm_messages, challenger_name, receiver, text, timestamp, type, id, avatarId)

    receiver_sid = user_to_sid.get(receiver)
    if receiver_sid:
        await sio.emit('dm', message_payload, to=receiver_sid)
    # Also send to challenger so they see their challenge
    await sio.emit('dm', message_payload, to=sid)

    # Set expiration timer
    sio.start_background_task(expire_private_challenge, sid, id)

async def expire_private_challenge(challenger_sid, message_id):
    await asyncio.sleep(120)  # 120 seconds

    if challenger_sid in active_games:
        game = active_games[challenger_sid]
        if game.get('is_private') and not game.get('haveOpponent'):
            print(f"Private challenge {message_id} from {challenger_sid} has expired.")
            del active_games[challenger_sid]
            # Optionally notify users
            challenger_name = sid_to_user.get(challenger_sid)
            receiver = game.get('receiver')
            if challenger_name and receiver:
                receiver_sid = user_to_sid.get(receiver)
                if receiver_sid:
                    await sio.emit('challenge_expired', {'id': message_id}, to=receiver_sid)
                await sio.emit('challenge_expired', {'id': message_id}, to=challenger_sid)

@sio.event
async def private_challenge_responseV2(sid, data):
    challenger_id = data.get('challenger_id')
    if challenger_id and challenger_id not in sid_to_user:
        # It's a username, use it directly and look up the socket ID
        challenger_name = challenger_id
        challenger_id = user_to_sid.get(challenger_id)
    else:
        # It's a socket ID, get the username
        challenger_name = sid_to_user.get(challenger_id) if challenger_id else None
    
    id = data.get('id')
    avatarId = data.get('avatarId')
    selectedRPS = data.get('selectedRPS')
    receiver = data.get('receiver')
    opponent_name = sid_to_user.get(sid)
    # receiver = data.get('receiver')  # The person who sent the challenge
    timestamp = datetime.now(timezone.utc)
    game = active_games.get(challenger_id) if challenger_id else None

    if not game:
        print(f"Game {challenger_id} not found (expired or challenger left).")
        return

    # Check if already accepted
    if game['haveOpponent']:
        print(f"This challenge has already been accepted.")
        error_payload = {
            "id": id,
            "sender": "Server",
            "receiver": opponent_name,
            "avatarId": 21,
            "timestamp": timestamp.isoformat(),
            "type": "text",
            "text": f"Challenge from {challenger_name} has already been accepted."
        }
        await sio.emit('dm', error_payload, to=sid)
        return

    # LOCK THE GAME IMMEDIATELY
    game['haveOpponent'] = True

    if not challenger_id or not challenger_name:
        print(f"Challenger {challenger_id} is no longer online.")
        return

    challenger_selected = game['selected']
    result = calculate_rps_winner(challenger_id, challenger_selected, sid, selectedRPS)

    # Determine winner name
    if result['draw']:
        winner_name = None
        loser_name = None
        text = "It's a draw!"
        participants = []
    else:
        winner_sid = result['winner']
        loser_sid = result['loser']
        winner_name = sid_to_user.get(winner_sid, "Unknown")
        loser_name = sid_to_user.get(loser_sid, "Unknown")
        text = f"{winner_name} wins! {loser_name} loses."
        participants = [winner_name, loser_name]

    # Send challenge accepted message
    accepted_payload = {
        "id": f"{id}-accepted",
        "sender": opponent_name,
        "receiver": receiver,  # challenger's username
        "avatarId": avatarId,
        "timestamp": timestamp.isoformat(),
        "type": "challenge_accepted",
        "text": f"{opponent_name} accepted {challenger_name}'s challenge!",
        "participants": [opponent_name, challenger_name]
    }
  
    await asyncio.to_thread(db.save_dm_message, dm_messages, opponent_name, receiver, accepted_payload["text"], timestamp, "challenge_accepted", f"{id}-accepted", avatarId)
    
    
    if challenger_id:
        await sio.emit('dm', accepted_payload, to=challenger_id)
    await sio.emit('dm', accepted_payload, to=sid)
    # Send result message
    result_payload_challenger = {
        "id": f"{id}-result",
        "sender": "System",
        "receiver": opponent_name,  # opponent's username (challenger views chat with opponent)
        "avatarId": 21,
        "timestamp": timestamp.isoformat(),
        "type": "challenge_result",
        "text": text,
        "participants": participants
    }

    result_payload_opponent = {
        "id": f"{id}-result",
        "sender": "System",
        "receiver": challenger_name,  # challenger's username (opponent views chat with challenger)
        "avatarId": 21,
        "timestamp": timestamp.isoformat(),
        "type": "challenge_result",
        "text": text,
        "participants": participants
    }

    await asyncio.to_thread(db.save_dm_message, dm_messages, "System", receiver, text, timestamp, "challenge_result", f"{id}-result", 21)
    
    if challenger_id:
        await sio.emit('dm', result_payload_challenger, to=challenger_id)
    await sio.emit('dm', result_payload_opponent, to=sid)

    if challenger_id in active_games:
        del active_games[challenger_id]
