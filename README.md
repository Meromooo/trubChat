# trubChat

A chat app I built to learn how WebSockets works where You can create rooms, send messages, and see when other people are typing and all happening live without refreshing the page at all.

Live demo: [trub-chat.vercel.app](https://trub-chat.vercel.app)

---

## What it does

- Register and log in with JWT authentication
- Create chat rooms and join existing ones
- Send and receive messages in real time
- See typing indicators when someone is writing
- Online/offline status tracking

---

## How I built it

I used **Vue 3** on the frontend since it's what a lot of companies use and I wanted to get comfortable with it. The real-time part is handled by **Socket.io** which basically keeps an open connection between the browser and the server so the messages arrive instantly instead of the page having to constantly ask for example something like "any new messages?".

The backend is a simple **Node.js + Express** server that handles auth, stores data in **MongoDB** and manages all the socket connections smoothly. Passwords are hashed with bcrypt and the protected routes uses the JWT tokens.

### Tech stack I used

- **Frontend**  Vue 3, Pinia (state management), Vue Router, Tailwind CSS
- **Backend**  Node.js, Express, Socket.io
- **Database**  MongoDB Atlas + Mongoose
- **Auth**  JWT + bcryptjs
- **Deployed on**  Vercel (client) + Render (server)

---


## Running it locally

```bash
# Clone the repo
git clone https://github.com/Meromooo/trubChat.git
cd trubChat
```

**Server:**
```bash
cd server
npm install
# Create a .env file based on .env.example and fill in your MongoDB URI and JWT secret
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

Then open `http://localhost:5173`.

---

## What I learned

I went into this knowing React but not too much of Vue, and knowing nothing about WebSockets. The trickiest part was understanding how Socket.io rooms work and making sure messages only go to the right people. Also spent way too long debugging a DNS issue with MongoDB Atlas as Finnish ISPs apparently blocks SRV records for some reason.
