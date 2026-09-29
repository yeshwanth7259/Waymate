import { io, type Socket } from "socket.io-client";
import { auth } from "./firebase";
import { API_BASE_URL } from "./socketConfig";
import type { LocationUpdate } from "../types/domain";

type LocationHandler = (location: LocationUpdate) => void;
type ErrorHandler = (message: string) => void;

class WayMateSocket {
  private socket: Socket | null = null;

  async connect(): Promise<Socket> {
    if (this.socket?.connected) return this.socket;

    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("You must be logged in to connect to live tracking.");

    if (!this.socket) {
      const origin = API_BASE_URL.replace(/\/api$/, "");
      this.socket = io(origin, {
        transports: ["websocket"],
        autoConnect: false,
        auth: { token },
      });
    } else {
      this.socket.auth = { token };
    }

    if (this.socket.connected) return this.socket;

    return await new Promise<Socket>((resolve, reject) => {
      const socket = this.socket!;
      const cleanup = () => {
        socket.off("connect", onConnect);
        socket.off("connect_error", onError);
      };
      const onConnect = () => {
        cleanup();
        resolve(socket);
      };
      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };
      socket.once("connect", onConnect);
      socket.once("connect_error", onError);
      socket.connect();
    });
  }

  async joinTrip(tripId: string) {
    const socket = await this.connect();
    socket.emit("joinTrip", tripId);
  }

  onLocationCurrent(callback: LocationHandler) {
    this.socket?.on("location:current", callback);
  }

  onLocationUpdate(callback: LocationHandler) {
    this.socket?.on("location:update", callback);
  }

  onError(callback: ErrorHandler) {
    this.socket?.on("trip:error", callback);
    this.socket?.on("joinTrip:error", callback);
  }

  offLocationCurrent(callback: LocationHandler) {
    this.socket?.off("location:current", callback);
  }

  offLocationUpdate(callback: LocationHandler) {
    this.socket?.off("location:update", callback);
  }

  offError(callback: ErrorHandler) {
    this.socket?.off("trip:error", callback);
    this.socket?.off("joinTrip:error", callback);
  }

  leaveTrip(tripId: string) {
    this.socket?.emit("leaveTrip", tripId);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  get connected() {
    return !!this.socket?.connected;
  }
}

export const wayMateSocket = new WayMateSocket();
