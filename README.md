# socket-programming-project

<!-- HOW TO RUN BACKEND -->
cd / server
uvicorn server:app --reload --host 0.0.0.0 --port 8000

<!-- HOW TO RUN FRONTEND -->
cd / the-performers
create .env.local
add NEXT_PUBLIC_SERVER_URL=http://{YOUR_IP}:8000
npm run dev
