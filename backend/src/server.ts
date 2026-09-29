import http from 'http';
import app from './app';
import { initLiveGateway } from './modules/live/live.gateway';

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

// Initialize Socket.IO
initLiveGateway(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
